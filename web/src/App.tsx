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

function getTable(items: any[]) {
    if (items.length === 0) {
        return <p>No items found in the table.</p>;
    }
    return (
        <table className="table table-bordered table-hover table-dark">
            <thead>
                <tr>
                    {
                        Object.keys(items[0]).map((key) => (
                            <th>{key}</th>
                        ))
                    }
                </tr>
            </thead>
            <tbody>
                {
                    items.map((item, index) => (
                        <tr>
                            {
                                Object.values(item).map((value: any, i) => (
                                    <td key={i}>{value.S}</td>
                                ))
                            }
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
