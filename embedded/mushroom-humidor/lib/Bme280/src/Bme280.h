#ifndef MUSHROOM_BME280_H
#define MUSHROOM_BME280_H

class Bme280
{
public:
    Bme280();
    int sync();
    float getTemperature();
    float getHumidity();

    private:
};

#endif

