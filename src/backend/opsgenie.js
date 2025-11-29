import api, { route } from '@forge/api';

// Using Jira Service Management native API instead of external Opsgenie
// This works directly with JSM incidents without needing external API keys

export const triggerIncident = async (issueKey, summary) => {
    console.log(`Creating JSM incident for ${issueKey}: ${summary}`);

    try {
        // Create a comment on the issue to simulate incident triggering
        // In a real JSM setup, you'd create an incident via JSM API
        const response = await api.asApp().requestJira(route`/rest/api/3/issue/${issueKey}/comment`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                body: {
                    type: 'doc',
                    version: 1,
                    content: [
                        {
                            type: 'paragraph',
                            content: [
                                {
                                    type: 'text',
                                    text: '🚨 INCIDENT TRIGGERED via Pit Crew',
                                    marks: [{ type: 'strong' }]
                                }
                            ]
                        },
                        {
                            type: 'paragraph',
                            content: [
                                {
                                    type: 'text',
                                    text: `Summary: ${summary}`
                                }
                            ]
                        },
                        {
                            type: 'paragraph',
                            content: [
                                {
                                    type: 'text',
                                    text: 'Priority: P1 - Immediate investigation required',
                                    marks: [{ type: 'em' }]
                                }
                            ]
                        }
                    ]
                }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('JSM API Error:', response.status, errText);
            return { success: false, error: `JSM API Error: ${response.status}` };
        }

        const data = await response.json();
        return {
            success: true,
            alertId: data.id,
            message: 'Incident comment created successfully in Jira'
        };
    } catch (error) {
        console.error('Trigger Incident Exception:', error);
        return { success: false, error: error.message };
    }
};

export const addComment = async (issueKey, commentBody) => {
    console.log(`Adding comment to ${issueKey}`);
    try {
        const response = await api.asApp().requestJira(route`/rest/api/3/issue/${issueKey}/comment`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                body: {
                    type: 'doc',
                    version: 1,
                    content: [
                        {
                            type: 'paragraph',
                            content: [
                                {
                                    type: 'text',
                                    text: commentBody
                                }
                            ]
                        }
                    ]
                }
            })
        });

        if (!response.ok) {
            console.error('Add Comment Error:', response.status);
            return { success: false, error: `Jira API Error: ${response.status}` };
        }

        return { success: true };
    } catch (error) {
        console.error('Add Comment Exception:', error);
        return { success: false, error: error.message };
    }
};

// eslint-disable-next-line no-unused-vars
export const getOnCallTeam = async (issueKey) => {
    console.log(`Fetching assignable users for ${issueKey}`);

    try {
        // Fetch users who can actually be assigned to this issue
        const response = await api.asApp().requestJira(route`/rest/api/3/user/assignable/search?issueKey=${issueKey}`, {
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('JSM Team Query Error:', response.status);
            return ['Error fetching team data from Jira'];
        }

        const users = await response.json();

        if (users && users.length > 0) {
            // Return first 5 active users as "on-call team"
            return users
                .filter(u => u.active)
                .slice(0, 5)
                .map(u => u.displayName || u.emailAddress);
        }

        return ['No active team members found'];

    } catch (error) {
        console.error('Get On Call Error:', error);
        return ['Error: ' + error.message];
    }
};
