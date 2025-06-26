import { useAuth } from "react-oidc-context";

function LoggedIn() {
    if (useAuth().isAuthenticated) {
        window.location.href = `https://mushrooms.sandbox.nakomis.com/`;
        return <div></div>
    } else {
        
    }
    return <div></div>
}


export default LoggedIn;