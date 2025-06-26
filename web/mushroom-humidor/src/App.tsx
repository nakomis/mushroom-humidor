import React from 'react';
import logo from './logo.svg';
import './App.css';

import { useAuth } from "react-oidc-context";

function App() {
    const auth = useAuth();

    const signOutRedirect = () => {
        const clientId = "b8rttvob8pp6inqhdjf471de";
        const logoutUri = "https://mushrooms.sandbox.nakomis.com/logout";
        const cognitoDomain = "https://auth.mushrooms.sandbox.nakomis.com";
        window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
    };

    if (auth.isLoading) {
        return <div>Loading...</div>;
    }

    if (auth.error) {
        return <div>Encountering error... {auth.error.message}</div>;
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
                    <button onClick={() => {
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
                <p>
                    Welcome to the mushroom humidor
                </p>
                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Login below to continue
                </a>
                <p></p>
                <button onClick={() => auth.signinRedirect(
                    {
                        // redirect_uri: "https://mushrooms.sandbox.nakomis.com/loggedin"
                    }
                )}>Sign in</button>
                <button onClick={() => signOutRedirect()}>Sign out</button>
            </header>
        </div >
    );

}

export default App;
