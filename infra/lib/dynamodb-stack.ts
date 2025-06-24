import * as cdk from 'aws-cdk-lib';
import { RemovalPolicy } from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';


export interface DynamodbStackProps extends cdk.StackProps {
}

export class DynamodbStack extends cdk.Stack {
    readonly telemetryTable: dynamodb.ITable;
    readonly commandTable: dynamodb.ITable;

    private readonly prod = process.env.NPM_ENVIRONMENT == "prod";

    constructor(scope: Construct, id: string, props: DynamodbStackProps) {
        super(scope, id, props);

        const importTelemetryTable = dynamodb.TableV2.fromTableName(this, 'ExistingTable', 'MushroomTelemetry');
        const importCommandTable = dynamodb.TableV2.fromTableName(this, 'ExistingCommandTable', 'MushroomCommands');

        if ((!importTelemetryTable) || (importTelemetryTable.tableId === undefined)) {
            console.log('Creating new DynamoDB Telemetry table: MushroomTelemetry');
            this.telemetryTable = new dynamodb.Table(this, 'MushroomTable', {
                tableName: 'MushroomTelemetry',
                partitionKey: { name: 'deviceId', type: dynamodb.AttributeType.STRING },
                sortKey: { name: 'timestamp', type: dynamodb.AttributeType.STRING },
                removalPolicy: RemovalPolicy.RETAIN,
                billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
                timeToLiveAttribute: 'ttl',
            });
        } else {
            console.log(`Using existing DynamoDB Telemetry table: ${importTelemetryTable.tableName}`);
            this.telemetryTable = importTelemetryTable;
            return;
        }

        if ((!importCommandTable) || (importCommandTable.tableId === undefined)) {
            console.log('Creating new DynamoDB Command table: MushroomCommands');
            this.commandTable = new dynamodb.Table(this, 'MushroomCommandTable', {
                tableName: 'MushroomCommands',
                partitionKey: { name: 'deviceId', type: dynamodb.AttributeType.STRING },
                sortKey: { name: 'timestamp', type: dynamodb.AttributeType.STRING },
                removalPolicy: RemovalPolicy.RETAIN,
                billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
                timeToLiveAttribute: 'ttl',
            });
        } else {
            console.log(`Using existing DynamoDB Command table: ${importCommandTable.tableName}`);
            this.commandTable = importCommandTable;
            return;
        }
    }
}