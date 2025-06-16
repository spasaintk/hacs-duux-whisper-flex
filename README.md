# Duux Whisper Flex Card

This repository contains custom Lovelace card for Home Assistant.

## Card

- **Duux Whisper Flex Card** – control power, oscillation, angle and speed of the Duux Whisper Flex fan.

## Installation

1. Add this repository as a [custom repository]([https://hacs.xyz/docs/setup/download](https://www.hacs.xyz/docs/faq/custom_repositories/)) in HACS.
2. Install the desired cards from the "Frontend" section (this may be labeled "Lovelace" in some HACS versions).
3. The card file is placed under `config/www/community/hacs/` when installed.  Add it as a resource in Home Assistant **as a JavaScript module**:
   ```
   /hacsfiles/hacs/duux-whisper-flex-card.js
   ```
4. Reload the browser or refresh the dashboard to ensure the new resource loads.
5. Use the card in your dashboard:
   ```yaml
   type: custom:duux-whisper-flex-card
   entity: fan.duux_whisper_flex_ultimate
   command_topic: sensor/b4:8a:0a:29:54:a8/command
   ```

## Home Assistant MQTT Configuration

In order to control the fan via Home Assistant you must run a local MQTTS
broker on port `443` with a self-signed certificate for the domain
`collector3.cloudgarden.nl`.

You will need a local DNS infrastructure (for example a Pi-hole) and your DHCP
server should hand out this DNS address.  Add a record for
`collector3.cloudgarden.nl` that points to your MQTTS server.

Add the following to your `configuration.yaml`:

```yaml
mqtt:
  fan:
    name: "Duux Whisper Flex Ultimate"
    unique_id: "duux_whisper_fan"
    command_topic: "sensor/[YOUR FAN MAC ADDRESS]/command"
    command_template: "tune set power {{ value }}"
    state_topic: "sensor/[YOUR FAN MAC ADDRESS]/in"
    state_value_template: "{{ value_json.sub.Tune[0].power }}"
    payload_on: 1
    payload_off: 0
    qos: 1
    retain: false

  sensor:
    - name: "Duux Whisper Flex Speed"
      unique_id: "duux_whisper_flex_speed"
      state_topic: "sensor/[YOUR FAN MAC ADDRESS]/in"
      value_template: "{{ value_json.sub.Tune[0].speed }}"
      icon: mdi:fan

    - name: "Duux Whisper Flex Swing"
      unique_id: "duux_whisper_flex_swing"
      state_topic: "sensor/[YOUR FAN MAC ADDRESS]/in"
      value_template: "{{ value_json.sub.Tune[0].swing }}"
      icon: mdi:axis-x-rotate-clockwise

    - name: "Duux Whisper Flex Tilt"
      unique_id: "duux_whisper_flex_tilt"
      state_topic: "sensor/[YOUR FAN MAC ADDRESS]/in"
      value_template: "{{ value_json.sub.Tune[0].tilt }}"
      icon: mdi:axis-y-rotate-clockwise
```

Dashboard card configuration:

```yaml
type: custom:stack-in-card
cards:
  - type: custom:duux-whisper-flex-card
    entity: fan.duux_whisper_flex_ultimate
    command_topic: sensor/[YOUR FAN MAC ADDRESS]/command
```
