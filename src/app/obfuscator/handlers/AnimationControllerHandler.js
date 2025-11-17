import hashString, {hashIdentifier, hashMolangExp, includesIgnoreCase, JSON_LINE_SIZE} from "../lib/Helpers";
import {FileHandler} from "./FileHandler"
import {AnimationController} from '../components/AnimationController'
import path from "path";

export class AnimationControllerHandler {
    static handle(cachePath, keyword) {
        const dirPath = `${cachePath}/animation_controllers/`;
        const animControlFiles= FileHandler.getAllFiles(dirPath);
        if(animControlFiles.length === 0) {
            return true;
        }
        animControlFiles.forEach(filePath => {
            console.info(`Obfuscating ${filePath}`);

            const controllerData = FileHandler.readFile(filePath);
            if (!controllerData) {
                return false;
            }
            const originalData = JSON.parse(controllerData.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g) => g ? "" : m));
            const obfuscatedController = new AnimationController(originalData["format_version"]);
            const animationControllers = originalData["animation_controllers"];

            for (let [ctrlName, ctrlData] of Object.entries(animationControllers)) {

                const currentController = animationControllers[ctrlName];

                const stateNameMap = {};
                for (const stateName of Object.keys(currentController.states)) {
                    stateNameMap[stateName] =  includesIgnoreCase(stateName, keyword) ? hashString(stateName) : stateName;
                }
                if (currentController["initial_state"]) {
                    const rawInitialState = currentController["initial_state"];
                    const obfuscatedInitialState = stateNameMap[rawInitialState] || rawInitialState;
                    obfuscatedController.setInitialStateToController(ctrlName, obfuscatedInitialState);
                }

                for (const [stateName, stateData] of Object.entries(currentController.states)) {
                    const newStateName = stateNameMap[stateName];
                    obfuscatedController.initializeStateName(ctrlName, newStateName);

                    for (const [dataKey, dataVal] of Object.entries(stateData)) {


                        if (dataKey === "animations" && Array.isArray(dataVal)) {
                            for (const animation of dataVal) {
                                if (typeof animation === "string") {
                                    const animName = includesIgnoreCase(animation, keyword) ? hashString(animation) : animation;
                                    obfuscatedController.setAnimationStateData(ctrlName, newStateName, animName);
                                } else if (typeof animation === "object" && animation !== null) {
                                    const keys = Object.keys(animation);
                                    if (keys.length !== 1) {
                                        console.warn("Unexpected animation object with multiple keys:", animation);
                                        continue;
                                    }
                                    const animName = keys[0];
                                    const animData = animation[animName];
                                    const hashedAnimName = includesIgnoreCase(animName, keyword) ? hashString(animName) : animName;
                                    const hashedAnimData = hashMolangExp(animData, keyword);
                                    if (typeof hashedAnimData !== "string") {
                                        console.warn("hashMolangExp did not return string for:", animData);
                                    }
                                    obfuscatedController.setAnimationStateData(ctrlName, newStateName, hashedAnimName, hashedAnimData);
                                } else {
                                    console.warn("Unexpected animation entry type:", animation);
                                }
                            }
                            continue;
                        }

                        if (dataKey === "transitions") {
                            for (const transitionData of Object.values(dataVal)) {
                                if (typeof transitionData === "object") {
                                    const transitionName = Object.keys(transitionData)[0];
                                    const transitionExpr = transitionData[transitionName];
                                    const obfuscatedName = includesIgnoreCase(transitionName, keyword)
                                        ? hashString(transitionName)
                                        : stateNameMap[transitionName] || transitionName;

                                    obfuscatedController.setTransitionStateData(
                                        ctrlName,
                                        newStateName,
                                        obfuscatedName,
                                        hashMolangExp(transitionExpr, keyword)
                                    );
                                }
                                if (typeof transitionData === "string") {
                                    const target = stateNameMap[transitionData] || transitionData;
                                    obfuscatedController.setTransitionStateData(
                                        ctrlName,
                                        newStateName,
                                        target,
                                        undefined
                                    );
                                }
                            }
                            continue;
                        }

                        if (dataKey === "particle_effects") {
                            for (const [_, data] of Object.entries(dataVal)) {
                                if (typeof data === "object") {
                                    const dataConstruct = {};
                                    for(const particleData of Object.entries(data)) {
                                        const particleVal = particleData[1];
                                        dataConstruct[particleData[0]] = includesIgnoreCase(particleVal, keyword) ? hashString(particleVal) : particleVal;
                                    }
                                    obfuscatedController.setParticleStateData(ctrlName, newStateName, dataConstruct);
                                }
                            }
                            continue;
                        }
                        if(dataKey === "on_entry") {
                            const newEntryArray = [];
                            if(Array.isArray(dataVal) ) {
                                dataVal.forEach(item => {
                                    newEntryArray.push(hashMolangExp(item, keyword));
                                })
                            }
                            obfuscatedController.setStateData(ctrlName, newStateName, dataKey, newEntryArray);
                            continue;
                        }
                        obfuscatedController.setStateData(ctrlName, newStateName, dataKey, dataVal)
                    }
                }
                if(Object.keys(obfuscatedController.getStateData(ctrlName)).length === 0) {
                    obfuscatedController.setEmptyStateData(ctrlName);
                }
                obfuscatedController.setAnimationControllerName(ctrlName, hashIdentifier(ctrlName, keyword, "controller.animation."));
            }

            FileHandler.deleteFile(filePath);
            const fileName = path.basename(filePath, ".json");
            const newFileName = (includesIgnoreCase(fileName, keyword) ? hashString(fileName) : fileName) + ".json";
            FileHandler.saveFile(path.join(path.dirname(filePath), newFileName), JSON.stringify(obfuscatedController.getControllerData(), null, JSON_LINE_SIZE));
        });
        return true;
    }
}
