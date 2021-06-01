"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApolloConfiguration = void 0;
var constant_1 = require("./../constant");
var utils_1 = require("../utils/utils");
var configuration_storage_1 = require("../configuration.storage");
var get_value_1 = require("get-value");
var date_utils_1 = require("../utils/date.utils");
function ApolloConfiguration(configNamespace) {
    var namespace = utils_1.isString(configNamespace)
        ? configNamespace
        : constant_1.DEFAULT_NAMESPACE;
    var configCache = Object.create(null);
    return function (target) {
        var props = Reflect.getMetadata(constant_1.PROPERTY_METADATA, target);
        props === null || props === void 0 ? void 0 : props.forEach(function (propMetadata) {
            var propName = propMetadata.propertyName;
            Reflect.defineProperty(target, propName, {
                get: function () {
                    var _a, _b, _c;
                    var releaseKey = configuration_storage_1.getConfigurationStorage().getReleaseKey(namespace);
                    if (releaseKey &&
                        releaseKey !== ((_a = configCache[releaseKey]) === null || _a === void 0 ? void 0 : _a.releaseKey)) {
                        var key = (_b = propMetadata === null || propMetadata === void 0 ? void 0 : propMetadata.key) !== null && _b !== void 0 ? _b : propName;
                        var pathKey = key;
                        var configValue = get_value_1.default(configuration_storage_1.getConfigurationStorage().getConfig(namespace), pathKey);
                        var value = prepareConfigValue(configValue, propMetadata);
                        configCache[propName] = {
                            value: value,
                            releaseKey: releaseKey,
                        };
                    }
                    return (_c = get_value_1.default(configCache, propName)) === null || _c === void 0 ? void 0 : _c.value;
                },
            });
        });
    };
}
exports.ApolloConfiguration = ApolloConfiguration;
/**
 * Prepares given value to a value to be persisted, based on its column type or metadata.
 */
function prepareConfigValue(value, propMetadata) {
    if (propMetadata === undefined) {
        return value;
    }
    if (value === null || value === undefined)
        return (propMetadata === null || propMetadata === void 0 ? void 0 : propMetadata.transformer) ? propMetadata.transformer(value) : value;
    if (propMetadata.type === 'boolean') {
        try {
            value = utils_1.isString(value) ? JSON.parse(value) : false;
        }
        catch (_a) {
            value = false;
        }
    }
    else if (propMetadata.type === 'datetime') {
        value = date_utils_1.DateUtils.normalizeHydratedDate(value);
    }
    else if (propMetadata.type === 'date') {
        value = date_utils_1.DateUtils.mixedDateToDateString(value);
    }
    else if (propMetadata.type === 'json') {
        value = typeof value === 'string' ? JSON.parse(value) : value;
    }
    else if (propMetadata.type === 'time') {
        value = date_utils_1.DateUtils.mixedTimeToString(value);
    }
    else if (propMetadata.type === 'array') {
        value = date_utils_1.DateUtils.stringToSimpleArray(value);
    }
    else if (propMetadata.type === 'number') {
        value = Number(value);
    }
    if (propMetadata.transformer)
        value = propMetadata.transformer(value);
    return value;
}
//# sourceMappingURL=apollo-configuration.decorator.js.map