/* eslint-disable no-underscore-dangle */
import Bull from 'bull';

const queue = async (queueName) => {
  const bullQueue = new Bull(queueName, {
    redis: {
      port: process.env.REDIS_PORT,
      host: process.env.REDIS_HOST,
      password: process.env.REDIS_PASSWORD,
    },
  });

  bullQueue.on('completed', () => {
    console.log('Job completed');
  });

  return bullQueue;
};

export default queue;
