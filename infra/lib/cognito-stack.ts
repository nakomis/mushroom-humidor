import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as cm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';

export interface CognitoStackProps extends cdk.StackProps {
    rootDomain: string;
    authDomainName: string;
    domainName: string;
    authCertificateArn: cm.Certificate;
}

export class CognitoStack extends cdk.Stack {
    readonly userPool: cognito.UserPool;
    readonly userPoolClient: cognito.UserPoolClient;

    constructor(scope: Construct, id: string, props: CognitoStackProps) {
        super(scope, id, props);

        this.userPool = new cognito.UserPool(this, 'UserPool', {
            userPoolName: 'MushroomUserPool',
            signInAliases: {
                username: true,
                email: true,
            },
            selfSignUpEnabled: false,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        this.userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
            userPoolClientName: 'MushroomUserPoolClient',
            userPool: this.userPool,
            authFlows: {
                userPassword: true,
                userSrp: true,
            },
            generateSecret: false,
            oAuth: {
                callbackUrls: [`https://${props.domainName}`, `https://${props.domainName}/loggedin`],
                logoutUrls: [`https://${props.domainName}`, `https://${props.domainName}/logout`]
            },
        });

        const userPoolDomain: cognito.UserPoolDomain = new cognito.UserPoolDomain(this, 'UserPoolCustomDomain', {
            customDomain: {
                domainName: props.authDomainName,
                certificate: props.authCertificateArn,
            },
            userPool: this.userPool,
            managedLoginVersion: cognito.ManagedLoginVersion.NEWER_MANAGED_LOGIN,
        });

        const user: cognito.CfnUserPoolUser = new cognito.CfnUserPoolUser(this, 'NakomisUser', {
            userPoolId: this.userPool.userPoolId,
            username: 'nakomis',
            userAttributes: [
                { name: 'email', value: 'mushrooms@nakomis.com' },
                { name: 'email_verified', value: 'true' },
            ],
        });

        new cognito.CfnManagedLoginBranding(this, 'ManagedLoginBranding', {
            userPoolId: this.userPool.userPoolId,
            clientId: this.userPoolClient.userPoolClientId,
            useCognitoProvidedValues: true,
        });

        const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZoneLookup', {
            domainName: props.rootDomain
        });

        new route53.ARecord(this, `${hostedZone.zoneName}AAliasRecord`, {
            recordName: props.authDomainName,
            zone: hostedZone,
            target: route53.RecordTarget.fromAlias(new targets.UserPoolDomainTarget(userPoolDomain))
        });

        new route53.AaaaRecord(this, `${hostedZone.zoneName}AaaaAliasRecord`, {
            recordName: props.authDomainName,
            zone: hostedZone,
            target: route53.RecordTarget.fromAlias(new targets.UserPoolDomainTarget(userPoolDomain))
        });

        // // Assign a UI customization (style) to the custom domain
        // new cognito.CfnUserPoolUICustomizationAttachment(this, 'UserPoolUICustomization', {
        //     userPoolId: this.userPool.userPoolId,
        //     clientId: this.userPoolClient.userPoolClientId,
        // });
    }
}