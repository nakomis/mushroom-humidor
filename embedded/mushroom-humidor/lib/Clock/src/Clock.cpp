#include "Clock.h"

#include <DS3231.h>
#include <Wire.h>
#include "time.h"

const char *ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 0;
const int daylightOffset_sec = 0;

TwoWire wire = TwoWire(0);
DS3231 myRTC = DS3231(wire);

bool century = true;
bool h12Flag = false;
bool pmFlag;
bool hasBeenSet = false;

Clock::Clock()
{
}

int Clock::sync()
{
    wire.begin(4, 5); // Set SDA and SCL pins for ESP32
    if (!hasBeenSet)
    {
        configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
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

    printLocalTime();

    return 0;
}

void Clock::printLocalTime()
{
    char buff[64];
    snprintf(buff, (sizeof(buff) - 1), "%1$'0.4d-%2$'0.2d-%3$'0.2dT%4$'0.2d:%5$'0.2d:%6$'0.2dZ", myRTC.getYear() + 2000, myRTC.getMonth(century),
             myRTC.getDate(), myRTC.getHour(h12Flag, pmFlag), myRTC.getMinute(), myRTC.getSecond());
    Serial.print(buff);

    return;
}
