export interface ApolloClientOptions {
  /**
   * The address of the Apollo configuration service.
   */
  url: string;

  /**
   * application ID.
   */
  appId: string;

  /**
   * The cluster name of Apollo.
   * Default is normally passed in.
   */
  clusterName: string;

  /**
   * The names of namespace.
   */
  namespaceNames: string[];

  /**
   * The IP of the machine where the Apollo application is deployed. 
   * This parameter is optional and is used to implement grayscale publishing.
   */
  ip?: string;

  
  secret?: string;
}

export interface ApolloConfigResponse {
  appId: string;
  cluster: string;
  namespaceName: string;
  configurations: Record<string, any>;
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
