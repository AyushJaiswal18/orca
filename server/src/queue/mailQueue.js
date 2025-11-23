import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL , {
  maxRetriesPerRequest: null
});

export const mailQueue = new Queue('mail-queue', { connection });

/**
 * Queue a mail job with priority.
 * @param {Object} job - { to, subject, html, text, type, priority, ... }
 * @param {number} priority - Lower number = higher priority (1 = highest)
 */
export async function queueMail(job, priority = 2) {
  await mailQueue.add('sendMail', job, { priority });
} 