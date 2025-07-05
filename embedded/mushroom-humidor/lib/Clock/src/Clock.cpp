#include <DS3231.h>
#include <Wire.h>
#include <time.h>

#include "Clock.h"
#include "config.h"

DS3231 *rtc;

bool century = true;
bool h12Flag = false;
bool pmFlag;

unsigned long *lastNtpSyncMillis = nullptr;
Clock::Clock()
{
    rtc = new DS3231();
}

int Clock::sync()
{
    unsigned long nowMillis = millis();
    if ((lastNtpSyncMillis == nullptr) || ((nowMillis - *lastNtpSyncMillis) >= RTC_NTP_RESYNC_INTERVAL))
    {
        configTime(GMT_OFFSET_SECONDS, DAYLIGHT_OFFSET_SECONDS, MUSHROOM_NTP_SERVER);
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
        rtc->setEpoch(mktime(&timeinfo), true); // Set the RTC to the current epoch time
        lastNtpSyncMillis = &nowMillis; // Store the last sync time
    }

    return 0;
}

char *Clock::getTimeChar()
{
    static char buff[64];
    snprintf(buff, (sizeof(buff) - 1), "%1$'0.4d-%2$'0.2d-%3$'0.2dT%4$'0.2d:%5$'0.2d:%6$'0.2dZ", rtc->getYear() + 2000, rtc->getMonth(century),
             rtc->getDate(), rtc->getHour(h12Flag, pmFlag), rtc->getMinute(), rtc->getSecond());
    return buff;
}

struct tm Clock::getTime()
{
    tm timeinfo = {};
    timeinfo.tm_year = rtc->getYear() + 2000 - 1900; // tm_year is years since 1900
    timeinfo.tm_mon = rtc->getMonth(century) - 1; // tm_mon is months since January
    timeinfo.tm_mday = rtc->getDate();
    timeinfo.tm_hour = rtc->getHour(h12Flag, pmFlag);
    timeinfo.tm_min = rtc->getMinute();
    timeinfo.tm_sec = rtc->getSecond();
    timeinfo.tm_isdst = -1; // Not set, let the system determine if DST is in effect

    return timeinfo;
}
