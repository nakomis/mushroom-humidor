#include "Aws.h"
#include "WiFi.h"
#include <MQTTClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <Clock.h>

#define AWS_IOT_PUBLISH_TOPIC "esp32/pub"

MQTTClient client = MQTTClient(256);
WiFiClientSecure net = WiFiClientSecure();

const unsigned long MQTT_START_TIMEOUT_MILLIS = 20 * 1000;
Clock myClock;

long lastMillis = 0;

Aws::Aws()
{
}

int Aws::connect()
{
    net.setCACert(AWS_CERT_CA);
    net.setCertificate(AWS_CERT_CRT);
    net.setPrivateKey(AWS_CERT_PRIVATE);
    // Connect to the MQTT broker on the AWS endpoint we defined earlier
    client.begin(AWS_IOT_ENDPOINT, 8883, net);
    unsigned long startMillis = millis();

    if (!client.connected())
    {
        while (!client.connect("MushroomThing"))
        {
            if (millis() - startMillis > MQTT_START_TIMEOUT_MILLIS)
            {
                Serial.println();
                Serial.println("Bailing out of MQTT Connect");
                WiFi.disconnect();
                return 1;
            }
            Serial.print(".");
        }
    }

    long millisNow = millis();
    if (millisNow - lastMillis >= 1000 * 60 * 5)
    {
        JsonDocument doc;
        doc["deviceId"] = "d1";
        doc["timestamp"] = myClock.getTimeChar();
        doc["humidity"] = 82.4;
        doc["temperature"] = 22.5;
        char jsonBuffer[512];
        serializeJson(doc, jsonBuffer);
        client.publish("MushroomThing/telemetry", jsonBuffer);
        lastMillis = millisNow;
        Serial.println("Published telemetry data");
    }

    return 0;
}