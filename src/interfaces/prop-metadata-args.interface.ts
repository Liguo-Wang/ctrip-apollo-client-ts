
import { ValueType } from './common.interface';
import { TransformerFunction } from './value-transformer.interface';
/**
 * Arguments for PropsMetadata class.
 */
export interface PropMetadataArgs {
  /**
   * Class to which property is applied.
   */
  readonly target: Function | string;
  /**
   * Class's property name to which property is applied.
   */
  readonly propertyName: string;
  /**
   *Property type. Must be one of the value from the ValueType class.
   */
  readonly type?: ValueType;
  /**
   * Property key in the Apollo configuration.
   */
  readonly key?: string;
  /**
   * Specifies a value transformer that is to be used to (un)marshal
   */
  readonly transformer?: TransformerFunction;
}
