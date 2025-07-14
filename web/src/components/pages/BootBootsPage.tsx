import { useEffect, useState } from "react";
import { CatadataRecord } from "../../dto/CatadataRecord";
import logo from '@images/mu.png';
import { PageProps } from "./Page";
import {
    Credentials as AWSCredentials,
} from "@aws-sdk/client-cognito-identity";
import { claimRecord, getCatadataRecords, getCatPicture } from "../../services/CatadataService";

type BootBootProps = PageProps & {
    creds: AWSCredentials | null,
    username: string | null;
};

const BootBootsPage = (props: BootBootProps) => {
    const [catadataRecords, setCatadataRecords] = useState<CatadataRecord[]>([]);
    const [currentRecord, setCurrentRecord] = useState<CatadataRecord | null>(null);
    const [catPicture, setCatPicture] = useState<string | null>(null);

    function getCatReviewer() {
        console.log("getCatReviewer called - catPicture:", !!catPicture);

        if (!catPicture) {
            return (
                <div style={{
                    backgroundColor: '#1f2329',
                    minHeight: '400px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '99%',
                    color: 'white'
                }}>
                    <p>Loading the next Kitty...</p>
                </div>
            );
        }

        const imgdiv = (
            <img className="img-fluid"
                id="cat-image"
                src={`${catPicture}`}
                alt="Cat"
                style={{
                    width: "99%",
                    height: "auto",
                    maxHeight: "400px",
                    objectFit: "contain"
                }}
                onLoad={() => {
                    setTimeout(function () {
                        document.getElementById("outerdiv")!.style.width = "100%";
                    }, 50);
                }}
            />
        )
        return (
            <div id="outerdiv" style={{
                backgroundColor: '#1f2329',
                padding: '20px',
                width: '99%',
                height: '80vh',
            }}>
                {imgdiv}
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        setCurrentRecord(null);
                        setCatPicture(null);
                    }}
                    style={{ width: '100px', height: '100px', backgroundColor: '#3b4048ff', border: 'none' }}
                >
                    <img src={logo} alt="Reset Cat" style={{ width: '100%', height: '100%' }} />
                </button>
            </div>
        )
    }

    useEffect(() => {
        if (props.creds) {
            (async () => {
                const records = await getCatadataRecords(props.creds!);
                setCatadataRecords(records);
            })();
        }
    }, [props.creds]);
    useEffect(() => {
        if (catadataRecords.length > 0 && currentRecord === null) {
            (async () => {
                const record = await claimRecord(catadataRecords, props.creds!, props.username || '');
                if (!record) {
                    console.error("No record claimed.");
                    return;
                }
                setCurrentRecord(record);
            })();
        }
    }, [catadataRecords]);
    useEffect(() => {
        if (currentRecord) {
            setCatPicture(null); // Clear the previous picture first
            (async () => {
                const pic = await getCatPicture(props.creds!, currentRecord);
                const url = await (new Response(pic)).blob().then(blob => {
                    return URL.createObjectURL(blob);
                });
                setCatPicture(url!);
            })();
        }
    }, [currentRecord]);

    const { tabId, index } = props;

    if (index === tabId) {
        return (
            <div className="page" style={{ width: '100%', height: '100%' }}>
                {getCatReviewer()}
            </div>
        )
    } else {
        return <div />
    }
}
export default BootBootsPage;