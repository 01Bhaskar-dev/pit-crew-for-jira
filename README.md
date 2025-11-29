# Pit Crew for Jira 🏁

**AI-powered incident response assistant for Atlassian Jira.**

Built for **Atlassian Codegeist 2025**.

## 🚀 Overview
Pit Crew for Jira transforms chaotic incident management into a streamlined race to resolution. It brings AI-powered intelligence directly into Jira where your incidents already live.

## ✨ Key Features
- **🚨 Call Pit Crew**: Instantly trigger major incidents and alert the team.
- **🤖 AI Co-Pilot**: Google Gemini (v2.0 Flash) analyzes incidents and suggests investigation steps.
- **👥 Crew Status**: Real-time view of the on-call team based on Jira project permissions.
- **📋 Race Report**: Auto-generates Post-Incident Reviews (PIR) and saves them to comments.

## 🛠️ Tech Stack
- **Platform**: Atlassian Forge (Custom UI)
- **AI Model**: Google Gemini 2.0 Flash
- **Frontend**: React + Vite
- **Backend**: Node.js (Forge Runtime)

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/pit-crew-for-jira.git
   cd pit-crew-for-jira
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Register the Forge App**
   ```bash
   forge register
   ```

4. **Configure Secrets**
   You need a Google Gemini API Key.
   ```bash
   forge variables set GEMINI_API_KEY <your_gemini_api_key>
   ```

5. **Build & Deploy**
   ```bash
   # Build the frontend
   npx vite build

   # Deploy to Atlassian Cloud
   forge deploy
   ```

6. **Install in Jira**
   ```bash
   forge install
   ```

## 🏆 Hackathon Submission
This project was built for the Atlassian Codegeist 2025 Hackathon.

---
*Built with ❤️ and ☕ by the Pit Crew Team.*
