// Use explicit URLs so Home Assistant can load the module directly
// @ts-ignore - TypeScript cannot resolve HTTP module specifiers
import { LitElement, html, css } from "https://unpkg.com/lit@2.8.0?module";
// @ts-ignore - same here for decorators
import { customElement, property } from "https://unpkg.com/lit@2.8.0/decorators.js?module";
// Minimal types for Home Assistant
interface HomeAssistant {
  callService(domain: string, service: string, data?: any): void;
  states: Record<string, any>;
}
interface LovelaceCardConfig { [key: string]: any; }
interface DuuxWhisperFlexCardConfig extends LovelaceCardConfig {
  command_topic?: string;
}

@customElement("duux-whisper-flex-card")
export class DuuxWhisperFlexCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property() private _config?: DuuxWhisperFlexCardConfig;
  @property({ type: Number }) private _speed = 1;

  setConfig(config: DuuxWhisperFlexCardConfig) {
    this._config = config;
  }

  static styles = css`
    .row {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      margin: 0;
    }
    .row + .row {
      margin-top: 4px;
    }
    .label {
      flex: 0 0 72px;
    }
    ha-icon {
      margin-right: 16px;
    }
    .fan-row ha-switch {
      margin-left: auto;
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
    .speed-row {
      flex-direction: column;
      align-items: stretch;
    }
    .speed-row .label {
      flex: none;
      margin-bottom: 4px;
    }
    .speed-control {
      display: flex;
      align-items: center;
    }
    .speed-control .slider {
      flex: 1;
      margin-right: 16px;
    }
    .speed-value {
      width: 32px;
      text-align: right;
    }
  `;

  render() {
    if (!this._config || !this.hass) return html``;

    const fanEntity = this.hass.states["fan.duux_whisper_flex_ultimate"];

    const speedSensor = this.hass.states["sensor.duux_whisper_flex_speed"];
    const swingSensor = this.hass.states["sensor.duux_whisper_flex_swing"];
    const tiltSensor = this.hass.states["sensor.duux_whisper_flex_tilt"];

    const swing = Number(swingSensor?.state ?? 0);
    const tilt = Number(tiltSensor?.state ?? 0);

    const sensorSpeed = Number(speedSensor?.state);
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


    return html`
      <ha-card header="Duux Whisper Flex">
        <div class="row fan-row">
          <ha-icon icon="mdi:fan"></ha-icon>
          <ha-switch
            .checked=${fanEntity.state === "on"}
            @change=${(e: Event) => this._toggleFan(e)}
          ></ha-switch>
        </div>
        <div class="row option-row">
          <span class="label">Swing</span>
          ${swingOptions.map(
            (opt) => html`
              <button
                class="button ${swing === opt.value ? 'active' : ''}"
                @click=${() => this._setSwing(opt.value)}
              >
                ${opt.label}
              </button>
            `
          )}
        </div>
        <div class="row option-row">
          <span class="label">Tilt</span>
          ${tiltOptions.map(
            (opt) => html`
              <button
                class="button ${tilt === opt.value ? 'active' : ''}"
                @click=${() => this._setTilt(opt.value)}
              >
                ${opt.label}
              </button>
            `
          )}
        </div>
        <div class="row speed-row">
          <span class="speed-label label">Fan speed</span>
          <div class="speed-control">
            <input
              type="range"
              class="slider"
              min="1"
              max="30"
              .value=${speed}
              @input=${(e: Event) => this._updateSpeed((e.target as HTMLInputElement).value)}
              @change=${(e: Event) => this._setSpeed((e.target as HTMLInputElement).value)}
            />
            <span class="speed-value">${speed}</span>
          </div>
        </div>
      </ha-card>
    `;
  }

  private _toggleFan(e: Event) {
    const turnOn = (e.target as HTMLInputElement).checked;
    this.hass.callService("fan", turnOn ? "turn_on" : "turn_off", {
      entity_id: "fan.duux_whisper_flex_ultimate",
    });
  }


  private _setSwing(value: number) {
    if (!this._config?.command_topic) {
      console.warn("Missing command_topic in config");
      return;
    }

    const payload = `tune set swing ${value}`;

    console.log(
      `MQTT publish to ${this._config.command_topic}:`,
      payload
    );
    this.hass.callService("mqtt", "publish", {
      topic: this._config.command_topic,
      payload: payload,
    });
  }

  private _setTilt(value: number) {
    if (!this._config?.command_topic) {
      console.warn("Missing command_topic in config");
      return;
    }

    const payload = `tune set tilt ${value}`;

    console.log(
      `MQTT publish to ${this._config.command_topic}:`,
      payload
    );
    this.hass.callService("mqtt", "publish", {
      topic: this._config.command_topic,
      payload: payload,
    });
  }

  private _updateSpeed(value: string) {
    // The UI slider input should not modify internal state directly
  }

  private _setSpeed(value: string) {
    const speed = Number(value);

    this._speed = speed;

    if (!this._config?.command_topic) {
      console.warn("Missing command_topic in config");
      return;
    }

    const payload = `tune set speed ${speed}`;

    console.log(
      `MQTT publish to ${this._config.command_topic}:`,
      payload
    );
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
}
