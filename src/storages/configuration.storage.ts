import get from 'get-value';
import { ApolloConfigResponse, Configurations } from '../interfaces/apollo-client.interface';

type ConfigValuesMap = Record<string, Configurations>
export class ConfigurationStorage {
  // -------------------------------------------------------------------------
  // Properties
  // -------------------------------------------------------------------------
  private configValues: ConfigValuesMap  = Object.create(null);
  private releaseKeys: Map<string, string> = new Map();

  // -------------------------------------------------------------------------
  // Public Functions
  // -------------------------------------------------------------------------
  public setConfig(data: ApolloConfigResponse) {
    this.configValues[data.namespaceName] = data.configurations;
    this.setReleaseKey(data.namespaceName, data.releaseKey);
  }

  public getAllConfigs(): ConfigValuesMap {
    return this.configValues;
  }

  public getConfig(namespaceName: string): Configurations | undefined {
    return this.configValues[namespaceName];
  }

  public getConfigValue<T>(key: string, namespaceName: string = 'application'): T | undefined {
    const config = this.configValues[namespaceName];
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
