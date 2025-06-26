import React, { useEffect } from 'react';
import logo from './logo.svg';
import { useAuth } from "react-oidc-context";
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import {
    CognitoIdentityClient,
    GetIdCommand,
    GetCredentialsForIdentityCommand,
    Credentials as AWSCredentials,
} from "@aws-sdk/client-cognito-identity";
import { DynamoDBClient, ScanCommand, ScanCommandOutput } from '@aws-sdk/client-dynamodb';
import Config from './config/config';
import { AwsClient } from "aws4fetch";


/*
    Looking for something interesting in the code?
    Get the full source code at https://nakom.is/mushroom-code
    It's an open-source project, so feel free to contribute or use it as you like!
*/

function getTable(items: any[]) {
    if (items.length === 0) {
        return <p>No items found in the table.</p>;
    }
    return (
        <table className="table table-bordered table-hover table-dark">
            <thead>
                <th scope='col'>
                    Device
                </th>
                <th scope='col'>
                    Temp
                </th>
                <th scope='col'>
                    Humidity
                </th>
                <th scope='col'>
                    Timestamp
                </th>
                <th scope='col'>
                    TTL
                </th>
            </thead>
            <tbody>
                {
                    items.map((item, index) => (
                        <tr>
                            <td key={index}>{item.deviceId.S}</td>
                            <td>{item.temperature.S}</td>
                            <td>{item.humidity.S}</td>
                            <td>{item.timestamp.S}</td>
                            <td>{
                                item.ttl && item.ttl.N ? new Date(Number(item.ttl.N) * 1000).toDateString() :
                                    item.ttl.N
                            }</td>
                        </tr>
                    ))
                }
            </tbody>
        </table>
    );
}

export async function getAWSCredentialsFromIdToken(
    region: string,
    identityPoolId: string,
    userPoolId: string,
    idToken: string
): Promise<AWSCredentials | undefined> {
    const client = new CognitoIdentityClient({ region });
    const providerName = `cognito-idp.${Config.aws.region}.amazonaws.com/${Config.cognito.userPoolId}`;

    // Step 1: Get the Cognito Identity ID
    const getIdCommand = new GetIdCommand({
        IdentityPoolId: identityPoolId,
        Logins: {
            [providerName]: idToken,
        },
    });
    const getIdResponse = await client.send(getIdCommand);

    if (!getIdResponse.IdentityId) return undefined;

    // Step 2: Get AWS Credentials for the Identity ID
    const getCredsCommand = new GetCredentialsForIdentityCommand({
        IdentityId: getIdResponse.IdentityId,
        Logins: {
            [providerName]: idToken,
        },
    });
    const getCredsResponse = await client.send(getCredsCommand);

    return getCredsResponse.Credentials;
}

const App: React.FC = () => {
    const auth = useAuth();
    const [items, setItems] = React.useState<any[]>([]);
    const [creds, setCreds] = React.useState<AWSCredentials | null>(null);
    useEffect(() => {
        const fetchData = async () => {
            const credentials = await getAWSCredentialsFromIdToken(
                Config.aws.region,
                Config.cognito.identityPoolId,
                Config.cognito.userPoolId,
                auth.user?.id_token || ''
            );
            setCreds(credentials ?? null);
            if (credentials) {
                const client = new DynamoDBClient({
                    region: Config.aws.region,
                    credentials: {
                        accessKeyId: credentials.AccessKeyId!,
                        secretAccessKey: credentials.SecretKey!,
                        sessionToken: credentials.SessionToken,
                    },
                });

                const command = new ScanCommand({ TableName: Config.aws.tableName });
                try {
                    const result: ScanCommandOutput = await client.send(command);
                    setItems(result.Items ?? []);
                } catch (err) {
                    console.error("DynamoDB scan error:", err);
                    setItems([]);
                }

                const awsClient: AwsClient = new AwsClient({
                    accessKeyId: credentials.AccessKeyId!,
                    secretAccessKey: credentials.SecretKey!,
                    sessionToken: credentials.SessionToken,
                    service: 'execute-api',
                    region: Config.aws.region,
                });
                
                // const res = await awsClient.fetch(Config.aws.apiUri, {
                //     method: "POST",
                //     headers: {
                //         "Content-Type": "application/json",
                //     },
                //     body: JSON.stringify({ message: "Hello from LearnAWS.io" }),
                // });

                // TODO: Check that API returns 202 Accepted on POST
                // 
                // For a PATCH, the response should be 200, with the updated item
                // in the body

            }
        };
        if (auth.isAuthenticated && auth.user?.id_token) {
            fetchData();
        }
    }, [auth.isAuthenticated, auth.user?.id_token]);

    const signOutRedirect = () => {
        // TODO: Can I just call auth.signoutRedirect()?
        // auth.signoutRedirect();
        const clientId = Config.cognito;
        const logoutUri = Config.cognito.logoutUri;
        window.location.href = `https://${Config.cognito.cognitoDomain}/logout?client_id=${Config.cognito.userPoolClientId}&logout_uri=${encodeURIComponent(Config.cognito.logoutUri)}`;
    };

    if (auth.isLoading) {
        return (
            <div className="App">
                <div className="App-header">
                    Loading...
                </div>
            </div>
        );
    }

    if (auth.error) {
        return (
            <div className="App">
                <div className="App-header">
                    Encountering error... {auth.error.message}
                </div>
            </div>
        );
    }

    if (auth.isAuthenticated) {
        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <p>
                        Mushroom Humidor
                    </p>
                    {auth.isAuthenticated ? (
                        <div className="App-credentials">
                            {creds ? getTable(items)
                                : (
                                    <p>Loading AWS credentials...</p>
                                )}
                        </div>
                    ) : (
                        <p>You are not authenticated.</p>
                    )}
                    <button type="button" className="btn btn-primary" onClick={() => {
                        auth.removeUser();
                        signOutRedirect()
                    }}>Sign out</button>
                </header>
            </div >
        );
    }

    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>Welcome to the mushroom humidor</p>
                <p>Login below to continue</p>
                <div className="App-login">
                    <button type="button" className="btn btn-primary" onClick={() => auth.signinRedirect()}>Sign in</button>
                </div>
            </header>
        </div >
    );

}

export default App;
