import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { ThingWithCert } from 'cdk-iot-core-certificates-v3';
import * as iot from 'aws-cdk-lib/aws-iot';
import * as iam from 'aws-cdk-lib/aws-iam';



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

        // IoT Rule: send all messages from this device to DynamoDB
        new iot.CfnTopicRule(this, 'MushroomThingToDynamoDB', {
            topicRulePayload: {
                sql: `SELECT *, (timestamp() / 1000) + ((525600 / 2) * 60) AS ttl FROM 'MushroomThing/telemetry'`, 
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