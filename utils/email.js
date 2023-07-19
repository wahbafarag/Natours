const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstname = user.name.split(' ')[0];
    this.url = url;
    this.from = `Natours Emails - ${process.env.USER}`;
  }
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.send.SENDGRID_USERNAME,
          pass: process.end.SENDGRID_PASSWORD,
        },
      });
    } else {
      return nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.USER,
          pass: process.env.PASS,
        },
        tls: { rejectUnauthorized: false },
      });
    }
  }
  // send the actual email
  async send(tmp, subject) {
    // 1 render the template
    const html = pug.renderFile(`${__dirname}/../views/emails/${tmp}.pug`, {
      firstname: this.firstname,
      url: this.url,
      subject,
    });
    // 2 define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };
    // 3 create a transport and send the email
    await this.newTransport().sendMail(mailOptions);
  }
  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }
  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your Password Reset token DO NOT share  it with anybody (valid for ONLY 10 MINS)'
    );
  }
};

// const sendEmail = async (options) => {
//   // create transporter
//   // const transporter = nodemailer.createTransport({
//   //   service: 'gmail',
//   //   host: 'smtp.gmail.com',
//   //   port: 465,
//   //   secure: true,
//   //   auth: {
//   //     user: process.env.USER,
//   //     pass: process.env.PASS,
//   //   },
//   //   tls: { rejectUnauthorized: false },
//   // });
//   // define email options
//   // const mailOptions = {
//   //   from: process.env.mailtrapUsername,
//   //   to: options.email,
//   //   subject: options.subject,
//   //   text: options.message,
//   // };
//   //send the email
//   await transporter.sendMail(mailOptions);
// };

// // module.exports = sendEmail;
