import get from 'get-value';
import { ApolloConfigResponse } from './interfaces/apollo-client.interface';

export class ConfigurationStorage {
  // -------------------------------------------------------------------------
  // Properties
  // -------------------------------------------------------------------------
  private configValues: Record<string, any> = Object.create(null);
  private releaseKeys: Map<string, string> = new Map();

  // -------------------------------------------------------------------------
  // Public Functions
  // -------------------------------------------------------------------------
  public setConfig(data: ApolloConfigResponse) {
    this.configValues[data.namespaceName] = data.configurations;
    this.setReleaseKey(data.namespaceName, data.releaseKey);
  }

  public getAllConfigs<T>(): T {
    return this.configValues as T;
  }

  public getConfig<T>(namespace: string): T {
    return get(this.configValues, namespace);
  }

  public getConfigValue<T>(key: string, namespace: string): T | undefined {
    const config = this.configValues[namespace];
    if (!config) return undefined;
    return get(config, key);
  }

  public getReleaseKey(namespace: string): string | undefined {
    return this.releaseKeys.get(namespace);
  }

  public setReleaseKey(namespace: string, releaseKey: string): void {
    this.releaseKeys.set(namespace, releaseKey);
  }
}

/**
 * Gets apollo configuration storage.
 */
export function getConfigurationStorage(): ConfigurationStorage {
  const globalScope = global as any;
  if (!globalScope._apolloConfigurationsStorage)
    globalScope._apolloConfigurationsStorage = new ConfigurationStorage();

  return globalScope._apolloConfigurationsStorage;
}
