"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Props = void 0;
var constant_1 = require("../constant");
var utils_1 = require("../utils/utils");
function Props(keyOrOptions) {
    var _a = utils_1.isUndefined(keyOrOptions)
        ? [undefined, undefined, undefined]
        : utils_1.isString(keyOrOptions)
            ? [keyOrOptions, undefined, undefined]
            : [keyOrOptions === null || keyOrOptions === void 0 ? void 0 : keyOrOptions.key, keyOrOptions === null || keyOrOptions === void 0 ? void 0 : keyOrOptions.type, keyOrOptions === null || keyOrOptions === void 0 ? void 0 : keyOrOptions.transformer], key = _a[0], type = _a[1], transformer = _a[2];
    return function (target, propertyName) {
        var propsMetaData = Reflect.getMetadata(constant_1.PROPERTY_METADATA, target);
        if (!propsMetaData) {
            propsMetaData = [];
            Reflect.defineMetadata(constant_1.PROPERTY_METADATA, propsMetaData, target);
        }
        propsMetaData.push({
            target: target.constructor,
            propertyName: propertyName,
            type: type,
            transformer: transformer,
            key: key,
        });
    };
}
exports.Props = Props;
//# sourceMappingURL=props.decorator.js.map