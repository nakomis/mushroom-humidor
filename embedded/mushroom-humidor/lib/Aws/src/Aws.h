#ifndef MUSHROOM_AWS_H
#define MUSHROOM_AWS_H

#include "secrets.h"
#include <Bme280.h>
#include <Clock.h>

class Aws
{
public:
    Aws(Clock &clock, Bme280 &bme280);
    int loop();
};

#endif
