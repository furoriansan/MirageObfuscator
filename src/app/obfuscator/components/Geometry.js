export class Geometry {

    geometryData = {};

    constructor(formatVersion) {
        this.geometryData["format_version"] = formatVersion;
        this.geometryData["minecraft:geometry"] = [];
        this.geometryData["minecraft:geometry"][0] = {};
        this.geometryData["minecraft:geometry"][0].description = {};
        this.geometryData["minecraft:geometry"][0]["bones"] = [];
    }

    setIdentifier(identifier) {
        this.geometryData["minecraft:geometry"][0]["description"]["identifier"] = identifier;
    }

    setDescriptionData(dataKey, dataValue) {
        this.geometryData["minecraft:geometry"][0]["description"][dataKey] = dataValue;
    }

    setBoneData(boneData) {
        this.geometryData["minecraft:geometry"][0]["bones"].push(boneData);
    }

    getGeometryObject() {
        return {
            description: this.geometryData["minecraft:geometry"][0]["description"],
            bones: this.geometryData["minecraft:geometry"][0]["bones"]
        };
    }


}