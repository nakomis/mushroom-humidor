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

export async function getAWSCredentialsFromIdToken(
    region: string,
    identityPoolId: string,
    userPoolId: string,
    idToken: string
): Promise<AWSCredentials | undefined> {
    const client = new CognitoIdentityClient({ region });

    // The Logins key must match this format:
    //   const providerName = `cognito-idp.${region}.amazonaws.com/${userPoolId}`;
    const providerName = `cognito-idp.eu-west-2.amazonaws.com/eu-west-2_B1QPS8ffN`;

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
        const fetchCreds = async () => {
            const credentials = await getAWSCredentialsFromIdToken(
                "eu-west-2",
                "eu-west-2:0708bfa6-b2b9-4f0a-93c7-037ec3fa3504",
                "eu-west-2_B1QPS8ffN",
                `${auth.user?.id_token}` // Ensure this is the correct token
            );
            setCreds(credentials ?? null);
            if (credentials) {

                const client = new DynamoDBClient({
                    region: "eu-west-2",
                    credentials: {
                        accessKeyId: credentials.AccessKeyId!,
                        secretAccessKey: credentials.SecretKey!,
                        sessionToken: credentials.SessionToken,
                    },
                });

                const command = new ScanCommand({ TableName: 'MushroomTelemetry' });
                try {
                    const result: ScanCommandOutput = await client.send(command);
                    setItems(result.Items ?? []);
                } catch (err) {
                    console.error("DynamoDB scan error:", err);
                    setItems([]);
                }
            }
        };
        const fetchData = async () => {
            if (auth.isAuthenticated && auth.user?.id_token) {
                if (creds) {

                }
            }
        };
        if (auth.isAuthenticated && auth.user?.id_token) {
            fetchCreds();
            fetchData();
        }
    }, [auth.isAuthenticated, auth.user?.id_token]);

    const signOutRedirect = () => {
        const clientId = "b8rttvob8pp6inqhdjf471de";
        const logoutUri = "https://mushrooms.sandbox.nakomis.com/logout";
        const cognitoDomain = "https://auth.mushrooms.sandbox.nakomis.com";
        window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
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
                    <p>
                        Authenticated as: <i>{auth.user?.profile.email}</i><br></br>
                        Username: <i>{auth.user?.profile['cognito:username'] as string}</i><br></br>
                    </p>
                    <button type="button" className="btn btn-primary" onClick={() => {
                        auth.removeUser();
                        signOutRedirect()
                    }}>Sign out</button>
                    {auth.isAuthenticated ? (
                        <div className="App-credentials">
                            <h3>AWS Credentials</h3>
                            {creds ? (
                                <div>
                                    <pre>{JSON.stringify(creds, null, 2)}</pre>
                                    <pre>{JSON.stringify(items, null, 2)}</pre>
                                </div>
                            ) : (
                                <p>Loading AWS credentials...</p>
                            )}

                        </div>
                    ) : (
                        <p>You are not authenticated.</p>
                    )}
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
