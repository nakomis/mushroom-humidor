import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Logout from './Logout';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from "react-oidc-context";
import { BrowserRouter, Routes, Route } from "react-router";
import LoggedIn from './LoggedIn';

const cognitoAuthConfig = {
    authority: "https://cognito-idp.eu-west-2.amazonaws.com/eu-west-2_B1QPS8ffN",
    client_id: "b8rttvob8pp6inqhdjf471de",
    redirect_uri: "https://mushrooms.sandbox.nakomis.com/loggedin",
    response_type: "code",
    scope: "email openid phone profile",
};

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <AuthProvider {...cognitoAuthConfig}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<App />} />
                    <Route path="/loggedin" element={<LoggedIn />} />
                    <Route path="/logout" element={<Logout/>} />
                    {/* Add more routes as needed */}
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
