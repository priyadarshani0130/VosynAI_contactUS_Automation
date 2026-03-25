require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

// Report configuration
const reportHtmlPath = path.join(__dirname, 'qa_report.html');
const reportPdfPath = path.join(__dirname, 'qa_report.pdf');

// Function to convert HTML to PDF using Playwright headless browser
async function generatePdf() {
  if (!fs.existsSync(reportHtmlPath)) {
    console.log('⚠️ HTML report not found. Skipping PDF generation.');
    return false;
  }

  console.log('📄 Converting HTML report to PDF...');

  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Load the local HTML file - we construct the file url safely for windows
    const fileUrl = 'file:///' + reportHtmlPath.replace(/\\/g, '/');
    await page.goto(fileUrl, { waitUntil: 'networkidle' });

    // Generate PDF
    await page.pdf({
      path: reportPdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });

    await browser.close();
    console.log('✅ PDF generated successfully.');
    return true;
  } catch (err) {
    console.error('❌ Failed to create PDF:', err.message);
    return false;
  }
}

async function main() {
  // Validate env variables
  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.EMAIL_TO) {
    console.error('❌ Missing required environment variables. Please check your .env file.');
    console.log('Required: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_TO');
    process.exit(1);
  }

  console.log('🔄 Preparing automated QA test report...');

  // 1. Generate the PDF first
  const pdfGenerated = await generatePdf();

  // 2. Configure Nodemailer transporter based on your SMTP server
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS, // Passed automatically from your secure .env file
    },
  });

  // Verify connection configuration
  try {
    await transporter.verify();
    console.log('✅ Connected to SMTP server securely!');
  } catch (error) {
    console.error('❌ Error connecting to SMTP server - please check your email and password.', error);
    process.exit(1);
  }

  // 3. Create attachments array
  const attachments = [];

  if (pdfGenerated && fs.existsSync(reportPdfPath)) {
    attachments.push({
      filename: 'VOSYN_QA_Report.pdf',
      path: reportPdfPath,
      contentType: 'application/pdf'
    });
  } else if (fs.existsSync(reportHtmlPath)) {
    // Graceful fallback to sending HTML if PDF generation failed
    attachments.push({
      filename: 'VOSYN_QA_Report.html',
      path: reportHtmlPath
    });
  }

  // 4. Define email options
  let mailOptions = {
    from: `"VOSYN QA Automation" <${process.env.SMTP_USER}>`,
    to: process.env.EMAIL_TO,
    subject: `✅ VOSYN Contact Us - Automated QA Report - ${new Date().toLocaleDateString()}`,
    text: "The latest automated QA test run has completed. Please review the attached PDF report for full details.",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">VOSYN Automated QA execution complete</h2>
        <p>Your automated Playwright end-to-end tests for the Contact Us page have finished running.</p>
        <p>Please find the detailed <strong>QA Test Report</strong> attached to this email as a PDF document.</p>
        <br>
        <p style="color: #6B7280; font-size: 12px;">This message was generated automatically by your test pipeline.</p>
      </div>
    `,
    attachments: attachments
  };

  try {
    // 5. Send email
    let info = await transporter.sendMail(mailOptions);
    console.log('✅ Email successfully sent with PDF attached!');
  } catch (error) {
    console.error('❌ Failed to send email.', error);
    process.exit(1);
  }

  // 6. TRIGGER n8n WORKFLOW
  // This connects your Playwright tests to your n8n AI Analysis!
  if (process.env.N8N_WEBHOOK_URL) {
    console.log('🔄 Triggering n8n AI Analysis Workflow...');
    try {
      await fetch(process.env.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: "Playwright Automation",
          timestamp: new Date().toISOString()
        })
      });
      console.log('✅ Successfully triggered n8n workflow!');
    } catch (err) {
      console.log('⚠️ Could not trigger n8n:', err.message);
    }
  }
}

main().catch(console.error);
