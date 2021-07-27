export interface BaseOptions {
  /**
   * The address of the Apollo configuration service.
   */
  configServerUrl: string;

  /**
   * application ID.
   */
  appId: string;

  /**
   * The cluster name of Apollo.
   * Default - default.
   */
  clusterName: string;

  secret?: string;

  /**
   * The IP of the machine where the Apollo application is deployed. 
   * This parameter is optional and is used to implement grayscale publishing.
   */
  ip?: string;
}

export interface NamespaceOptions extends BaseOptions {
  /**
   * The name of namespace.
   * Default: application
   */
  namespaceName: string;
}

export interface ApolloClientOptions extends BaseOptions {
  /**
   * The names of namespace.
   * Default ['application']
   */
  namespaceNames?: Function[];
}

export type Configurations = Record<string, string>;
export interface ApolloConfigResponse {
  appId: string;
  cluster: string;
  namespaceName: string;
  configurations: Configurations;
  releaseKey: string;
}

export interface ApolloConfigLongPollingResponse {
  namespaceName: string;
  notificationId: number;
  messages: {
    details: Record<string, number>;
  };
}

export interface INotifications {
  namespaceName: string;
  notificationId: number;
}