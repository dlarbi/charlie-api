import nodemailer from "nodemailer";

export type MailOptions = { to: string, from: string, subject: string, text: string };

export class GmailSend {
  private transporter: nodemailer.transporter;
  private mailOptions: MailOptions;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD
      }
    });
  }

  public setupOptions(options: MailOptions) {
    this.mailOptions = options;
  }

  public sendEmail() {
    this.transporter.sendMail(this.mailOptions, (error: nodemailer.error, info: nodemailer.info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  }
}