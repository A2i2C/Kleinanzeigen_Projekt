const toggleButton = document.getElementById('toggleNavbar')
const navbar = document.getElementById('navigationToggle') // You can use getElementById if you prefer an id for the navbar
toggleButton.addEventListener('click', () => {
  if (toggleButton) {
    navbar.classList.toggle('hidden')
  }
  console.log('clicked')
})
