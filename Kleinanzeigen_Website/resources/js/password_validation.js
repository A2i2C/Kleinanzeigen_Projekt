document.addEventListener('DOMContentLoaded', () => {
  const passwordInput = document.getElementById('password')
  const infoButton = document.getElementById('info-image')
  const guidelines = document.getElementById('guidelines')

  // Show guidelines on hover
    infoButton.addEventListener('mouseover', () => {
      console.log('hovering')
    guidelines.classList.remove('hidden')
  })

  // Hide guidelines when not hovering
    infoButton.addEventListener('mouseout', () => {
      console.log('not hovering')
    guidelines.classList.add('hidden')
  })

  // Toggle guidelines on click
  infoButton.addEventListener('click', () => {
    guidelines.classList.toggle('hidden')
  })

  // Validate password on input
    passwordInput.addEventListener('input', () => {
      console.log('input')
    validatePassword(passwordInput.value)
  })

  function validatePassword(password) {
    const length = document.getElementById('length')
    const uppercase = document.getElementById('uppercase')
    const lowercase = document.getElementById('lowercase')
    const number = document.getElementById('number')
    const special = document.getElementById('special')

    // Length validation
    if (password.length >= 8) {
      length.classList.add('valid')
      length.classList.remove('invalid')
    } else {
      length.classList.add('invalid')
      length.classList.remove('valid')
    }

    // Uppercase letter validation
    if (/[A-Z]/.test(password)) {
      uppercase.classList.add('valid')
      uppercase.classList.remove('invalid')
    } else {
      uppercase.classList.add('invalid')
      uppercase.classList.remove('valid')
    }

    // Lowercase letter validation
    if (/[a-z]/.test(password)) {
      lowercase.classList.add('valid')
      lowercase.classList.remove('invalid')
    } else {
      lowercase.classList.add('invalid')
      lowercase.classList.remove('valid')
    }

    // Number validation
    if (/\d/.test(password)) {
      number.classList.add('valid')
      number.classList.remove('invalid')
    } else {
      number.classList.add('invalid')
      number.classList.remove('valid')
    }

    // Special character validation
    if (/(?=.*[!@#\$%\^&\*\-\_\:\.])/.test(password)) {
      special.classList.add('valid')
      special.classList.remove('invalid')
    } else {
      special.classList.add('invalid')
      special.classList.remove('valid')
    }
  }
})
