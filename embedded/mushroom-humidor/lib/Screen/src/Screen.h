#ifndef MUSHROOM_SCREEN_H
#define MUSHROOM_SCREEN_H
#include <SPI.h>
#include <Wire.h>

class Screen
{
public:
    Screen();
    int loop();
    void drawText(const char *text, int x, int y, uint8_t size);
};

#endif
