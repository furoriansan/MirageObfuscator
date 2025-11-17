import CryptoJS from "crypto-js";

const hashKey : string =  process.env.OBFUSCATION_KEY ? process.env.OBFUSCATION_KEY : "ilovecheesecake"; // Use your own key here, this ensures no one is able to reverse the pack obfuscation.
const replacementMap: { [key: string]: string } = {'0': 'q', '1': 'r', '2': 's', '3': 't', '4': 'u', '5': 'v', '6': 'w', '7': 'x', '8': 'y', '9': 'z'};

export const JSON_LINE_SIZE  = 0;

export default function hashString(str: string) {
    const hashedString = CryptoJS.HmacMD5(str, hashKey).toString();
    const obfuscatedString= hashedString.replace(/[0-9]/g, c => replacementMap[c])
    return obfuscatedString.substring(0,10);
}

export function hashMolangExp(expression: string | number, keyword: string) {
    const molangPattern: RegExp = /\b(?:(v|variable|q|query))\.([a-zA-Z_][a-zA-Z0-9_]*)\b/g
    if(typeof expression !== 'string') {
        return expression;
    }
    return expression.replace(molangPattern, (fullMatch, prefix, name) => {
        const hashedName = includesIgnoreCase(name, keyword) ? hashString(name) : name;
        return `${prefix}.${hashedName}`;
    });
}

export function hashTextureExpression(expression: string, keyword: string): string {
    const texturePattern = /\bTexture\.([a-zA-Z_][a-zA-Z0-9_]*)\b/g;
    return expression.replace(texturePattern, (fullMatch, name) => {
        let hashedName = name;
        if(includesIgnoreCase(name, keyword)) {
            hashedName = hashString(name);
        }
        return `Texture.${hashedName}`;
    });
}

export function hashArrayExp(expression: string, keyword: string) {
    const match = expression.match(/^array\.(\w+)\[(.+)\]$/i);
    if (!match) return expression;
    const arrayName = match[1];
    const hashedName = includesIgnoreCase(arrayName, keyword) ? hashString(arrayName) : arrayName;
    return `Array.${hashedName}[${ hashMolangExp(match[2], keyword)}]`;
}

export function hashIdentifier(identifier: string, keyword: string, prefix: string) {
    const newIdentifier = identifier.toLowerCase();
    if (!newIdentifier.startsWith(prefix)) return identifier;
    const identifierName = newIdentifier.slice(prefix.length);
    if (!includesIgnoreCase(identifierName, keyword)) return identifier;
    return `${prefix}${hashString(identifierName)}`; 
}

export function hashArrayData(arrayData: string[], dataType: string, keyword: string): string[] {
    const newArrayData = [];
    const prefix = `${dataType}.`;

    for (const arrayValue of arrayData) {
        if (!includesIgnoreCase(arrayValue, keyword)) {
            newArrayData.push(arrayValue);
            continue;
        }
        if (!arrayValue.toUpperCase().startsWith(prefix.toUpperCase())) {
            newArrayData.push(arrayValue);
            continue;
        }
        const dataName = arrayValue.slice(prefix.length);
        newArrayData.push(`${dataType}.${hashString(dataName)}`);
    }
    return newArrayData;
}

export function includesIgnoreCase(str: string, search: string): boolean {
    if (typeof str !== "string" || typeof search !== "string") return false;
    return str.trim().toLowerCase().includes(search.trim().toLowerCase());
}
