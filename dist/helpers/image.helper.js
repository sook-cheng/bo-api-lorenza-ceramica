"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatImageUrl = exports.removeImageFile = exports.uploadImageFile = exports.imagesFolder = void 0;
const promises_1 = require("node:stream/promises");
const node_fs_1 = __importDefault(require("node:fs"));
exports.imagesFolder = '/home/lorenzac/public_html/images';
const uploadImageFile = (folder, image) => {
    (0, promises_1.pipeline)(image.file, node_fs_1.default.createWriteStream(`${exports.imagesFolder}/${folder}/${image.filename}`, { highWaterMark: 10 * 1024 * 1024 }));
};
exports.uploadImageFile = uploadImageFile;
const removeImageFile = (folder, filename) => {
    node_fs_1.default.unlinkSync(`${exports.imagesFolder}/${folder}/${filename}`);
};
exports.removeImageFile = removeImageFile;
const formatImageUrl = (folder, filename) => {
    return `https://lorenzaceramica.com/images/${folder}/${filename}`;
};
exports.formatImageUrl = formatImageUrl;
//# sourceMappingURL=image.helper.js.map