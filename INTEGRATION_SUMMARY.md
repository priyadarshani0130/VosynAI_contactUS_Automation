# Integration Summary: Automated QA Pipeline 🔗

This document provides a high-level overview of how our testing suite, GitHub repository, and AI analysis (n8n) work together.

## 🔗 The Big Picture

| Component | Role | Technology |
| :--- | :--- | :--- |
| **Testing Engine** | Runs E2E tests on the "Contact Us" page. | Playwright (Node.js) |
| **Reporting** | Generates PDF results and emails the team. | Nodemailer + Playwright |
| **Version Control** | Maintains code history and collaboration. | GitHub |
| **AI Analysis** | Scans page for bugs using Gemini AI. | n8n + Google Gemini |
| **Final Logger** | Stores AI-found bugs for review. | Google Sheets |

## 🚀 Step-by-Step Process

1. **Local Test Run**: 
   - A developer or CI/CD runs `npm run test`.
   - Playwright validates the Contact Us form (inputs, submission, responsiveness).

2. **Email Delivery**: 
   - After tests finish, a PDF report is automatically generated.
   - The report is sent to the QA team's email.

3. **n8n Webhook Trigger**: 
   - `send_report.js` sends a secure "ping" (Webhook) to our n8n instance.
   - This ensures AI analysis only starts *after* the initial tests are confirmed.

4. **Gemini AI Inspection**: 
   - n8n fetches the latest live code of the website.
   - It sends the code to **Google Gemini 1.5 Flash**.
   - Gemini acts as an expert QA engineer, identifying SEO issues, link errors, and UX improvements.

5. **Google Sheets Log**: 
   - The bugs found by Gemini are appended as new rows in our centralized Google Sheet for tracking.

## 🛠️ Configuration
All sensitive configurations (SMTP credentials, Webhook URLs) are stored in the `.env` file. Never commit this file to GitHub.

---
**This pipeline ensures that every time we test, we get both functional validation (Playwright) and intelligent analysis (Gemini AI) automatically.**
