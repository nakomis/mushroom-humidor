import React, { useEffect } from 'react';
import logo from '@images/mushroom-red.png';
import { useAuth } from "react-oidc-context";
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import {
    CognitoIdentityClient,
    GetIdCommand,
    GetCredentialsForIdentityCommand,
    Credentials as AWSCredentials,
} from "@aws-sdk/client-cognito-identity";
import Config from '../config/config';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { AppBar } from '@mui/material';
import { createTheme, ThemeProvider, styled } from "@mui/material/styles";
import { blue, green } from "@mui/material/colors";
import TelemetryPage from './pages/TelemetryPage';
import CommandPage from './pages/CommandPage';
import SettingsPage from './pages/SettingsPage';


/*
    Looking for something interesting in the code?
    Get the full source code at https://nakom.is/mushroom-code
    It's an open-source project, so feel free to contribute or use it as you like!
*/


export async function getAWSCredentialsFromIdToken(
    region: string,
    identityPoolId: string,
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
    const [tabId, setTabId] = React.useState(0);

    useEffect(() => {
        if (!auth.user?.id_token) {
            return;
        }
        (async () => {
            const credentials = await getAWSCredentialsFromIdToken(
                Config.aws.region,
                Config.cognito.identityPoolId,
                auth.user?.id_token || ''
            );
            setCreds(credentials ?? null);
        })();
    }, [auth.user?.id_token]);

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
                                <TelemetryPage tabId={tabId} index={0} creds={creds}></TelemetryPage>
                                <CommandPage tabId={tabId} index={1} creds={creds} items={items}></CommandPage>
                                <SettingsPage tabId={tabId} index={2} creds={creds}></SettingsPage>
                            </Box>
                        </ThemeProvider>
                        {
                            !auth.isAuthenticated ? (
                                <p>You are not authenticated.</p>
                            ) : ""
                        }
                    </header>
                </div >
            </div>
        );
    }

    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>Welcome to the Mushroom Humidor</p>
                <p>Login below to continue</p>
                <div>
                    <button type="button" className="btn btn-primary" onClick={() => auth.signinRedirect()}>Sign in</button>
                </div>
            </header>
        </div >
    );

}

export default App;
