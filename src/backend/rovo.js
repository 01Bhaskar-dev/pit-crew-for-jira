import api, { route } from '@forge/api';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const getHeaders = () => ({
    'Content-Type': 'application/json'
});

const getIssueDetails = async (issueKey) => {
    try {
        const response = await api.asApp().requestJira(route`/rest/api/3/issue/${issueKey}`, {
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.error(`Failed to fetch issue ${issueKey}: ${response.status}`);
            return null;
        }

        const data = await response.json();
        return {
            summary: data.fields.summary,
            description: data.fields.description ?
                (typeof data.fields.description === 'string' ? data.fields.description : JSON.stringify(data.fields.description))
                : 'No description provided'
        };
    } catch (error) {
        console.error('Error fetching issue details:', error);
        return null;
    }
};

const askAI = async (systemPrompt, userPrompt) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('Missing GEMINI_API_KEY');
    }

    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    const response = await api.fetch(`${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: fullPrompt
                }]
            }],
            safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
            ]
        })
    });

    if (!response.ok) {
        const errText = await response.text();
        console.error('Gemini API Error:', response.status, errText);
        console.error('Request URL:', `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY ? '[KEY_SET]' : '[KEY_MISSING]'}`);
        console.error('Response headers:', JSON.stringify([...response.headers]));
        throw new Error(`Gemini API Error: ${response.status} - ${errText.substring(0, 200)}`);
    }

    const data = await response.json();
    console.log('Gemini Response:', JSON.stringify(data));

    if (!data.candidates || data.candidates.length === 0) {
        return "Error: No AI candidates returned. (Check logs)";
    }

    const candidate = data.candidates[0];
    if (candidate.finishReason !== 'STOP' && candidate.finishReason !== undefined) {
        return `Error: AI generation stopped. Reason: ${candidate.finishReason}`;
    }

    if (!candidate.content || !candidate.content.parts || !candidate.content.parts[0].text) {
        return "Error: AI returned empty content.";
    }

    return candidate.content.parts[0].text;
};

export const getRovoSuggestions = async (issueKey) => {
    console.log(`[DEBUG] getRovoSuggestions called for ${issueKey}`);
    console.log(`[DEBUG] API Key present: ${!!process.env.GEMINI_API_KEY}`);

    try {
        const issueDetails = await getIssueDetails(issueKey);

        const contextText = issueDetails
            ? `Incident: ${issueDetails.summary}\nDescription: ${issueDetails.description}`
            : `Incident Key: ${issueKey}`;

        const prompt = `You are analyzing this production incident:

INCIDENT: ${issueDetails?.summary || issueKey}
DETAILS: ${issueDetails?.description || 'No details provided'}

Provide STRUCTURED troubleshooting guidance in this EXACT format:

🔍 IMMEDIATE CHECKS:
• First check action
• Second check action
• Third check action

🔧 TROUBLESHOOTING STEPS:
1. Step one with specific action
2. Step two with specific action
3. Step three with specific action

💡 LIKELY CAUSES:
• Most common cause
• Second likely cause
• Third possibility

Keep each point SHORT (one line) and ACTION-ORIENTED. Use simple language.`;

        const result = await askAI("You are an expert Site Reliability Engineer providing clear, structured incident response guidance.", prompt);

        // Return as single formatted string for better display
        return [result];
    } catch (error) {
        console.error('Rovo Suggestions Error:', error);
        return [`Error: ${error.message}`];
    }
};

export const draftPostIncidentReview = async (incidentData) => {
    console.log('Drafting PIR with AI...');
    try {
        const issueDetails = await getIssueDetails(incidentData.key);

        const summary = issueDetails ? issueDetails.summary : incidentData.summary;
        const description = issueDetails ? issueDetails.description : 'N/A';

        const prompt = `Create a clear Post-Incident Review for this incident:

INCIDENT KEY: ${incidentData.key}
ISSUE: ${summary}
DESCRIPTION: ${description}

Format the PIR in this EXACT structure:

## 📋 INCIDENT SUMMARY
Brief overview of what happened (2-3 sentences)

## ⏱️ TIMELINE
• HH:MM - Detection: Issue first noticed
• HH:MM - Investigation: Team started analysis  
• HH:MM - Mitigation: Initial fix applied
• HH:MM - Resolution: Service restored

## 🔍 ROOT CAUSE
Clear explanation of what caused the incident (2-3 sentences)

## ✅ RESOLUTION STEPS
1. First action taken
2. Second action taken
3. Third action taken

## 🛡️ PREVENTION ACTIONS
• Action to prevent recurrence #1
• Action to prevent recurrence #2
• Action to prevent recurrence #3

Keep it CONCISE and ACTION-ORIENTED. Use simple, clear language.`;

        return await askAI("You are an expert SRE creating professional post-incident documentation.", prompt);
    } catch (error) {
        console.error('PIR Draft Error:', error);
        return `Error generating PIR: ${error.message}`;
    }
};
