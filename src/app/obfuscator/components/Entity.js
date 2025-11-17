export class Entity {

    entityData = {};

    constructor(formatVersion) {
        this.entityData["format_version"] = formatVersion;
        this.entityData["minecraft:client_entity"] = {};
        this.entityData["minecraft:client_entity"]["description"] = {};
    }

    setIdentifier(identifier) {
        this.entityData["minecraft:client_entity"]["description"]["identifier"] = identifier;
    }

    setMaterial(name, material) {
        this.entityData["minecraft:client_entity"]["description"]["materials"] ??= {};
        this.entityData["minecraft:client_entity"]["description"]["materials"][name] = material;
    }

    setTexture(name, path) {
        this.entityData["minecraft:client_entity"]["description"]["textures"] ??= {};
        this.entityData["minecraft:client_entity"]["description"]["textures"][name] = path;
    }

    setGeometry(name, identifier) {
        this.entityData["minecraft:client_entity"]["description"]["geometry"] ??= {};
        this.entityData["minecraft:client_entity"]["description"]["geometry"][name] = identifier;
    }

    setVariable(variable){
        this.entityData["minecraft:client_entity"]["description"]["scripts"] ??= {};
        this.entityData["minecraft:client_entity"]["description"]["scripts"]["initialize"] ??= [];
        this.entityData["minecraft:client_entity"]["description"]["scripts"]["initialize"].push(variable);
    }

    setPreAnimation(variable) {
        this.entityData["minecraft:client_entity"]["description"]["scripts"] ??= {};
        this.entityData["minecraft:client_entity"]["description"]["scripts"]["pre_animation"] ??= [];
        this.entityData["minecraft:client_entity"]["description"]["scripts"]["pre_animation"].push(variable);
    }

    setAnimate(animateData) {
        this.entityData["minecraft:client_entity"]["description"]["scripts"] ??= {};
        this.entityData["minecraft:client_entity"]["description"]["scripts"]["animate"] ??= [];
        this.entityData["minecraft:client_entity"]["description"]["scripts"]["animate"].push(animateData);
    }
    setAnimation(animationName, animationData) {
        this.entityData["minecraft:client_entity"]["description"]["animations"] ??= {};
        this.entityData["minecraft:client_entity"]["description"]["animations"][animationName] = animationData;
    }

    setRenderController(identifier, queryData) {
        this.entityData["minecraft:client_entity"]["description"]["render_controllers"] ??= [];
        this.entityData["minecraft:client_entity"]["description"]["render_controllers"].push({ [identifier]: queryData });
    }
    setRenderControllerWithoutInstructions(controllerName) {
        this.entityData["minecraft:client_entity"]["description"]["render_controllers"] ??= [];
        this.entityData["minecraft:client_entity"]["description"]["render_controllers"].push(controllerName);
    }

    setScriptData(name, data){
        this.entityData["minecraft:client_entity"]["description"]["scripts"] ??= {};
        this.entityData["minecraft:client_entity"]["description"]["scripts"][name] = data;
    }

    setParticleEffect(name, identifier) {
        this.entityData["minecraft:client_entity"]["description"]["particle_effects"] ??= {};
        this.entityData["minecraft:client_entity"]["description"]["particle_effects"][name] = identifier;
    }
    setSoundEffect(name, identifier) {
        this.entityData["minecraft:client_entity"]["description"]["sound_effects"] ??= {};
        this.entityData["minecraft:client_entity"]["description"]["sound_effects"][name] = identifier;
    }

    setScriptVariableData(data){
        this.entityData["minecraft:client_entity"]["description"]["scripts"] ??= {};
        this.entityData["minecraft:client_entity"]["description"]["scripts"]["variables"] ??= {};
        Object.assign(this.entityData["minecraft:client_entity"]["description"]["scripts"]["variables"], data);
    }

    setDescriptionData(descriptionType, data) {
        this.entityData["minecraft:client_entity"]["description"][descriptionType].push(data);

    }

    getEntityData() {
        return this.entityData;
    }
}