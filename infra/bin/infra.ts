#!/usr/local/opt/node/bin/node
import * as cdk from 'aws-cdk-lib';
import { MushroomError } from '../lib/mushroom-error';
import { CloudfrontStack } from '../lib/cloudfront-stack';
import { CertificateStack } from '../lib/certificate-stack';
import { LambdaStack } from '../lib/lambda-stack';
import { DynamodbStack } from '../lib/dynamodb-stack';
import { IoTStack } from '../lib/iot-stack';
import { CognitoStack } from '../lib/cognito-stack';
import { ApiGatewayStack } from '../lib/api-gateway-stack';

const londonEnv = { env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION } };
const nvirginiaEnv = { env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'us-east-1' } };
const environmentSubdomain = process.env.NPM_ENVIRONMENT == "prod" ? "" : "sandbox.";
const rootDomain = `${environmentSubdomain}nakomis.com`;
const domainName = `mushrooms.${environmentSubdomain}nakomis.com`
const apiDomain = `api.${domainName}`;
const authDomain = `auth.${domainName}`;

if (process.env.NPM_ENVIRONMENT) {
    console.log("Deploying to " + process.env.NPM_ENVIRONMENT);
} else {
    throw new MushroomError({ name: "ENV_NOT_SET_ERROR", message: "Please use `npm run deploy-prod` or `npm run deploy-sandbox`" })
}

const app = new cdk.App();
const certificateStack = new CertificateStack(app, 'MushroomCertificateStack', {
    ...nvirginiaEnv,
    domainName: domainName,
    rootDomain: rootDomain,
    authDomain: authDomain,
    apiDomain: apiDomain,
});
const cloudfrontStack = new CloudfrontStack(app, 'MushroomCloudfrontStack', {
    ...londonEnv,
    certificate: certificateStack.certificate,
    domainName: domainName,
    rootDomain: rootDomain,
    crossRegionReferences: true
});
const dynamodbStack = new DynamodbStack(app, 'MushroomDynamodbStack', {
    ...londonEnv
});
const lambdaStack = new LambdaStack(app, 'MushroomLambdaStack', {
    commandTable: dynamodbStack.commandTable,
    ...londonEnv
});
const apiGatewayStack = new ApiGatewayStack(app, 'MushroomApiGatewayStack', {
    ...londonEnv,
    rootDomain: rootDomain,
    domainName: apiDomain,
    commandProcessor: lambdaStack.commandProcessor
});
const iotStack = new IoTStack(app, 'MushroomIoTStack', {
    ...londonEnv,
    table: dynamodbStack.telemetryTable
});
const cognitoStack = new CognitoStack(app, 'MushroomCognitoStack', {
    ...londonEnv,
    rootDomain: rootDomain,
    domainName: domainName,
    authDomainName: authDomain,
    authCertificateArn: certificateStack.authCertificate,
    crossRegionReferences: true,
    commandDatabase: dynamodbStack.commandTable,
    telemetryDatabase: dynamodbStack.telemetryTable,
});