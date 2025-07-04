

// #include <Wire.h>
// #include <Arduino.h>
// #include <pins.h>

// // scans devices from 50 to 800KHz I2C speeds.
// // lower than 50 is not possible
// // DS3231 RTC works on 800 KHz. TWBR = 2; (?)
// long speed[] = {
//     50, 100, 200, 250, 400, 500, 800};
// const int speeds = sizeof(speed) / sizeof(speed[0]);

// // DELAY BETWEEN TESTS
// #define RESTORE_LATENCY 5 // for delay between tests of found devices.
// bool delayFlag = false;

// // MINIMIZE OUTPUT
// bool printAll = true;
// bool header = true;

// // STATE MACHINE
// enum states
// {
//     STOP,
//     ONCE,
//     CONT,
//     HELP
// };
// states state = STOP;

// uint32_t startScan;
// uint32_t stopScan;

// char getCommand()
// {
//     char c = '\0';
//     if (Serial.available())
//     {
//         c = Serial.read();
//     }
//     return c;
// }

// void displayHelp()
// {
//     Serial.println(F("\nArduino I2C Scanner - 0.1.03\n"));
//     Serial.println(F("\ts = single scan"));
//     Serial.println(F("\tc = continuous scan - 1 second delay"));
//     Serial.println(F("\tq = quit continuous scan"));
//     Serial.println(F("\td = toggle latency delay between successful tests."));
//     Serial.println(F("\tp = toggle printAll - printFound."));
//     Serial.println(F("\th = toggle header - noHeader."));
//     Serial.println(F("\t? = help - this page"));
//     Serial.println();
// }


// void I2Cscan()
// {
//     startScan = millis();
//     uint8_t count = 0;

//     if (header)
//     {
//         Serial.print(F("TIME\tDEC\tHEX\t"));
//         for (uint8_t s = 0; s < speeds; s++)
//         {
//             Serial.print(F("\t"));
//             Serial.print(speed[s]);
//         }
//         Serial.println(F("\t[KHz]"));
//         for (uint8_t s = 0; s < speeds + 5; s++)
//         {
//             Serial.print(F("--------"));
//         }
//         Serial.println();
//     }

//     // TEST
//     // 0.1.04: tests only address range 8..120
//     // --------------------------------------------
//     // Address	R/W Bit	Description
//     // 0000 000   0	General call address
//     // 0000 000   1	START byte
//     // 0000 001   X	CBUS address
//     // 0000 010   X	reserved - different bus format
//     // 0000 011   X	reserved - future purposes
//     // 0000 1XX   X	High Speed master code
//     // 1111 1XX   X	reserved - future purposes
//     // 1111 0XX   X	10-bit slave addressing
//     for (uint8_t address = 8; address < 120; address++)
//     {
//         bool printLine = printAll;
//         bool found[speeds];
//         bool fnd = false;

//         for (uint8_t s = 0; s < speeds; s++)
//         {
//             // TWBR = (F_CPU / (speed[s] * 1000) - 16) / 2;
//             Wire.beginTransmission(address);
//             found[s] = (Wire.endTransmission() == 0);
//             fnd |= found[s];
//             // give device 5 millis
//             if (fnd && delayFlag)
//                 delay(RESTORE_LATENCY);
//         }

//         if (fnd)
//             count++;
//         printLine |= fnd;

//         if (printLine)
//         {
//             Serial.print(millis());
//             Serial.print(F("\t"));
//             Serial.print(address, DEC);
//             Serial.print(F("\t0x"));
//             Serial.print(address, HEX);
//             Serial.print(F("\t"));

//             for (uint8_t s = 0; s < speeds; s++)
//             {
//                 Serial.print(F("\t"));
//                 Serial.print(found[s] ? F("V") : F("."));
//             }
//             Serial.println();
//         }
//     }

//     stopScan = millis();
//     if (header)
//     {
//         Serial.println();
//         Serial.print(count);
//         Serial.print(F(" devices found in "));
//         Serial.print(stopScan - startScan);
//         Serial.println(F(" milliseconds."));
//     }
// }

// void setup()
// {
//     Serial.begin(115200);
//     delay(5000);
//     bool x = Wire.begin(5 , 4);
//     if (!x)
//     {
//         Serial.println(F("I2C bus initialization failed!"));
//         Serial.println(F("Check your wiring and try again."));
//     }
//     else
//     {
//         Serial.println(F("I2C bus initialized successfully."));
//     }   
//     displayHelp();
// }

