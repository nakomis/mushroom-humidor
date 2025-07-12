#include "Clock.h"

#include <DS3231.h>
#include <Wire.h>
#include "time.h"
#include <pins.h>

const char *ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 0;
const int daylightOffset_sec = 0;

DS3231 myRTC = DS3231();

bool century = true;
<<<<<<< Updated upstream
bool h12Flag = false;
bool pmFlag;
bool hasBeenSet = false;
=======
bool h12Flag = true;
bool pmFlag = false;
>>>>>>> Stashed changes

Clock::Clock()
{
}

int Clock::sync()
{
    Wire.begin(4, 5); // Set SDA and SCL pins for ESP32
    if (!hasBeenSet)
    {
<<<<<<< Updated upstream
        configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
=======
        configTzTime(MUSHROOM_TIME_ZONE, MUSHROOM_NTP_SERVER_0, MUSHROOM_NTP_SERVER_1, MUSHROOM_NTP_SERVER_2);
        // configTime(GMT_OFFSET_SECONDS, DAYLIGHT_OFFSET_SECONDS, MUSHROOM_NTP_SERVER);
>>>>>>> Stashed changes
        struct tm timeinfo;
        mktime(&timeinfo); // Initialize timeinfo to zero
        if (!getLocalTime(&timeinfo))
        {
            Serial.println("Failed to obtain time");
            return 1;
        }
        else
        {
            Serial.println("Time obtained successfully");
        }
        myRTC.setEpoch(mktime(&timeinfo), true); // Set the RTC to the current epoch time
        hasBeenSet = true;
    }

    return 0;
}

char* Clock::getTimeChar()
{
    static char buff[64];
<<<<<<< Updated upstream
    snprintf(buff, (sizeof(buff) - 1), "%1$'0.4d-%2$'0.2d-%3$'0.2dT%4$'0.2d:%5$'0.2d:%6$'0.2dZ", myRTC.getYear() + 2000, myRTC.getMonth(century),
             myRTC.getDate(), myRTC.getHour(h12Flag, pmFlag), myRTC.getMinute(), myRTC.getSecond());
=======
    byte hour = rtc->getHour(h12Flag, pmFlag);
    if (h12Flag && pmFlag) {
        hour += 12; // Convert to 12-hour format if necessary
    }
    snprintf(buff, (sizeof(buff) - 1), "%1$'0.4d-%2$'0.2d-%3$'0.2dT%4$'0.2d:%5$'0.2d:%6$'0.2dZ", rtc->getYear() + 2000, rtc->getMonth(century),
             rtc->getDate(), hour, rtc->getMinute(), rtc->getSecond());
>>>>>>> Stashed changes
    return buff;
}

struct tm Clock::getTime()
{
    tm timeinfo = {};
<<<<<<< Updated upstream
    timeinfo.tm_year = myRTC.getYear() + 2000 - 1900; // tm_year is years since 1900
    timeinfo.tm_mon = myRTC.getMonth(century) - 1; // tm_mon is months since January
    timeinfo.tm_mday = myRTC.getDate();
    timeinfo.tm_hour = myRTC.getHour(h12Flag, pmFlag);
    timeinfo.tm_min = myRTC.getMinute();
    timeinfo.tm_sec = myRTC.getSecond();
=======
    timeinfo.tm_year = rtc->getYear() + 2000 - 1900; // tm_year is years since 1900
    timeinfo.tm_mon = rtc->getMonth(century) - 1; // tm_mon is months since January
    timeinfo.tm_mday = rtc->getDate();
    timeinfo.tm_hour = rtc->getHour(h12Flag, pmFlag);
    if (h12Flag && pmFlag) {
        timeinfo.tm_hour += 12; // Convert to 24-hour format if PM
    }
    timeinfo.tm_min = rtc->getMinute();
    timeinfo.tm_sec = rtc->getSecond();
>>>>>>> Stashed changes
    timeinfo.tm_isdst = -1; // Not set, let the system determine if DST is in effect

    return timeinfo;
}
