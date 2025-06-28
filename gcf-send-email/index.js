// Function to handle CORS preflight requests
function setCorsHeaders(res) {
  // IMPORTANT: Replace 'https://bela25art.github.io' with your actual GitHub Pages URL
  // If you also host your frontend on Google Cloud, you might need to add that URL here as well.
  res.setHeader('Access-Control-Allow-Origin', 'https://bela25art.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Added Authorization
  res.setHeader('Access-Control-Max-Age', '3600'); // Cache preflight for 1 hour
}

const nodemailer = require('nodemailer');

/**
 * HTTP Cloud Function that sends an email.
 * This function will replace your Vercel sendEmail.js.
 *
 * @param {object} req Cloud Function request context.
 * @param {object} res Cloud Function response context.
 */
exports.sendEmail = async (req, res) => {
  setCorsHeaders(res);

  // Handle preflight requests (browsers send an OPTIONS request before the actual POST)
  if (req.method === 'OPTIONS') {
    return res.status(200).send();
  }

  // Ensure the request method is POST
  if (req.method !== 'POST') {
    console.warn(`Method Not Allowed: Received ${req.method} request.`);
    return res.status(405).send('Method Not Allowed');
  }

  const { to, subject, body } = req.body;

  // Basic validation for required email parameters
  if (!to || !subject || !body) {
    console.error('Missing email parameters:', { to, subject, body: body ? 'body_present' : 'body_missing' });
    return res.status(400).json({ message: 'Missing email parameters (to, subject, or body).' });
  }

  // Configure the Nodemailer transporter using Gmail SMTP
  // Ensure GMAIL_USER and GMAIL_PASS are set as Environment Variables in your Cloud Function deployment
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
    console.log('Email sent successfully to:', to);
    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    // Log the error for debugging on the server side
    console.error('Error sending email from Cloud Function:', error);
    // Send an error response back to the frontend
    res.status(500).json({ message: 'Failed to send email from server', error: error.message });
  }
};
