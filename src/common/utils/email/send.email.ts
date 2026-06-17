import nodemailer from "nodemailer";
import { EMAIL, PASSWORD } from "../../../config/config.service";
import Mail from "nodemailer/lib/mailer";   
import e from "express";


export const sendEmail = async (mailOptions: Mail.Options) => {
    const trasporter = nodemailer.createTransport({
        host:"ixuhncvuhijnsdifjono.mailgun.org", 
        port:587,
        secure: false,
        auth: {
            user: EMAIL,
            pass: PASSWORD
        },
    
    })
    const info = await trasporter.sendMail({     
    from: '"Fred Foo 👻" <fredfoo@example.com>',
    to: mailOptions.to,
    subject: mailOptions.subject,
    html: mailOptions.html,
    attachments: mailOptions.attachments
})
console.log("Message sent: %s", info.messageId);
}
export const generateOTP = async (): Promise<string> => {
            const otp = Math.floor(100000 + Math.random() * 900000);
            return otp.toString();
        }


