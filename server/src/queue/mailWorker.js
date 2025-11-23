import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { sendEmail } from '../utils/sendMail.js';
import { logger } from '../utils/logger.js';

const connection = new IORedis(process.env.REDIS_URL , {
  maxRetriesPerRequest: null
});

const mailWorker = new Worker(
  'mail-queue',
  async job => {
    const { to, subject, html, type, priority } = job.data;
    try {
      await sendEmail(to, subject, html);
      logger.info('Mail sent', {
        module: 'mail',
        to,
        subject,
        type: type || 'general',
        priority: priority || job.opts?.priority || 2,
        status: 'sent',
      });
    } catch (err) {
      logger.error('Mail send failed', {
        module: 'mail',
        to,
        subject,
        type: type || 'general',
        priority: priority || job.opts?.priority || 2,
        status: 'failed',
        error: err.message,
      });
      throw err;
    }
  },
  { connection }
);

mailWorker.on('completed', job => {
  logger.info('Mail job completed', {
    module: 'mail',
    to: job.data.to,
    subject: job.data.subject,
    type: job.data.type || 'general',
    priority: job.data.priority || job.opts?.priority || 2,
    status: 'completed',
  });
});

mailWorker.on('failed', (job, err) => {
  logger.error('Mail job failed', {
    module: 'mail',
    to: job.data.to,
    subject: job.data.subject,
    type: job.data.type || 'general',
    priority: job.data.priority || job.opts?.priority || 2,
    status: 'failed',
    error: err.message,
  });
}); 