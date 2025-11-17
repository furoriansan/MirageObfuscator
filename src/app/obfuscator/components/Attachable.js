export class Attachable {

    attachableData = {};

    constructor(formatVersion) {
        this.attachableData["format_version"] = formatVersion;
        this.attachableData["minecraft:attachable"] = {};
        this.attachableData["minecraft:attachable"]["description"] = {};
    }

    setIdentifier(identifier) {
        this.attachableData["minecraft:attachable"]["description"]["identifier"] = identifier;
    }

    setMaterial(name, material) {
        this.attachableData["minecraft:attachable"]["description"]["materials"] ??= {};
        this.attachableData["minecraft:attachable"]["description"]["materials"][name] = material;
    }

    setTexture(name, path) {
        this.attachableData["minecraft:attachable"]["description"]["textures"] ??= {};
        this.attachableData["minecraft:attachable"]["description"]["textures"][name] = path;
    }

    setGeometry(name, identifier) {
        this.attachableData["minecraft:attachable"]["description"]["geometry"] ??= {};
        this.attachableData["minecraft:attachable"]["description"]["geometry"][name] = identifier;
    }

    setVariable(variable){
        this.attachableData["minecraft:attachable"]["description"]["scripts"] ??= {};
        this.attachableData["minecraft:attachable"]["description"]["scripts"]["initialize"] ??= [];
        this.attachableData["minecraft:attachable"]["description"]["scripts"]["initialize"].push(variable);
    }

    setPreAnimation(variable) {
        this.attachableData["minecraft:attachable"]["description"]["scripts"] ??= {};
        this.attachableData["minecraft:attachable"]["description"]["scripts"]["pre_animation"] ??= [];
        this.attachableData["minecraft:attachable"]["description"]["scripts"]["pre_animation"].push(variable);
    }

    setAnimate(animateData) {
        this.attachableData["minecraft:attachable"]["description"]["scripts"] ??= {};
        this.attachableData["minecraft:attachable"]["description"]["scripts"]["animate"] ??= [];
        this.attachableData["minecraft:attachable"]["description"]["scripts"]["animate"].push(animateData);
    }


    setAnimation(animationName, animationData) {
        this.attachableData["minecraft:attachable"]["description"]["animations"] ??= {};
        this.attachableData["minecraft:attachable"]["description"]["animations"][animationName] = animationData;
    }

    setParticleEffect(name, identifier) {
        this.attachableData["minecraft:attachable"]["description"]["particle_effects"] ??= {};
        this.attachableData["minecraft:attachable"]["description"]["particle_effects"][name] = identifier;
    }
    setSoundEffect(name, identifier) {
        this.attachableData["minecraft:attachable"]["description"]["sound_effects"] ??= {};
        this.attachableData["minecraft:attachable"]["description"]["sound_effects"][name] = identifier;
    }


    setRenderController(identifier, queryData) {
        this.attachableData["minecraft:attachable"]["description"]["render_controllers"] ??= [];
        this.attachableData["minecraft:attachable"]["description"]["render_controllers"].push({ [identifier]: queryData });
    }

    setRenderControllerWithoutInstructions(controllerName) {
        this.attachableData["minecraft:attachable"]["description"]["render_controllers"] ??= [];
        this.attachableData["minecraft:attachable"]["description"]["render_controllers"].push(controllerName);
    }

    setScriptData(name, data){
        this.attachableData["minecraft:attachable"]["description"]["scripts"] ??= {};
        this.attachableData["minecraft:attachable"]["description"]["scripts"][name] = data;
    }

    setDescriptionData(descriptionType, data) {
        this.attachableData["minecraft:attachable"]["description"][descriptionType] = (data);
    }

    getAttachableData() {
        return this.attachableData;
    }
}