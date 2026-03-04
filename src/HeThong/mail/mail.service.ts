import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) { }
    async sendNewUser(obj: { emailTo, subject, name, code, cccd }, lang = 'en') {
        console.log(obj.name);
        await this.mailerService.sendMail({
            to: obj.emailTo,
            // from: '"WOSS"', // override default from
            subject: obj.subject,
            template: `./new-user.${lang}.hbs`, // `.hbs` extension is appended automatically
            context: { // filling curly brackets with content
                name: obj.name,
                code: obj.code,
                cccd: obj.cccd,
            },
        });
    }
    async sendNewPassword(obj: { emailTo, subject, name, code, sdt }, lang = 'en') {
        console.log(obj.name);
        await this.mailerService.sendMail({
            to: obj.emailTo,
            // from: '"WOSS"', // override default from
            subject: obj.subject,
            template: `./forgot-password.${lang}.hbs`, // `.hbs` extension is appended automatically
            context: { // filling curly brackets with content
                name: obj.name,
                code: obj.code,
                sdt: obj.sdt,
            },
        });
    }

    async sendUnlockCode(obj: { emailTo, subject, name, code }) {
        console.log('Sending unlock code to:', obj.emailTo);
        await this.mailerService.sendMail({
            to: obj.emailTo,
            subject: obj.subject,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Mở khóa tài khoản</h2>
                    <p>Xin chào <strong>${obj.name}</strong>,</p>
                    <p>Bạn đã yêu cầu mở khóa tài khoản. Mã xác nhận của bạn là:</p>
                    <div style="background: #f4f4f4; padding: 20px; margin: 20px 0; text-align: center;">
                        <h1 style="color: #007bff; font-size: 32px; margin: 0;">${obj.code}</h1>
                    </div>
                    <p>Vui lòng nhập mã này để mở khóa tài khoản của bạn.</p>
                    <p>Mã có hiệu lực trong 15 phút.</p>
                    <hr style="margin: 30px 0;">
                    <p style="color: #666; font-size: 12px;">
                        Đây là email tự động, vui lòng không trả lời email này.<br>
                        LIÊN ĐOÀN LAO ĐỘNG TỈNH BẮC NINH
                    </p>
                </div>
            `
        });
    }

}
