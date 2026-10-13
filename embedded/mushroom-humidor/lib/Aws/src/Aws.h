#ifndef MUSHROOM_AWS_H
#define MUSHROOM_AWS_H

#include "secrets.h"
#include "Bme280.h"
#include "Clock.h"

// Every message the device publishes carries a `messageType` field so consumers can tell
// message kinds apart without inferring them from the payload shape. Keep this list in
// step with infra/lib/iot-stack.ts and web/src/dto/MessageType.tsx.
//
// - telemetry: periodic BME280 reading (humidity, temperature) on AWS_IOT_TOPIC_TELEMETRY
static const char MESSAGE_TYPE_TELEMETRY[] = "telemetry";

class Aws
{
public:
    Aws(Clock &clock, Bme280 &bme280);
    int loop();
};

#endif
