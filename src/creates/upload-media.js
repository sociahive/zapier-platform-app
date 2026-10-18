/**
 * Action: Copy a file from a public URL into SociaHive's storage
 * (POST /api/v1/uploads/from-url). The returned URL can be used in Create Post.
 */

const { API_BASE } = require('../lib/api')

const perform = async (z, bundle) => {
  const response = await z.request({
    url: `${API_BASE}/uploads/from-url`,
    method: 'POST',
    body: { url: bundle.inputData.url },
  })
  const file = response.data || {}
  return {
    id: file.key,
    url: file.url,
    key: file.key,
    size_bytes: file.size_bytes,
    mime_type: file.mime_type,
  }
}

module.exports = {
  key: 'uploadMedia',
  noun: 'Media',

  display: {
    label: 'Upload Media From URL',
    description: 'Copies an image or video from a public link into SociaHive, so a post can use it.',
  },

  operation: {
    inputFields: [
      {
        key: 'url',
        label: 'File URL',
        required: true,
        helpText:
          'A public https link to a JPEG, PNG, WebP, MP4, or MOV file. The size limit depends on your plan (at most 100 MB).',
      },
    ],
    perform,
    sample: {
      id: 'uploads/9f2c/2b6f3a1e-4d5c-4b7a-9e1f-3c2d1b0a9f8e.jpg',
      url: 'https://media.sociahive.com/uploads/9f2c/2b6f3a1e-4d5c-4b7a-9e1f-3c2d1b0a9f8e.jpg',
      key: 'uploads/9f2c/2b6f3a1e-4d5c-4b7a-9e1f-3c2d1b0a9f8e.jpg',
      size_bytes: 482113,
      mime_type: 'image/jpeg',
    },
    outputFields: [
      { key: 'url', label: 'Media URL' },
      { key: 'key', label: 'Storage Key' },
      { key: 'size_bytes', label: 'Size (bytes)', type: 'integer' },
      { key: 'mime_type', label: 'MIME Type' },
    ],
  },
}
