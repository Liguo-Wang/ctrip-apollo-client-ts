import {
  ApolloClientOptions,
  ApolloConfigLongPollingResponse,
  ApolloConfigResponse,
} from './interfaces/apollo-client.interface';
import * as ip from 'ip';
import { URL } from 'url';
import * as crypto from 'crypto';
import { from, lastValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { request } from './utils/request.util';
import { getConfigurationStorage } from './configuration.storage';

export class ApolloClient {
  // -------------------------------------------------------------------------
  // Private Methods
  // -------------------------------------------------------------------------

  /**
   * @internal
   */
  private readonly configServerUrl: string;

  /**
   * @internal
   */
  private readonly appId: string;

  /**
   * @internal
   */
  private readonly clusterName: string;

  /**
   * @internal
   */
  private readonly clientIp: string = ip.address('public', 'ipv4');

  /**
   * long polling read timeout
   */
  private readonly longPollingTimeout: number = 33 * 1000;

  /**
   * @Type Map<namespaceName, notificationId> : <string, number>
   */
  private readonly notifications: Record<string, number>;

  /**
   * @internal
   */
  private readonly releaseKeys: Map<string, string> = new Map();

  private readonly secret: string;

  constructor(options: ApolloClientOptions) {
    const { appId, url, clusterName = 'cluster', namespaceNames } = options;
    this.appId = appId;
    this.configServerUrl = url;
    this.clusterName = clusterName;
    this.notifications = namespaceNames.reduce<Record<string, number>>(
      (acc, namespaceName) => {
        acc[namespaceName] = -1;
        return acc;
      },
      Object.create(null),
    );
  }

  // -------------------------------------------------------------------------
  // Public Methods
  // -------------------------------------------------------------------------

  public async start(): Promise<void> {
    if (this.notifications.length === 0) return;
    return this._doLongPollingRequest();
  }

  // -------------------------------------------------------------------------
  // Private Methods
  // -------------------------------------------------------------------------

  private async _doLongPollingRequest() {
    try {
      const url = `${this.configServerUrl}/notifications/v2`;
      const notifications = JSON.stringify(
        Object.keys(this.notifications).map(namespaceName => ({
          namespaceName,
          notificationId: this.notifications[namespaceName],
        })),
      );
      const params = {
        appId: this.appId,
        cluster: this.clusterName,
        notifications: encodeURIComponent(notifications),
      };
      const { data, status } = await this._fetch<
        ApolloConfigLongPollingResponse[]
      >({
        url,
        params,
        timeout: this.longPollingTimeout,
      });

      // long polling end, start next long polling.
      if (status === 304) {
        this.start();
      }

      const source$ = from(data).pipe(
        map(async ({ namespaceName, notificationId }) => {
          if (!namespaceName || !notificationId) {
            throw new Error(
              `Unexpected namespaceName or notificationId, namespaceName:${namespaceName}, notificationId:${notificationId}`,
            );
          }
          await this._fetchConfig(namespaceName);
          this.notifications[namespaceName] = notificationId;
        }),
      );
      await lastValueFrom(source$);
    } catch (error) {
      throw error;
    }
  }

  private async _fetchConfig(namespaceName: string): Promise<void> {
    try {
      const url = `${this.configServerUrl}/configs/${this.appId}/${this.clusterName}/${namespaceName}`;
      const params = {
        ip: this.clientIp,
        releaseKey: this.releaseKeys.get(namespaceName),
      };
      const { data } = await this._fetch<ApolloConfigResponse>({
        url,
        params,
      });
      if (data) {
        getConfigurationStorage().setConfig(data);
      }
    } catch (error) {
      // TODO
      throw error;
    }
  }

  private async _fetch<T>(args: {
    url: string;
    params: Record<string, any>;
    timeout?: number;
  }) {
    const { url, params, timeout } = args;
    const search = Object.keys(params)
      .reduce<string[]>((acc, currKey) => {
        if (params[currKey] !== undefined) {
          acc.push(`${currKey}=${params[currKey]}`);
        }
        return acc;
      }, [])
      .join('&');
    const urlString = search ? `${url}?${search}` : url;
    const headers = this._genAuthHeaders(urlString);
    return request.get<T>(urlString, {
      timeout,
      headers,
    });
  }

  private _genAuthHeaders(urlString: string) {
    const { secret, appId } = this;
    if (!secret) return {};

    const Timestamp = Date.now();
    const Authorization = this._genSignature({
      appId,
      secret,
      urlString,
      timestamp: Timestamp,
    });
    return {
      Authorization,
      Timestamp,
    };
  }
  /**
   * 生成签名
   *
   * @param url 传入请求URL
   * @param timestamp 传入当前时间戳
   * @param secret 传入Apollo accessKey
   * @returns {string} 返回base64的签名字符串
   */
  private _genSignature(args: {
    urlString: string;
    timestamp: number;
    secret: string;
    appId: string;
  }): string {
    const { urlString, timestamp, secret, appId } = args;
    const url = new URL(urlString);
    const urlPath = url.pathname + url.search;
    const hmac = crypto.createHmac('sha1', secret);
    const signature = hmac
      .update(`${timestamp}\n${urlPath}`)
      .digest()
      .toString('base64');
    return `Apollo ${appId}:${signature}`;
  }
}
