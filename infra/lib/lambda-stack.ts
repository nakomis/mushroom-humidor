import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';

export interface LambdaStackProps extends cdk.StackProps {

}

export class LambdaStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: LambdaStackProps) {
        super(scope, id, props);
        const helloFunction = new NodejsFunction(this, 'function', {
            functionName: 'MushroomThumbmaker',
            entry: `${__dirname}/../lambda/thumbmaker/src/handler.ts`,
        });
        new LambdaRestApi(this, 'apigw', {
            handler: helloFunction,
        });
    }
}