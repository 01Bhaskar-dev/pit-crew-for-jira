import Resolver from '@forge/resolver';
import { triggerIncident, getOnCallTeam, addComment } from './backend/opsgenie';
import { getRovoSuggestions, draftPostIncidentReview } from './backend/rovo';
import { saveIncident, getRecentIncidents, updateIncidentStage } from './backend/history';
import { getAnalytics } from './backend/analytics';

const resolver = new Resolver();

resolver.define('triggerIncident', async (req) => {
    const { issueKey, message } = req.payload;
    const result = await triggerIncident(issueKey, message);

    // Save to history if successful
    if (result.success) {
        await saveIncident({
            issueKey,
            summary: message || 'Incident triggered',
            stage: 'Detection',
            status: 'active'
        });
    }

    return result;
});

resolver.define('getRovoSuggestions', async (req) => {
    const { issueKey } = req.payload;
    const suggestions = await getRovoSuggestions(issueKey);
    return { suggestions };
});

resolver.define('getOnCallTeam', async (req) => {
    const { issueKey } = req.payload;
    const team = await getOnCallTeam(issueKey);
    return { team };
});

resolver.define('draftPIR', async (req) => {
    const { issueKey, summary } = req.payload;
    const draft = await draftPostIncidentReview({ key: issueKey, summary });
    return { draft };
});

resolver.define('addComment', async (req) => {
    const { issueKey, comment } = req.payload;
    const result = await addComment(issueKey, comment);
    return result;
});

// New: Analytics endpoints
resolver.define('getAnalytics', async (req) => {
    const { projectKey } = req.payload;
    const analytics = await getAnalytics(projectKey);
    return analytics;
});

// New: History endpoints
resolver.define('getRecentIncidents', async (req) => {
    const { limit } = req.payload;
    const incidents = await getRecentIncidents(limit || 10);
    return { incidents };
});

resolver.define('updateIncidentStage', async (req) => {
    const { incidentId, stage } = req.payload;
    const result = await updateIncidentStage(incidentId, stage);
    return result;
});

export const handler = resolver.getDefinitions();