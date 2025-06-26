import './Footer.css';

function Footer(props: any) {
    return (
        <div className='Footer'>{props.children}
            <div>Designed and built by Nakomis. Open-source <a href='https://creativecommons.org/public-domain/cc0/' target='_blank'>CC0</a> code available on <a href="https://nakom.is/mushroom-code" target='_blank'>Github</a>. Mushroom icons created by <a href='https://www.flaticon.com/free-icons/mushroom' title='mushroom icons'  target='_blank'>Freepik - Flaticon</a></div>
        </div>
    )
}

export default Footer;