# API Keys Setup Guide

To work with **real data**, you need two API keys:

## 1. OpenAI API Key (for Rovo AI Suggestions)

### How to Get It:
1. Go to https://platform.openai.com/signup
2. Create an account or sign in
3. Navigate to **API Keys**: https://platform.openai.com/api-keys
4. Click **"Create new secret key"**
5. Name it "Pit Crew Jira App"
6. **Copy the key immediately** (you won't see it again!)

### Cost:
- Pay-as-you-go pricing
- GPT-3.5-turbo is very cheap: ~$0.002 per API call
- For hackathon/demo: $5 credit should be enough

---

## 2. Opsgenie API Key (for Incident Management)

### How to Get It:
1. Go to https://www.atlassian.com/software/opsgenie
2. Sign up for a **free trial** (no credit card required)
3. After signup, go to **Settings** → **API key management**
4. Click **Add new API key**
5. Give it full access permissions
6. **Copy the API key**

### Free Trial:
- 14-day free trial
- Includes all features
- Enough for hackathon demo

---

## 3. Configure in Forge App

Once you have both keys, run:

```bash
# Set OpenAI API key
forge variables set --encrypt OPENAI_API_KEY

# Set Opsgenie API key
forge variables set --encrypt OPSGENIE_API_KEY
```

You'll be prompted to paste each key securely.

---

## 4. Deploy with Keys

After setting variables:

```bash
forge deploy
forge install --upgrade
```

The app will now work with **real data**:
- ✅ Real AI suggestions from OpenAI
- ✅ Real incident creation in Opsgenie
- ✅ Real on-call team retrieval

---

## Alternative: Use Environment Variables Locally

For testing locally with `forge tunnel`:

Create `.env` file (don't commit this!):
```
OPENAI_API_KEY=sk-...
OPSGENIE_API_KEY=...
```

---

## Ready to Proceed?

Once you have the keys, let me know and I'll help you:
1. Configure them in the app
2. Start the Custom UI migration
3. Test with real data
