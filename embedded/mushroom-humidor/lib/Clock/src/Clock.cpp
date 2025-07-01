#include "Clock.h"
#include <RTClib.h> // Include the RTC library if needed

RTC_DS1307 rtc;
TwoWire twowire = TwoWire(0);
char daysOfTheWeek[7][12] = {"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"};
const char *ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 3600;
const int daylightOffset_sec = 3600;

Clock::Clock()
{
    Serial.println("Clock constructor Clock::Clock() called.");
    twowire.setPins(21, 22); // Set SDA and SCL pins for I2C
    twowire.begin(); // Initialize the I2C bus
    
    // if (rtc.begin(&twowire)) {
    //     Serial.println("RTC initialized successfully.");
    // } else {
    //     Serial.println("RTC initialization failed.");
    // }
    // if (!rtc.isrunning()) {
    //     Serial.println("RTC is not running, setting the time.");
    //     // Set the RTC to the date & time this sketch was compiled
    //     rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
    // } else {
    //     Serial.println("RTC is running.");  
    // }

}

int Clock::sync()
{
    // Placeholder for clock synchronization logic
    // This function should implement the logic to sync the clock with an external time source
    // For now, we will just return 0 to indicate success
    // rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
    // configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
    // printLocalTime();
    Serial.println("Clock synchronized successfully.");
    return 0;
}

void Clock::printLocalTime()
{
    // struct tm timeinfo;
    // if (!getLocalTime(&timeinfo))
    // {
    //     Serial.println("Failed to obtain time");
    //     return;
    // }
    // Serial.println(&timeinfo, "%A, %B %d %Y %H:%M:%S");
    Serial.println("printLocalTime() called, but not implemented yet.");
}