// void loop()
// {
//     switch (getCommand())
//     {
//     case 's':
//         state = ONCE;
//         break;
//     case 'c':
//         state = CONT;
//         break;
//     case 'd':
//         delayFlag = !delayFlag;
//         Serial.print(F("<delay="));
//         Serial.println(delayFlag ? F("5>") : F("0>"));
//         break;
//     case 'e':
//         // eeprom test TODO
//         break;
//     case 'h':
//         header = !header;
//         Serial.print(F("<header="));
//         Serial.println(header ? F("yes>") : F("no>"));
//         break;
//     case '?':
//         state = HELP;
//         break;
//     case 'p':
//         printAll = !printAll;
//         Serial.print(F("<print="));
//         Serial.println(printAll ? F("all>") : F("found>"));
//         break;
//     case 'q':
//         state = HELP;
//         break;
//     default:
//         break;
//     }

//     switch (state)
//     {
//     case ONCE:
//         I2Cscan();
//         state = HELP;
//         break;
//     case CONT:
//         I2Cscan();
//         delay(1000);
//         break;
//     case HELP:
//         displayHelp();
//         state = STOP;
//         break;
//     case STOP:
//         break;
//     default: // ignore all non commands
//         break;
//     }
// }

#include <Arduino.h>
#include <Aws.h>
#include <WifiConnect.h>
#include <Clock.h>
#include <Screen.h>
#include <pins.h>
#include <Bmp280.h>

WifiConnect wifiConnect;
Aws aws;
Clock esp32Clock;
Screen screen;
Bmp280 bmp280; // Assuming Bmp280 is a class that handles the BMP280 sensor
long lastPinMillis = 0;
uint8_t lastPinValue = HIGH;

void setup()
{
    Serial.begin(115200);
    // Wait for the serial port to become available
    delay(5000);

    Serial.println("\n\n");
    Serial.println("======================");
    Serial.println("=== Starting Setup ===");
    Serial.println("======================\n");
    pinMode(MISTER_PIN, OUTPUT);
}

void loop()
{
    Serial.println("Looping...");
    if (wifiConnect.connect() != 0)
    {
        Serial.println("Failed to connect to Wi-Fi.");
        delay(5000);
        return;
    }

    Serial.println("Connected to AWS..");
    if (aws.connect() != 0)
    {
        Serial.println("Failed to connect to AWS.");
        delay(5000);
        return;
    }

    // Serial.println("Clocking...");
    // esp32Clock.sync();
    // tm currentTime = esp32Clock.getTime();
    // char* localTime = esp32Clock.getTimeChar();

    Serial.println("BMPing...");
    bmp280.sync(); // Synchronize the BMP280 sensor
    Serial.println("BMP280 synchronized.");

    float temp = bmp280.getTemperature();
    static char buff[5];
    snprintf(buff, (sizeof(buff) - 1), "%1$'0.4f", temp);
    Serial.print("Temperature: ");
    Serial.println(buff);
    /*
    static char buff[64];
    snprintf(buff, (sizeof(buff) - 1), "%1$'0.4d-%2$'0.2d-%3$'0.2dT%4$'0.2d:%5$'0.2d:%6$'0.2dZ", myRTC.getYear() + 2000, myRTC.getMonth(century),
             myRTC.getDate(), myRTC.getHour(h12Flag, pmFlag), myRTC.getMinute(), myRTC.getSecond());
    */

    // Serial.println("Drawing");
    // screen.loop(); // Run the screen loop to handle display updates
    // screen.drawText("20.5° C", 5, 0, 2); // Draw text on the screen
    // screen.drawText(localTime, 5, 30, 2); // Draw text on the screen

    // long millisNow = millis();
    // if ((millisNow - lastPinMillis) >= 1000 * 5) // Every 5 seconds
    // {
    //     if (lastPinValue == HIGH)
    //     {
    //         digitalWrite(MISTER_PIN, LOW); // Turn the pin LOW
    //         Serial.println("Pin 18 set to LOW");
    //         lastPinValue = LOW;
    //     }
    //     else
    //     {
    //         digitalWrite(MISTER_PIN, HIGH); // Turn the pin HIGH
    //         Serial.println("Pin 18 set to HIGH");
    //         lastPinValue = HIGH;
    //     }
    //     lastPinMillis = millisNow;
    // } else {
    //     Serial.println("Waiting for 5 seconds before toggling pin 18 again.");
    // }

    // Add a delay before the next loop iteration
    delay(500);
}
