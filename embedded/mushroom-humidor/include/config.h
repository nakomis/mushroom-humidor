#pragma once

const unsigned long MQTT_START_TIMEOUT_MILLIS = 20 * 1000;
const char *MQTT_TOPIC_TELEMETRY = "MushroomThing/telemetry";
const char *DEVICE_ID = "d1";

const char *MUSHROOM_NTP_SERVER = "pool.ntp.org";
const long GMT_OFFSET_SECONDS = 0;
const int DAYLIGHT_OFFSET_SECONDS = 60 * 60; // 1 hour in seconds
const unsigned long RTC_NTP_RESYNC_INTERVAL = 20 * 1000;