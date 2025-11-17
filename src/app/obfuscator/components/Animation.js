export class Animation {

    animationData = {};

    constructor(formatVersion) {
        this.animationData["format_version"] = formatVersion;
        this.animationData["animations"] = {};
    }

    setAnimationName(animName, newAnimName) {
        const oldController = { ...this.animationData["animations"][animName] };
        if (!this.animationData["animations"][animName]) return;
        delete this.animationData["animations"][animName];
        this.animationData["animations"][newAnimName] = oldController;
    }

    initializeBones(animName) {
        this.animationData["animations"][animName] ??= {};
        this.animationData["animations"][animName]["bones"] = {};
    }

    setBoneName(animName, boneName) {
        this.animationData["animations"][animName] ??= {};
        this.animationData["animations"][animName]["bones"] ??= {};
        if (!this.animationData["animations"][animName]["bones"][boneName]) {
            this.animationData["animations"][animName]["bones"][boneName] = {};
        }
    }

    setAnimationData(animName, identifier, data) {
        this.animationData["animations"][animName] ??= {};
        this.animationData["animations"][animName][identifier] = data;
    }


    setBoneData(animName, boneName, boneType, boneValue) {
        this.animationData["animations"][animName] ??= {};
        this.animationData["animations"][animName]["bones"] ??= {};
        this.animationData["animations"][animName]["bones"][boneName] ??= {};
        this.animationData["animations"][animName]["bones"][boneName][boneType] = boneValue;
    }

    cleanEmptyBones() {
        for (const animName in this.animationData.animations) {
            const anim = this.animationData.animations[animName];
            if (!anim.bones) continue;
            for (const boneName in anim.bones) {
                if (Object.keys(anim.bones[boneName]).length === 0) {
                    delete anim.bones[boneName];
                }
            }
            if (Object.keys(anim.bones).length === 0) {
                delete anim.bones;
            }
        }
    }

    getAnimationData() {
        return this.animationData;
    }


}