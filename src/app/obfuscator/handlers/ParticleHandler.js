import { FileHandler } from "./FileHandler";
import hashString, {hashMolangExp, includesIgnoreCase, JSON_LINE_SIZE} from "../lib/Helpers";
import path from "path";
import { Particle } from "../components/Particle";

export class ParticleHandler {
    static handle(cachePath, keyword) {
        const dirPath = `${cachePath}/particles/`;
        const particleFiles = FileHandler.getAllFiles(dirPath);

        if (particleFiles.length === 0) return true;

        for (const filePath of particleFiles) {
            const particleBufferData = FileHandler.readFile(filePath);
            if (!particleBufferData) return false;
            const json = JSON.parse(particleBufferData.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g) => g ? "" : m));
            const particle = new Particle(json["format_version"]);
            const data = json["particle_effect"];

            if (data.description) {
                const desc = data.description;
                if (desc.identifier) particle.setIdentifier(desc.identifier);
                if (desc.basic_render_parameters?.texture) {
                    const texturePath = desc.basic_render_parameters.texture.split("/").map(part => includesIgnoreCase(part, keyword) ? hashString(part) : part).join("/");
                    particle.setTexture(texturePath);
                }
                if (desc.basic_render_parameters?.material) {
                    particle.setMaterial(desc.basic_render_parameters.material);
                }
            }
            if (data.components) {
                this.processComponents(data.components, particle, keyword);
            }
            if (data.curves) {
                for (const [curveName, curveObj] of Object.entries(data.curves)) {
                    const obfName = hashMolangExp(curveName, keyword);
                    for (const [curveType, value] of Object.entries(curveObj)) {
                        const newVal = this.obfuscateRecursive(value, keyword);
                        particle.setCurveData(obfName, curveType, newVal);
                    }
                }
            }
            if (data.events) {
                for (const [eventName, eventData] of Object.entries(data.events)) {
                    const newEvent = this.processEventNode(eventData, keyword);
                    particle.setEventData(hashMolangExp(eventName, keyword), newEvent);
                }
            }
            FileHandler.deleteFile(filePath);
            const baseName = path.basename(filePath, ".json");
            const newName = (includesIgnoreCase(baseName, keyword) ? hashString(baseName) : baseName) + ".json";
            FileHandler.saveFile(path.join(path.dirname(filePath), newName), JSON.stringify(particle.getParticleData(), null, JSON_LINE_SIZE));
        }
        return true;
    }

    static processComponents(components, obfuscatedParticle, keyword) {
        for (const [compType, compData] of Object.entries(components)) {
            if (Array.isArray(compData)) {
                obfuscatedParticle.setComponentData(compType, null, compData, "a");
                continue;
            }
            if (typeof compData === "object" && compData !== null) {
                const newComponent = {};
                for (const [key, value] of Object.entries(compData)) {
                    newComponent[key] = this.obfuscateValue(value, keyword);
                }
                obfuscatedParticle.setComponentData(compType, null, newComponent, "o");
                continue;
            }
            const finalValue = typeof compData === "string"
                ? hashMolangExp(compData, keyword)
                : compData;

            obfuscatedParticle.setComponentData(compType, null, finalValue, "o");
        }
    }

    static processEventNode(node, keyword) {
        if (!node || typeof node !== "object") return node;
        if (node.sequence) {
            return { sequence: node.sequence.map(n => this.processEventNode(n, keyword)) };
        }
        if (node.randomize) {
            return { randomize: node.randomize.map(opt => ({
                    weight: opt.weight,
                    ...this.processEventNode(opt, keyword)
                }))
            };
        }

        const result = {};
        if (node.particle_effect) {
            result.particle_effect = {
                effect: node.particle_effect.effect,
                type: node.particle_effect.type
            };
            if (node.particle_effect.pre_effect_expression) {
                result.particle_effect.pre_effect_expression = hashMolangExp(
                    node.particle_effect.pre_effect_expression,
                    keyword
                );
            }
        }

        if (node.sound_effect) {
            result.sound_effect = { event_name: node.sound_effect.event_name };
        }
        if (node.expression) {
            result.expression = hashMolangExp(node.expression, keyword);
        }
        if (node.log) result.log = node.log;
        return result;
    }
    static obfuscateRecursive(data, keyword) {
        if (Array.isArray(data)) {
            return data.map(item => this.obfuscateRecursive(item, keyword));
        }
        if (typeof data === "object" && data !== null) {
            const newObj = {};
            for (let [k, v] of Object.entries(data)) {
                newObj[k] = this.obfuscateRecursive(v, keyword);
            }
            return newObj;
        }
        if (typeof data === "string") {
            return hashMolangExp(data, keyword);
        }
        return data;
    }

    static obfuscateValue(value, keyword) {
        if (typeof value === "string") {
            return hashMolangExp(value, keyword);
        }
        if (Array.isArray(value)) {
            return value.map(v => this.obfuscateValue(v, keyword));
        }
        if (typeof value === "object" && value !== null) {
            const result = {};
            for (const [k, v] of Object.entries(value)) {
                result[k] = this.obfuscateValue(v, keyword);
            }
            return result;
        }
        return value;
    }
}