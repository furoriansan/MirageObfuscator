import path from "path";
import AdmZip from 'adm-zip';
import hashString, {includesIgnoreCase} from "../lib/Helpers.ts";
import {AnimationControllerHandler} from "../handlers/AnimationControllerHandler";
import {FileHandler} from "../handlers/FileHandler";
import {AnimationHandler} from "../handlers/AnimationHandler";
import {EntityHandler} from "@/app/obfuscator/handlers/EntityHandler";
import {RenderControllerHandler} from "@/app/obfuscator/handlers/RenderControllerHandler";
import {AttachableHandler} from "@/app/obfuscator/handlers/AttachableHandler";
import {GeometryHandler} from "@/app/obfuscator/handlers/GeometryHandler";
import {TextureHandler} from "@/app/obfuscator/handlers/TextureHandler";
import {SoundHandler} from "@/app/obfuscator/handlers/SoundHandler";
import {ParticleHandler} from "@/app/obfuscator/handlers/ParticleHandler";

const UPLOAD_DIR = path.resolve(process.env.APP_ENV === "DEV" ? "private/cached" : (process.env.GLOBAL_PATH ?? ""));
export const ALLOWED_FOLDERS = ["animation_controllers", "animations", "attachables", "entity", "models", "particles", "render_controllers", "textures", "sounds"]

export class ObfuscationHandler {

    static async initiateObfuscation(uploadedFile) {
        const fileName = hashString(uploadedFile.name.replace(/\.[^/.]+$/, ""));
        const filePath = `${UPLOAD_DIR}/${fileName}/`;

        if (FileHandler.doesFileExists(filePath)) {
            console.error('File already exists, aborting.');
            return {statusCode: 0x01, message: "Your file is already being processed, please wait."}
        }

        const convertedZip = new AdmZip(Buffer.from(await uploadedFile.arrayBuffer()));
        convertedZip.extractAllTo(filePath, true);

        const userPackFiles = FileHandler.getFiles(filePath);
        if (userPackFiles.length === 1) {
            console.error('Invalid folder structure, aborting.');
            FileHandler.deleteFile(filePath);
            return {statusCode: 0x02, message: "Your resource pack has an invalid folder structure, have you read the instructions?"}

        }

        const hasConfig = userPackFiles.some(
            file => includesIgnoreCase(file.name,"mirage_config.json") && file.isFile
        );
        if (!hasConfig) {
            console.error("Can't find configuration file, aborting.");
            FileHandler.deleteFile(filePath);
            return {statusCode: 0x03, message: "We couldn't find the mirage config file, have you read the instructions?"}
        }
        let userKeyword = "";
        let userConfigFile = FileHandler.readFile(`${filePath}/mirage_config.json`, "utf8");
        if (!userConfigFile) {
            console.error("Can't open keyword file, aborting.");
            FileHandler.deleteFile(filePath);
            return {statusCode: 0x04, message: "Failed to open config file, have you read the instructions?"}
        } else {
            const configData = JSON.parse(userConfigFile);
            if (!configData.keyword) {
                console.error("Can't find keyword in user config file, aborting.");
                FileHandler.deleteFile(filePath);
                return {statusCode: 0x05, message: "Cannot find keyword in config file, have you read the instructions?"}
            }
            userKeyword = configData.keyword;
        }

        const foldersToObfuscate = [];
        userPackFiles.forEach(dirFile => {
            ALLOWED_FOLDERS.forEach(folder => {
                if(includesIgnoreCase(folder, dirFile.name)){
                    foldersToObfuscate.push(dirFile.name);
                }
            })
        })

        if ((foldersToObfuscate.length === 0)) {
            console.error("Can't find any folder to obfuscate, aborting.");
            FileHandler.deleteFile(filePath);
            return {statusCode: 0x06, message: "There is no folders to obfuscate, are you sure you have the right folder structure?"}
        }
        if (!this.handleFolders(foldersToObfuscate, filePath, userKeyword)) {
            console.error("An error has occurred while obfuscate, aborting.");
            FileHandler.deleteFile(filePath);
            return {statusCode: 0x07, message: "There has been an internal error while obfuscating, if this proceeds to happen please report it."}
        }else{
            let obfuscatedZip = new AdmZip();
            const { files, dirs } = FileHandler.getFilesAndDirs(filePath);

            if (files.length === 0 && dirs.length === 0) {
                console.error("No files have been added, check the logs.");
                FileHandler.deleteFile(filePath);
                return {statusCode: 0x08, message: "There is no obfuscated files to return, if this proceeds to happen please report it."}
            }
            const basePath = path.resolve(filePath);
            files.forEach(file => {
                const buffer = FileHandler.getFileBuffer(file);
                const relativePath = path.relative(basePath, file);
                obfuscatedZip.addFile(relativePath, buffer, "Obfuscated with Mirage", );
            });
            dirs.forEach(directory => {
                const relativePath = path.relative(basePath, directory);
                obfuscatedZip.addFile(path.join(relativePath, "/"), Buffer.alloc(0)); // add empty dir
            });
            FileHandler.deleteFile(filePath);
            console.info("All files have been successfully obfuscated.");
            return {statusCode: 0x00, message: obfuscatedZip.toBuffer()}
        }
    }

    static handleFolders(folders, fullPath, keyword) {
        folders.forEach(folder => {
            switch (folder) {
                case "animation_controllers":
                    if (!AnimationControllerHandler.handle(fullPath, keyword)) return false;
                    break;
                case "animations":
                    if (!AnimationHandler.handle(fullPath, keyword)) return false;
                    break;
                case "attachables":
                    if (!AttachableHandler.handle(fullPath, keyword)) return false;
                    break;
                case "entity":
                    if (!EntityHandler.handle(fullPath, keyword)) return false;
                    break;
                case "render_controllers":
                    if (!RenderControllerHandler.handle(fullPath, keyword)) return false;
                    break;
                case "models":
                    if (!GeometryHandler.handle(fullPath, keyword)) return false;
                    break;
                case "particles": // TODO: Rename texture paths in particles
                    if (!ParticleHandler.handle(fullPath, keyword)) return false;
                    break;
                case "textures":
                    if (!TextureHandler.handle(fullPath, keyword)) return false;
                    break;
                case "sounds":
                    if (!SoundHandler.handle(fullPath, keyword)) return false;
                    break;
            }
        })
        folders.forEach(folder => {
            const files = FileHandler.getAllFiles(`${fullPath}/${folder}/`);
            const replaceWord = `${folder}`;

            files.forEach(currentFilePath => {
                const normalizedPath = path.normalize(currentFilePath);
                const parts = normalizedPath.split(path.sep);

                const index = parts.indexOf(replaceWord);
                if (index === -1 || parts.filter(p => p === replaceWord).length > 1) {
                    console.error("Invalid texture path, 'textures' not found or used more than once.");
                    return;
                }

                const beforeTextures = parts.slice(0, index + 1).join(path.sep);
                const afterTextures = parts.slice(index + 1);

                const newFilePath = path.join(
                    beforeTextures,
                    ...afterTextures.map(part => includesIgnoreCase(part, keyword) ? hashString(part) : part)
                );

                FileHandler.renameFile(currentFilePath, newFilePath);
            });

            const miragePath = path.join(fullPath, "mirage_config.json");
            FileHandler.deleteFile(miragePath);

            FileHandler.deleteEmptyDirs(path.join(fullPath, folder));
        });
        return true;
    }
}