import Mailer from '../../services/mailer.mjs';

const sendEmailProcess = async (job) => {
  await Mailer.sendMail(job.data);
};

export default sendEmailProcess;
