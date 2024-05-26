const dropzone = document.getElementById('dropzone')
const fileInput = document.getElementById('file-input')
const previewContainer = document.getElementById('preview-container') // Container for preview images

var yesRadio = document.querySelector('input[name="shipping"][value="Ja"]')
var noRadio = document.querySelector('input[name="shipping"][value="Nein"]')
var shippingPriceInput = document.getElementById('shipping_price')

var price = document.getElementById('price')

price.addEventListener('change', function () {
  price.value = parseFloat(price.value).toFixed(2) // Format the price value to two decimal places
})

yesRadio.addEventListener('change', function () {
  shippingPriceInput.disabled = false // Enable shipping price input when "Ja" is selected
})

noRadio.addEventListener('change', function () {
  shippingPriceInput.disabled = true // Disable shipping price input when "Nein" is selected
})

// Allow drag and drop
dropzone.addEventListener('dragover', (e) => {
  e.preventDefault()
  dropzone.classList.add('drag-over') // Add 'drag-over' class when dragging over the dropzone
})

dropzone.addEventListener('drop', (e) => {
  e.preventDefault()
  dropzone.classList.remove('drag-over') // Remove 'drag-over' class when dropping files
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
    alert('Please select at least one file') // Display an alert if no files are selected
    return
  }

  previewContainer.innerHTML = ''
  for (const file of files) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = document.createElement('img')
      img.src = e.target.result
      img.style.objectFit = 'cover'
      previewContainer.appendChild(img) // Append preview images to the container
    }
    reader.readAsDataURL(file)
  }
}