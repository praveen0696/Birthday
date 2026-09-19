import { handleUpload } from '@vercel/blob/client'

export default async function handler(request, response) {
  const body = request.body

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => {},
    })

    return response.status(200).json(jsonResponse)
  } catch (error) {
    return response.status(400).json({ error: error.message })
  }
}
