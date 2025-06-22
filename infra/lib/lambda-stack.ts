import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';

export interface LambdaStackProps extends cdk.StackProps {

}

export class LambdaStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: LambdaStackProps) {
        super(scope, id, props);
        const logGroup = new logs.LogGroup(this, 'MyFunctionLogGroup', {
            logGroupName: '/aws/lambda/MushroomThumbmaker',
            retention: logs.RetentionDays.SIX_MONTHS,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });
        const mushroomFunction = new NodejsFunction(this, 'function', {
            functionName: 'MushroomThumbmaker',
            entry: `${__dirname}/../lambda/thumbmaker/src/handler.ts`,
            logGroup: logGroup
        });
    }
}