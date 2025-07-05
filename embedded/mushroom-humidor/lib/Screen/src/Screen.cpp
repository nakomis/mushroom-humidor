#include "Screen.h"
#include <SPI.h>
#include <Wire.h>
#include <pins.h>
#include "SSD1306Wire.h"

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define SCREEN_ADDRESS 0x3C

SSD1306Wire display(SCREEN_ADDRESS, I2C_SDA, I2C_SCL);
bool initialized = false;

Screen::Screen()
{
}

int Screen::loop()
{
    if (!initialized && display.init())
    {
        display.flipScreenVertically();
        initialized = true;
    }
    return 0;
}

void Screen::drawText(const char *text, int x, int y, uint8_t size, OLEDDISPLAY_TEXT_ALIGNMENT alignment)
{
    if (size == 24)
    {
        display.setFont(ArialMT_Plain_24);
    }
    else if (size == 16)
    {
        display.setFont(ArialMT_Plain_16);
    }
    else
    {
        display.setFont(ArialMT_Plain_10);
    }
    display.setTextAlignment(alignment);
    if (alignment == TEXT_ALIGN_CENTER)
    {
        x = SCREEN_WIDTH / 2;
    }
    else if (alignment == TEXT_ALIGN_CENTER_BOTH)
    {
        x = SCREEN_WIDTH / 2;
        y = SCREEN_HEIGHT / 2;
    }
    display.drawString(x, y, text);
}

void Screen::drawText(const char *text, int x, int y, uint8_t size)
{
    drawText(text, x, y, size, TEXT_ALIGN_LEFT);
}

void Screen::drawImage(const uint8_t *image, int x, int y, int width, int height)
{
    display.drawXbm(x, y, width, height, image);
}

void Screen::clearScreen()
{
    display.clear();
}

void Screen::draw()
{
    display.display();
}
