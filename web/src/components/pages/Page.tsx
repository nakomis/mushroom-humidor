import { ReactNode } from "react";

type TabPanelProps = {
  children?: ReactNode;
  index: any;
  tabId: any;
};


const Page = (props: TabPanelProps) => {
    const { children, tabId, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={tabId !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
        >
            {tabId === index && children}
            <div className="page">
                <h1>Welcome to the Page Component {index}</h1>
                <p>This is a placeholder for your page content.</p>
            </div>
        </div>

    );
}

export default Page;