import hashString, {
    ashIdentifier,
    hashIdentifier,
    hashMolangExp,
    includesIgnoreCase,
    JSON_LINE_SIZE
} from "../lib/Helpers";
import {FileHandler} from "./FileHandler"
import path from "path";
import {Entity} from "../components/Entity";

export class EntityHandler {
    static handle(cachePath, keyword) {
        const entityFiles= FileHandler.getAllFiles(`${cachePath}/entity/`);

        if(entityFiles.length === 0) {
            return true;
        }

        for (const filePath of entityFiles) {

            const entityData = FileHandler.readFile(filePath);
            if (!entityData) return false;
            console.info(`Obfuscating ${filePath}`);

            const originalData = JSON.parse(entityData.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g) => g ? "" : m));

            const obfuscatedEntity = new Entity(originalData["format_version"]);
            const entityDescription = originalData["minecraft:client_entity"]["description"];

            obfuscatedEntity.setIdentifier(entityDescription["identifier"]);

            for (let [descType, descData] of Object.entries(entityDescription)) {
                if(descType === "materials") {
                    if(typeof descData === "object") {
                        Object.entries(descData).forEach(([name, identifier]) => {
                            obfuscatedEntity.setMaterial(
                                includesIgnoreCase(name, keyword) ? hashString(name) : name, identifier);
                        });
                    }
                }
                if(descType === "textures") {
                    if(typeof descData === "object") {
                        Object.entries(descData).forEach(([name, path]) => {
                            const obfuscatedPath = path.split("/").map(part => includesIgnoreCase(part, keyword) ? hashString(part) : part).join("/");
                            obfuscatedEntity.setTexture(includesIgnoreCase(name, keyword) ?  hashString(name) : name, obfuscatedPath);
                        });
                    }
                }
                if(descType === "geometry") {
                    if(typeof descData === "object") {
                        Object.entries(descData).forEach(([name, identifier]) => {
                            const obfuscatedName = includesIgnoreCase(name, keyword) ? hashString(name) : name;
                            obfuscatedEntity.setGeometry(obfuscatedName, hashIdentifier(identifier, keyword, "geometry."));
                        });
                    }
                }
                if(descType === "scripts") {
                    if(typeof descData === "object") {
                        Object.entries(descData).forEach(([type, data]) => {

                            if(typeof data === "string" || typeof data === "boolean" || typeof data === "number") {
                                obfuscatedEntity.setScriptData(type, data)
                            }
                            if(type === "variables") {
                                if(typeof data === "object") {
                                    Object.entries(data).forEach(([variable, value]) => {
                                        obfuscatedEntity.setScriptVariableData({ [variable]: value });
                                    });
                                }
                            }
                            if(type === "initialize") {
                                if(Array.isArray(data)) {
                                    data.forEach((value) => {
                                        obfuscatedEntity.setVariable(hashMolangExp(value, keyword));
                                    });
                                }
                            }
                            if(type === "pre_animation") {
                                if(Array.isArray(data)) {
                                    data.forEach((value) => {
                                        obfuscatedEntity.setPreAnimation(hashMolangExp(value, keyword));
                                    });
                                }
                            }
                            if(type === "animate") {
                                if(Array.isArray(data)) {
                                    data.forEach((value) => {
                                        if(typeof value === "string") {
                                            obfuscatedEntity.setAnimate(includesIgnoreCase(value, keyword) ? hashString(value) : value,);
                                        }
                                        else if(typeof value === "object") {
                                            Object.entries(value).forEach(([name, queries]) => {
                                                const obfuscatedName = includesIgnoreCase(name, keyword) ? hashString(name) : name;
                                                const obfuscatedQueries = hashMolangExp(queries, keyword);
                                                obfuscatedEntity.setAnimate({ [obfuscatedName] : obfuscatedQueries})
                                            });
                                        }
                                    })
                                }
                            }
                        });
                    }
                }
                if(descType === "animations") {
                    if(typeof descData === "object") {
                        Object.entries(descData).forEach(([name, controller]) => {
                            const obfuscatedName = includesIgnoreCase(name, keyword) ? hashString(name) : name;
                            const ctrlStr = "controller.animation.";
                            const isController = controller.toLowerCase().startsWith(ctrlStr);
                            const newCtrlName = isController ? hashIdentifier(controller, keyword, ctrlStr) : hashIdentifier(controller, keyword, "animation.");
                            obfuscatedEntity.setAnimation(obfuscatedName, newCtrlName);
                        });
                    }
                }
                if(descType === "particle_effects") {
                    if(!Array.isArray(descData) && typeof descData === "object") {
                        Object.entries(descData).forEach(([name, identifier]) => {
                            obfuscatedEntity.setParticleEffect(includesIgnoreCase(name, keyword) ? hashString(name) : name, identifier);
                        })
                    }
                }
                if(descType === "sound_effects") {
                    if(!Array.isArray(descData) && typeof descData === "object") {
                        Object.entries(descData).forEach(([name, identifier]) => {
                            obfuscatedEntity.setSoundEffect(includesIgnoreCase(name, keyword) ? hashString(name) : name, identifier);
                        })
                    }
                }

                if(descType === "render_controllers"){
                    if(Array.isArray(descData)) {
                        descData.forEach((value) => {
                            if(typeof value === "object" && value !== null) {
                                Object.entries(value).forEach(([controllerName, queries]) => {
                                    const obfuscatedName =  hashIdentifier(controllerName, keyword, "controller.render.");
                                    const obfuscatedQueries = hashMolangExp(queries, keyword);
                                    obfuscatedEntity.setRenderController(obfuscatedName, obfuscatedQueries);
                                });
                            }
                            else{
                                const obfuscatedName = hashIdentifier(value, keyword, "controller.render.")
                                obfuscatedEntity.setRenderControllerWithoutInstructions(obfuscatedName)
                            }
                        })
                    }
                }
                if(Object.keys(obfuscatedEntity.getEntityData(descType)).length === 0) {
                    obfuscatedEntity.setDescriptionData(descType, []);
                }

            }
            FileHandler.deleteFile(filePath);
            const fileName = path.basename(filePath, ".json");
            const newFileName = (includesIgnoreCase(fileName, keyword) ? hashString(fileName) : fileName) + ".json";
            FileHandler.saveFile(path.join(path.dirname(filePath), newFileName), JSON.stringify(obfuscatedEntity.getEntityData(), null, JSON_LINE_SIZE));
        }
        return true;
    }
}