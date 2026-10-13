import { MessageType } from "./MessageType";

export type TelemetryRecord = {
    messageType: MessageType;
    deviceId: string;
    temperature: string;
    humidity: string;
    timestamp: string;
    ttl: string;
};
