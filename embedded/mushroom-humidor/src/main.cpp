#include <Arduino.h>
#include <Aws.h>
#include <WifiConnect.h>
#include <Clock.h>
#include <Screen.h>
#include <pins.h>

WifiConnect wifiConnect;
Aws aws;
Clock esp32Clock;
Screen screen;
long lastPinMillis = 0;
uint8_t lastPinValue = HIGH;

void setup()
{
    Serial.begin(115200);
    // Wait for the serial port to become available
    delay(5000);

    Serial.println("\n\n");
    Serial.println("======================");
    Serial.println("=== Starting Setup ===");
    Serial.println("======================\n");
    pinMode(MISTER_PIN, OUTPUT);
}

void loop()
{
    Serial.println("Looping...");
    if (wifiConnect.connect() != 0)
    {
        Serial.println("Failed to connect to Wi-Fi.");
        delay(5000);
        return;
    }

    Serial.println("Connected to AWS..");
    if (aws.connect() != 0)
    {
        Serial.println("Failed to connect to AWS.");
        delay(5000);
        return;
    }

    Serial.println("Clocking...");
    esp32Clock.sync();
    tm currentTime = esp32Clock.getTime();
    char* localTime = esp32Clock.getTimeChar();
    
    Serial.println("Drawing");
    screen.loop(); // Run the screen loop to handle display updates
    screen.drawText("20.5° C", 5, 0, 2); // Draw text on the screen
    screen.drawText(localTime, 5, 30, 2); // Draw text on the screen

    long millisNow = millis();
    if ((millisNow - lastPinMillis) >= 1000 * 5) // Every 5 seconds
    {
        if (lastPinValue == HIGH)
        {
            digitalWrite(MISTER_PIN, LOW); // Turn the pin LOW
            Serial.println("Pin 18 set to LOW");
            lastPinValue = LOW;
        }
        else
        {
            digitalWrite(MISTER_PIN, HIGH); // Turn the pin HIGH
            Serial.println("Pin 18 set to HIGH");
            lastPinValue = HIGH;
        }
        lastPinMillis = millisNow;
    } else {
        Serial.println("Waiting for 5 seconds before toggling pin 18 again.");
    }

    // Add a delay before the next loop iteration
    delay(500);
}
