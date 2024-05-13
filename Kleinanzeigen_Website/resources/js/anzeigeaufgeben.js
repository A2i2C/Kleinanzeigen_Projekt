const dropzone = document.getElementById('dropzone')
const fileInput = document.getElementById('file-input')
const previewContainer = document.getElementById('preview-container') // Moved this line up

var yesRadio = document.querySelector('input[name="shipping"][value="Ja"]')
var noRadio = document.querySelector('input[name="shipping"][value="Nein"]')
var shippingPriceInput = document.getElementById('shipping_price')

yesRadio.addEventListener('change', function () {
  shippingPriceInput.disabled = false
})

noRadio.addEventListener('change', function () {
  shippingPriceInput.disabled = true
})

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

  previewContainer.innerHTML = ''
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
}