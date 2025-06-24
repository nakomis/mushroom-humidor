import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';

export interface LambdaStackProps extends cdk.StackProps {
    commandTable: cdk.aws_dynamodb.ITable;
}

export class LambdaStack extends cdk.Stack {
    readonly thumbmaker: NodejsFunction;
    readonly commandProcessor: NodejsFunction;

    constructor(scope: Construct, id: string, props: LambdaStackProps) {
        super(scope, id, props);
        const thumbmakerLogGroup = new logs.LogGroup(this, 'MushroomThumbMakerLogGroup', {
            logGroupName: '/aws/lambda/MushroomThumbmaker',
            retention: logs.RetentionDays.SIX_MONTHS,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });
        this.thumbmaker = new NodejsFunction(this, 'MushroomThumbMakerFunction', {
            functionName: 'MushroomThumbmaker',
            runtime: cdk.aws_lambda.Runtime.NODEJS_22_X,
            entry: `${__dirname}/../lambda/thumbmaker/src/handler.ts`,
            logGroup: thumbmakerLogGroup,
        });
        
        const commandProcessorLogGroup = new logs.LogGroup(this, 'MushroomCommandProcessorLogGroup', {
            logGroupName: '/aws/lambda/MushroomCommandProcessor',
            retention: logs.RetentionDays.SIX_MONTHS,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });
        this.commandProcessor = new NodejsFunction(this, 'MushroomCommandProcessorFunction', {
            functionName: 'MushroomCommandProcessor',
            runtime: cdk.aws_lambda.Runtime.NODEJS_22_X,
            entry: `${__dirname}/../lambda/command-processor/src/handler.ts`,
            logGroup: commandProcessorLogGroup,
        });

        const iotTopicArn = `arn:aws:iot:${this.region}:${this.account}:topic/MushroomThing/commands`;
        this.commandProcessor.addToRolePolicy(new cdk.aws_iam.PolicyStatement({
            actions: ['iot:Publish'],
            resources: [iotTopicArn],
        }));

        props.commandTable.grant(this.commandProcessor, 'dynamodb:PutItem');
    }
}