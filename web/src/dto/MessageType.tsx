/**
 * Values of the `messageType` field that the device firmware puts on every message it
 * publishes (see embedded/mushroom-humidor/lib/Aws/src/Aws.h and infra/lib/iot-stack.ts).
 *
 * - telemetry: periodic BME280 reading (humidity, temperature)
 */
export const MESSAGE_TYPES = ['telemetry'] as const;
export type MessageType = typeof MESSAGE_TYPES[number];

/**
 * Records stored before MUSH-22 carry no `messageType`; they were all telemetry readings.
 */
export const DEFAULT_MESSAGE_TYPE: MessageType = 'telemetry';

/**
 * Returns the message type of a stored record, treating a missing value as the default.
 * Unrecognised values (from newer firmware) are returned as `undefined`.
 */
export const parseMessageType = (value: string | undefined): MessageType | undefined => {
    if (value === undefined || value === '') {
        return DEFAULT_MESSAGE_TYPE;
    }
    return (MESSAGE_TYPES as readonly string[]).includes(value) ? value as MessageType : undefined;
};
