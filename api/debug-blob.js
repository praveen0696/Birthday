export default function handler(request, response) {
  response.status(200).json({
    hasReadWriteToken: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    hasOidcToken: Boolean(process.env.VERCEL_OIDC_TOKEN),
    hasStoreId: Boolean(process.env.BLOB_STORE_ID),
    storeIdPrefix: process.env.BLOB_STORE_ID
      ? process.env.BLOB_STORE_ID.slice(0, 12)
      : null,
    vercelEnv: process.env.VERCEL_ENV || null,
  })
}
