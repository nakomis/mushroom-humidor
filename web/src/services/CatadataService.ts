import {
    Credentials as AWSCredentials,
} from "@aws-sdk/client-cognito-identity";
import Config from "../config/config";
import { ConditionalCheckFailedException, DynamoDBClient, ScanCommand, ScanCommandOutput } from "@aws-sdk/client-dynamodb";
import { CatadataRecord } from "../dto/CatadataRecord";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import {
  GetObjectCommand,
  NoSuchKey,
  S3Client,
  S3ServiceException,
} from "@aws-sdk/client-s3";

export type CatadataProps = {
    creds: AWSCredentials;
}

const getCatPicture = async (creds: AWSCredentials, record: CatadataRecord): Promise<ReadableStream> => {
    const s3Client = new S3Client({
        region: Config.aws.region,
        credentials: {
            accessKeyId: creds.AccessKeyId!,
            secretAccessKey: creds.SecretKey!,
            sessionToken: creds.SessionToken!,
        },
    });
    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: "bootbootstraining",
        Key: record.imageName,
      }),
    );
    
    return response.Body as ReadableStream;
}

const getCatadataRecords = async (creds: AWSCredentials): Promise<CatadataRecord[]> => {
    if (!creds) {
        throw new Error("Credentials are required to fetch catadata records.");
    }
    const client = new DynamoDBClient({
        region: Config.aws.region,
        credentials: {
            accessKeyId: creds.AccessKeyId!,
            secretAccessKey: creds.SecretKey!,
            sessionToken: creds.SessionToken,
        },
    });

    const command = new ScanCommand({
        FilterExpression: "attribute_not_exists(#user)",
        TableName: "catadata",
        ExpressionAttributeNames: {
            "#user": "user"
        }
    });
    let records: CatadataRecord[] = [];
    try {
        var result: ScanCommandOutput = await client.send(command);
        result.Items?.forEach(item => {
            if (item.imageName && item.uuid) {
                records.push({
                    imageName: item.imageName.S!,
                    uuid: item.uuid.S!,
                    user: item.user?.S,
                    cat: item.cat?.S,
                    reviewedAt: item.reviewedAt?.S,
                });
            }
        });
        while (result.LastEvaluatedKey) {
            command.input.ExclusiveStartKey = result.LastEvaluatedKey;
            const nextResult: ScanCommandOutput = await client.send(command);
            nextResult.Items?.forEach(item => {
                if (item.imageName && item.uuid) {
                    records.push({
                        imageName: item.imageName.S!,
                        uuid: item.uuid.S!,
                        user: item.user?.S,
                        cat: item.cat?.S,
                        reviewedAt: item.reviewedAt?.S,
                    });
                }
            });
            result = nextResult;
        }
    } catch (err) {
        console.error("DynamoDB scan error:", err);
    }

    return records;
}

const claimRecord = async (records: CatadataRecord[], creds: AWSCredentials, user: string): Promise<CatadataRecord | null> => {
    if (!creds) {
        throw new Error("Credentials are required to claim a record.");
    }
    const client = new DynamoDBClient({
        region: Config.aws.region,
        credentials: {
            accessKeyId: creds.AccessKeyId!,
            secretAccessKey: creds.SecretKey!,
            sessionToken: creds.SessionToken,
        },
    });

    var recordToClaim: CatadataRecord | null = null;;

    while (!recordToClaim) {
        var testRecord = records.pop();
        if (!testRecord) {
            break;
        }

        const command = new UpdateCommand({
            TableName: "catadata",
            Key: {
                imageName: testRecord.imageName,
                uuid: testRecord.uuid,
            },
            UpdateExpression: "SET #user = :user, #claimedAt = :claimedAt",
            ConditionExpression: "attribute_not_exists(#user)",
            ExpressionAttributeNames: {
                "#user": "user",
                "#claimedAt": "claimedAt",
            },
            ExpressionAttributeValues: {
                ":user": { S: user },
                ":claimedAt": { S: new Date().toISOString() },
            },
            ReturnValues: "ALL_NEW",
        });

        try {
            await client.send(command);
        } catch (err) {
            if (err instanceof ConditionalCheckFailedException) {
                continue;
            }
            console.error("Error claiming record:", err);
            throw err;
        }

        recordToClaim = testRecord;
    }

    return recordToClaim;
};
export { getCatadataRecords, getCatPicture, claimRecord };