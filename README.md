# VOSYN AI Automated QA Pipeline 🚀

Welcome! This system acts as a fully automated Quality Assurance (QA) tester for the VOSYN "Contact Us" page. It tests the website, emails a report, and uses Artificial Intelligence to find bugs—all by itself!

---

## 🌟 How the Magic Happens (Step-by-Step)

When we press "Start", here is exactly what happens in the background:

### Step 1: Automated Website Testing 
First, our testing script (Playwright) opens a hidden browser and automatically tests the Contact Us page just like a real user would. It checks to make sure everything loads and works correctly.

### Step 2: The Email Report
Once the tests finish, the system creates a formal PDF report of the results and automatically emails it directly to the QA team.

### Step 3: Waking up the AI (The Webhook)
The exact second the email is sent, the system sends a hidden "ping" (called a Webhook) over to our cloud platform, **n8n**. This tells n8n: *"Hey, the tests are done, go run the AI analysis!"*

### Step 4: Google Gemini AI Inspection
Inside n8n, the real magic happens:
- n8n downloads the live code of the Contact Us page.
- It hands that code directly to **Google Gemini 2.5 Flash** (a highly advanced AI).
- Gemini acts like an expert QA Engineer. It scans the page specifically hunting for SEO problems, bad links, missing tags, or confusing text.
- Gemini returns a formal list of 5 to 10 specific bugs it found.

### Step 5: Logging to Google Sheets
Finally, n8n takes Gemini's list of bugs and automatically adds them as brand-new rows into a centralized **Google Sheet**. The team can now open the Google Sheet to review the AI's bug report instantly!

---

## 🛠️ How to Run It

If you want to trigger this entire flow yourself, simply open your terminal, type this command, and press Enter:

```bash
npm run test
```

That's it! Everything else—the testing, the PDF email, the AI scanning, and the Google Sheets updating—happens completely automatically!
