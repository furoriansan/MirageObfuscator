export class SoundDefinitions {

    soundDefs = {};

    constructor(formatVersion) {
        this.soundDefs["format_version"] = formatVersion;
        this.soundDefs["sound_definitions"] = {};
    }

    addSoundDefinition(soundName, soundData) {
        this.soundDefs["sound_definitions"][soundName] ??= {};
        this.soundDefs["sound_definitions"][soundName] = soundData;
    }

    getSoundDefinitions() {
        return this.soundDefs;
    }


}