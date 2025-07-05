#include <Arduino.h>
#include <OLEDDisplay.h>

#include "Aws.h"
#include "Bme280.h"
#include "Clock.h"
#include "I2CScan.h"
#include "Screen.h"
#include "WifiConnect.h"
#include "images.h"
#include "config.h"

WifiConnect wifiConnect;
Clock esp32Clock;
Bme280 bme280;
Aws aws = Aws(esp32Clock, bme280);
Screen screen;
I2CScan i2cScan;
unsigned long lastPinMillis = 0;
uint8_t lastPinValue = HIGH;
unsigned long lastScrollTime = 0;
unsigned int scrollPosition = 0;

void drawTempHumidityCo2()
{
    float temperature = bme280.getTemperature();
    float humidity = bme280.getHumidity();
    float co2 = 12.34;
    int tempTop;
    int humTop;
    int co2Top;
    switch (scrollPosition)
    {
    case 0:
        tempTop = 16 + 10;
        humTop = 16 + 10 + 16 + 5;
        co2Top = SCREEN_HEIGHT + 10; // Draw offscreen
        break;
    case 1:
        humTop = 16 + 10;
        co2Top = 16 + 10 + 16 + 5;
        tempTop = SCREEN_HEIGHT + 10; // Draw offscreen
        break;
    case 2:
        co2Top = 16 + 10;
        tempTop = 16 + 10 + 16 + 5;
        humTop = SCREEN_HEIGHT + 10; // Draw offscreen
        break;
    default:
        break;
    }
    screen.drawText(("T: " + String(temperature, 2) + " °C").c_str(), 32 + 5, tempTop, 16, OLEDDISPLAY_TEXT_ALIGNMENT::TEXT_ALIGN_LEFT);
    screen.drawText(("H: " + String(humidity, 2) + " %").c_str(), 32 + 5, humTop, 16, OLEDDISPLAY_TEXT_ALIGNMENT::TEXT_ALIGN_LEFT);
    screen.drawText(("C: " + String(co2, 2) + " pm").c_str(), 32 + 5, co2Top, 16, OLEDDISPLAY_TEXT_ALIGNMENT::TEXT_ALIGN_LEFT);
}

void setup()
{
    Serial.begin(115200);
    Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL);
    delay(5000);

    Serial.println("\n\n");
    Serial.println("======================");
    Serial.println("=== Starting Setup ===");
    Serial.println("======================\n");
    pinMode(PIN_MISTER, OUTPUT);
    if (wifiConnect.connect() != 0)
    {
        Serial.println("Failed to connect to Wi-Fi.");
        delay(5000);
        return;
    }
    i2cScan.scan();
    Serial.println("\n");
    Serial.println("======================");
    Serial.println("=== Setup Complete ===");
    Serial.println("======================\n");
    Serial.println("\n\n");
}

void loop()
{
    screen.loop();
    bme280.sync();
    esp32Clock.sync();
    aws.loop();

    screen.clearScreen();
    char *localTime = esp32Clock.getTimeChar();
    String justTime = String(localTime).substring(11, 19);
    const char *timeOnly = justTime.c_str();

    screen.drawImage(mushroom_ico32x32_bmp, 0, 32, 32, 32);
    screen.drawText(timeOnly, 0, 0, 24, OLEDDISPLAY_TEXT_ALIGNMENT::TEXT_ALIGN_CENTER);

    if (millis() - lastScrollTime > 1000)
    {
        lastScrollTime = millis();
        scrollPosition++;
        if (scrollPosition > 2)
        {
            scrollPosition = 0;
        }
    }
    drawTempHumidityCo2();

    screen.draw();

    delay(100);
}
