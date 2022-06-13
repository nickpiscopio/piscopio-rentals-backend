const nodemailer = require("nodemailer");

const email = require("../constants/email.js");
const encoderUtil = require("./EncoderUtil.js");

module.exports = class EmailUtil {
    static async sendEmailWithAttachment(attachmentName, attachmentLocation, fromDate, toDate) {
        const keatsLaneEmail = encoderUtil.decode(email.KEATS_LANE);
        const toEmailsAsStringList = String(encoderUtil.decodeList(email.TO_LIST));

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: keatsLaneEmail,
                // Documentation: https://stackoverflow.com/questions/72530276/nodemailergoogle-disabled-the-less-secure-app-option-on-google-accounts-i-woul
                pass: encoderUtil.decode(email.PASSWORD)
            }
        });
        
        const mailOptions = {
            from: keatsLaneEmail,
            to: toEmailsAsStringList,
            subject: '153 Keats Lane Rental: ' + fromDate + '–' + toDate,
            text: 'Attached is the filled out Short Term Rental form for 153 Keats Lane for ' + fromDate + ' to ' + toDate,
            attachments: [{
                filename: attachmentName,
                path: attachmentLocation,
                contentType: 'application/pdf'
            }]
        };
    
        return new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    reject(error);
                }
        
                resolve();
            });
        });
    }
}