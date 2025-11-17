import hashString, {hashIdentifier, hashMolangExp, includesIgnoreCase, JSON_LINE_SIZE} from "../lib/Helpers";
import {FileHandler} from "./FileHandler"
import path from "path";
import {Animation} from "../components/Animation";

export class AnimationHandler {
    static handle(cachePath, keyword) {
        const dirPath = `${cachePath}/animations/`;
        const animFiles = FileHandler.getAllFiles(dirPath);

        if (animFiles.length === 0) return true;

        for (const filePath of animFiles) {
            console.info(`Obfuscating ${filePath}`);

            const animData = FileHandler.readFile(filePath);
            if (!animData) continue;

            const originalData = JSON.parse(animData.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g) => g ? "" : m));
            const obfuscated = new Animation(originalData["format_version"]);
            if (!originalData["animations"]) continue;
            const animations = originalData["animations"];

            for (const [animName, animContent] of Object.entries(animations)) {
                const newAnimName = hashIdentifier(animName, keyword, "animation.");

                if (animContent.bones) {
                    obfuscated.initializeBones(newAnimName);
                }
                for (const [prop, value] of Object.entries(animContent)) {
                    if (["relative_to", "animation_length", "loop", "override_previous_animation"].includes(prop)) {
                        obfuscated.setAnimationData(newAnimName, prop, value);
                    }
                }

                obfuscated.setAnimationName(animName, newAnimName);

                if (animContent.bones) {
                    for (const [boneName, boneData] of Object.entries(animContent.bones)) {
                        const newBoneName = includesIgnoreCase(boneName, keyword) ? hashString(boneName) : boneName;

                        obfuscated.setBoneName(newAnimName, newBoneName);

                        for (const [type, value] of Object.entries(boneData)) {
                            if (typeof value === "object" && !Array.isArray(value) &&
                                Object.keys(value).every(k => !isNaN(Number(k)))) {

                                const newKeyframes = {};
                                for (const [timestamp, keyframeData] of Object.entries(value)) {
                                    if (Array.isArray(keyframeData)) {
                                        newKeyframes[timestamp] = keyframeData.map(item =>
                                            typeof item === "string" ? hashMolangExp(item, keyword) : item
                                        );
                                    } else if (typeof keyframeData === "object") {
                                        const newKF = {};
                                        for (const [kfProp, kfVal] of Object.entries(keyframeData)) {
                                            if (Array.isArray(kfVal)) {
                                                newKF[kfProp] = kfVal;
                                            } else if (typeof kfVal === "string") {
                                                newKF[kfProp] = hashMolangExp(kfVal, keyword);
                                            } else {
                                                newKF[kfProp] = kfVal;
                                            }
                                        }
                                        newKeyframes[timestamp] = newKF;
                                    } else if (typeof keyframeData === "string") {
                                        newKeyframes[timestamp] = hashMolangExp(keyframeData, keyword);
                                    } else {
                                        newKeyframes[timestamp] = keyframeData;
                                    }
                                }
                                obfuscated.setBoneData(newAnimName, newBoneName, type, newKeyframes);
                            }
                            else if (Array.isArray(value)) {
                                const newArrayDat = value.map(item =>
                                    typeof item === "string" ? hashMolangExp(item, keyword) : item
                                );
                                obfuscated.setBoneData(newAnimName, newBoneName, type, newArrayDat);
                            }
                            else if (typeof value === "string") {
                                obfuscated.setBoneData(newAnimName, newBoneName, type, hashMolangExp(value, keyword));
                            } else {
                                obfuscated.setBoneData(newAnimName, newBoneName, type, value);
                            }
                        }
                    }
                }
                if (animContent.sound_effects) {
                    obfuscated.setAnimationData(newAnimName, "sound_effects", this.handleSoundEffects(animContent.sound_effects, keyword));
                }
                if (animContent.particle_effects) {
                    obfuscated.setAnimationData(newAnimName, "particle_effects", this.handleParticleData(animContent.particle_effects, keyword));
                }
                if (Object.keys(obfuscated.getAnimationData(newAnimName)).length === 0) {
                    obfuscated.setEmptyAnimation(newAnimName);
                }
            }

            obfuscated.cleanEmptyBones();

            FileHandler.deleteFile(filePath);

            const fileName = path.basename(filePath, ".json");
            const newFileName = (includesIgnoreCase(fileName, keyword) ? hashString(fileName) : fileName) + ".json";
            FileHandler.saveFile(path.join(path.dirname(filePath), newFileName), JSON.stringify(obfuscated.getAnimationData(), null, JSON_LINE_SIZE));
        }
        return true;
    }

    static handleSoundEffects(currentData, keyword) {
        const newData = {};
        for (const [timestamp, data] of Object.entries(currentData)) {
            if (typeof data === "string") {
                newData[timestamp] = {
                    effect: includesIgnoreCase(data, keyword) ? hashString(data) : data
                };
            }
            else if (Array.isArray(data)) {
                newData[timestamp] = data.map(entry => {
                    if (typeof entry === "object" && entry.effect) {
                        const effectName = entry.effect;
                        return {
                            effect: includesIgnoreCase(effectName, keyword) ? hashString(effectName) : effectName
                        };
                    }
                    return entry;
                });
            }
            else if (typeof data === "object" && data.effect) {
                const effectName = data.effect;
                newData[timestamp] = {
                    effect: includesIgnoreCase(effectName, keyword) ? hashString(effectName) : effectName
                };
            }
        }
        return newData;
    }

    static handleParticleData(currentData, keyword) {
        const newData = {};
        Object.entries(currentData).forEach(([timestamp, data]) => {
            if (!Array.isArray(data)) {
                newData[timestamp] = {};
                for (const [type, value] of Object.entries(data)) {
                    if (type === "effect" || type === "locator") {
                        newData[timestamp][type] = includesIgnoreCase(value, keyword) ? hashString(value) : value;
                    } else if (type === "pre_effect_script") {
                        newData[timestamp][type] = includesIgnoreCase(value, keyword) ? hashMolangExp(value, keyword) : value;
                    } else if (type === "bind_to_actor") {
                        newData[timestamp][type] = value;
                    }
                }
            }
            else if (Array.isArray(data)) {
                newData[timestamp] = [];
                for (const element of data) {
                    if (typeof element === "object") {
                        const newElement = {};
                        for (const [type, value] of Object.entries(element)) {
                            if (type === "effect" || type === "locator") {
                                newElement[type] = includesIgnoreCase(value, keyword) ? hashString(value) : value;
                            } else if (type === "pre_effect_script") {
                                newElement[type] = includesIgnoreCase(value, keyword) ? hashMolangExp(value, keyword) : value;
                            } else if (type === "bind_to_actor") {
                                newElement[type] = value;
                            }
                        }
                        newData[timestamp].push(newElement);
                    }
                }
            }
        });
        return newData;
    }
}