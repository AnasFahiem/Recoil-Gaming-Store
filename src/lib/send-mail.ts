import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
})

type EmailPayload = {
    to: string
    subject: string
    html: string
}

export async function sendEmail({ to, subject, html }: EmailPayload) {
    try {
        if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
            console.warn("Gmail SMTP credentials missing. Email not sent.")
            return { success: false, error: 'Configuration missing' }
        }

        const info = await transporter.sendMail({
            from: `"RECOIL System" <${process.env.GMAIL_USER}>`,
            to,
            subject,
            html,
        })

        console.log("Email sent successfully:", info.messageId)
        return { success: true, messageId: info.messageId }
    } catch (error) {
        console.error("Error sending email:", error)
        return { success: false, error }
    }
}
