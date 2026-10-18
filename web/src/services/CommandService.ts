import {
    Credentials as AWSCredentials,
} from "@aws-sdk/client-cognito-identity";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import Config from "../config/config";
import { queryAllDevices } from "./DeviceQuery";
import { CommandRecord } from "../dto/CommandRecord";

export type CommandProps = {
    creds: AWSCredentials;
};

const getCommandRecords = async (creds: AWSCredentials) => {
    if (!creds) {
        throw new Error("Credentials are required to fetch commadn records.");
    }
    const client = new DynamoDBClient({
        region: Config.aws.region,
        credentials: {
            accessKeyId: creds.AccessKeyId!,
            secretAccessKey: creds.SecretKey!,
            sessionToken: creds.SessionToken,
        },
    });

    let records: CommandRecord[] = [];
    try {
        const items = await queryAllDevices(client, Config.aws.commandTableName);
        items.forEach(item => {
            if (item.deviceId && item.timestamp && item.commandType && item.action) {
                records.push({
                    deviceId: item.deviceId.S!,
                    timestamp: item.timestamp.S!,
                    commandType: item.commandType.S!,
                    action: item.action.S!,
                    ttl: item.ttl ? new Date(Number(item.ttl.N) * 1000).toDateString() : "immortal"
                });
            }
        });
    } catch (err) {
        console.error("DynamoDB query error:", err);
    }

    return records;
}

export { getCommandRecords };