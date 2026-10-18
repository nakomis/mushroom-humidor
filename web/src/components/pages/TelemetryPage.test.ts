// Chart.js and the page's CSS are irrelevant to the ordering logic under test
jest.mock('chart.js/auto', () => ({ Chart: jest.fn() }));
jest.mock('./TelemetryPage.css', () => ({}), { virtual: true });

import { toChartData } from './TelemetryPage';
import { TelemetryRecord } from '../../dto/TelemetryRecord';

const record = (timestamp: string, temperature: string, humidity: string): TelemetryRecord =>
    ({ messageType: 'telemetry', deviceId: 'd1', timestamp, temperature, humidity, ttl: 'immortal' });

describe('toChartData', () => {
    it('orders the chart oldest to newest even though records arrive newest first', () => {
        const newestFirst = [
            record('2026-10-03T00:00:00Z', '3', '30'),
            record('2026-10-02T00:00:00Z', '2', '20'),
            record('2026-10-01T00:00:00Z', '1', '10'),
        ];
        const data = toChartData(newestFirst);
        expect(data.map(d => d.date)).toEqual(['2026-10-01T00:00:00Z', '2026-10-02T00:00:00Z', '2026-10-03T00:00:00Z']);
        expect(data.map(d => d.temp)).toEqual([1, 2, 3]);
        expect(data.map(d => d.humidity)).toEqual([10, 20, 30]);
        expect(newestFirst[0].timestamp).toBe('2026-10-03T00:00:00Z');
    });
});
