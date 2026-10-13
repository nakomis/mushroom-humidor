import {
    Credentials as AWSCredentials,
} from "@aws-sdk/client-cognito-identity";
import { TelemetryRecord } from "../dto/TelemetryRecord";
import { parseMessageType } from "../dto/MessageType";
import { AttributeValue, DynamoDBClient, ScanCommand, ScanCommandOutput } from "@aws-sdk/client-dynamodb";
import Config from "../config/config";

export type TelemetryProps = {
    creds: AWSCredentials;
};

/**
 * Converts a telemetry table item into a TelemetryRecord. Returns undefined for items that are
 * incomplete or are not telemetry readings. Items without a `messageType` (stored before
 * MUSH-22) are treated as telemetry.
 */
const parseTelemetryItem = (item: Record<string, AttributeValue>): TelemetryRecord | undefined => {
    const messageType = parseMessageType(item.messageType?.S);
    if (messageType !== 'telemetry') {
        return undefined;
    }
    if (!(item.deviceId && item.temperature && item.humidity && item.timestamp)) {
        return undefined;
    }
    return {
        messageType,
        deviceId: item.deviceId.S!,
        temperature: item.temperature.S ? item.temperature.S : item.temperature.N!,
        humidity: item.humidity.S ? item.humidity.S : item.humidity.N!,
        timestamp: item.timestamp.S!,
        ttl: item.ttl ? new Date(Number(item.ttl.N) * 1000).toDateString() : "immortal"
    };
}

const getTelemetryRecords = async (creds: AWSCredentials) => {
    if (!creds) {
        throw new Error("Credentials are required to fetch telemetry records.");
    }
    const client = new DynamoDBClient({
        region: Config.aws.region,
        credentials: {
            accessKeyId: creds.AccessKeyId!,
            secretAccessKey: creds.SecretKey!,
            sessionToken: creds.SessionToken,
        },
    });

    const command = new ScanCommand({ TableName: Config.aws.telemetryTableName });
    let records: TelemetryRecord[] = [];
    try {
        const result: ScanCommandOutput = await client.send(command);
        result.Items?.forEach(item => {
            const record = parseTelemetryItem(item);
            if (record) {
                records.push(record);
            }
        });
    } catch (err) {
        console.error("DynamoDB scan error:", err);
    }

    return records;
}

export { getTelemetryRecords, parseTelemetryItem };