import { catchError, concatMap, mergeMap } from 'rxjs/operators';
import { defer, from, lastValueFrom } from "rxjs";
import { INotification, longPollingRequest } from "./api";
import { BaseOptions } from "./interfaces/apollo-client.interface";
import { getMetadataArgsStorage } from "./meta-data-args.storage";
import { Namespace } from "./namespace";
import { handleRetry } from "./utils/utils";

export class Cluster {
  private options: BaseOptions;

  /**
   * long polling read timeout
   */
  private readonly longPollingTimeout: number = 70 * 1000;
  private readonly enableLongPolling: boolean = true;
  public readonly namespaces: Map<string, Namespace>;

  private readonly delay = 3000;
  constructor(options: BaseOptions, namespaces: Function[]){
    this.options = options
    this.namespaces = new Map(namespaces.map(target => {
      const cls = getMetadataArgsStorage().findNamespace(target);
      if (!cls?.name) {
        throw new Error(`Namespace can not found, do you inject it with the decorator "ApolloConfiguration"`);
      }
      return [cls.name, this.creatNamespace(cls.name)];
    }))
  }

  public async firstLoadData() {
    const source$ = from(this.namespaces).pipe(
      concatMap(([_, ns]) =>
        defer(() => ns.fetchDataAndSave()).pipe(handleRetry(3)),
      ),
    );
    await lastValueFrom(source$);
  }

  
  public async longPolling(): Promise<void> {
    if (this.enableLongPolling) {
      const source$ = lastValueFrom(defer(() => {
        const notifications = this.getNotifications();
        return longPollingRequest({
          ...this.options,
          notifications: notifications,
          timeout: this.longPollingTimeout,
        })
      }).pipe(handleRetry()));
      await source$.then(async (res) => {
        if (res?.data && !res.noChange) {
          const longPollingData = res.data;
          await this.reloadConfig(longPollingData)
        }
        this.longPolling();
      }).catch(err => {
        console.error('Apollo LongPolling error', err)
        setTimeout(() => this.longPolling(), this.delay)
      });
      return;
    }
    return;
  }

  private async reloadConfig(notifications: INotification[]): Promise<void> {
    await lastValueFrom(
      from(notifications).pipe(
        mergeMap(async (notification) => {
          const { namespaceName, notificationId } = notification;
          const ns = this.namespaces.get(namespaceName) as Namespace;
          return ns.fetchDataAndSave().then(()=>{
            ns.notificationId = notificationId;
          });
        }),
        catchError(e => {
          console.error('Apollo reloadConfig error', e)
          return e;
        })
      )
    );
  }

  private getNotifications(): INotification[] {
    const ret: INotification[] = [];
    this.namespaces.forEach((ns, namespaceName) => {
      const notificationId = ns.notificationId
      ret.push({
        namespaceName,
        notificationId,
      })
    })
    return ret;
  }

  private creatNamespace(namespaceName: string): Namespace {
    return new Namespace(this.options, namespaceName)
  }
}