import { ApolloClient } from './apollo-client';
import { ApolloClientOptions } from './interfaces/apollo-client.interface';

// -------------------------------------------------------------------------
// Decorators
// -------------------------------------------------------------------------
export { ApolloConfiguration } from './decorators/apollo-configuration.decorator';
export { Props } from './decorators/props.decorator';

// -------------------------------------------------------------------------
// Interfaces
// -------------------------------------------------------------------------
export { ConnectionOptions } from './interfaces/connection.interface';
export { PropOptions } from './interfaces/prop-options.interface';
export { ValueType } from './interfaces/common.interface';
export { PropMetadataArgs } from './interfaces/prop-metadata-args.interface';
// -------------------------------------------------------------------------
// Functions
// -------------------------------------------------------------------------
/**
 * create Apollo client
 * @param options
 * @returns ApolloClient
 */
export const createClient = async (
  options: ApolloClientOptions,
): Promise<void> => {
  const client = new ApolloClient(options);
  await client.start();
};
