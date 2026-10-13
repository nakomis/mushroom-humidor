// config.json is generated per environment by deployscripts/set-config.sh and is git-ignored
jest.mock('../config/config', () => ({ __esModule: true, default: { aws: {} } }));

import { parseTelemetryItem } from './TelemetryService';
import { DEFAULT_MESSAGE_TYPE, parseMessageType } from '../dto/MessageType';

describe('parseMessageType', () => {
    it('defaults a missing messageType to telemetry', () => {
        expect(parseMessageType(undefined)).toBe(DEFAULT_MESSAGE_TYPE);
        expect(parseMessageType('')).toBe('telemetry');
    });

    it('accepts known message types', () => {
        expect(parseMessageType('telemetry')).toBe('telemetry');
    });

    it('returns undefined for unknown message types', () => {
        expect(parseMessageType('alert')).toBeUndefined();
    });
});

describe('parseTelemetryItem', () => {
    const item = {
        deviceId: { S: 'd1' },
        timestamp: { S: '2026-10-13T12:00:00Z' },
        humidity: { N: '85.5' },
        temperature: { N: '21.25' },
        ttl: { N: '1800000000' },
    };

    it('parses a telemetry item with messageType', () => {
        expect(parseTelemetryItem({ ...item, messageType: { S: 'telemetry' } })).toEqual({
            messageType: 'telemetry',
            deviceId: 'd1',
            timestamp: '2026-10-13T12:00:00Z',
            humidity: '85.5',
            temperature: '21.25',
            ttl: new Date(1800000000 * 1000).toDateString(),
        });
    });

    it('treats an item without messageType as telemetry', () => {
        expect(parseTelemetryItem(item)?.messageType).toBe('telemetry');
    });

    it('skips items of other message types', () => {
        expect(parseTelemetryItem({ ...item, messageType: { S: 'status' } })).toBeUndefined();
    });

    it('skips incomplete items', () => {
        const { humidity, ...incomplete } = item;
        expect(parseTelemetryItem(incomplete)).toBeUndefined();
    });

    it('marks items without a ttl as immortal', () => {
        const { ttl, ...noTtl } = item;
        expect(parseTelemetryItem(noTtl)?.ttl).toBe('immortal');
    });
});
