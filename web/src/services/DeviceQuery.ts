import { AttributeValue, DynamoDBClient, QueryCommand, QueryCommandOutput } from "@aws-sdk/client-dynamodb";
import Config from "../config/config";

export const DEFAULT_DEVICE_IDS = ["d1"];

const getDeviceIds = (): string[] => Config.aws.deviceIds ?? DEFAULT_DEVICE_IDS;

/**
 * Reads every item for one device, newest first, following LastEvaluatedKey until all pages
 * have been read.
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
    } while (exclusiveStartKey);
    return items;
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
