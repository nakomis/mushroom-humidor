import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import Logout from './components/Logout';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from "react-oidc-context";
import { BrowserRouter, Routes, Route } from "react-router";
import LoggedIn from './components/LoggedIn';
import Config from './config/config';
import Footer from './components/Footer';
import Outline from './components/Outline';
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';

/*
    Looking for something interesting in the code?
    Get the full source code at https://nakom.is/mushroom-code
    It's an open-source project, so feel free to contribute or use it as you like!
*/

const cognitoAuthConfig = {
    authority: Config.cognito.authority,
    client_id: Config.cognito.userPoolClientId,
    redirect_uri: Config.cognito.redirectUri,
    // I'm happy for these values to be hardcoded for now, but they can be configured later
    response_type: "code",
    scope: "email openid phone profile",
};

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <Outline>
            <div className="main-content">
                <AuthProvider {...cognitoAuthConfig}>
                    <BrowserRouter>
                        <Routes>
                            <Route path="/" element={<App />} />
                            <Route path="/loggedin" element={<LoggedIn />} />
                            <Route path="/logout" element={<Logout />} />
                            {/* Add more routes as needed */}
                        </Routes>
                    </BrowserRouter>
                </AuthProvider>
            </div>
            <Footer/>
        </Outline>
    </React.StrictMode>
);

reportWebVitals();
