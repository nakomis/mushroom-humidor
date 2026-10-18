import { ALL_DEVICES } from "../services/DeviceSelectionService";

type DeviceSelectorProps = {
    deviceIds: string[];
    selectedDevice: string;
    onChange: (deviceId: string) => void;
};

const DeviceSelector = (props: DeviceSelectorProps) => {
    const { deviceIds, selectedDevice, onChange } = props;
    // Keep a remembered device selectable even if none of the loaded records mention it
    const options = selectedDevice !== ALL_DEVICES && !deviceIds.includes(selectedDevice)
        ? [...deviceIds, selectedDevice]
        : deviceIds;

    return (
        <select
            className="form-select form-select-sm bg-dark text-light"
            aria-label="Device"
            style={{ width: 'auto', marginRight: 10, alignSelf: "center" }}
            value={selectedDevice}
            onChange={(event) => onChange(event.target.value)}
        >
            <option value={ALL_DEVICES}>All devices</option>
            {options.map(deviceId => (
                <option key={deviceId} value={deviceId}>{deviceId}</option>
            ))}
        </select>
    );
}

export default DeviceSelector;
