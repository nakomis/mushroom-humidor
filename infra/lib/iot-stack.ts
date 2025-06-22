import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { ThingWithCert } from 'cdk-iot-core-certificates-v3';



export interface IoTStackProps extends cdk.StackProps {
}

export class IoTStack extends cdk.Stack {
    readonly table: dynamodb.Table;

    private readonly prod = process.env.NPM_ENVIRONMENT == "prod";

    constructor(scope: Construct, id: string, props: IoTStackProps) {
        super(scope, id, props);

        const { thingArn, certId, certPem, privKey } = new ThingWithCert(this, 'MyThing', {
            thingName: 'MushroomThing',
            saveToParamStore: true,
            paramPrefix: 'Mushroom',
        });
    }
}