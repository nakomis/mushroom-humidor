import { AttributeValue, DynamoDBClient, QueryCommand, QueryCommandOutput } from "@aws-sdk/client-dynamodb";
import Config from "../config/config";

export const DEFAULT_DEVICE_IDS = ["d1"];

// Upper bound on items read per device per load. Reading is newest first, so the cap keeps the
// most recent items and stops a long-lived table (~182 days of readings) being pulled in full.
export const MAX_ITEMS_PER_DEVICE = 2000;

const getDeviceIds = (): string[] => Config.aws.deviceIds ?? DEFAULT_DEVICE_IDS;

/**
 * Reads items for one device, newest first, following LastEvaluatedKey until all pages have been
 * read or MAX_ITEMS_PER_DEVICE is reached.
 */
const queryDevice = async (client: DynamoDBClient, tableName: string, deviceId: string) => {
    const items: Record<string, AttributeValue>[] = [];
    let exclusiveStartKey: Record<string, AttributeValue> | undefined;
    do {
        const result: QueryCommandOutput = await client.send(new QueryCommand({
            TableName: tableName,
            KeyConditionExpression: "deviceId = :d",
            ExpressionAttributeValues: { ":d": { S: deviceId } },
            ScanIndexForward: false,
            ExclusiveStartKey: exclusiveStartKey,
        }));
        items.push(...(result.Items ?? []));
        exclusiveStartKey = result.LastEvaluatedKey;
    } while (exclusiveStartKey && items.length < MAX_ITEMS_PER_DEVICE);
    return items.slice(0, MAX_ITEMS_PER_DEVICE);
}

/**
 * Queries a deviceId/timestamp keyed table for each configured device and merges the results,
 * newest first.
 */
const queryAllDevices = async (client: DynamoDBClient, tableName: string, deviceIds: string[] = getDeviceIds()) => {
    const perDevice = await Promise.all(deviceIds.map(deviceId => queryDevice(client, tableName, deviceId)));
    return perDevice.flat().sort((a, b) => (b.timestamp?.S ?? "").localeCompare(a.timestamp?.S ?? ""));
}

export { getDeviceIds, queryAllDevices };
