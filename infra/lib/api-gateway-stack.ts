import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cm from 'aws-cdk-lib/aws-certificatemanager';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';
import * as targets from 'aws-cdk-lib/aws-route53-targets';

export interface ApiGatewayStackProps extends cdk.StackProps {
    rootDomain: string,
    domainName: string,
    commandProcessor: lambda.Function
}

export class ApiGatewayStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: ApiGatewayStackProps) {
        super(scope, id, props);

        const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZoneLookup', {
            domainName: props.rootDomain
        });

        const apiCert = new cm.Certificate(this, "MushroomApiCert", {
            domainName: props.domainName,
            validation: cm.CertificateValidation.fromDns(hostedZone)
        });

        const mushroomGateway = new apigateway.RestApi(this, 'MushroomApiGateway', {
            restApiName: 'Mushroom API Gateway',
            description: 'API Gateway for Mushroom application',
            domainName: {
                domainName: props.domainName,
                certificate: apiCert,
            },
            deployOptions: {
                stageName: 'prod',
                loggingLevel: apigateway.MethodLoggingLevel.INFO,
            },
        }); 
        
        const commandProcessorIntegration = new apigateway.LambdaIntegration(props.commandProcessor, {
            proxy: true,
            integrationResponses: [{
                statusCode: '202',
            }],
        });

        mushroomGateway.root.addMethod('POST', commandProcessorIntegration, {
            methodResponses: [{
                statusCode: '202',
            }],
            authorizationType: apigateway.AuthorizationType.IAM
        });

        new route53.ARecord(this, `${hostedZone.zoneName}ApiAAliasRecord`, {
            recordName: props.domainName,
            zone: hostedZone,
            target: route53.RecordTarget.fromAlias(new targets.ApiGateway(mushroomGateway)),
        });

        new route53.AaaaRecord(this, `${hostedZone.zoneName}ApiAaaaAliasRecord`, {
            recordName: props.domainName,
            zone: hostedZone,
            target: route53.RecordTarget.fromAlias(new targets.ApiGateway(mushroomGateway)),
        });
    }
};