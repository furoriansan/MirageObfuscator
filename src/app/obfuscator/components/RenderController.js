export class RenderController {

    controllerData = {};

    constructor(formatVersion) {
        this.controllerData["format_version"] = formatVersion;
        this.controllerData["render_controllers"] = {};
    }

    initializeController(ctrlName) {
        this.controllerData["render_controllers"][ctrlName] = {};
    }

    setEmptyControllerData(ctrlName) {
        this.controllerData["render_controllers"][ctrlName] = {};
    }

    setGeometry(ctrlName, geometry){
        this.controllerData["render_controllers"][ctrlName]["geometry"] = geometry;
    }

    setArray(ctrlName, objType, arrayName, arrayData) {
        this.controllerData["render_controllers"][ctrlName]["arrays"] ??= {};
        this.controllerData["render_controllers"][ctrlName]["arrays"][objType] ??= {};
        this.controllerData["render_controllers"][ctrlName]["arrays"][objType][arrayName] = arrayData;
    }

    setMaterial(ctrlName, boneName, query) {
        if (typeof boneName !== "string" || !boneName.trim()) return;
        if (typeof query !== "string" || !query.trim()) return;

        this.controllerData["render_controllers"][ctrlName]["materials"] ??= [];
        this.controllerData["render_controllers"][ctrlName]["materials"].push({ [boneName]: query });
    }

    setPartVisibility(ctrlName, boneName, query) {
        this.controllerData["render_controllers"][ctrlName]["part_visibility"] ??= [];
        this.controllerData["render_controllers"][ctrlName]["part_visibility"].push({ [boneName] : query });
    }

    setOverlayColor(ctrlName, color, query) {
        this.controllerData["render_controllers"][ctrlName]["overlay_color"] ??= [];
        this.controllerData["render_controllers"][ctrlName]["overlay_color"].push( {[color] : query} );
    }

    setColor(ctrlName, color, query) {
        this.controllerData["render_controllers"][ctrlName]["color"] ??= {};
        this.controllerData["render_controllers"][ctrlName]["color"][color] = query;
    }

    setTexture(ctrlName, texture) {
        this.controllerData["render_controllers"][ctrlName]["textures"] ??= [];
        this.controllerData["render_controllers"][ctrlName]["textures"].push(texture);
    }

    /**
     *  Example Usage for on_fire_color<br>
     *  ctrlName = e.g. controller.render.example<br>
     *  dataType = "on_fire_color"<br>
     *  dataKey = "r"<br>
     *  dataValue = 0.0<br>
     */

    setRenderControllerData(ctrlName, dataType, dataKey, dataValue) {
        const controller = this.controllerData["render_controllers"][ctrlName];
        controller[dataType] ??= {};
        controller[dataType][dataKey] = dataValue;
    }

    setRenderControllerTypeData(ctrlName, dataType, dataValue) {
        const controller = this.controllerData["render_controllers"][ctrlName];
        controller[dataType] ??= {};
        controller[dataType] = dataValue;
    }

    setRenderControllerName(ctrlName, newCtrlName) {
        const oldController = { ...this.controllerData["render_controllers"][ctrlName] };
        delete this.controllerData["render_controllers"][ctrlName];
        this.controllerData["render_controllers"][newCtrlName] = oldController;
    }

    getControllerData() {
        return this.controllerData;
    }

    setRenderController(ctrlName, data) {
        this.controllerData["render_controllers"][ctrlName] = JSON.parse(JSON.stringify(data));
    }


}