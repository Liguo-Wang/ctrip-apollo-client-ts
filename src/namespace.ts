import { fetchConfigRequest } from './api';
import { getConfigurationStorage } from './storages/configuration.storage';
import {
  BaseOptions,
  NamespaceOptions,
} from './interfaces/apollo-client.interface';
import { prepareConfigValue } from './utils/tranform.utils';
import { getMetadataArgsStorage } from './meta-data-args.storage';
import { PROPERTY_METADATA } from './constant';
import { PropMetadataArgs } from './interfaces/prop-metadata-args.interface';
import { log } from './utils';

export class Namespace {
  private options: NamespaceOptions;

  private releaseKey: string;

  public notificationId: number;

  constructor(options: BaseOptions, namespaceName: string) {
    this.options = {
      ...options,
      namespaceName,
    };
    this.releaseKey = '';
    this.notificationId = -1;
  }

  public async fetchDataAndSave(): Promise<void> {
    const { data, noChange } = await this.fetchDataWithNoCache();
    log('fetch config data: ', data, noChange)
    if (noChange) return;
    if (data) {
      const newConfig = data.configurations;
      const namespaceName = this.getNamespaceName();
      const NSMetaData = getMetadataArgsStorage().findNamespaceByName(namespaceName);
      if (NSMetaData) {
        const cacheData = getConfigurationStorage()?.getConfig(namespaceName) ?? {};
        const { target } = NSMetaData;
        const props: PropMetadataArgs[] = Reflect.getMetadata(PROPERTY_METADATA, target) ?? [];
        props.forEach(propMetadata => {
          const propName = propMetadata.propertyName;
          const pathKey = propMetadata.key ?? propName;
          const newValue = newConfig[pathKey];
          const oldValue = cacheData[pathKey];
          if (newValue !== oldValue) {
            const value = prepareConfigValue(newValue, propMetadata);
            const flag = Reflect.defineProperty(target, propName, { value, writable: true })
            console.info(`Apollo value change:  ns: ${namespaceName}, key: ${pathKey}, value: ${value}, changed success: ${flag}`)
          }
        })
      }
      
      getConfigurationStorage().setConfig(data);
      this.releaseKey = data.releaseKey;
    }
  }
  public async fetchDataWithNoCache() {
    return await fetchConfigRequest({
      ...this.options,
      releaseKey: this.releaseKey,
    });
  }

  public getNamespaceName() {
    return this.options.namespaceName;
  }

  public updateNamespaceTarget() {

  }
}
