import { triggerIncident, getOnCallTeam } from './opsgenie';
import api from '@forge/api';

jest.mock('@forge/api', () => ({
    fetch: jest.fn(),
    route: jest.fn()
}));

describe('Opsgenie Integration', () => {
    beforeEach(() => {
        process.env.OPSGENIE_API_KEY = 'test-key';
        jest.clearAllMocks();
    });

    describe('triggerIncident', () => {
        it('should call Opsgenie API with correct parameters', async () => {
            api.fetch.mockResolvedValue({
                ok: true,
                json: async () => ({ requestId: '123' })
            });

            const result = await triggerIncident('TEST-1', 'Test Incident');

            expect(api.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/alerts'),
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Authorization': 'GenieKey test-key'
                    })
                })
            );
            expect(result.success).toBe(true);
            expect(result.alertId).toBe('123');
        });

        it('should handle API errors', async () => {
            api.fetch.mockResolvedValue({
                ok: false,
                status: 400,
                statusText: 'Bad Request',
                text: async () => 'Invalid data'
            });

            const result = await triggerIncident('TEST-1', 'Test Incident');

            expect(result.success).toBe(false);
            expect(result.error).toContain('Opsgenie API Error');
        });
    });

    describe('getOnCallTeam', () => {
        it('should return on-call participants', async () => {
            api.fetch.mockResolvedValue({
                ok: true,
                json: async () => ({
                    data: {
                        onCallParticipants: [{ name: 'Alice' }, { name: 'Bob' }]
                    }
                })
            });

            const team = await getOnCallTeam('schedule-1');

            expect(team).toEqual(['Alice', 'Bob']);
        });
    });
});