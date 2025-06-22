import { useAuth } from "react-oidc-context";

function LoggedIn() {
    if (useAuth().isAuthenticated) {
        window.location.href = `https://mushrooms.sandbox.nakomis.com/`;
        return <div></div>
    }
    return <div></div>
}


export default LoggedIn;