import hashString, {includesIgnoreCase, JSON_LINE_SIZE} from "../lib/Helpers";
import {FileHandler} from "./FileHandler"
import path from "path";
import {SoundDefinitions} from "../components/SoundDefinitions";

export class SoundHandler {
    static handle(cachePath, keyword) {

        const soundDefinitionPath = `${cachePath}/sounds/sound_definitions.json`;
        const soundDefinitionBuffer = FileHandler.readFile(soundDefinitionPath);
        if(!soundDefinitionBuffer){
            console.warn("Could not retrieve sound definition buffer.")
            return true;
        }

        const soundDefinitionData = JSON.parse(soundDefinitionBuffer.replace(
            /\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g) => g ? "" : m)
        );

        const newSoundDefs = new SoundDefinitions(soundDefinitionData["format_version"]);


        if(typeof soundDefinitionData["sound_definitions"] !== "object") {
            console.warn("Invalid sound definition structure detected, aborting.")
            return true;
        }
        for (const [soundName, soundData] of Object.entries(soundDefinitionData["sound_definitions"])) {
            if(typeof soundData !== "object") {
                console.warn("Invalid sound data structure detected, skipping.")
                continue;
            }
            let newSoundData = {};
            for (const [dataType, dataValue] of Object.entries(soundData)) {
                if(dataType !== "sounds") {
                    newSoundData[dataType] = dataValue;
                    continue;
                }
                if(!Array.isArray(dataValue)) {
                    console.warn("Invalid sound structure detected, skipping.")
                    continue;
                }
                if(dataValue.length === 0) {
                    newSoundData[dataType] = [];
                    continue;
                }
                newSoundData[dataType] = [];
                for (const soundFile of dataValue) {
                    if(typeof soundFile !== "object") {
                        console.warn("Invalid sound file structure detected, skipping.")
                        continue;
                    }
                    let soundObject = {};
                    for (const [type, value] of Object.entries(soundFile)) {
                        if(type === "name"){
                            let obfuscatedPath = "";
                            const splitPath = value.split("/");
                            splitPath.forEach((value, i) => {
                                const isLast = i === splitPath.length - 1;
                                const part = includesIgnoreCase(value, keyword) ? hashString(value) : value;
                                obfuscatedPath += part + (isLast ? "" : "/");
                            });
                            soundObject[type] = obfuscatedPath;
                        }else{
                            soundObject[type] = value;
                        }
                    }
                    newSoundData[dataType].push(soundObject);
                }
            }
            newSoundDefs.addSoundDefinition(soundName, newSoundData);
        }

        FileHandler.deleteFile(soundDefinitionPath);
        const fileName = path.basename(soundDefinitionPath);
        FileHandler.saveFile(path.join(path.dirname(soundDefinitionPath), fileName), JSON.stringify(newSoundDefs.getSoundDefinitions(), null, JSON_LINE_SIZE));

        const soundFiles = FileHandler.getAllFiles(`${cachePath}/sounds/`);
        if (soundFiles.length === 0) return true;
        for (const filePath of soundFiles) {
            const soundFile = FileHandler.getFileBuffer(filePath);
            if(!soundFile) {
                console.warn("Invalid sound file, skipping.")
                continue;
            }
            console.info(`Obfuscating ${filePath}`);

            FileHandler.deleteFile(filePath);
            const extensionType = path.extname(filePath);
            const fileName = path.basename(filePath, extensionType);
            const newFileName = (includesIgnoreCase(fileName, keyword) ? hashString(fileName) : fileName) + extensionType;
            FileHandler.saveFile(path.join(path.dirname(filePath), newFileName), soundFile);
        }
        return true;
    }
}