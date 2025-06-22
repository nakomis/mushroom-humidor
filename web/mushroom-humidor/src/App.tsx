import React from 'react';
import logo from './logo.svg';
import './App.css';
import { useAuth } from "react-oidc-context";

function App() {
    const auth = useAuth();

    const signOutRedirect = () => {
        const clientId = "40f6diqtkupliql4eimogdrlks";
        const logoutUri = "https://mushrooms.sandbox.nakomis.com";
        const cognitoDomain = "https://auth.mushrooms.sandbox.nakomis.com.auth.eu-west-2.amazoncognito.com";
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
                        Mustroom Humidor
                    </p>
                    <a
                        className="App-link"
                        href="https://reactjs.org"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Authenticated as {auth.user?.profile.email}
                        Or: {JSON.stringify(auth.user)}
                    </a>
                </header>
            </div>
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
                        redirect_uri: "https://mushrooms.sandbox.nakomis.com"
                    }
                )}>Sign in</button>
                <button onClick={() => signOutRedirect()}>Sign out</button>
            </header>
        </div >
    );

}

export default App;
