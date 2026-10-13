import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Template } from 'aws-cdk-lib/assertions';
import { DEFAULT_MESSAGE_TYPE, IoTStack, MESSAGE_TYPES, TELEMETRY_RULE_SQL } from '../lib/iot-stack';

// ThingWithCert bundles its custom resource Lambda with esbuild or Docker, neither of which
// the unit tests need; replace it with an empty construct.
jest.mock('cdk-iot-core-certificates-v3', () => {
    const { Construct } = jest.requireActual('constructs');
    return {
        ThingWithCert: class extends Construct {
            thingArn = 'arn:aws:iot:eu-west-2:123456789012:thing/MushroomThing';
            certId = 'cert-id';
            certPem = 'cert-pem';
            privKey = 'priv-key';
        },
    };
});

describe('IoTStack', () => {
    const synth = () => {
        const app = new cdk.App();
        const tableStack = new cdk.Stack(app, 'TableStack');
        const table = dynamodb.TableV2.fromTableName(tableStack, 'Table', 'MushroomTelemetry');
        const stack = new IoTStack(app, 'TestIoTStack', { table });
        return Template.fromStack(stack);
    };

    test('defines telemetry as the only message type and the default', () => {
        expect(MESSAGE_TYPES).toEqual(['telemetry']);
        expect(DEFAULT_MESSAGE_TYPE).toBe('telemetry');
    });

    test('telemetry rule stores messageType, defaulting old messages to telemetry', () => {
        expect(TELEMETRY_RULE_SQL).toContain("'telemetry' AS messageType");
        expect(TELEMETRY_RULE_SQL).toContain("FROM 'MushroomThing/telemetry'");
        expect(TELEMETRY_RULE_SQL).toContain("WHERE isUndefined(messageType) OR messageType = 'telemetry'");
        expect(TELEMETRY_RULE_SQL).toContain('AS ttl');
    });

    test('topic rule uses the telemetry SQL and writes to DynamoDB', () => {
        synth().hasResourceProperties('AWS::IoT::TopicRule', {
            TopicRulePayload: {
                Sql: TELEMETRY_RULE_SQL,
                RuleDisabled: false,
                Actions: [
                    {
                        DynamoDBv2: {
                            PutItem: { TableName: 'MushroomTelemetry' },
                        },
                    },
                ],
            },
        });
    });
});
