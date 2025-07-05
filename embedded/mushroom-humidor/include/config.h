#ifndef MUSHROOM_CONFIG_H
#define MUSHROOM_CONFIG_H

extern const unsigned long MQTT_START_TIMEOUT_MILLIS;
extern const char *MQTT_TOPIC_TELEMETRY;
extern const char *DEVICE_ID;

extern const char *MUSHROOM_NTP_SERVER;
extern const long GMT_OFFSET_SECONDS;
extern const int DAYLIGHT_OFFSET_SECONDS;
extern const unsigned long RTC_NTP_RESYNC_INTERVAL;

extern const unsigned int SCREEN_WIDTH;
extern const unsigned int SCREEN_HEIGHT;
extern const unsigned int SCREEN_ADDRESS;

extern const unsigned int PIN_I2C_SDA;
extern const unsigned int PIN_I2C_SCL;
extern const unsigned int PIN_MISTER;

#endif