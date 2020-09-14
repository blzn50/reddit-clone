import sgMail from '@sendgrid/mail';
import { SENDGRID_KEY } from '../constants';

sgMail.setApiKey(SENDGRID_KEY);

export async function sendMail(to: string, html: string) {
  const msg = {
    to: to,
    from: 'blazeraze.naren@gmail.com',
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
