import Page, { PageProps } from "./Page";
import {
    Credentials as AWSCredentials,
} from "@aws-sdk/client-cognito-identity";
import { CommandRecord } from "../../dto/CommandRecord";
import { useEffect, useRef, useState } from "react";
import { getCommandRecords } from "../../services/CommandService";
import "./CommandPage.css";
import { Chart, ChartData } from 'chart.js/auto';

type CommandProps = PageProps & {
    creds: AWSCredentials | null;
};

const formatData = (data: number[]): ChartData => ({
    labels: ["a", "b", "c", "d", "e", "f", "g", "h"],
    datasets: [{ data }]
});

function getCommandTable(items: CommandRecord[]) {
    if (items.length === 0) {
        return <p>No items found in the table.</p>;
    }
    return (
        <div className="Command-table-container">
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
        </div>
    );
}

const CommandPage = (props: CommandProps) => {
    const [data, setData] = useState([0, 1, 2, 3, 4, 5, 6, 7]);
    const [commandRecords, setCommandRecords] = useState([] as CommandRecord[]);
    const chartRef = useRef<Chart | null>(null);

    useEffect(() => {
        // must verify that the chart exists
        if (chartRef.current) {
            chartRef.current.data = formatData(data);
            chartRef.current.update();
        }
    }, [data]);

    const canvasCallback = (canvas: HTMLCanvasElement | null) => {
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
            chartRef.current = new Chart(ctx, {
                type: "line",
                data: formatData(data),
                // options: { responsive: true }
            });
        }
    };

    useEffect(() => {
        const fetchRecords = async () => {
            const records = await getCommandRecords(props.creds!!);
            setCommandRecords(records);
        };
        if (props.creds) {
            fetchRecords();
        }
    }, [props.creds]);

    const { tabId, index } = props;

    if (index === tabId) {
        var table;
        if (commandRecords) {
            table = getCommandTable(commandRecords);
        } else {
            table = <p>Loading AWS credentials...</p>;
        }
        return (
            <Page tabId={tabId} index={index}>
                <div className="Command-chart-container">
                    <canvas ref={canvasCallback} className="Command-chart-canvas"></canvas>
                </div>
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