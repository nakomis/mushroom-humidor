import { ReactNode } from "react";
import logo from '@images/mushroom.png';
export type PageProps = {
    children?: ReactNode;
    index: any;
    tabId: any;
};


const Page = (props: PageProps) => {
    const { children, tabId, index, ...other } = props;

    return (
        <div
            // role="tabpanel"
            hidden={tabId !== index}
            // id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-0`}
            // {...other}
        >
            {/* {tabId === index && children} */}
            {/* {children} */}
            <div className="page">
                <img src={logo} className="App-logo" alt="logo" />
                <h1>Welcome to the Page Component {index}</h1>
                <p>This is a placeholder for your page content.</p>
            </div>
        </div>

    );
}

export default Page;