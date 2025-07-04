#ifndef MUSHROOM_BMP280_H
#define MUSHROOM_BMP280_H

class Bmp280
{
public:
    Bmp280();
    int sync();
    float getTemperature();
    float getHumidity();

    private:
};

#endif

