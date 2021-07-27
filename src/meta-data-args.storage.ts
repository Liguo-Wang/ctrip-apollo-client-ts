import { NamespaceMetaArgs } from "./interfaces/namespace-metadata-args.interface";

export class MetadataArgsStorage{
  // -------------------------------------------------------------------------
  // Properties
  // -------------------------------------------------------------------------

  readonly namespaces: NamespaceMetaArgs[] = []
  
  public findNamespace(target: Function): NamespaceMetaArgs | undefined {
    return this.namespaces.find(namespace => namespace.target === target);
  }

  public findNamespaceByName(namespacesName: string): NamespaceMetaArgs | undefined {
    return this.namespaces.find(namespace => namespace.name === namespacesName);
  }
}

/**
 * Gets apollo configuration storage.
 */
 export function getMetadataArgsStorage(): MetadataArgsStorage {
  const globalScope = global as any;
  if (!globalScope._metadataArgsStorage)
    globalScope._metadataArgsStorage = new MetadataArgsStorage();

  return globalScope._metadataArgsStorage;
}