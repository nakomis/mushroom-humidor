import Page, { PageProps } from "./Page";
import { Credentials as AWSCredentials } from "@aws-sdk/client-cognito-identity";
import { getTelemetryRecords } from "../../services/TelemetryService";
import { TelemetryRecord } from "../../dto/TelemetryRecord";
import { useEffect, useState } from "react";

type TelemetryProps = PageProps & {
    creds: AWSCredentials | null;
};

function getTelemetryTable(items: TelemetryRecord[]) {
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
                        <tr key={item.deviceId + '-' + item.timestamp}>
                            <td key={index}>{item.deviceId}</td>
                            <td>{item.temperature}</td>
                            <td>{item.humidity}</td>
                            <td>{item.timestamp}</td>
                            <td>{
                                item.ttl ? new Date(Number(item.ttl) * 1000).toDateString() :
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
    const [telemetryRecords, setTelemetryRecords] = useState([] as TelemetryRecord[]);
    useEffect(() => {
        const fetchRecords = async () => {
            const records = await getTelemetryRecords(props.creds!!);
            setTelemetryRecords(records);
        };
        if (props.creds) {
            fetchRecords();
        }
    }, [props.creds]);

    const { children, tabId, index, ...other } = props;

    if (index == tabId) {
        var table;
        if (telemetryRecords) {
            table = getTelemetryTable(telemetryRecords);
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

export default TelemetryPage;