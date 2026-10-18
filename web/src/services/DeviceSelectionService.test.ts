import {
    ALL_DEVICES,
    filterByDevice,
    getDeviceIds,
    loadSelectedDevice,
    saveSelectedDevice,
} from './DeviceSelectionService';

describe('getDeviceIds', () => {
    it('returns the distinct deviceIds across all record lists, sorted', () => {
        const telemetry = [{ deviceId: 'd2' }, { deviceId: 'd1' }, { deviceId: 'd2' }];
        const commands = [{ deviceId: 'd3' }, { deviceId: 'd1' }];
        expect(getDeviceIds(telemetry, commands)).toEqual(['d1', 'd2', 'd3']);
    });

    it('ignores records without a deviceId', () => {
        expect(getDeviceIds([{ deviceId: '' }, { deviceId: 'd1' }])).toEqual(['d1']);
    });

    it('returns an empty list when there are no records', () => {
        expect(getDeviceIds([], [])).toEqual([]);
    });
});

describe('filterByDevice', () => {
    const records = [{ deviceId: 'd1', n: 1 }, { deviceId: 'd2', n: 2 }, { deviceId: 'd1', n: 3 }];

    it('returns every record when all devices are selected', () => {
        expect(filterByDevice(records, ALL_DEVICES)).toBe(records);
    });

    it('returns only the selected device\'s records', () => {
        expect(filterByDevice(records, 'd1').map(r => r.n)).toEqual([1, 3]);
    });

    it('returns nothing for a device with no records', () => {
        expect(filterByDevice(records, 'd9')).toEqual([]);
    });
});

describe('selected device persistence', () => {
    beforeEach(() => window.localStorage.clear());

    it('defaults to all devices', () => {
        expect(loadSelectedDevice()).toBe(ALL_DEVICES);
    });

    it('remembers the selected device', () => {
        saveSelectedDevice('d1');
        expect(loadSelectedDevice()).toBe('d1');
    });

    it('forgets the device when all devices is selected again', () => {
        saveSelectedDevice('d1');
        saveSelectedDevice(ALL_DEVICES);
        expect(loadSelectedDevice()).toBe(ALL_DEVICES);
    });
});
