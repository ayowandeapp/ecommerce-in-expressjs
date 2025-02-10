const nodemailer = require('nodemailer')
require('dotenv').config()


const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // Use true for port 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Function to send mail

const sendMail = async (to, subject, text, html) => {
    try {
        let info = await transporter.sendMail({
            from: `"App Name" <${process.env.SMTP_USER}>`, 
            to, 
            subject, 
            text, 
            html 
        });

        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = sendMail;
