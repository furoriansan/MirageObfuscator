export class AnimationController {

    controllerData = {};

    constructor(formatVersion) {
        this.controllerData["format_version"] = formatVersion;
        this.controllerData["animation_controllers"] = {};
    }

    setAnimationController(ctrlName, data) {
        this.controllerData["animation_controllers"][ctrlName] = JSON.parse(JSON.stringify(data));
    }


    setInitialStateToController(ctrlName, initialState) {
        this.controllerData["animation_controllers"][ctrlName] ??= {};
        this.controllerData["animation_controllers"][ctrlName]["initial_state"] = initialState
        this.controllerData["animation_controllers"][ctrlName]["states"] = {};
    }

    setAnimationControllerName(ctrlName, newCtrlName) {
        const oldController = { ...this.controllerData["animation_controllers"][ctrlName] };
        delete this.controllerData["animation_controllers"][ctrlName];
        this.controllerData["animation_controllers"][newCtrlName] = oldController;
    }

    initializeStateName(ctrlName, stateName) {
        this.controllerData["animation_controllers"][ctrlName] ??= []
        this.controllerData["animation_controllers"][ctrlName]["states"] ??= {};
        if (!this.controllerData["animation_controllers"][ctrlName]["states"][stateName]) {
            this.controllerData["animation_controllers"][ctrlName]["states"][stateName] = {};
        }
    }

    setAnimationStateData(ctrl, state, name, data) {
        const stateAnimations = this.controllerData.animation_controllers[ctrl].states[state];
        stateAnimations.animations ??= [];

        if (data === undefined) {
            stateAnimations.animations.push(name);
        } else {
            let foundIndex = -1;
            for (let index = 0; index < stateAnimations.animations.length; index++) {
                const item = stateAnimations.animations[index];

                if (typeof item === "object" && Object.hasOwn(item, name)) {
                    foundIndex = index;
                    break;
                }
            }
            const entry = { [name]: data };
            if (foundIndex !== -1) {
                stateAnimations.animations[foundIndex] = entry;
            } else {
                stateAnimations.animations.push(entry);
            }
        }
    }

    setTransitionStateData(ctrlName, stateName, transitionName, transitionData) {
        if (this.controllerData["animation_controllers"][ctrlName]["states"][stateName]["transitions"] === undefined) {
            this.controllerData["animation_controllers"][ctrlName]["states"][stateName]["transitions"] = [];
        }
        if (transitionData === undefined) {
            this.controllerData["animation_controllers"][ctrlName]["states"][stateName]["transitions"].push(transitionName)
            return;
        }

        const transitionObject = { [transitionName]: transitionData };
        this.controllerData["animation_controllers"][ctrlName]["states"][stateName]["transitions"].push(transitionObject);
    }

    setParticleStateData(ctrlName, stateName, particleData) {
        if (this.controllerData["animation_controllers"][ctrlName]["states"][stateName]["particle_effects"] === undefined) {
            this.controllerData["animation_controllers"][ctrlName]["states"][stateName]["particle_effects"] = [];
        }
        this.controllerData["animation_controllers"][ctrlName]["states"][stateName]["particle_effects"].push(particleData);
    }

    setStateData(ctrlName, newStateName, dataKey, dataVal) {
        if (this.controllerData["animation_controllers"][ctrlName]["states"][newStateName][dataKey] === undefined) {
            this.controllerData["animation_controllers"][ctrlName]["states"][newStateName][dataKey] = dataVal;
        }
    }

    setEmptyStateData(ctrlName) {
        this.controllerData["animation_controllers"][ctrlName]["states"]["default"] = {};
    }

    getStateData(ctrlName) {
        return this.controllerData["animation_controllers"][ctrlName];
    }

    getControllerData() {
        return this.controllerData;
    }


}