
export class Particle {

    particleData = {};

    constructor(formatVersion) {
        this.particleData = {
            "format_version": formatVersion,
            "particle_effect": {
                "description": {
                    "basic_render_parameters": {}
                },
                "components" : {},
            },
        };
    }

    setIdentifier(identifier) {
        this.particleData.particle_effect.description.identifier = identifier;
    }

    setMaterial(material) {
        this.particleData.particle_effect.description.basic_render_parameters["material"] =  material;
    }

    setTexture(texture) {
        this.particleData.particle_effect.description.basic_render_parameters["texture"] = texture;
    }

    setComponentData(compType, innerCompType, compData, dataObjType) {
        if (dataObjType === "a" || innerCompType === null) {
            this.particleData.particle_effect["components"][compType] = compData;
        } else {

            this.particleData.particle_effect["components"][compType] ??= {};
            this.particleData.particle_effect["components"][compType][innerCompType] = compData;
        }
    }

    setCurveData(curveName, curveType, curveData) {
        this.particleData.particle_effect["curves"] ??= [];
        this.particleData.particle_effect["curves"][curveName] ??= [];
        this.particleData.particle_effect["curves"][curveName][curveType] = curveData;
    }

    setEventData(eventName, eventData) {
        this.particleData.particle_effect["events"] ??= {};
        this.particleData.particle_effect["events"][eventName] =  eventData;
    }

    getParticleData() {
        return this.particleData;
    }
}