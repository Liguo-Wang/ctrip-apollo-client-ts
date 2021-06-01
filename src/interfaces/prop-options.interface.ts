import { ValueType } from "./common.interface";

export interface PropOptions {
  type?: ValueType;
  key?: string;
  transformer?: (value: any) => any;
}