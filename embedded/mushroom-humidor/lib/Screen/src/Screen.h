#ifndef MUSHROOM_SCREEN_H
#define MUSHROOM_SCREEN_H
#include <SPI.h>
#include <Wire.h>
#include <OLEDDisplay.h>

class Screen
{
public:
    Screen();
    int loop();
    void drawText(const char *text, int x, int y, uint8_t size, OLEDDISPLAY_TEXT_ALIGNMENT);
    void drawText(const char *text, int x, int y, uint8_t size);
    void drawImage(const uint8_t *image, int x, int y, int width, int height);
    void clearScreen();
    void draw();
};

#endif
