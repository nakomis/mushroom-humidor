import { ReactNode, useEffect } from "react";
import logo from '@images/mushroom.png';
import { useAuth } from "react-oidc-context";
export type PageProps = {
    children?: ReactNode;
    index: any;
    tabId: any;
};

const Page = (props: PageProps) => {
    const { children, tabId, index, ...other } = props;
    // useEffect(() => {
    //     // This effect runs when the component mounts or when tabId changes
    //     console.log(`Page component mounted or tabId changed: ${tabId}`);
    // }, [tabId]);
    return (
        <div hidden={tabId !== index} aria-labelledby={`vertical-tab-0`}>
            <div className="page">
                <img src={logo} className="App-logo" alt="logo" />
                {children}
            </div>
        </div>
    );
}

export default Page;