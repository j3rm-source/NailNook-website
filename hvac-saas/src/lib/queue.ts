import { Queue } from 'bullmq'
import IORedis from 'ioredis'

function getConnection() {
  if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL is not set — add it to .env.local')
  }
  return new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null, lazyConnect: false })
}

let _smsQueue: Queue | null = null
let _reviewQueue: Queue | null = null

export function getSmsQueue(): Queue {
  if (!_smsQueue) _smsQueue = new Queue('sms-followup', { connection: getConnection() })
  return _smsQueue
}

export function getReviewQueue(): Queue {
  if (!_reviewQueue) _reviewQueue = new Queue('review-request', { connection: getConnection() })
  return _reviewQueue
}

// Proxy aliases for backwards compat — only connect on first use
export const smsQueue = new Proxy({} as Queue, { get: (_, p) => getSmsQueue()[p as keyof Queue] })
export const reviewQueue = new Proxy({} as Queue, { get: (_, p) => getReviewQueue()[p as keyof Queue] })
