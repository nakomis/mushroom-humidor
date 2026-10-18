// config.json is generated per environment by deployscripts/set-config.sh and is git-ignored
jest.mock('../config/config', () => ({ __esModule: true, default: { aws: {} } }));

import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { getDeviceIds, queryAllDevices } from './DeviceQuery';

const item = (deviceId: string, timestamp: string) => ({ deviceId: { S: deviceId }, timestamp: { S: timestamp } });

describe('getDeviceIds', () => {
    it('defaults to d1 when deviceIds is not configured', () => {
        expect(getDeviceIds()).toEqual(['d1']);
    });
});

describe('queryAllDevices', () => {
    it('queries each device newest first, follows LastEvaluatedKey and merges newest first', async () => {
        const pages: Record<string, any[]> = {
            d1: [
                { Items: [item('d1', '2026-10-03')], LastEvaluatedKey: { deviceId: { S: 'd1' }, timestamp: { S: '2026-10-03' } } },
                { Items: [item('d1', '2026-10-01')] },
            ],
            d2: [{ Items: [item('d2', '2026-10-02')] }],
        };
        const send = jest.fn(async (command: QueryCommand) => pages[command.input.ExpressionAttributeValues![':d'].S!].shift());
        const client = { send } as unknown as DynamoDBClient;

        const items = await queryAllDevices(client, 'MushroomTelemetry', ['d1', 'd2']);

        expect(items.map(i => i.timestamp.S)).toEqual(['2026-10-03', '2026-10-02', '2026-10-01']);
        expect(send).toHaveBeenCalledTimes(3);
        send.mock.calls.forEach(([command]) => {
            expect(command).toBeInstanceOf(QueryCommand);
            expect(command.input).toMatchObject({
                TableName: 'MushroomTelemetry',
                KeyConditionExpression: 'deviceId = :d',
                ScanIndexForward: false,
            });
        });
        const startKeys = send.mock.calls.map(([command]) => command.input.ExclusiveStartKey).filter(Boolean);
        expect(startKeys).toEqual([{ deviceId: { S: 'd1' }, timestamp: { S: '2026-10-03' } }]);
    });
});

describe('queryAllDevices cap', () => {
    it('stops paginating once MAX_ITEMS_PER_DEVICE items are read, keeping the newest', async () => {
        const { MAX_ITEMS_PER_DEVICE } = jest.requireActual('./DeviceQuery');
        const page = (start: number) => ({
            Items: Array.from({ length: MAX_ITEMS_PER_DEVICE / 2 + 1 }, (_, i) => item('d1', String(start - i).padStart(8, '0'))),
            LastEvaluatedKey: { deviceId: { S: 'd1' } },
        });
        const send = jest.fn()
            .mockResolvedValueOnce(page(99999999))
            .mockResolvedValueOnce(page(99998000))
            .mockResolvedValue(page(1));
        const items = await queryAllDevices({ send } as unknown as DynamoDBClient, 'T', ['d1']);
        expect(send).toHaveBeenCalledTimes(2);
        expect(items).toHaveLength(MAX_ITEMS_PER_DEVICE);
    });
});
