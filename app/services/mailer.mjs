import nodemailer from 'nodemailer';
import mjml2html from 'mjml';

const transporter = nodemailer.createTransport({
  service: process.env.MAIL_SERVICE,
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});
export default class Mailer {
  static async sendMail(params) {
    const {
      email, header, subject, message, body = [], sections = [],
    } = params;
    const { html } = mjml2html({
      tagName: 'mjml',
      attributes: {},
      children: [
        {
          tagName: 'mj-body',
          attributes: {},
          children: [
            {
              tagName: 'mj-section',
              attributes: {},
              children: [
                {
                  tagName: 'mj-column',
                  attributes: {},
                  children: [
                    {
                      tagName: 'mj-image',
                      attributes: {
                        src: 'https://next.salud.gob.sv/index.php/s/AHEMQ38JR93fnXQ/download',
                        width: '350px',
                      },
                    },
                    ...header,
                    {
                      tagName: 'mj-spacer',
                      attributes: {
                        'css-class': 'primary',
                      },
                    },
                    {
                      tagName: 'mj-divider',
                      attributes: {
                        'border-width': '3px',
                        'border-color': '#175efb',
                      },
                    },
                    {
                      tagName: 'mj-text',
                      attributes: {
                        align: 'center',
                        'font-weight': 'bold',
                        'font-size': '12px',
                      },
                      content: message,
                    },
                    ...body,
                  ],
                },
              ],
            },
            ...sections,
          ],
        },
      ],
    });

    const mailConfig = {
      from: `${process.env.SISTEM_NAME} <${process.env.MAIL_USER}>`,
      to: email,
      subject,
      html,
    };

    const send = await transporter.sendMail(mailConfig);
    return send;
  }
}
