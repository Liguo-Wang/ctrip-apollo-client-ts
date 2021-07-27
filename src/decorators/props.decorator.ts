import 'reflect-metadata';
import { PROPERTY_METADATA } from '../constant';
import { PropMetadataArgs } from '../interfaces/prop-metadata-args.interface';
import { PropOptions } from '../interfaces/prop-options.interface';
import { isString, isUndefined } from '../utils/utils';


export function Props(): PropertyDecorator;

export function Props(key: string): PropertyDecorator;

export function Props(options: PropOptions): PropertyDecorator;

export function Props(keyOrOptions?: string | PropOptions): PropertyDecorator {
  const [key, type, transformer] = isUndefined(keyOrOptions)
    ? [undefined, undefined, undefined]
    : isString(keyOrOptions)
    ? [keyOrOptions, undefined, undefined]
    : [keyOrOptions?.key, keyOrOptions?.type, keyOrOptions?.transformer];

  return (target: Object, propertyName: string): void => {
    let propsMetaData: PropMetadataArgs[] = Reflect.getMetadata(PROPERTY_METADATA, target);
    if (!propsMetaData) {
      propsMetaData = [];
      Reflect.defineMetadata(PROPERTY_METADATA, propsMetaData, target);
    }
    propsMetaData.push({
      target: target.constructor,
      propertyName,
      type,
      transformer,
      key,
    });
  };
}
