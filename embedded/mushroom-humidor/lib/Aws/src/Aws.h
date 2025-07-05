#ifndef MUSHROOM_AWS_H
#define MUSHROOM_AWS_H

#include "secrets.h"
#include <Bme280.h>
#include <Clock.h>

const unsigned long MQTT_START_TIMEOUT_MILLIS = 20 * 1000;

class Aws
{
public:
    Aws(Clock &clock, Bme280 &bme280);
    int loop();
};

#endif
