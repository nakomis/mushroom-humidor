#ifndef MUSHROOM_CLOCK_H
#define MUSHROOM_CLOCK_H


class Clock
{
public:
    Clock();
    int sync();

private:
    void printLocalTime();
};

#endif

