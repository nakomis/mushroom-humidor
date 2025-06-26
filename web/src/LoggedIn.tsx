import { useAuth } from "react-oidc-context";
import './LoggedIn.css';

function
 LoggedIn() {
    if (useAuth().isAuthenticated) {
        window.location.href = '/';
        return <div></div>
    }
    return <div></div>
}


export default LoggedIn;