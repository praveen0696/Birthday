import { list, put, del } from '@vercel/blob'

const PREFIX = 'memories/'
const CAPTIONS_PATH = 'data/captions.json'

function defaultCaption(pathname) {
  const base = pathname.split('/').pop().replace(/\.[^.]+$/, '')
  const cleaned = base.replace(/^\d+[-_]/, '').replace(/[-_]+/g, ' ').trim()
  if (!cleaned) return 'New memory'
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}

async function readCaptions() {
  const { blobs } = await list({ prefix: CAPTIONS_PATH, limit: 1 })
  const meta = blobs.find((b) => b.pathname === CAPTIONS_PATH)
  if (!meta) return {}
  const res = await fetch(meta.url, { cache: 'no-store' })
  if (!res.ok) return {}
  return res.json()
}

async function writeCaptions(captions) {
  await put(CAPTIONS_PATH, JSON.stringify(captions), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  })
}

export default async function handler(request, response) {
  if (request.method === 'GET') {
    const [{ blobs }, captions] = await Promise.all([
      list({ prefix: PREFIX }),
      readCaptions(),
    ])
    const memories = blobs
      .sort((a, b) => new Date(a.uploadedAt) - new Date(b.uploadedAt))
      .map((b) => ({
        id: b.pathname,
        src: b.url,
        caption: captions[b.url] || defaultCaption(b.pathname),
      }))
    return response.status(200).json(memories)
  }

  if (request.method === 'POST') {
    const { url, caption } = request.body || {}
    if (!url || typeof caption !== 'string') {
      return response.status(400).json({ error: 'Expected { url, caption }' })
    }
    const captions = await readCaptions()
    captions[url] = caption
    await writeCaptions(captions)
    return response.status(200).json({ ok: true })
  }

  if (request.method === 'DELETE') {
    const { url } = request.body || {}
    if (url) {
      try {
        await del(url)
      } catch {
        // already gone, nothing to clean up
      }
      const captions = await readCaptions()
      delete captions[url]
      await writeCaptions(captions)
    }
    return response.status(200).json({ ok: true })
  }

  response.setHeader('Allow', 'GET, POST, DELETE')
  return response.status(405).end()
}
