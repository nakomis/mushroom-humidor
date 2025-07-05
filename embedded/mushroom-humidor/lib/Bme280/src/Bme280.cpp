#include <Bme280.h>
#include <Adafruit_BME280.h>

#include <Wire.h>
#include <pins.h>

Adafruit_BME280 bme;

Bme280::Bme280()
{
}

int Bme280::sync()
{
    if (!bme.begin(0x76, &Wire))
    {
        Serial.println("Could not find a valid BME80 sensor, check wiring!");
    }
    bme.setSampling(Adafruit_BME280::MODE_NORMAL,
                    Adafruit_BME280::SAMPLING_X1,   // temperature
                    Adafruit_BME280::SAMPLING_NONE, // pressure
                    Adafruit_BME280::SAMPLING_X1,   // humidity
                    Adafruit_BME280::FILTER_OFF);
    return 0;
}

float Bme280::getTemperature()
{
    return bme.readTemperature();
}

float Bme280::getHumidity()
{
    return bme.readHumidity();
}