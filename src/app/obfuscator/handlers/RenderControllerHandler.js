import hashString, {
    hashArrayData,
    hashArrayExp,
    hashArrayName, hashGeoIdentifier, hashIdentifier, hashMaterialIdentifier,
    hashMolangExp, hashTextureIdentifier, hashTextureExpression,
    includesIgnoreCase, JSON_LINE_SIZE
} from "../lib/Helpers";
import {FileHandler} from "./FileHandler"
import path from "path";
import {RenderController} from "../components/RenderController";

export class RenderControllerHandler {
    static handle(cachePath, keyword) {
        const dirPath = `${cachePath}/render_controllers/`;
        const renderCtrlFiles= FileHandler.getAllFiles(dirPath);

        if(renderCtrlFiles.length === 0) {
            return true;
        }

        for (const filePath of renderCtrlFiles) {
            const animData = FileHandler.readFile(filePath);
            if (!animData) return false;

            console.info(`Obfuscating ${filePath}`);

            const originalData = JSON.parse(animData.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g) => g ? "" : m));
            const obfuscatedControllers = new RenderController(originalData["format_version"]);

            const originalRenderControllers = originalData["render_controllers"];

            for (let [ctrlName, ctrlData] of Object.entries(originalRenderControllers)) {
                const currentController = originalRenderControllers[ctrlName];
                obfuscatedControllers.initializeController(ctrlName);

                for (const [typeName, typeData] of Object.entries(currentController)) {
                    if (typeName === "geometry") {
                        if (typeof typeData === "string") {   // TODO;:

                            if(typeData.toUpperCase().startsWith("ARRAY")) {
                                obfuscatedControllers.setGeometry(ctrlName, hashArrayExp(typeData, keyword))
                            }
                            else{
                                const obfuscated = hashIdentifier(typeData, keyword, "geometry.");
                                obfuscatedControllers.setGeometry(ctrlName, obfuscated);
                            }
                        }
                        continue;
                    }
                    if(typeName === "arrays") {
                       if(typeof typeData === "object") {
                           for (let [objType, objData] of Object.entries(typeData)) {
                               if (typeof objData !== "object" || objData === null) {
                                   continue;
                               }
                               const arrayDataTypes = {
                                   geometries: "Geometry",
                                   textures: "Texture",
                                   materials: "Material"
                               };
                               const dataType = arrayDataTypes[objType] || null;

                               for (let [arrayName, arrayData] of Object.entries(objData)) {
                                   if (!Array.isArray(arrayData)) continue;
                                    // "Array.top": ["Texture.top_1", "Texture.top_2", "Texture.top_3"]

                                   const hashedName = hashIdentifier(arrayName, keyword, "array.");
                                   const hashedData = hashArrayData(arrayData, dataType, keyword);

                                   obfuscatedControllers.setArray(ctrlName, objType, hashedName, hashedData);
                               }
                           }
                       }
                        continue;
                    }
                    if(typeName === "materials") {
                        if(!Array.isArray(typeData)){
                            continue;
                        }

                        for (const materialObject of typeData){
                            if (typeof materialObject !== "object" || Object.keys(materialObject).length === 0) continue;
                            for (let [boneName, materialData] of Object.entries(materialObject)) {
                                const obfuscatedName = includesIgnoreCase(boneName, keyword) ? hashString(boneName) : boneName;
                                if (typeof materialData === "string" && materialData.startsWith("Array")){
                                    obfuscatedControllers.setMaterial(ctrlName, obfuscatedName, hashArrayExp(materialData, keyword));
                                }
                                else{
                                    const obfuscatedMaterialData = hashIdentifier(materialData, keyword, "material.");
                                    obfuscatedControllers.setMaterial(ctrlName, obfuscatedName, obfuscatedMaterialData);
                                }
                            }
                        }
                        continue;
                    }
                    if (typeName === "part_visibility") {
                        if (!Array.isArray(typeData)) {
                            continue;
                        }
                        for (const pvObject of typeData) {
                            for (let [boneName, visibilityData] of Object.entries(pvObject)) {
                                const obfBoneName = includesIgnoreCase(boneName, keyword) ? hashString(boneName) : boneName;
                                obfuscatedControllers.setPartVisibility(ctrlName, obfBoneName, visibilityData);
                            }
                        }
                        continue;
                    }

                    if(typeName === "textures") {
                        if(!Array.isArray(typeData)){
                            continue;
                        }
                        for (const texture of typeData){
                            if (typeof texture !== "string") continue;
                            if (texture.toUpperCase().startsWith("ARRAY")) {
                                obfuscatedControllers.setTexture(ctrlName, hashArrayExp(texture, keyword));
                            }
                            else if (texture.includes("?") || texture.includes(":")) {
                                obfuscatedControllers.setTexture(ctrlName, hashTextureExpression(texture, keyword));
                            }
                            else {
                                obfuscatedControllers.setTexture(ctrlName, hashIdentifier(texture, keyword, "texture."));
                            }
                        }
                        continue;
                    }
                    if (typeName === "uv_anim") {
                        if (typeof typeData !== "object") continue;

                        const uvAnimData = {};
                        for (const [uvKey, uvValue] of Object.entries(typeData)) {
                            if (Array.isArray(uvValue)) {
                                uvAnimData[uvKey] = uvValue.map(val => hashMolangExp(val, keyword));
                            } else {
                                uvAnimData[uvKey] = uvValue;
                            }
                        }

                        obfuscatedControllers.setRenderControllerTypeData(ctrlName, "uv_anim", uvAnimData);
                        continue;
                    }
                    if (typeName === "is_hurt_color" || typeName === "overlay_color" || typeName === "color" || typeName === "on_fire_color") {
                        if (typeof typeData !== "object") {
                            continue;
                        }
                        const entries = Object.entries(typeData);
                        if (entries.length === 0) {
                            obfuscatedControllers.setRenderControllerTypeData(ctrlName, typeName, typeData);
                        } else {
                            for (let [boneName, visibilityData] of entries) {
                                obfuscatedControllers.setRenderControllerData(ctrlName, typeName, boneName, hashMolangExp(visibilityData, keyword));
                            }
                        }
                    } else {
                        obfuscatedControllers.setRenderControllerTypeData(ctrlName, typeName, typeData);
                    }
                }
                if(Object.keys(obfuscatedControllers.getControllerData(ctrlName)).length === 0) {
                    obfuscatedControllers.setEmptyControllerData(ctrlName);
                }
                obfuscatedControllers.setRenderControllerName(ctrlName, hashIdentifier(ctrlName, keyword, "controller.render."));
            }
            FileHandler.deleteFile(filePath);
            const fileName = path.basename(filePath, ".json");
            const newFileName = (includesIgnoreCase(fileName, keyword) ? hashString(fileName) : fileName) + ".json";
            FileHandler.saveFile(path.join(path.dirname(filePath), newFileName), JSON.stringify(obfuscatedControllers.getControllerData(), null, JSON_LINE_SIZE));
        }
        return true;
    }
}