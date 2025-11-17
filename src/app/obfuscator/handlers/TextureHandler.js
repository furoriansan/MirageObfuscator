import hashString, {includesIgnoreCase} from "../lib/Helpers";
import {FileHandler} from "./FileHandler"
import path from "path";

export class TextureHandler {
    static handle(cachePath, keyword) {
        const textureFiles = FileHandler.getAllFiles(`${cachePath}/textures/`);
        if (textureFiles.length === 0) return true;
        for (const filePath of textureFiles) {
            try {
                const imageFile = FileHandler.getFileBuffer(filePath);
                console.info(`Obfuscating ${filePath}`);
                FileHandler.deleteFile(filePath);
                const extensionType = path.extname(filePath);
                const fileName = path.basename(filePath, extensionType);
                const newFileName = (includesIgnoreCase(fileName, keyword) ? hashString(fileName) : fileName) + extensionType;
                FileHandler.saveFile(path.join(path.dirname(filePath), newFileName), imageFile);
            } catch (error) {
                console.error(`Failed to handle ${filePath}:`, error);
            }
        }
        return true;
    }
}