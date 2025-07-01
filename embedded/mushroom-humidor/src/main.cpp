#include <Arduino.h>
#include <Aws.h>
#include <WifiConnect.h>
#include <Clock.h>

WifiConnect wifiConnect;
Aws aws;
Clock esp32Clock;

void setup()
{
    Serial.begin(115200);
    // Wait for the serial port to become available
    delay(5000);

    Serial.println("\n\n");
    Serial.println("======================");
    Serial.println("=== Starting Setup ===");
    Serial.println("======================\n");
}

void loop()
{
    if (wifiConnect.connect() != 0)
    {
        Serial.println("Failed to connect to Wi-Fi.");
        delay(5000);
        return;
    }

    Serial.println("Connecting to AWS.");
    if (aws.connect() != 0)
    {
        Serial.println("Failed to connect to AWS.");
        delay(5000);
        return;
    } else {
        Serial.println("Connected to AWS successfully.");
    }

    esp32Clock.sync();

    // Add a delay before the next loop iteration
    delay(1200);
}
