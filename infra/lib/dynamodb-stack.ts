import * as cdk from 'aws-cdk-lib';
import { RemovalPolicy } from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';


export interface DynamodbStackProps extends cdk.StackProps {
}

export class DynamodbStack extends cdk.Stack {
    readonly table: dynamodb.ITable;

    private readonly prod = process.env.NPM_ENVIRONMENT == "prod";

    constructor(scope: Construct, id: string, props: DynamodbStackProps) {
        super(scope, id, props);

        const importTable = dynamodb.Table.fromTableName(this, 'MushroomTelemetryTable', this.prod ? 'MushroomTelemetry' : 'MushroomTelemetry');
        if (importTable) {
            console.log(`Using existing table: ${importTable.tableName}`);
            this.table = importTable;
            return;
        } else {
            this.table = new dynamodb.Table(this, 'MushroomTable', {
                tableName: this.prod ? 'MushroomTelemetry' : 'MushroomTelemetry',
                partitionKey: { name: 'deviceId', type: dynamodb.AttributeType.STRING },
                sortKey: { name: 'timestamp', type: dynamodb.AttributeType.STRING },
                removalPolicy: RemovalPolicy.RETAIN,
                billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
                timeToLiveAttribute: 'ttl',
            });
        }
    }
}