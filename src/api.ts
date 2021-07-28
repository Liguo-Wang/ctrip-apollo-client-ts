import { URL } from 'url';
import * as crypto from 'crypto';
import { request } from './utils/request.util';
import { BadHttpStatusError } from './error/bad-http-status.error';
import { ApolloConfigLongPollingResponse, ApolloConfigResponse } from './interfaces/apollo-client.interface';

export interface Response<T> {
  data?: T;
  noChange?: boolean;
}
export interface INotification {
  namespaceName: string;
  notificationId: number;
}
export interface LongPollingArgs {
  configServerUrl: string;
  appId: string;
  clusterName: string;
  secret?: string;
  notifications: INotification[];
  timeout?: number;
}

export interface FetchConfigRequestArgs {
  configServerUrl: string;
  appId: string;
  clusterName: string;
  namespaceName: string;
  releaseKey: string;
  ip?: string;
  secret?: string;
  timeout?: number;
}

interface GenAuthHeadersArgs {
  urlString: string;
  secret?: string;
  appId: string;
}

export async function longPollingRequest(args: LongPollingArgs): Promise<Response<ApolloConfigLongPollingResponse[]>> {
  if (!args?.notifications || !Object.keys(args.notifications).length) {
    return {};
  }
  const { configServerUrl, appId, secret, timeout, clusterName } = args;
  const url = `${configServerUrl}/notifications/v2`;
  const notifications: string = JSON.stringify(args.notifications);
  const params = {
    appId: appId,
    cluster: clusterName,
    notifications: encodeURIComponent(notifications),
    secret: secret,
  };
  const { data, status } = await fetch<ApolloConfigLongPollingResponse[]>({
    url,
    params,
    timeout,
    appId,
    secret,
  });
  if (status === 304) {
    return { noChange: true };
  }

  if (status !== 200) {
    throw new BadHttpStatusError('long polling', status);
  }
  return {
    data,
    noChange: false,
  };
}

export async function fetchConfigRequest(args: FetchConfigRequestArgs): Promise<Response<ApolloConfigResponse>>  {
  const {
    configServerUrl,
    appId,
    clusterName,
    namespaceName,
    timeout,
    secret,
    ip,
    releaseKey,
  } = args;
  const url = `${configServerUrl}/configs/${appId}/${clusterName}/${namespaceName}`;
  const params = { ip, releaseKey };
  const { data, status } = await fetch<ApolloConfigResponse>({
    url,
    params,
    timeout,
    secret,
    appId,
  });

  if (status === 304) {
    return { noChange: true };
  }

  if (status !== 200) {
    throw new BadHttpStatusError('long polling', status);
  }
  return {
    data,
    noChange: false,
  };
}

async function fetch<T>(args: {
  url: string;
  params: Record<string, any>;
  appId: string;
  secret?: string;
  timeout?: number;
}) {
  const { url, params, timeout , appId, secret } = args;
  const search = Object.keys(params)
    .reduce<string[]>((acc, currKey) => {
      if (params[currKey] !== undefined) {
        acc.push(`${currKey}=${params[currKey]}`);
      }
      return acc;
    }, [])
    .join('&');
  const urlString = search ? `${url}?${search}` : url;
  const headers = genAuthHeaders({ urlString, appId, secret });
  return request.get<T>(urlString, {
    timeout,
    headers,
  });
}


function genAuthHeaders(args: GenAuthHeadersArgs) {
  const { urlString, secret, appId } = args;
  if (!secret) return {};

  const Timestamp = Date.now();
  const Authorization = genSignature({
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
function genSignature(args: {
  urlString: string;
  timestamp: number;
  secret: string;
  appId: string;
}): string | undefined {
  const { urlString, timestamp, secret, appId } = args;
  
  if (!secret) return undefined;

  const url = new URL(urlString);
  const urlPath = url.pathname + url.search;
  const hmac = crypto.createHmac('sha1', secret);
  const signature = hmac
    .update(`${timestamp}\n${urlPath}`)
    .digest()
    .toString('base64');
  return `Apollo ${appId}:${signature}`;
}
