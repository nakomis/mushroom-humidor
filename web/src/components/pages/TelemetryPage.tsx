import Page, { PageProps } from "./Page";
import { Credentials as AWSCredentials } from "@aws-sdk/client-cognito-identity";
import { getTelemetryRecords } from "../../services/TelemetryService";
import { TelemetryRecord } from "../../dto/TelemetryRecord";
import { useEffect, useRef, useState } from "react";
import { Chart, ChartData } from 'chart.js/auto';
import "./TelemetryPage.css";

type TelemetryProps = PageProps & {
    creds: AWSCredentials | null;
};

const formatData = (data: TelemetryData[]): ChartData => ({
    labels: data.map((value) => { return value.date }),
    datasets: [
        {
            data: data.map((value) => { return value.humidity }),
            label: "Humidity",
            yAxisID: "y",
        },
        {
            label: "Temperature",
            data: data.map((value) => { return value.temp }),
            yAxisID: "y1",
        }
    ]
});

type TelemetryData = {
    temp: number;
    humidity: number;
    date: string;
};

const TelemetryPage = (props: TelemetryProps) => {
    const [telemetryRecords, setTelemetryRecords] = useState([] as TelemetryRecord[]);
    const [data, setData] = useState([] as TelemetryData[]);
    const chartRef = useRef<Chart | null>(null);

    useEffect(() => {
        if (chartRef.current) {
            chartRef.current.data = formatData(data);
            chartRef.current.update();
        }
    }, [data]);

    useEffect(() => {
        if (props.creds) {
            (async () => {
                const records = await getTelemetryRecords(props.creds!!);
                // TODO: Map records to data format
                const data = records.map(record => {
                    return {
                        humidity: Number(record.humidity) as number,
                        temp: Number(record.temperature) as number,
                        date: record.timestamp
                    } as TelemetryData;
                });
                setData(data);
                setTelemetryRecords(records);
            })();
        };
    }, [props.creds]);

    const canvasCallback = (canvas: HTMLCanvasElement | null) => {
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
            chartRef.current = new Chart(ctx,
                {
                    type: 'line',
                    data: formatData(data),
                    options: {
                        responsive: true,
                        interaction: {
                            mode: 'index',
                            intersect: false,
                        },
                        plugins: {
                            legend: {
                                display: true,
                                labels: {
                                    padding: 20,
                                    boxHeight: 10,
                                    color: 'rgba(255, 255, 255, 0.8)',
                                    font: {
                                        size: 14,
                                    },
                                },
                            },
                            title: {
                                display: true,
                                text: 'Telemetry Data',
                            },
                        },
                        scales: {
                            y: {
                                title: {
                                    padding: { bottom: 20 },
                                    display: true,
                                    text: 'Humidity (%)',
                                },
                                type: 'linear',
                                display: true,
                                position: 'left',
                                grid: {
                                    color: 'rgba(255, 255, 255, 0.2)',
                                    drawOnChartArea: true,
                                },
                            },
                            y1: {
                                title: {
                                    padding: { bottom: 20 },
                                    display: true,
                                    text: 'Temperature (°C)',
                                },
                                type: 'linear',
                                display: true,
                                position: 'right',

                                // grid line settings
                                grid: {
                                    drawOnChartArea: false, // only want the grid lines for one axis to show up
                                },
                            },
                        }
                    }
                });
        }
    };

    useEffect(() => {
        if (props.creds) {
            (async () => {
                const records = await getTelemetryRecords(props.creds!!);
                setTelemetryRecords(records);
            })();
        };
    }, [props.creds]);

    const { tabId, index, children } = props;

    if (index === tabId) {
        return (
            <Page tabId={tabId} index={index}>
                <div className="Telemetry-chart-container">
                    <canvas ref={canvasCallback} className="Telemetry-chart-canvas"></canvas>
                </div>
                {children}
            </Page>
        )
    } else {
        return (
            <Page tabId={tabId} index={index}>
                {children}
            </Page>
        )
    }
}

export default TelemetryPage;