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

const uint8_t mushroom_ico16x16_bmp[] PROGMEM =
    {
        0xF0, 0x0F,
        0xFC, 0x3E,
        0xCE, 0x7C,
        0x8E, 0x7F,
        0xDF, 0xFF,
        0xFF, 0x9D,
        0xF3, 0xB8,
        0xFB, 0xFD,
        0xFF, 0xFF,
        0x20, 0x04,
        0x20, 0x04,
        0x20, 0x04,
        0x20, 0x04,
        0x20, 0x04,
        0x60, 0x06,
        0xC0, 0x03
    };

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

void Screen::drawText(const char *text, int x, int y, uint8_t size)
{
    display.setFont(ArialMT_Plain_24);
    display.setTextAlignment(TEXT_ALIGN_LEFT);
    display.drawString(x, y, text);
    display.display();
}

void Screen::drawImage(const uint8_t *image, int x, int y, int width, int height)
{
    display.drawXbm(x, y, width, height, image);
    display.display();
}
