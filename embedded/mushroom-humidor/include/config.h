#ifndef MUSHROOM_CONFIG_H
#define MUSHROOM_CONFIG_H

extern const unsigned long MQTT_START_TIMEOUT_MILLIS;
extern const char *MQTT_TOPIC_TELEMETRY;
extern const char *DEVICE_ID;

extern const char *MUSHROOM_TIME_ZONE;
extern const char *MUSHROOM_NTP_SERVER_0;
extern const char *MUSHROOM_NTP_SERVER_1;
extern const char *MUSHROOM_NTP_SERVER_2;
extern const char *MUSHROOM_NTP_SERVER_3;
extern const unsigned long RTC_NTP_RESYNC_INTERVAL;

extern const unsigned int SCREEN_WIDTH;
extern const unsigned int SCREEN_HEIGHT;
extern const unsigned int SCREEN_ADDRESS;

extern const unsigned int PIN_I2C_SDA;
extern const unsigned int PIN_I2C_SCL;
extern const unsigned int PIN_MISTER;

#endif