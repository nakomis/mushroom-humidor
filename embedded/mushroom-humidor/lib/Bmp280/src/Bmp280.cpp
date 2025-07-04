#include <Bmp280.h>
#include <Adafruit_BMP280.h>
#include <Adafruit_BME280.h>

#include <Wire.h>
#include <pins.h>

// SSD1306Wire display(SCREEN_ADDRESS, I2C_SDA, I2C_SCL);
Adafruit_BMP280 bmp(&Wire); // I2C
Adafruit_BME280 bme; // I2C
// Checks the internal thermometer on the DS3231 and returns the
Bmp280::Bmp280()
{
}

int Bmp280::sync()
{
    Wire.begin(I2C_SDA, I2C_SCL); // Initialize I2C communication
                                  // Serial.begin(9600);
    Serial.println(F("BME280 test"));

    if (!bmp.begin(0x76))
    {
        Serial.println("Could not find a valid BM80 sensor, check wiring!");
    }

    if (!bme.begin(0x76, &Wire))
    {
        Serial.println("Could not find a valid BME280 sensor, check wiring!");
    }

    Serial.println("-- Default Test --");
    Serial.println("normal mode, 16x oversampling for all, filter off,");
    Serial.println("0.5ms standby period");
    // delayTime = 5000;
    // This function is a placeholder for any synchronization logic needed.
    // Currently, it does nothing and returns 0.
    return 0;
}

float Bmp280::getTemperature()
{
    // humidity sensing
    Serial.println("-- Humidity Sensing Scenario --");
    Serial.println("forced mode, 1x temperature / 1x humidity / 0x pressure oversampling");
    Serial.println("= pressure off, filter off");
    bme.setSampling(Adafruit_BME280::MODE_FORCED,
                    Adafruit_BME280::SAMPLING_X1,   // temperature
                    Adafruit_BME280::SAMPLING_NONE, // pressure
                    Adafruit_BME280::SAMPLING_X1,   // humidity
                    Adafruit_BME280::FILTER_OFF);

    if (bme.takeForcedMeasurement())
    {
        Serial.print("Humidity = ");
        Serial.print(bme.readHumidity());
        Serial.println(" %");
    }
    else
    {
        Serial.println("Forced measurement failed!");
        return -1.0f;
    }
}

float Bmp280::getHumidity()
{
    // This function is a placeholder for getting the humidity.
    // Currently, it returns a fixed value of 50.0 percent.
    return 50.0f;
}