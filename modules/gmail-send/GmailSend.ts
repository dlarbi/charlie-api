const nodemailer = require('nodemailer');
export type MailOptions = { to: string, from: string, subject: string, text: string };

export class GmailSend {
  private transporter: any;
  private mailOptions: MailOptions;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: 'dean@willieai.com',
        pass: 'Postal9curse$swaN'
      }
    });
  }

  public setupOptions(options: MailOptions) {
    this.mailOptions = options;
  }

  public sendEmail() {
    this.transporter.sendMail(this.mailOptions, (error: any, info: any,) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  }
}