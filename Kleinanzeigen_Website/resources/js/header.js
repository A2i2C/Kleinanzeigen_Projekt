const toggleButton = document.getElementById('toggleNavbar')
const navbar = document.getElementById('navigationToggle')

toggleButton.addEventListener('click', () => {
  if (toggleButton) {
    navbar.classList.toggle('hidden')
  }
})
