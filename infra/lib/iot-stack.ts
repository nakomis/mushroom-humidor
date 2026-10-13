import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { ThingWithCert } from 'cdk-iot-core-certificates-v3';
import * as iot from 'aws-cdk-lib/aws-iot';
import * as iam from 'aws-cdk-lib/aws-iam';



/**
 * Values of the `messageType` field that the device firmware puts on every message it
 * publishes (see embedded/mushroom-humidor/lib/Aws/src/Aws.h).
 *
 * - telemetry: periodic BME280 reading (humidity, temperature) on `MushroomThing/telemetry`
 */
export const MESSAGE_TYPES = ['telemetry'] as const;
export type MessageType = typeof MESSAGE_TYPES[number];

/**
 * Messages published before MUSH-22 carry no `messageType`; they were all telemetry readings.
 */
export const DEFAULT_MESSAGE_TYPE: MessageType = 'telemetry';

/**
 * Stores telemetry readings in the telemetry table. Only messages whose `messageType` is
 * `telemetry`, or which lack one (older firmware), are stored, so any other kind published
 * to this topic is not mistaken for a reading. The stored item always has `messageType` set,
 * defaulting to `telemetry` for messages that lack it.
 */
export const TELEMETRY_RULE_SQL =
    `SELECT *, '${DEFAULT_MESSAGE_TYPE}' AS messageType, (timestamp() / 1000) + ((525600 / 2) * 60) AS ttl ` +
    `FROM 'MushroomThing/telemetry' ` +
    `WHERE isUndefined(messageType) OR messageType = '${DEFAULT_MESSAGE_TYPE}'`;

export interface IoTStackProps extends cdk.StackProps {
    table: dynamodb.ITable;
}

export class IoTStack extends cdk.Stack {

    private readonly prod = process.env.NPM_ENVIRONMENT == "prod";

    constructor(scope: Construct, id: string, props: IoTStackProps) {
        super(scope, id, props);

        const { thingArn, certId, certPem, privKey } = new ThingWithCert(this, 'MyThing', {
            thingName: 'MushroomThing',
            saveToParamStore: true,
            paramPrefix: 'Mushroom',
        });

        const tableRole = new iam.Role(this, 'IoTRuleDynamoDBRole', {
            assumedBy: new iam.ServicePrincipal('iot.amazonaws.com'),
        });
        props.table.grantWriteData(tableRole);

        // IoT Rule: send telemetry readings from this device to DynamoDB
        new iot.CfnTopicRule(this, 'MushroomThingToDynamoDB', {
            topicRulePayload: {
                sql: TELEMETRY_RULE_SQL,
                actions: [
                    {
                        dynamoDBv2: {
                            putItem: {
                                tableName: props.table.tableName,
                            },
                            roleArn: tableRole.roleArn,
                        }
                    }
                ],
                ruleDisabled: false,
            }
        });


    }

}