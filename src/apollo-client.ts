import { ApolloClientOptions } from './interfaces/apollo-client.interface';
import * as ip from 'ip';
import { Cluster } from './cluster';

export class ApolloClient {
  // -------------------------------------------------------------------------
  // Private Methods
  // -------------------------------------------------------------------------

  private readonly options: ApolloClientOptions;

  public readonly cluster: Cluster;

  constructor(options: ApolloClientOptions) {
    const { clusterName = 'default', namespaceNames = [] } = options;
    this.options = {
      ...options,
      clusterName,
      ip: ip.address(),
    };
    this.cluster = new Cluster(this.options, namespaceNames);
  }

  // -------------------------------------------------------------------------
  // Public Methods
  // -------------------------------------------------------------------------

  public async start(): Promise<void> {
    await this.cluster.longPolling()
    // setTimeout(() => {
    //   this.cluster.longPolling()
    // }, 10000);
  }
}
