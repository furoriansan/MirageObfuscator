import hashString, {hashIdentifier, hashMolangExp, includesIgnoreCase, JSON_LINE_SIZE} from "../lib/Helpers";
import { FileHandler } from "./FileHandler";
import path from "path";
import { Geometry } from "../components/Geometry";

export class GeometryHandler {
    static handle(cachePath, keyword) {
        const geometryFiles = FileHandler.getAllFiles(`${cachePath}/models/entity/`);
        if (geometryFiles.length === 0) {
            return true;
        }

        for (const filePath of geometryFiles) {
            const geometryData = FileHandler.readFile(filePath);
            if (!geometryData) return false;
            console.info(`Obfuscating ${filePath}`);

            const strippedData = geometryData.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g) => g ? "" : m);
            const originalData = JSON.parse(strippedData);

            const formatVersion = originalData["format_version"] || "1.12.0";
            const geometryArray = originalData["minecraft:geometry"];
            if (!Array.isArray(geometryArray)) continue;

            const newGeometryData = [];

            for (const geo of geometryArray) {
                const obfuscatedGeometry = new Geometry(formatVersion);
                const geometryDescription = geo["description"];
                const geometryBones = geo["bones"];

                if (!geometryDescription || !geometryBones) continue;

                for (let [descType, descData] of Object.entries(geometryDescription)) {
                    if (descType === "identifier") {
                        obfuscatedGeometry.setIdentifier(hashIdentifier(descData, keyword, "geometry."));
                        continue;
                    }
                    obfuscatedGeometry.setDescriptionData(descType, descData);
                }

                for (const boneData of geometryBones) {
                    if (typeof boneData !== "object") continue;

                    let newBoneData = {};
                    for (const [dataType, dataValue] of Object.entries(boneData)) {
                        if (dataType === "name" || dataType === "parent") {
                            newBoneData[dataType] = includesIgnoreCase(dataValue, keyword) ? hashString(dataValue) : dataValue;
                        } else if (dataType === "locators") {
                            newBoneData[dataType] = {};
                            if (typeof dataValue !== "object") continue;
                            for (const [locName, locData] of Object.entries(dataValue)) {
                                const obfuscatedName = includesIgnoreCase(locName, keyword) ? hashString(locName) : locName;
                                newBoneData[dataType][obfuscatedName] = locData;
                            }
                        } else if (dataType === "binding") {
                            newBoneData[dataType] = hashMolangExp(dataValue, keyword);
                        } else {
                            newBoneData[dataType] = dataValue;
                        }
                    }

                    obfuscatedGeometry.setBoneData(newBoneData);
                }

                newGeometryData.push(obfuscatedGeometry.getGeometryObject());
            }

            FileHandler.deleteFile(filePath);

            const fileName = path.basename(filePath, ".json");
            const newFileName = (includesIgnoreCase(fileName, keyword) ? hashString(fileName) : fileName) + ".json";

            const finalOutput = {
                format_version: formatVersion,
                "minecraft:geometry": newGeometryData
            };

            FileHandler.saveFile(
                path.join(path.dirname(filePath), newFileName),
                JSON.stringify(finalOutput, null, JSON_LINE_SIZE)
            );
        }

        return true;
    }
}