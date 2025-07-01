#include <Arduino.h>
#include <esp32-hal.h>
#include <Aws.h>
#include <WifiConnect.h>


WifiConnect wifiConnect;
Aws aws;

void setup()
{
    Serial.begin(9600);
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

    if (aws.connect() != 0)
    {
        Serial.println("Failed to connect to AWS.");
        delay(5000);
        return;
    }

    

    // Add a delay before the next loop iteration
    delay(100);
}
