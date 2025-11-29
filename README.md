# 🏎️ Pit Crew for Jira
### *Turn Incident Chaos into Choreography*

[![Built with Forge](https://img.shields.io/badge/Built%20with-Forge-blue)](https://developer.atlassian.com/platform/forge/)
[![Powered by Gemini](https://img.shields.io/badge/AI-Gemini%202.0%20Flash-8E75B2)](https://deepmind.google/technologies/gemini/)
[![Hackathon](https://img.shields.io/badge/Codegeist-2025-FF5630)](https://codegeist.devpost.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

> **"When production is on fire, every second counts."**

**Pit Crew for Jira** is an AI-powered incident response assistant built natively on Atlassian Forge. It eliminates the friction of context switching by bringing intelligent alerting, investigation, and documentation directly into your Jira issues.

---

## 📺 See It In Action
[![Watch the Demo](https://img.youtube.com/vi/https://youtube.com/shorts/XfgOyT-NlwQ?feature=share/0.jpg)](https://www.youtube.com/watch?v=https://youtube.com/shorts/XfgOyT-NlwQ?feature=share)
*(Click the image above to watch the 45-second demo!)*

---

## ✨ Key Features

### 🚨 1. Call Pit Crew (Instant Response)
Stop hunting for escalation procedures. With **one click**, trigger a major incident workflow directly from the issue.
- **What it does:** Logs a "Major Incident" alert in the comments and notifies the team.
- **Why it matters:** Reduces Time-to-Acknowledge (TTA) to zero.

### 🤖 2. AI Co-Pilot (Powered by Gemini 2.0 Flash)
Your intelligent sidekick that never sleeps.
- **Context-Aware:** Reads the issue summary, description, and comments in real-time.
- **Smart Suggestions:** Generates actionable investigation steps (e.g., "Check DB connection pool," "Verify recent deployments").
- **Tech:** Uses Google's latest **Gemini 2.0 Flash** model for sub-second responses.

### 👥 3. Crew Status (On-Call Visibility)
Know exactly who is in the pit lane.
- **Real-Time Data:** Fetches active users with assignable permissions for the specific project.
- **Instant Access:** No more asking "Who's on call?" in Slack. See your available engineers instantly.

### 📋 4. Race Report (Auto-PIR)
The race isn't over until the paperwork is done.
- **One-Click Documentation:** AI drafts a complete **Post-Incident Review (PIR)**.
- **Structured Output:** Includes Summary, Root Cause Analysis, and Recommended Actions.
- **Save to Jira:** Saves the report directly to the issue comments with proper formatting.

---

## 🚀 How to Use

1.  **Open an Issue**: Navigate to any Jira issue.
2.  **Launch Pit Crew**: Click the "Pit Crew" icon in the issue panel.
3.  **Take Action**:
    *   Click **🚨 Call Pit Crew** to alert the team.
    *   Click **🤖 AI Co-Pilot** to get investigation ideas.
    *   Click **👥 Crew Status** to see who can help.
    *   Click **📋 Race Report** to draft your retrospective.
4.  **Save & Close**: Use the "Save" button to commit the AI's findings to the official record.

---

## 🛠️ Installation & Setup

### Prerequisites
- Atlassian Forge CLI
- Node.js 20.x
- Google Gemini API Key

### Steps
1.  **Clone the repo**
    ```bash
    git clone https://github.com/01Bhaskar-dev/pit-crew-for-jira.git
    cd pit-crew-for-jira
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Secrets**
    ```bash
    forge register
    forge variables set GEMINI_API_KEY <your_api_key>
    ```

4.  **Deploy**
    ```bash
    # Build frontend
    npx vite build

    # Deploy to cloud
    forge deploy
    ```

5.  **Install**
    ```bash
    forge install
    ```

---

## 🏆 About the Project
Built for **Atlassian Codegeist 2025**.
*   **Theme:** "AI Apps for DevOps"
*   **Goal:** To make incident management as fast and coordinated as a Formula 1 pit stop.

---
*Built with ❤️ and ☕ by the Pit Crew Team.*
