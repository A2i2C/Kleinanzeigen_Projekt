const toggleButton = document.getElementById('toggleNavbar')
const navbar = document.getElementById('navigationToggle')

toggleButton.addEventListener('click', () => {
  if (toggleButton) {
    
    navbar.classList.toggle('hidden')

    const isNavbarHidden = navbar.classList.contains('hidden')

    if (isNavbarHidden) {
      toggleButton.src = '/Site_Graphics/arrow_down.png' // Replace 'arrow-down.png' with the path to your arrow down image
    } else {
      toggleButton.src = '/Site_Graphics/arrow_up.png' // Replace 'arrow-up.png' with the path to your arrow up image
    }
  }
})
