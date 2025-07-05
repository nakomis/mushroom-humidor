#include <WiFi.h>
#include <MQTTClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>

#include "Aws.h"
#include "Clock.h"
#include "config.h"
#include "secrets.h"

MQTTClient *client;
WiFiClientSecure *net;
Clock *awsClock;
Bme280 *awsBme280;
unsigned long lastSentTelemetryMillis = -1;

Aws::Aws(Clock &clock, Bme280 &bme280)
{
    client = new MQTTClient(256);
    net = new WiFiClientSecure();
    awsClock = &clock;
    awsBme280 = &bme280;
    net->setCACert(AWS_CERT_CA);
    net->setCertificate(AWS_CERT_CRT);
    net->setPrivateKey(AWS_CERT_PRIVATE);
    client->begin(AWS_IOT_ENDPOINT, 8883, *net);
    Serial.println("AWS Client initialized");
}

int Aws::loop()
{
    unsigned long startMQConnectMillis = millis();
    if (!client->connected())
    {
        client->begin(AWS_IOT_ENDPOINT, 8883, *net);
        while (!client->connect("MushroomThing"))
        {
            if (millis() - startMQConnectMillis > MQTT_START_TIMEOUT_MILLIS)
            {
                Serial.println();
                Serial.println("Bailing out of MQTT Connect");
                return 1;
            }
            Serial.print(".");
        }
    }

    unsigned long startSendTelemetryMillis = millis();
    if ((lastSentTelemetryMillis == -1) || (startSendTelemetryMillis - lastSentTelemetryMillis >= (1000 * 60 * 5)))
    {
        Serial.println("Publishing telemetry data...");

        tm currentTime = awsClock->getTime();
        time_t epochTime = mktime(&currentTime);

        JsonDocument doc;
        doc["deviceId"] = DEVICE_ID;
        doc["timestamp"] = awsClock->getTimeChar();
        doc["humidity"] = awsBme280->getHumidity();
        doc["temperature"] = awsBme280->getTemperature();

        char jsonBuffer[512];
        serializeJson(doc, jsonBuffer);

        client->publish(MQTT_TOPIC_TELEMETRY, jsonBuffer);

        lastSentTelemetryMillis = startSendTelemetryMillis;

        Serial.println("Published telemetry data");
    }

    return 0;
}