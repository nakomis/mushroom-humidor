#include "I2CScan.h"
#include <pins.h>
#include <Wire.h>
#include <Arduino.h>

I2CScan::I2CScan()
{
    Wire.begin(I2C_SDA, I2C_SCL);
}

uint32_t startScan;
uint32_t stopScan;
uint32_t RESTORE_LATENCY = 5; // 5 milliseconds
long speed[] = {
    50, 100, 200, 250, 400, 500, 800};
const int speeds = sizeof(speed) / sizeof(speed[0]);
bool delayFlag = false; // delay between tests of found devices.
void I2CScan::scan()
{
    startScan = millis();
    uint8_t count = 0;

    if (true)
    {
        Serial.print(F("TIME\tDEC\tHEX\t"));
        for (uint8_t s = 0; s < speeds; s++)
        {
            Serial.print(F("\t"));
            Serial.print(speed[s]);
        }
        Serial.println(F("\t[KHz]"));
        for (uint8_t s = 0; s < speeds + 5; s++)
        {
            Serial.print(F("--------"));
        }
        Serial.println();
    }

    // TEST
    // 0.1.04: tests only address range 8..120
    // --------------------------------------------
    // Address	R/W Bit	Description
    // 0000 000   0	General call address
    // 0000 000   1	START byte
    // 0000 001   X	CBUS address
    // 0000 010   X	reserved - different bus format
    // 0000 011   X	reserved - future purposes
    // 0000 1XX   X	High Speed master code
    // 1111 1XX   X	reserved - future purposes
    // 1111 0XX   X	10-bit slave addressing
    for (uint8_t address = 8; address < 120; address++)
    {
        bool printLine = true;
        bool found[speeds];
        bool fnd = false;

        for (uint8_t s = 0; s < speeds; s++)
        {
            // TWBR = (F_CPU / (speed[s] * 1000) - 16) / 2;
            Wire.beginTransmission(address);
            found[s] = (Wire.endTransmission() == 0);
            fnd |= found[s];
            // give device 5 millis
            if (fnd && delayFlag)
                delay(RESTORE_LATENCY);
        }

        if (fnd)
            count++;
        printLine |= fnd;

        if (printLine)
        {
            Serial.print(millis());
            Serial.print(F("\t"));
            Serial.print(address, DEC);
            Serial.print(F("\t0x"));
            Serial.print(address, HEX);
            Serial.print(F("\t"));

            for (uint8_t s = 0; s < speeds; s++)
            {
                Serial.print(F("\t"));
                Serial.print(found[s] ? F("V") : F("."));
            }
            Serial.println();
        }
    }

    stopScan = millis();
    if (true)
    {
        Serial.println();
        Serial.print(count);
        Serial.print(F(" devices found in "));
        Serial.print(stopScan - startScan);
        Serial.println(F(" milliseconds."));
    }
}
