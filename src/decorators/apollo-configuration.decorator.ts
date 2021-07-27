import { DEFAULT_NAMESPACE } from './../constant';
import { isString } from '../utils/utils';

import { getMetadataArgsStorage } from '../meta-data-args.storage';

/**
 * @ApolloConfiguration
 * @param prefix
 * @param namespace
 */
export function ApolloConfiguration(): ClassDecorator;
export function ApolloConfiguration(namespace: string): ClassDecorator;

export function ApolloConfiguration(configNamespace: string = DEFAULT_NAMESPACE): ClassDecorator {
  const namespace = isString(configNamespace)
    ? configNamespace
    : DEFAULT_NAMESPACE;

  return function(target) {
    // Save meta data args info.
    getMetadataArgsStorage().namespaces.push({
      target,
      name: namespace,
    })

    
    // props?.forEach(propMetadata => {
    //   const propName = propMetadata.propertyName;
    //   Reflect.defineProperty(target, propName, {
    //     get() {
    //       const releaseKey = getConfigurationStorage().getReleaseKey(namespace);
    //       if (
    //         releaseKey &&
    //         releaseKey !== configCache[propName]?.releaseKey
    //       ) {
    //         const pathKey = propMetadata?.key ?? propName;
    //         const configValue = get(
    //           getConfigurationStorage().getConfig(namespace),
    //           pathKey,
    //         );
    //         const value = prepareConfigValue(configValue, propMetadata);
    //         configCache[propName] = {
    //           value,
    //           releaseKey,
    //         };
    //       }

    //       return get(configCache, propName)?.value;
    //     },
    //   });
    // });
  };
}


