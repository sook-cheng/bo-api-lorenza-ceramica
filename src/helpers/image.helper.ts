import { pipeline } from "node:stream/promises";
import fs from 'node:fs';

export const imagesFolder = '/home/lorenzac/public_html/images';

export const uploadImageFile = (folder: string, image: any) => {
    pipeline(image.file, fs.createWriteStream(`${imagesFolder}/${folder}/${image.filename}`, { highWaterMark: 10 * 1024 * 1024 }))
}

export const removeImageFile = (folder: string, filename: string) => {
    const file = `${imagesFolder}/${folder}/${filename}`;
    if (fs.existsSync(file)) {
        fs.unlinkSync(`${imagesFolder}/${folder}/${filename}`)
    }
}

export const formatImageUrl = (folder: string, filename: string) => {
    return encodeURI(`https://lorenzaceramica.com/images/${folder}/${filename}`);
}