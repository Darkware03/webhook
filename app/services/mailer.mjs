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
  static async sendMail(email = null, message = null, subject = null, header = '', customHtml = null) {
    let html = `
<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-image src="https://next.salud.gob.sv/index.php/s/AHEMQ38JR93fnXQ/download" width="350px"></mj-image>
            <mj-button width="80%" padding="5px 10px" font-size="20px" background-color="#175efb" border-radius="99px">
               <mj-text  align="center" font-weight="bold"  color="#ffffff" >
                 ${header}
              </mj-text>
           </mj-button>
        <mj-spacer css-class="primary"></mj-spacer>
        <mj-divider border-width="3px" border-color="#175efb" />
        <mj-text  align="center" font-weight="bold" font-size="17px">${message}</mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;
    if (customHtml !== null) html = customHtml;

    const formattedHtml = mjml2html(html, {});
    const mailConfig = {
      from: `${process.env.SISTEM_NAME} <${process.env.MAIL_USER}>`,
      to: email,
      subject,
      html: formattedHtml.html,
    };
    await transporter.sendMail(mailConfig, (error) => {
      if (error) {
        return false;
      }
      return true;
    });
  }
}
