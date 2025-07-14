import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as cm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import { ITable, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Bucket } from 'aws-cdk-lib/aws-s3';

export interface CognitoStackProps extends cdk.StackProps {
    rootDomain: string;
    authDomainName: string;
    domainName: string;
    authCertificateArn: cm.Certificate;
    telemetryDatabase: cdk.aws_dynamodb.ITable;
    commandDatabase: cdk.aws_dynamodb.ITable;
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

        const callbackUrls: string[] = [`https://${props.domainName}/loggedin`];
        const logoutUrls: string[] = [`https://${props.domainName}/logout`];
        if (process.env.NPM_ENVIRONMENT != 'prod') {
            callbackUrls.push('http://localhost:3000/loggedin');
            logoutUrls.push('http://localhost:3000/logout');
        }

        this.userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
            userPoolClientName: 'MushroomUserPoolClient',
            userPool: this.userPool,
            authFlows: {
                userPassword: true,
                userSrp: true,
            },
            generateSecret: false,
            oAuth: {
                callbackUrls: callbackUrls,
                logoutUrls: logoutUrls,
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

        const identityPool = new cognito.CfnIdentityPool(this, 'IdentityPool', {
            identityPoolName: 'MushroomIdentityPool',
            allowUnauthenticatedIdentities: false,
            cognitoIdentityProviders: [{
                clientId: this.userPoolClient.userPoolClientId,
                providerName: this.userPool.userPoolProviderName,
            }],
        });

        const databaseReadRole = new cdk.aws_iam.Role(this, 'MushroomDatabaseReadRole', {
            assumedBy: new cdk.aws_iam.FederatedPrincipal(
                'cognito-identity.amazonaws.com',
                {
                    'StringEquals': { 'cognito-identity.amazonaws.com:aud': identityPool.ref },
                    'ForAnyValue:StringLike': { 'cognito-identity.amazonaws.com:amr': 'authenticated' }
                },
                'sts:AssumeRoleWithWebIdentity'
            ),
        });

        const catadata: ITable =  Table.fromTableName(this, 'CatadataDatabase', 'catadata');

        const catBucket = Bucket.fromBucketName(this, 'CatadataBucket', 'bootbootstraining');

        props.telemetryDatabase.grantReadData(databaseReadRole);
        props.commandDatabase.grantReadData(databaseReadRole);
        catadata.grantReadWriteData(databaseReadRole);
        catBucket.grantRead(databaseReadRole);

        // new cognito.CfnIdentityPoolRoleAttachment(this, 'IdentityPoolRoleAttachment', {
        //     identityPoolId: identityPool.ref,
        //     roles: {
        //         authenticated: databaseReadRole,
        //     },
        // });

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
    }
}