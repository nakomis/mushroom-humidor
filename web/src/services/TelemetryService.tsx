import {
    Credentials as AWSCredentials,
} from "@aws-sdk/client-cognito-identity";
import { TelemetryRecord } from "../dto/TelemetryRecord";
import { DynamoDBClient, ScanCommand, ScanCommandOutput } from "@aws-sdk/client-dynamodb";
import Config from "../config/config";

export type TelemetryProps = {
    creds: AWSCredentials;
};

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
            if (item.deviceId && item.temperature && item.humidity && item.timestamp) {
                records.push({
                    deviceId: item.deviceId.S!,
                    temperature: item.temperature.S ? item.temperature.S : item.temperature.N!,
                    humidity: item.humidity.S ? item.humidity.S : item.humidity.N!,
                    timestamp: item.timestamp.S!,
                    ttl: item.ttl ? new Date(Number(item.ttl.N) * 1000).toDateString() : "immortal"
                });
            }
        });
    } catch (err) {
        console.error("DynamoDB scan error:", err);
    }

    return records;
}

export { getTelemetryRecords };