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
Clock *awsClock;
Bme280 *awsBme280;

unsigned long lastMillis = -1;

Aws::Aws(Clock &clock, Bme280 &bme280)
{
    awsClock = &clock;
    awsBme280 = &bme280;
    net.setCACert(AWS_CERT_CA);
    net.setCertificate(AWS_CERT_CRT);
    net.setPrivateKey(AWS_CERT_PRIVATE);
    client.begin(AWS_IOT_ENDPOINT, 8883, net);
    Serial.println("AWS Client initialized");
}

int Aws::loop()
{
    // Connect to the MQTT broker on the AWS endpoint we defined earlier
    unsigned long startMillis = millis();

    if (!client.connected())
    {
        client.begin(AWS_IOT_ENDPOINT, 8883, net);
        while (!client.connect("MushroomThing"))
        {
            if (millis() - startMillis > MQTT_START_TIMEOUT_MILLIS)
            {
                Serial.println();
                Serial.println("Bailing out of MQTT Connect");
                return 1;
            }
            Serial.print(".");
        }
    }

    unsigned long millisNow = millis();
    if ((lastMillis == -1) || (millisNow - lastMillis >= (1000 * 60 * 5)))
    {
        Serial.println("Publishing telemetry data...");
        tm currentTime = awsClock->getTime();
        
        time_t epochTime = mktime(&currentTime);
        JsonDocument doc;
        doc["deviceId"] = "d1";
        doc["timestamp"] = awsClock->getTimeChar();
        doc["humidity"] = awsBme280->getHumidity();
        doc["temperature"] = awsBme280->getTemperature();
        char jsonBuffer[512];
        serializeJson(doc, jsonBuffer);
        client.publish("MushroomThing/telemetry", jsonBuffer);
        lastMillis = millisNow;
        Serial.println("Published telemetry data");
    }

    return 0;
}