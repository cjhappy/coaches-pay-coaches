// Resizes and compresses an image file in the browser before upload, so a
// coach uploading an unedited 12MP phone photo doesn't ship the full
// multi-megabyte original to every visitor who loads the page. Keeps the
// file under the given max dimension and re-encodes as JPEG at a
// reasonable quality — usually cuts file size by 80-95% with no visible
// quality loss at the sizes these images are actually displayed.
export function compressImage(file, { maxDimension = 1200, quality = 0.82 } = {}) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = (e) => { img.src = e.target.result }
    reader.onerror = reject
    reader.readAsDataURL(file)

    img.onload = () => {
      let { width, height } = img
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width)
          width = maxDimension
        } else {
          width = Math.round((width * maxDimension) / height)
          height = maxDimension
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return }
          // Only use the compressed version if it's actually smaller —
          // a tiny already-optimized image shouldn't get re-encoded larger.
          if (blob.size >= file.size) { resolve(file); return }
          const compressedFile = new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' })
          resolve(compressedFile)
        },
        'image/jpeg',
        quality
      )
    }
    img.onerror = () => resolve(file) // if anything goes wrong, fall back to the original
  })
}
