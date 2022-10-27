import queue from '../Bull.mjs';
import sendEmailProcess from '../processes/email.process.mjs';

const emailQueue = await queue('email-queue');
emailQueue.process(sendEmailProcess);

const addEmailQueue = (data) => {
  emailQueue.add(data);
};

export default addEmailQueue;
