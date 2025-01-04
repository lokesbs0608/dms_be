const nodemailer = require('nodemailer');

// Create a transporter using SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use other services like Outlook, Yahoo, etc.
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});





module.exports = { transporter }
