import { ReactNode } from "react";
import Page, { PageProps } from "./Page";
import {
    Credentials as AWSCredentials,
} from "@aws-sdk/client-cognito-identity";

type TelemetryProps = PageProps & {
    creds: AWSCredentials | null;
    items: any[];
};

function getTelemetryTable(items: any[]) {
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
                        Temp
                    </th>
                    <th scope='col'>
                        Humidity
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
                        <tr>
                            <td key={index}>{item.deviceId.S}</td>
                            <td>{item.temperature.S}</td>
                            <td>{item.humidity.S}</td>
                            <td>{item.timestamp.S}</td>
                            <td>{
                                item.ttl && item.ttl.N ? new Date(Number(item.ttl.N) * 1000).toDateString() :
                                    "immortal"
                            }</td>
                        </tr>
                    ))
                }
            </tbody>
        </table>
    );
}

const TelemetryPage = (props: TelemetryProps) => {
    const { children, tabId, index, ...other } = props;

    return (
        <Page tabId={tabId} index={index}>
            <div className="page">
                <h1>Telemetry</h1>
                <h3>Hello, World!</h3>
                {props.creds ? getTelemetryTable(props.items) : <p>Loading AWS credentials...</p>}
            </div>
        </Page>
    )
}

export default TelemetryPage;