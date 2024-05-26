const toggleButton = document.getElementById('toggleNavbar')
const navbar = document.getElementById('navigationToggle')

toggleButton.addEventListener('click', () => {
  // Check if toggleButton exists
  if (toggleButton) {
    
    navbar.classList.toggle('hidden')

    const isNavbarHidden = navbar.classList.contains('hidden')

    // Update toggleButton image based on navbar visibility
    if (isNavbarHidden) {
      toggleButton.src = '/Site_Graphics/arrow_down.png' // Show arrow down image
    } else {
      toggleButton.src = '/Site_Graphics/arrow_up.png' // Show arrow up image
    }
  }
})
