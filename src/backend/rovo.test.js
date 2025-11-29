import { getRovoSuggestions, draftPostIncidentReview } from './rovo';
import api from '@forge/api';

jest.mock('@forge/api', () => ({
    fetch: jest.fn(),
    route: jest.fn()
}));

describe('Rovo Integration', () => {
    beforeEach(() => {
        process.env.GEMINI_API_KEY = 'test-key';
        jest.clearAllMocks();
    });

    describe('getRovoSuggestions', () => {
        it('should call Gemini API and return suggestions', async () => {
            api.fetch.mockResolvedValue({
                ok: true,
                json: async () => ({
                    candidates: [{
                        content: {
                            parts: [{
                                text: 'Suggestion 1\nSuggestion 2'
                            }]
                        }
                    }]
                })
            });

            const context = { platformContext: { issueKey: 'TEST-1' } };
            const suggestions = await getRovoSuggestions(context);

            expect(api.fetch).toHaveBeenCalledWith(
                expect.stringContaining('generativelanguage.googleapis.com'),
                expect.objectContaining({
                    method: 'POST'
                })
            );
            expect(suggestions).toEqual(['Suggestion 1', 'Suggestion 2']);
        });
    });

    describe('draftPostIncidentReview', () => {
        it('should call Gemini API and return draft', async () => {
            api.fetch.mockResolvedValue({
                ok: true,
                json: async () => ({
                    candidates: [{
                        content: {
                            parts: [{
                                text: '# PIR\nSummary...'
                            }]
                        }
                    }]
                })
            });

            const draft = await draftPostIncidentReview({ key: 'TEST-1', summary: 'Incident' });

            expect(draft).toContain('# PIR');
        });
    });
});
