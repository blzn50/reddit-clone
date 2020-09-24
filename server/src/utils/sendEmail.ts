import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_KEY);

export async function sendMail(to: string, html: string) {
  const msg = {
    to: to,
    from: 'no-reply@minireddit.com',
    subject: 'Reset password',
    html,
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.log(error);
    if (error.response) {
      console.log(error.response.body);
    }
  }
}
