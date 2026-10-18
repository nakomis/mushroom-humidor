import * as cdk from 'aws-cdk-lib';
import * as cm from 'aws-cdk-lib/aws-certificatemanager';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { CognitoStack, DATABASE_READ_ACTIONS } from '../lib/cognito-stack';

describe('CognitoStack', () => {
    const synth = () => {
        const app = new cdk.App();
        const env = { account: '123456789012', region: 'eu-west-2' };
        const tableStack = new cdk.Stack(app, 'TableStack', { env });
        const telemetryDatabase = dynamodb.TableV2.fromTableName(tableStack, 'Telemetry', 'MushroomTelemetry');
        const commandDatabase = dynamodb.TableV2.fromTableName(tableStack, 'Commands', 'MushroomCommands');
        const authCertificateArn = cm.Certificate.fromCertificateArn(tableStack, 'Cert',
            'arn:aws:acm:us-east-1:123456789012:certificate/test') as cm.Certificate;
        const stack = new CognitoStack(app, 'TestCognitoStack', {
            env,
            rootDomain: 'example.com',
            authDomainName: 'auth.mushrooms.example.com',
            domainName: 'mushrooms.example.com',
            authCertificateArn,
            telemetryDatabase,
            commandDatabase,
        });
        return Template.fromStack(stack);
    };

    const dynamoActions = (template: Template): string[] => {
        const policies = template.findResources('AWS::IAM::Policy');
        return Object.values(policies).flatMap((policy: any) =>
            policy.Properties.PolicyDocument.Statement.flatMap((statement: any) =>
                [statement.Action].flat().filter((action: string) => action.startsWith('dynamodb:'))));
    };

    test('database read role cannot Scan', () => {
        const actions = dynamoActions(synth());
        expect(actions.length).toBeGreaterThan(0);
        expect(actions).not.toContain('dynamodb:Scan');
        expect(actions).not.toContain('dynamodb:*');
    });

    test('database read role gets only the explicit read actions', () => {
        expect(new Set(dynamoActions(synth()))).toEqual(new Set(DATABASE_READ_ACTIONS));
    });

    test('both tables are granted the read actions', () => {
        synth().hasResourceProperties('AWS::IAM::Policy', {
            PolicyDocument: {
                Statement: Match.arrayWith([
                    Match.objectLike({ Action: DATABASE_READ_ACTIONS, Effect: 'Allow' }),
                ]),
            },
        });
        const statements = Object.values(synth().findResources('AWS::IAM::Policy'))
            .flatMap((policy: any) => policy.Properties.PolicyDocument.Statement);
        const resources = JSON.stringify(statements.map((statement: any) => statement.Resource));
        expect(resources).toContain('table/MushroomTelemetry');
        expect(resources).toContain('table/MushroomCommands');
    });
});
