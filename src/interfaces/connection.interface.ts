export interface ConnectionOptions {
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
   * Default: default.
   */
  clusterName?: string;

  /**
   * The Namespace name.
   * Default: application.
   */
  namespaceName?: string;

  /**
   * The IP of the machine where the Apollo application is deployed.
   * This parameter is optional and is used to implement grayscale publishing.
   */
  ip?: string;

  secret?: string;
}
