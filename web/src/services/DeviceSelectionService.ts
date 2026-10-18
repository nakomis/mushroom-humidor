/**
 * Selecting which device the pages show (MUSH-17). There is no device registry: the selectable
 * devices are the distinct deviceIds found in the telemetry and command records already scanned.
 */

/** Selector value meaning "don't filter by device". */
export const ALL_DEVICES = '';

const STORAGE_KEY = 'mushroom-humidor.selectedDevice';

type DeviceRecord = { deviceId: string };

/** Returns the distinct deviceIds across the given record lists, sorted. */
export const getDeviceIds = (...recordLists: DeviceRecord[][]): string[] => {
    const ids = new Set<string>();
    recordLists.forEach(records => records.forEach(record => {
        if (record.deviceId) {
            ids.add(record.deviceId);
        }
    }));
    return Array.from(ids).sort();
};

/** Returns the records for the selected device, or all records when ALL_DEVICES is selected. */
export const filterByDevice = <T extends DeviceRecord>(records: T[], deviceId: string): T[] =>
    deviceId === ALL_DEVICES ? records : records.filter(record => record.deviceId === deviceId);

export const loadSelectedDevice = (): string => {
    try {
        return window.localStorage.getItem(STORAGE_KEY) ?? ALL_DEVICES;
    } catch {
        return ALL_DEVICES;
    }
};

export const saveSelectedDevice = (deviceId: string) => {
    try {
        if (deviceId === ALL_DEVICES) {
            window.localStorage.removeItem(STORAGE_KEY);
        } else {
            window.localStorage.setItem(STORAGE_KEY, deviceId);
        }
    } catch {
        // localStorage can be unavailable (e.g. private browsing); the choice just won't persist
    }
};
