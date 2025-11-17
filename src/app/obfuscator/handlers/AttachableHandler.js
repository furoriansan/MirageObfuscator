import hashString, {
    hashGeoIdentifier,
    hashIdentifier,
    hashMolangExp,
    includesIgnoreCase,
    JSON_LINE_SIZE
} from "../lib/Helpers";
import {FileHandler} from "./FileHandler"
import path from "path";
import {Attachable} from "../components/Attachable";

export class AttachableHandler {
    static handle(cachePath, keyword) {
        const attachableFiles= FileHandler.getAllFiles(`${cachePath}/attachables/`);
        if(attachableFiles.length === 0) {
            return true;
        }
        for (const filePath of attachableFiles) {
            const attachableData = FileHandler.readFile(filePath);
            if (!attachableData) return false;
            console.info(`Obfuscating ${filePath}`);

            const originalData = JSON.parse(attachableData.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g) => g ? "" : m));

            const obfuscatedAttachable = new Attachable(originalData["format_version"]);
            const attachableDescription = originalData["minecraft:attachable"]["description"];

            obfuscatedAttachable.setIdentifier(attachableDescription["identifier"]);

            for (let [descType, descData] of Object.entries(attachableDescription)) {
                if(descType === "materials") {
                    if(typeof descData === "object") {
                        Object.entries(descData).forEach(([name, identifier]) => {
                            obfuscatedAttachable.setMaterial(
                                includesIgnoreCase(name, keyword) ? hashString(name) : name, identifier);
                        });
                    }
                    continue;
                }
                if (descType === "textures" && typeof descData === "object") {
                    Object.entries(descData).forEach(([name, path]) => {
                        const obfuscatedPath = path.split("/").map(part => includesIgnoreCase(part, keyword) ? hashString(part) : part).join("/");
                        obfuscatedAttachable.setTexture(includesIgnoreCase(name, keyword) ?  hashString(name) : name, obfuscatedPath);
                    });
                    continue;
                }
                if(descType === "geometry") {
                    if(typeof descData === "object") {
                        Object.entries(descData).forEach(([name, identifier]) => {
                            const obfuscatedName = includesIgnoreCase(name, keyword) ? hashString(name) : name;
                            obfuscatedAttachable.setGeometry(obfuscatedName, hashIdentifier(identifier, keyword, "geometry."));
                        });
                    }
                    continue;
                }
                if(descType === "scripts") {
                    if(typeof descData === "object") {
                        Object.entries(descData).forEach(([type, data]) => {

                            if(typeof data === "string" || typeof data === "boolean" || typeof data === "number") {
                                obfuscatedAttachable.setScriptData(type, data)
                            }
                            if(type === "variables") {
                                if((typeof data === "object")) {
                                    Object.entries(data).forEach(([variable, value]) => {
                                        obfuscatedAttachable.setScriptData(variable, { [variable]: value });
                                    });
                                }
                            }
                            if(type === "initialize") {
                                if(Array.isArray(data)) {
                                    data.forEach((value) => {
                                        obfuscatedAttachable.setVariable(hashMolangExp(value, keyword));
                                    });
                                }
                            }
                            if(type === "pre_animation") {
                                if(Array.isArray(data)) {
                                    data.forEach((value) => {
                                        obfuscatedAttachable.setPreAnimation(hashMolangExp(value, keyword));
                                    });
                                }
                            }
                            if(type === "animate") {
                                if(Array.isArray(data)) {
                                    data.forEach((value) => {
                                        if(typeof value === "string") {
                                            obfuscatedAttachable.setAnimate(includesIgnoreCase(value, keyword) ? hashString(value) : value,);
                                        }
                                        else if(typeof value === "object") {
                                            Object.entries(value).forEach(([name, queries]) => {
                                                const obfuscatedName = includesIgnoreCase(name, keyword) ? hashString(name) : name;
                                                const obfuscatedQueries = hashMolangExp(queries, keyword);
                                                obfuscatedAttachable.setAnimate({ [obfuscatedName] : obfuscatedQueries})
                                            });
                                        }
                                    })
                                }
                            }
                        });
                    }
                    continue;
                }
                if(descType === "animations") {
                    if(typeof descData === "object") {
                        Object.entries(descData).forEach(([name, controller]) => {
                            const obfuscatedName = includesIgnoreCase(name, keyword) ? hashString(name) : name;
                            const isController = controller.toUpperCase().startsWith("CONTROLLER.ANIMATION");
                            const newCtrlName = isController ? hashIdentifier(controller, keyword, "controller.animation.") : hashIdentifier(controller, keyword, "animation.");
                            obfuscatedAttachable.setAnimation(obfuscatedName, newCtrlName);
                        });
                    }
                    continue;
                }

                if(descType === "particle_effects") {
                    if(!Array.isArray(descData) && typeof descData === "object") {
                        Object.entries(descData).forEach(([name, identifier]) => {
                            obfuscatedAttachable.setParticleEffect(includesIgnoreCase(name, keyword) ? hashString(name) : name, identifier);
                        })
                    }
                    continue;
                }
                if(descType === "sound_effects") {
                    if(!Array.isArray(descData) && typeof descData === "object") {
                        Object.entries(descData).forEach(([name, identifier]) => {
                            obfuscatedAttachable.setSoundEffect(includesIgnoreCase(name, keyword) ? hashString(name) : name, identifier);
                        })
                    }
                    continue;
                }

                if(descType === "render_controllers"){
                    if(Array.isArray(descData)) {
                        descData.forEach((value) => {
                            if(typeof value === "object" && value !== null) {
                                Object.entries(value).forEach(([controllerName, queries]) => {
                                    const obfuscatedName = hashIdentifier(controllerName, keyword, "controller.render.");
                                    const obfuscatedQueries = hashMolangExp(queries, keyword);
                                    obfuscatedAttachable.setRenderController(obfuscatedName, obfuscatedQueries);
                                });
                            }
                            else{
                                const obfuscatedName =  hashIdentifier(value, keyword, "controller.render.");
                                obfuscatedAttachable.setRenderControllerWithoutInstructions(obfuscatedName)
                            }
                        })
                    }
                    continue;
                }else{
                    obfuscatedAttachable.setDescriptionData(descType, descData);
                }
                if(Object.keys(obfuscatedAttachable.getAttachableData(descType)).length === 0) {
                    obfuscatedAttachable.setDescriptionData(descType, []);
                }
            }
            FileHandler.deleteFile(filePath);
            const fileName = path.basename(filePath, ".json");
            const newFileName = (includesIgnoreCase(fileName, keyword) ? hashString(fileName) : fileName) + ".json";
            FileHandler.saveFile(path.join(path.dirname(filePath), newFileName), JSON.stringify(obfuscatedAttachable.getAttachableData(), null, JSON_LINE_SIZE));
        }
        return true;
    }
}