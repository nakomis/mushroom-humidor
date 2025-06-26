import React from 'react';
import logo from './logo.svg';
import { useAuth } from "react-oidc-context";
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';

function App() {
    const auth = useAuth();

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
