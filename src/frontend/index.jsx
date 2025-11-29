import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { invoke, view } from '@forge/bridge';
import './index.css';

// Analytics Dashboard Component
const AnalyticsDashboard = ({ analytics }) => {
    if (!analytics) {
        return <div className="loading">Loading analytics...</div>;
    }

    const { overview, performance, distribution } = analytics;

    return (
        <div className="analytics-container">
            <h2>📊 Incident Analytics</h2>

            {/* Overview Cards */}
            <div className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-value">{overview.totalIncidents}</div>
                    <div className="metric-label">Total Incidents</div>
                </div>
                <div className="metric-card">
                    <div className="metric-value">{overview.weekIncidents}</div>
                    <div className="metric-label">This Week</div>
                </div>
                <div className="metric-card">
                    <div className="metric-value">{overview.activeIncidents}</div>
                    <div className="metric-label">Active Now</div>
                </div>
                <div className="metric-card">
                    <div className="metric-value">{performance.avgResolutionHours}h</div>
                    <div className="metric-label">Avg Resolution</div>
                </div>
            </div>

            {/* Top Incident Types */}
            <div className="chart-section">
                <h3>Top Incident Types</h3>
                <div className="bar-chart">
                    {distribution.topTypes.map((item, index) => (
                        <div key={index} className="bar-item">
                            <div className="bar-label">{item.type}</div>
                            <div className="bar-container">
                                <div
                                    className="bar-fill"
                                    style={{ width: `${(item.count / overview.totalIncidents) * 100}%` }}
                                >
                                    {item.count}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Stage Distribution */}
            <div className="chart-section">
                <h3>Incident Lifecycle Stages</h3>
                <div className="stage-chart">
                    {Object.entries(distribution.stageDistribution).map(([stage, count]) => (
                        <div key={stage} className="stage-item">
                            <div className="stage-name">{stage}</div>
                            <div className="stage-count">{count}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Incident History Component
const IncidentHistory = ({ incidents, onRefresh }) => {
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    const getStageIcon = (stage) => {
        const icons = {
            Detection: '🔍',
            Diagnosis: '🔬',
            Fix: '🔧',
            Recovery: '✅'
        };
        return icons[stage] || '📋';
    };

    return (
        <div className="history-container">
            <div className="history-header">
                <h2>📜 Recent Pit Stops</h2>
                <button className="refresh-btn" onClick={onRefresh}>
                    🔄 Refresh
                </button>
            </div>

            <div className="timeline">
                {incidents.length === 0 ? (
                    <div className="empty-state">
                        <p>No incidents recorded yet.</p>
                        <p>Trigger an incident from the Control tab to get started!</p>
                    </div>
                ) : (
                    incidents.map((incident) => (
                        <div key={incident.id} className="timeline-item">
                            <div className="timeline-marker">
                                <div className="timeline-icon">{getStageIcon(incident.stage)}</div>
                            </div>
                            <div className="timeline-content">
                                <div className="timeline-header">
                                    <span className="issue-link">{incident.issueKey}</span>
                                    <span className="timeline-time">{formatTime(incident.timestamp)}</span>
                                </div>
                                <div className="timeline-summary">{incident.summary}</div>
                                <div className="timeline-footer">
                                    <span className={`stage-badge stage-${incident.stage.toLowerCase()}`}>
                                        {incident.stage}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// Main App Component
const PitCrewApp = () => {
    const [issueKey, setIssueKey] = useState('');
    const [projectKey, setProjectKey] = useState('');
    const [stage, setStage] = useState('Detection');
    const [status, setStatus] = useState('');
    const [rovoSuggestions, setRovoSuggestions] = useState([]);
    const [onCallTeam, setOnCallTeam] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('main');
    const [analytics, setAnalytics] = useState(null);
    const [recentIncidents, setRecentIncidents] = useState([]);

    const stages = ['Detection', 'Diagnosis', 'Fix', 'Recovery'];

    useEffect(() => {
        // Initialize Forge Bridge Context
        view.getContext().then((context) => {
            setIssueKey(context.extension.issue.key);
            // Extract project key from issue key (e.g., "PROJ-123" -> "PROJ")
            const projKey = context.extension.issue.key.split('-')[0];
            setProjectKey(projKey);

            // Load analytics and history
            loadAnalytics(projKey);
            loadRecentIncidents();
        });
    }, []);

    const loadAnalytics = async (projKey) => {
        const data = await callBackend('getAnalytics', { projectKey: projKey });
        setAnalytics(data);
    };

    const loadRecentIncidents = async () => {
        const data = await callBackend('getRecentIncidents', { limit: 10 });
        if (data.incidents) {
            setRecentIncidents(data.incidents);
        }
    };

    const callBackend = async (functionName, payload) => {
        setLoading(true);
        try {
            // Use Forge Bridge invoke
            const result = await invoke(functionName, payload);
            return result;
        } catch (error) {
            console.error('Backend call failed:', error);
            return { error: error.message };
        } finally {
            setLoading(false);
        }
    };

    const handleTriggerIncident = async () => {
        setStatus('🚨 Triggering Opsgenie incident...');
        const result = await callBackend('triggerIncident', {
            issueKey,
            message: 'Incident detected via Pit Crew'
        });

        if (result.success) {
            setStatus(`✅ Alert Created: ${result.alertId}`);
            setStage('Diagnosis');
            // Reload history to show new incident
            await loadRecentIncidents();
            await loadAnalytics(projectKey);
        } else {
            setStatus(`❌ Error: ${result.error}`);
        }
    };

    const handleGetSuggestions = async () => {
        setStatus('🤖 Asking Rovo AI for help...');
        const result = await callBackend('getRovoSuggestions', { issueKey });

        if (result.suggestions) {
            setRovoSuggestions(result.suggestions);
            setStatus('✅ AI suggestions ready!');
        } else {
            setStatus(`❌ Error: ${result.error}`);
        }
    };

    const handleGetOnCall = async () => {
        setStatus('👥 Fetching on-call crew...');
        const result = await callBackend('getOnCallTeam', {
            issueKey
        });

        if (result.team) {
            setOnCallTeam(result.team.length ? result.team : ['No on-call data']);
            setStatus('✅ Crew roster loaded!');
        } else {
            setStatus(`❌ Error: ${result.error}`);
        }
    };

    const handleDraftPIR = async () => {
        setStatus('📋 Drafting Post-Incident Review...');
        const result = await callBackend('draftPIR', {
            issueKey
        });

        if (result.draft) {
            setRovoSuggestions([result.draft]);
            setStatus('✅ PIR drafted successfully!');
            setStage('Recovery');
        } else {
            setStatus(`❌ Error: ${result.error}`);
        }
    };

    const handleSavePIR = async () => {
        if (!rovoSuggestions.length) return;

        setStatus('💾 Saving to Jira comments...');
        setLoading(true);

        const commentText = `h2. 🏁 Pit Crew Race Report (PIR)\\n\\n${rovoSuggestions[0]}`;

        const result = await callBackend('addComment', {
            issueKey,
            comment: commentText
        });

        if (result.success) {
            setStatus('✅ Race Report Saved to Issue!');
        } else {
            setStatus(`❌ Save Failed: ${result.error}`);
        }
        setLoading(false);
    };

    const getStageIndex = (stageName) => stages.indexOf(stageName);
    const currentStageIndex = getStageIndex(stage);
    const progressPercent = (currentStageIndex / (stages.length - 1)) * 100;

    return (
        <div className="pit-crew-container">
            {/* Header */}
            <div className="pit-crew-header">
                <h1>🏁 Pit Crew Command</h1>
                <div className="issue-key">{issueKey || 'Loading...'}</div>
            </div>

            {/* Tab Navigation */}
            <div className="tab-navigation">
                <button
                    className={`tab-btn ${activeTab === 'main' ? 'active' : ''}`}
                    onClick={() => setActiveTab('main')}
                >
                    🏎️ Control
                </button>
                <button
                    className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
                    onClick={() => setActiveTab('analytics')}
                >
                    📊 Analytics
                </button>
                <button
                    className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    📜 History
                </button>
            </div>

            {/* Main Tab Content */}
            {activeTab === 'main' && (
                <div className="tab-content">
                    {/* Race Track Progress */}
                    <div className="race-track">
                        <h2>🏎️ Incident Race Track</h2>
                        <div className="track-progress">
                            <div className="track-line">
                                <div
                                    className="progress-bar"
                                    style={{ width: `${progressPercent}%` }}
                                ></div>
                            </div>
                            {stages.map((stageName, index) => (
                                <div
                                    key={stageName}
                                    className={`stage ${index < currentStageIndex ? 'completed' : ''} ${index === currentStageIndex ? 'active' : ''}`}
                                >
                                    <div className="stage-icon">
                                        {index < currentStageIndex ? '✓' :
                                            index === currentStageIndex ? '🏎️' : index + 1}
                                    </div>
                                    <div className="stage-name">{stageName}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pit-crew-actions">
                        <div className="action-grid">
                            <button
                                className="action-btn"
                                onClick={handleTriggerIncident}
                                disabled={loading}
                            >
                                <span className="btn-icon">🚨</span>
                                <div className="btn-label">Call Pit Crew</div>
                                <div className="btn-description">Trigger Major Incident</div>
                            </button>
                            <button
                                className="action-btn"
                                onClick={handleGetSuggestions}
                                disabled={loading}
                            >
                                <span className="btn-icon">🤖</span>
                                <div className="btn-label">AI Co-Pilot</div>
                                <div className="btn-description">Get Rovo Suggestions</div>
                            </button>
                            <button
                                className="action-btn"
                                onClick={handleGetOnCall}
                                disabled={loading}
                            >
                                <span className="btn-icon">👥</span>
                                <div className="btn-label">Crew Status</div>
                                <div className="btn-description">Check On-Call Team</div>
                            </button>
                            <button
                                className="action-btn"
                                onClick={handleDraftPIR}
                                disabled={loading}
                            >
                                <span className="btn-icon">📋</span>
                                <div className="btn-label">Race Report</div>
                                <div className="btn-description">Draft Incident Review</div>
                            </button>
                        </div>
                    </div>

                    {/* Status Display */}
                    {status && (
                        <div className={`status-display ${status.includes('✅') ? 'success' : status.includes('❌') ? 'error' : ''}`}>
                            <div className="status-label">System Status</div>
                            <div className="status-content">{status}</div>
                        </div>
                    )}

                    {/* Loading */}
                    {loading && (
                        <div className="loading">
                            <div className="spinner"></div>
                            <div>Pit Crew is working...</div>
                        </div>
                    )}

                    {/* Rovo Suggestions */}
                    {rovoSuggestions.length > 0 && (
                        <div className="results-panel">
                            <h3>🤖 AI Analysis Results</h3>
                            {rovoSuggestions.map((suggestion, index) => (
                                <div key={index} className="result-item">{suggestion}</div>
                            ))}

                            {/* Only show Save button if it looks like a PIR (long text) */}
                            {rovoSuggestions[0].length > 100 && (
                                <button className="save-btn" onClick={handleSavePIR}>
                                    💾 Save Report to Jira Comments
                                </button>
                            )}
                        </div>
                    )}

                    {/* On-Call Team */}
                    {onCallTeam.length > 0 && (
                        <div className="results-panel">
                            <h3>👥 Active Pit Crew</h3>
                            {onCallTeam.map((person, index) => (
                                <div key={index} className="result-item">
                                    <span style={{ marginRight: '8px' }}>🔧</span>
                                    {person}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Analytics Tab Content */}
            {activeTab === 'analytics' && (
                <div className="tab-content">
                    <AnalyticsDashboard analytics={analytics} />
                </div>
            )}

            {/* History Tab Content */}
            {activeTab === 'history' && (
                <div className="tab-content">
                    <IncidentHistory
                        incidents={recentIncidents}
                        onRefresh={loadRecentIncidents}
                    />
                </div>
            )}
        </div>
    );
};

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<PitCrewApp />);
