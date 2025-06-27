const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  // Set CORS headers to allow requests from your GitHub Pages domain
  res.setHeader('Access-Control-Allow-Origin', 'https://bela25art.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests (browsers send an OPTIONS request before the actual POST)
  if (req.method === 'OPTIONS') {
    return res.status(200).send();
  }

  // Ensure the request method is POST
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  const { to, subject, body } = req.body;

  // Basic validation for required email parameters
  if (!to || !subject || !body) {
    return res.status(400).json({ message: 'Missing email parameters (to, subject, or body).' });
  }

  // Configure the Nodemailer transporter using Gmail SMTP
  // Ensure GMAIL_USER and GMAIL_PASS are set as Environment Variables in your Vercel project
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Specifies using Gmail's SMTP server
    auth: {
      user: process.env.GMAIL_USER, // Your Gmail address (sender email)
      pass: process.env.GMAIL_PASS, // Your Gmail App Password (recommended for security)
    },
  });

  try {
    // Send the email
    await transporter.sendMail({
      from: `"Bela Art" <${process.env.GMAIL_USER}>`, // Sender display name and email address
      to,          // Recipient email address
      subject,     // Email subject
      html: body,   // HTML content for the email body
    });

    // Send a success response back to the frontend
    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    // Log the error for debugging on the server side
    console.error('Error sending email from Vercel function:', error);
    // Send an error response back to the frontend
    res.status(500).json({ message: 'Failed to send email from server', error: error.message });
  }
}
