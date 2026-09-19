import { list, put, del } from '@vercel/blob'

const METADATA_PATH = 'data/memories.json'

async function readMemories() {
  const { blobs } = await list({ prefix: METADATA_PATH, limit: 1 })
  const meta = blobs.find((b) => b.pathname === METADATA_PATH)
  if (!meta) return null
  const res = await fetch(meta.url, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

async function writeMemories(memories) {
  await put(METADATA_PATH, JSON.stringify(memories), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  })
}

export default async function handler(request, response) {
  if (request.method === 'GET') {
    const memories = (await readMemories()) ?? []
    return response.status(200).json(memories)
  }

  if (request.method === 'POST') {
    const memories = request.body
    if (!Array.isArray(memories)) {
      return response.status(400).json({ error: 'Expected an array of memories' })
    }
    await writeMemories(memories)
    return response.status(200).json(memories)
  }

  if (request.method === 'DELETE') {
    const { url } = request.body || {}
    if (url) {
      try {
        await del(url)
      } catch {
        // blob already gone, nothing to clean up
      }
    }
    const memories = (await readMemories()) ?? []
    const next = memories.filter((m) => m.src !== url)
    await writeMemories(next)
    return response.status(200).json(next)
  }

  response.setHeader('Allow', 'GET, POST, DELETE')
  return response.status(405).end()
}
