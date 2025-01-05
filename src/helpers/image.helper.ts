import { pipeline } from "node:stream/promises";
import fs from 'node:fs';

export const imagesFolder = '/home/lorenzac/public_html/images';

export const uploadImageFile = (folder: string, image: any) => {
    pipeline(image.file, fs.createWriteStream(`${imagesFolder}/${folder}/${image.filename}}`))
}

export const removeImageFile = (folder: string, filename: string) => {
    fs.unlinkSync(`${imagesFolder}/${folder}/${filename}`)
}

export const formatImageUrl = (folder: string, filename: string) => {
    return `https://lorenzaceramica.com/images/${folder}/${filename}`;
}