import * as cdk from 'aws-cdk-lib';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as cm from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';

export interface CertificateStackProps extends cdk.StackProps { 
    domainName: string,
    rootDomain: string
}

export class CertificateStack extends cdk.Stack {
    readonly certificate: cm.Certificate;
    
    constructor(scope: Construct, id: string, props: CertificateStackProps) {
        super(scope, id, props);

        const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZoneLookup', {
            domainName: props.rootDomain
        });

        this.certificate = new cm.Certificate(this, "MushroomCert", {
            domainName: props.domainName,
            validation: cm.CertificateValidation.fromDns(hostedZone)
        });
    }
};