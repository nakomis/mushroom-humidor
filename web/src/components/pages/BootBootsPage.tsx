import { useEffect, useState } from "react";
import { CatadataRecord } from "../../dto/CatadataRecord";
import mu from '../../images/mu.png';
import tau from '../../images/tau.png';
import chi from '../../images/chi.png';
import kappa from '../../images/kappa.png';
import boots from '../../images/boots.png';
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
                        document.getElementById("outerdiv")!.style.width = "99%";
                        setTimeout(function () {
                            document.getElementById("outerdiv")!.style.width = "100%";
                        }, 50);
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
                        clickCat("Mu")
                    }}
                    style={{ width: '100px', height: '100px', backgroundColor: '#3b4048ff', border: 'none' }}
                >
                    <img src={mu} alt="Mu" style={{ width: '100%', height: '100%' }} />
                </button>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        clickCat("Tau");
                    }}
                    style={{ width: '100px', height: '100px', backgroundColor: '#3b4048ff', border: 'none' }}
                >
                    <img src={tau} alt="Tau" style={{ width: '100%', height: '100%' }} />
                </button>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        clickCat("Chi");
                    }}
                    style={{ width: '100px', height: '100px', backgroundColor: '#3b4048ff', border: 'none' }}
                >
                    <img src={chi} alt="Chi" style={{ width: '100%', height: '100%' }} />
                </button>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        clickCat("Kappa");
                    }}
                    style={{ width: '100px', height: '100px', backgroundColor: '#3b4048ff', border: 'none' }}
                >
                    <img src={kappa} alt="Kappa" style={{ width: '100%', height: '100%' }} />
                </button>
                <br></br>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        clickCat("Boots");
                    }}
                    style={{ width: '200px', height: '100px', backgroundColor: '#3b4048ff', border: 'none' }}
                >
                    <img src={boots} alt="Boots" style={{ width: '50%', height: '100%' }} />
                </button>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        clickCat("NoCat");
                    }}
                    style={{ width: '200px', height: '100px', backgroundColor: '#3b4048ff', border: 'none' }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="currentColor" className="bi bi-trash-fill" viewBox="0 0 16 16">
                        <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0" />
                    </svg>
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

    function clickCat(cat: string) {
        setCurrentRecord(null);
        setCatPicture(null);
        (async () => {
            const records = await getCatadataRecords(props.creds!);
            setCatadataRecords(records);
        })();
    }

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