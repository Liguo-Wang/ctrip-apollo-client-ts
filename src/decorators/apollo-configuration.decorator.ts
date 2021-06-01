import { DEFAULT_NAMESPACE, PROPERTY_METADATA } from './../constant';
import { isString } from '../utils/utils';
import { getConfigurationStorage } from '../configuration.storage';
import get from 'get-value';
import { PropMetadataArgs } from '../interfaces/prop-metadata-args.interface';
import { DateUtils } from '../utils/date.utils';

interface CacheValue {
  releaseKey: string;
  value: any;
}
/**
 * @ApolloConfiguration
 * @param prefix
 * @param namespace
 */
export function ApolloConfiguration(): ClassDecorator;
export function ApolloConfiguration(namespace: string): ClassDecorator;

export function ApolloConfiguration(configNamespace?: string): ClassDecorator {
  const namespace = isString(configNamespace)
    ? configNamespace
    : DEFAULT_NAMESPACE;
  const configCache: Record<string, CacheValue> = Object.create(null);

  return function(target) {
    const props: PropMetadataArgs[] = Reflect.getMetadata(
      PROPERTY_METADATA,
      target,
    );
    props?.forEach(propMetadata => {
      const propName = propMetadata.propertyName;
      Reflect.defineProperty(target, propName, {
        get() {
          const releaseKey = getConfigurationStorage().getReleaseKey(namespace);
          if (
            releaseKey &&
            releaseKey !== configCache[releaseKey]?.releaseKey
          ) {
            const key = propMetadata?.key ?? propName;
            const pathKey = key;
            const configValue = get(
              getConfigurationStorage().getConfig(namespace),
              pathKey,
            );
            const value = prepareConfigValue(configValue, propMetadata);
            configCache[propName] = {
              value,
              releaseKey,
            };
          }

          return get(configCache, propName)?.value;
        },
      });
    });
  };
}

/**
 * Prepares given value to a value to be persisted, based on its column type or metadata.
 */
function prepareConfigValue(value: any, propMetadata?: PropMetadataArgs): any {
  if (propMetadata === undefined) {
    return value;
  }
  if (value === null || value === undefined)
    return propMetadata?.transformer ? propMetadata.transformer(value) : value;

  if (propMetadata.type === 'boolean') {
    try {
      value = isString(value) ? JSON.parse(value) : false;
    } catch {
      value = false;
    }
  } else if (propMetadata.type === 'datetime') {
    value = DateUtils.normalizeHydratedDate(value);
  } else if (propMetadata.type === 'date') {
    value = DateUtils.mixedDateToDateString(value);
  } else if (propMetadata.type === 'json') {
    value = typeof value === 'string' ? JSON.parse(value) : value;
  } else if (propMetadata.type === 'time') {
    value = DateUtils.mixedTimeToString(value);
  } else if (propMetadata.type === 'array') {
    value = DateUtils.stringToSimpleArray(value);
  } else if (propMetadata.type === 'number') {
    value = Number(value);
  }

  if (propMetadata.transformer) value = propMetadata.transformer(value);

  return value;
}
