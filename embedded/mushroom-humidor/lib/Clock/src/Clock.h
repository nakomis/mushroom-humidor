#ifndef MUSHROOM_CLOCK_H
#define MUSHROOM_CLOCK_H

#include <ctime>

class Clock
{
public:
    Clock();
    int sync();
    struct tm getTime();

private:
    void printLocalTime();
};

#endif

