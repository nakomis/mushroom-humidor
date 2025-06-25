import React, { useEffect } from 'react';
import logo from '@images/mushroom.png';
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
import Config from '../config/config';
import { AwsClient } from "aws4fetch";
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Page from './pages/Page';
import { AppBar, Paper } from '@mui/material';
import { createTheme, ThemeProvider, styled } from "@mui/material/styles";
import { blue, green } from "@mui/material/colors";


/*
    Looking for something interesting in the code?
    Get the full source code at https://nakom.is/mushroom-code
    It's an open-source project, so feel free to contribute or use it as you like!
*/

function getTelemetryTable(items: any[]) {
    if (items.length === 0) {
        return <p>No items found in the table.</p>;
    }
    return (
        <table className="table table-bordered table-hover table-dark">
            <thead>
                <tr>
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
                </tr>
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
                                    "immortal"
                            }</td>
                        </tr>
                    ))
                }
            </tbody>
        </table>
    );
}

function getCommandTable(items: any[]) {
    if (items.length === 0) {
        return <p>No items found in the table.</p>;
    }
    return (
        <table className="table table-bordered table-hover table-dark">
            <thead>
                <tr>
                    <th scope='col'>
                        Device
                    </th>
                    <th scope='col'>
                        Command Type
                    </th>
                    <th scope='col'>
                        Action
                    </th>
                    <th scope='col'>
                        Timestamp
                    </th>
                    <th scope='col'>
                        TTL
                    </th>
                </tr>
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
                                    "immortal"
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
    const [tabId, setTabId] = React.useState(() => {
        const hash = window.location.hash.substr(1);
        if (hash === '') {
            return 0;
        }
        return parseInt(hash);
    });

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

    const onTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setTabId(newValue);
        window.location.hash = `${newValue}`;
    };

    const overrides = {
        MuiTab: {
            // general overrides for your material tab component here
            root: {
                backgroundColor: 'red',
                '&$selected': {
                    backgroundColor: 'blue',
                }
            },
        },
    };

    const theme = createTheme({

        typography: {
            fontFamily: ['Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(','),
            fontSize: 24,
        },
        palette: {
            text: {
                secondary: '#585c64',
            },
            primary: {
                main: blue["A700"],
            },
            secondary: {
                main: green[900],
            },
            background: {
                default: '#ffffff',
                paper: '#1e1e1e',
            },
        },
    });

    if (auth.isAuthenticated) {
        return (
            <div className="App">
                <div >
                    <header className="App-header">
                        <ThemeProvider theme={theme}>
                            <AppBar position="static">
                                <Box sx={{ backgroundColor: '#1f2329' }}>
                                    <div style={{ display: 'flex' }}>
                                        <Tabs value={tabId} onChange={onTabChange} aria-label="basic tabs example" sx={{
                                            marginLeft: "0",
                                            "&& .Mui-selected": { // && are used to increase the specificity
                                                color: "#d1d1d1",
                                            },
                                        }}>
                                            <Tab label="Telemetry" />
                                            <Tab label="Commands" />
                                            <Tab label="Settings" />
                                        </Tabs>
                                        <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
                                            <button type="button" className="btn btn-primary" style={{ marginRight: 10, alignSelf: "anchor-center" }} onClick={() => {
                                                auth.removeUser();
                                                signOutRedirect()
                                            }}>Sign out</button>
                                        </div>
                                    </div>
                                </Box>
                            </AppBar>
                            <Box sx={{ width: '100%' }}>
                                <Page tabId={tabId} index={0}>
                                    <div className="page">
                                        <h1>Telemetry</h1>
                                        {creds ? getTelemetryTable(items) : <p>Loading AWS credentials...</p>}
                                    </div>
                                </Page>
                                <Page tabId={tabId} index={1}>
                                    <div className="page">
                                        <h1>Commands</h1>
                                        {creds ? getCommandTable(items) : <p>Loading AWS credentials...</p>}
                                    </div>
                                </Page>
                                <Page tabId={tabId} index={2}>
                                    <div className="page">
                                        <h1>Settings</h1>
                                        <p>This is the settings page.</p>
                                    </div>
                                </Page>
                            </Box>
                        </ThemeProvider>

                        <img src={logo} className="App-logo" alt="logo" />
                        <p>
                            Mushroom Humidor
                        </p>
                        {auth.isAuthenticated ? (
                            <div className="App-credentials">
                                {creds ? getTelemetryTable(items)
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
            </div>
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
