import { Client } from '@upstash/qstash'

let _client: Client | null = null

function getClient(): Client {
  if (!_client) _client = new Client({ token: process.env.QSTASH_TOKEN! })
  return _client
}

export async function publishDelayed(
  path: string,
  body: unknown,
  delaySeconds: number
): Promise<string> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  const opts: Parameters<Client['publishJSON']>[0] = {
    url: `${appUrl}${path}`,
    body,
  }
  if (delaySeconds > 0) opts.delay = delaySeconds
  const res = await getClient().publishJSON(opts)
  return res.messageId
}

export async function cancelMessage(messageId: string): Promise<void> {
  try {
    await getClient().messages.delete(messageId)
  } catch {
    // Message may have already fired — ignore
  }
}
