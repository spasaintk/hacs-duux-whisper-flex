var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
// Use explicit URLs so Home Assistant can load the module directly
// @ts-ignore - TypeScript cannot resolve HTTP module specifiers
import { LitElement, html, css } from "https://unpkg.com/lit@2.8.0?module";
// @ts-ignore - same here for decorators
import { customElement, property } from "https://unpkg.com/lit@2.8.0/decorators.js?module";
let DuuxWhisperFlexCard = class DuuxWhisperFlexCard extends LitElement {
    constructor() {
        super(...arguments);
        this._speed = 1;
    }
    setConfig(config) {
        this._config = config;
    }
    render() {
        var _a, _b;
        if (!this._config || !this.hass)
            return html ``;
        const fanEntity = this.hass.states["fan.duux_whisper_flex_ultimate"];
        const speedSensor = this.hass.states["sensor.duux_whisper_flex_speed"];
        const swingSensor = this.hass.states["sensor.duux_whisper_flex_swing"];
        const tiltSensor = this.hass.states["sensor.duux_whisper_flex_tilt"];
        const swing = Number((_a = swingSensor === null || swingSensor === void 0 ? void 0 : swingSensor.state) !== null && _a !== void 0 ? _a : 0);
        const tilt = Number((_b = tiltSensor === null || tiltSensor === void 0 ? void 0 : tiltSensor.state) !== null && _b !== void 0 ? _b : 0);
        const sensorSpeed = Number(speedSensor === null || speedSensor === void 0 ? void 0 : speedSensor.state);
        const speed = !isNaN(sensorSpeed)
            ? sensorSpeed
            : this._speed
                ? this._speed
                : 1;
        if (!isNaN(sensorSpeed)) {
            this._speed = sensorSpeed;
        }
        console.log("Reported swing:", swing);
        console.log("Reported tilt:", tilt);
        const swingOptions = [
            { value: 0, label: "Off" },
            { value: 1, label: "30°" },
            { value: 2, label: "60°" },
            { value: 3, label: "90°" },
        ];
        const tiltOptions = [
            { value: 0, label: "Off" },
            { value: 1, label: "90°" },
            { value: 2, label: "105°" },
        ];
        return html `
      <ha-card header="Duux Whisper Flex">
        <div class="row">
          <ha-switch
            .checked=${fanEntity.state === "on"}
            @change=${(e) => this._toggleFan(e)}
          ></ha-switch>
          <span>Fan ${fanEntity.state === "on" ? "On" : "Off"}</span>
        </div>
        <div class="row">
          <span>Swing:</span>
          ${swingOptions.map((opt) => html `
              <button
                class="button ${swing === opt.value ? 'active' : ''}"
                @click=${() => this._setSwing(opt.value)}
              >
                ${opt.label}
              </button>
            `)}
        </div>
        <div class="row">
          <span>Tilt:</span>
          ${tiltOptions.map((opt) => html `
              <button
                class="button ${tilt === opt.value ? 'active' : ''}"
                @click=${() => this._setTilt(opt.value)}
              >
                ${opt.label}
              </button>
            `)}
        </div>
        <div class="row">
          <span>Speed:</span>
          <input
            type="range"
            class="slider"
            min="1"
            max="30"
            .value=${speed}
            @input=${(e) => this._updateSpeed(e.target.value)}
            @change=${(e) => this._setSpeed(e.target.value)}
          />
          <span>${speed}</span>
        </div>
      </ha-card>
    `;
    }
    _toggleFan(e) {
        const turnOn = e.target.checked;
        this.hass.callService("fan", turnOn ? "turn_on" : "turn_off", {
            entity_id: "fan.duux_whisper_flex_ultimate",
        });
    }
    _setSwing(value) {
        var _a;
        if (!((_a = this._config) === null || _a === void 0 ? void 0 : _a.command_topic)) {
            console.warn("Missing command_topic in config");
            return;
        }
        const payload = `tune set swing ${value}`;
        console.log(`MQTT publish to ${this._config.command_topic}:`, payload);
        this.hass.callService("mqtt", "publish", {
            topic: this._config.command_topic,
            payload: payload,
        });
    }
    _setTilt(value) {
        var _a;
        if (!((_a = this._config) === null || _a === void 0 ? void 0 : _a.command_topic)) {
            console.warn("Missing command_topic in config");
            return;
        }
        const payload = `tune set tilt ${value}`;
        console.log(`MQTT publish to ${this._config.command_topic}:`, payload);
        this.hass.callService("mqtt", "publish", {
            topic: this._config.command_topic,
            payload: payload,
        });
    }
    _updateSpeed(value) {
        // The UI slider input should not modify internal state directly
    }
    _setSpeed(value) {
        var _a;
        const speed = Number(value);
        this._speed = speed;
        if (!((_a = this._config) === null || _a === void 0 ? void 0 : _a.command_topic)) {
            console.warn("Missing command_topic in config");
            return;
        }
        const payload = `tune set speed ${speed}`;
        console.log(`MQTT publish to ${this._config.command_topic}:`, payload);
        this.hass.callService("mqtt", "publish", {
            topic: this._config.command_topic,
            payload: payload,
        });
    }
    static getConfigElement() {
        return document.createElement("hui-generic-card-editor");
    }
    static getStubConfig() {
        return {};
    }
};
DuuxWhisperFlexCard.styles = css `
    .row {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
    }
    .button {
      padding: 6px 12px;
      margin: 0 2px;
      cursor: pointer;
    }
    .button.active {
      background-color: var(--primary-color);
      color: var(--text-primary-color, white);
    }
    .slider {
      width: 100%;
    }
  `;
__decorate([
    property({ attribute: false })
], DuuxWhisperFlexCard.prototype, "hass", void 0);
__decorate([
    property()
], DuuxWhisperFlexCard.prototype, "_config", void 0);
__decorate([
    property({ type: Number })
], DuuxWhisperFlexCard.prototype, "_speed", void 0);
DuuxWhisperFlexCard = __decorate([
    customElement("duux-whisper-flex-card")
], DuuxWhisperFlexCard);
export { DuuxWhisperFlexCard };
