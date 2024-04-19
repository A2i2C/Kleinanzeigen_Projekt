const dropzone = document.getElementById('dropzone')
const fileInput = document.getElementById('file-input')
const previewContainer = document.getElementById('preview-container') // Moved this line up

// Allow drag and drop
dropzone.addEventListener('dragover', (e) => {
  e.preventDefault()
  dropzone.classList.add('drag-over')
})

dropzone.addEventListener('drop', (e) => {
  e.preventDefault()
  dropzone.classList.remove('drag-over')
  const files = e.dataTransfer.files
  fileInput.files = files
  handleFileUpload(files)
})

fileInput.addEventListener('change', (e) => {
  const files = e.target.files
  handleFileUpload(files)
})

function handleFileUpload(files) {
  if (files.length === 0) {
    alert('Please select at least one file')
    return
  }

  for (const file of files) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = document.createElement('img')
      img.src = e.target.result
      img.style.objectFit = 'cover'
      previewContainer.appendChild(img)
    }
    reader.readAsDataURL(file)
  }

  // Process files here (e.g., upload to server, display previews)
  console.log('Selected files:', files)
}
