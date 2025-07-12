#include "config.h"

const unsigned long MQTT_START_TIMEOUT_MILLIS = 20 * 1000;
const char *MQTT_TOPIC_TELEMETRY = "MushroomThing/telemetry";
const char *DEVICE_ID = "d1";

const char *MUSHROOM_TIME_ZONE = "GBT0BST,M3.5.0,M10.5.0/1";
const char *MUSHROOM_NTP_SERVER_0 = "0.uk.pool.ntp.org";
const char *MUSHROOM_NTP_SERVER_1 = "1.uk.pool.ntp.org";
const char *MUSHROOM_NTP_SERVER_2 = "time.google.com";
const char *MUSHROOM_NTP_SERVER_3 = "time.aws.com";
const unsigned long RTC_NTP_RESYNC_INTERVAL = 20 * 1000;

const unsigned int SCREEN_WIDTH = 128;
const unsigned int SCREEN_HEIGHT = 64;
const unsigned int SCREEN_ADDRESS = 0x3C;

const unsigned int PIN_I2C_SDA = 5;
const unsigned int PIN_I2C_SCL = 4;
const unsigned int PIN_MISTER = 18;
