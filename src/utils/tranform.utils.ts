
import { PropMetadataArgs } from '../interfaces/prop-metadata-args.interface';
import { DateUtils } from '../utils/date.utils';
import { isString } from './utils';

/**
 * Prepares given value to a value to be persisted, based on its column type or metadata.
 */
export function prepareConfigValue(value: string | undefined, propMetadata?: PropMetadataArgs): any {
  if (propMetadata === undefined) {
    return value;
  }
  if (value === null || value === undefined)
    return propMetadata?.transformer ? propMetadata.transformer(value) : value;

  let ret: any = value;
  if (propMetadata.type === 'boolean') {
    try {
      ret = isString(value) ? JSON.parse(value) : false;
    } catch {
      ret = false;
    }
  } else if (propMetadata.type === 'datetime') {
    ret = DateUtils.normalizeHydratedDate(value);
  } else if (propMetadata.type === 'date') {
    ret = DateUtils.mixedDateToDateString(value);
  } else if (propMetadata.type === 'json') {
    ret = typeof value === 'string' ? JSON.parse(value) : value;
  } else if (propMetadata.type === 'time') {
    ret = DateUtils.mixedTimeToString(value);
  } else if (propMetadata.type === 'array') {
    ret = DateUtils.stringToSimpleArray(value);
  } else if (propMetadata.type === 'number') {
    ret = Number(value);
  }

  if (propMetadata.transformer) ret = propMetadata.transformer(ret);

  return ret;
}