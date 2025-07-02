#include "Screen.h"
#include <SPI.h>
#include <Wire.h>
#include <pins.h>
#include "SSD1306Wire.h"

#define SCREEN_WIDTH 128 // OLED display width, in pixels
#define SCREEN_HEIGHT 64 // OLED display height, in pixels

#define OLED_RESET -1       // Reset pin # (or -1 if sharing Arduino reset pin)
#define SCREEN_ADDRESS 0x3C ///< See datasheet for Address; 0x3D for 128x64, 0x3C for 128x32
SSD1306Wire display(SCREEN_ADDRESS, I2C_SDA, I2C_SCL);

#define NUMFLAKES 10 // Number of snowflakes in the animation example
#define LOGO_HEIGHT 16
#define LOGO_WIDTH 16

bool initialized = false;

const uint8_t mushroom_bmp_16[] PROGMEM =
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
        0xC0, 0x03, 
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
    // display.drawIco16x16(15, 15, mushroom_bmp);
    display.setFont(ArialMT_Plain_24);
    display.setTextAlignment(TEXT_ALIGN_LEFT);
    display.drawString(x, y, text);
    display.drawXbm(SCREEN_WIDTH - (16 + 5), 5, 16, 16, mushroom_bmp_16);
    display.display();
}
