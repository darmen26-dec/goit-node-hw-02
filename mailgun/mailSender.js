const formData = require('form-data');
const Mailgun = require('mailgun.js');
const dotenv = require('dotenv');

dotenv.config();

const { API_KEY, DOMAIN, SENDER_EMAIL } = process.env;

const mailgun = new Mailgun(formData);
const client = mailgun.client({ username: 'api', key: API_KEY });

const sendVerificationEmail = async ({ email, verificationToken }) => {
  const verificationLink = `${process.env.BASE_URL}/users/verify/${verificationToken}`;

  const messageData = {
    from: `Excited User <${SENDER_EMAIL}>`,
    to: `<${email}>`,
    subject: 'Please verify your email',
    html: `<b>Verify your email:</b><br><a href="${verificationLink}">${email}</a>`,
  };

  try {
    const res = await client.messages.create(DOMAIN, messageData);
    console.log(res);
  } catch (error) {
    console.error(error);
  }
};

module.exports = sendVerificationEmail;
