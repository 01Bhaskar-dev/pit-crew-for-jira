import { storage } from '@forge/api';

const HISTORY_KEY = 'incident_history';
const MAX_HISTORY_ITEMS = 100;

/**
 * Save an incident to history
 */
export const saveIncident = async (incidentData) => {
    try {
        const history = await getHistory();

        const newIncident = {
            id: `incident_${Date.now()}`,
            issueKey: incidentData.issueKey,
            summary: incidentData.summary || 'Incident triggered',
            stage: incidentData.stage || 'Detection',
            timestamp: new Date().toISOString(),
            status: incidentData.status || 'active'
        };

        // Add to beginning of array
        history.unshift(newIncident);

        // Keep only the most recent MAX_HISTORY_ITEMS
        const trimmedHistory = history.slice(0, MAX_HISTORY_ITEMS);

        await storage.set(HISTORY_KEY, trimmedHistory);

        console.log('Incident saved to history:', newIncident);
        return { success: true, incident: newIncident };
    } catch (error) {
        console.error('Error saving incident to history:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get incident history
 */
export const getHistory = async () => {
    try {
        const history = await storage.get(HISTORY_KEY);
        return history || [];
    } catch (error) {
        console.error('Error retrieving history:', error);
        return [];
    }
};

/**
 * Update an incident's stage
 */
export const updateIncidentStage = async (incidentId, newStage) => {
    try {
        const history = await getHistory();
        const incidentIndex = history.findIndex(i => i.id === incidentId);

        if (incidentIndex !== -1) {
            history[incidentIndex].stage = newStage;
            history[incidentIndex].lastUpdated = new Date().toISOString();

            await storage.set(HISTORY_KEY, history);
            return { success: true };
        }

        return { success: false, error: 'Incident not found' };
    } catch (error) {
        console.error('Error updating incident stage:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get recent incidents (last N)
 */
export const getRecentIncidents = async (limit = 10) => {
    try {
        const history = await getHistory();
        return history.slice(0, limit);
    } catch (error) {
        console.error('Error getting recent incidents:', error);
        return [];
    }
};

/**
 * Clear old incidents (keep last N)
 */
export const cleanupHistory = async (keepCount = 50) => {
    try {
        const history = await getHistory();
        const trimmed = history.slice(0, keepCount);
        await storage.set(HISTORY_KEY, trimmed);
        return { success: true, removed: history.length - trimmed.length };
    } catch (error) {
        console.error('Error cleaning up history:', error);
        return { success: false, error: error.message };
    }
};
