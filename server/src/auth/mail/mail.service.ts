import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'localhost',
            port: Number(process.env.SMTP_PORT) || 1025,
            secure: false,
            auth: null,
        });
    }

    async sendActivationMail(to: string, link: string) {
        return this.transporter.sendMail({
            from: 'noreply@example.com', // Почта отправителя
            to, // Получатель
            subject: `Активация аккаунта на ${process.env.API_URL}`,
            text: '',
            html: `
                <div>
                    <h1>Для активации перейдите по ссылке:</h1>
                    <a href="${link}">${link}</a>
                </div>
            `,
        });
    }
}