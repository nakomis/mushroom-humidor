import Page, { PageProps } from "./Page";
import {
    Credentials as AWSCredentials,
} from "@aws-sdk/client-cognito-identity";
import { CommandRecord } from "../../dto/CommandRecord";
import { useEffect, useState } from "react";
import { getCommandRecords } from "../../services/CommandService";

type CommandProps = PageProps & {
    creds: AWSCredentials | null;
    items: any[];
};

function getCommandTable(items: CommandRecord[]) {
    if (items.length === 0) {
        return <p>No items found in the table.</p>;
    }
    return (
        <table className="table table-bordered table-hover table-dark">
            <thead>
                <tr>
                    <th scope='col'>
                        Device
                    </th>
                    <th scope='col'>
                        Command Type
                    </th>
                    <th scope='col'>
                        Action
                    </th>
                    <th scope='col'>
                        Timestamp
                    </th>
                    <th scope='col'>
                        TTL
                    </th>
                </tr>
            </thead>
            <tbody>
                {
                    items.map((item, index) => (
                        <tr key={item.deviceId + '-' + item.timestamp}>
                            <td key={index}>{item.deviceId}</td>
                            <td>{item.commandType}</td>
                            <td>{item.action}</td>
                            <td>{item.timestamp}</td>
                            <td>{
                                item.ttl ? item.ttl : "immortal"
                            }</td>
                        </tr>
                    ))
                }
            </tbody>
        </table>
    );
}

const CommandPage = (props: CommandProps) => {
    const [commandRecords, setCommandRecords] = useState([] as CommandRecord[]);
    useEffect(() => {
        const fetchRecords = async () => {
            const records = await getCommandRecords(props.creds!!);
            setCommandRecords(records);
        };
        if (props.creds) {
            fetchRecords();
        }
    }, [props.creds]);

    const { children, tabId, index, ...other } = props;

    if (index == tabId) {
        var table;
        if (commandRecords) {
            table = getCommandTable(commandRecords);
        } else {
            table = <p>Loading AWS credentials...</p>;
        }
        return (
            <Page tabId={tabId} index={index}>
                <div className="page">
                    {table}
                </div>
            </Page>
        )
    } else {
        return <div />
    }
}

export default CommandPage;