/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

router.on('/').render('pages/home')

router.get('/home', async ({ view }) => {
  return view.render('pages/home')
})

router.get('user/login', async ({ view }) => {
  return view.render('pages/user/login')
})

router.post('user/login', async ({ request, view }) => {
  if (
    request.input('username_login') === undefined ||
    request.input('password_login') === undefined
  ) {
    return 'Fehler!'
  }
  if (request.input('username_login') === null || request.input('password_login') === null) {
    return 'Da wurde etwas vergessen'
  }
  const username = request.input('username_login')
  const passwort = request.input('password_login')
  return view.render('pages/ausgabe_login_registrierung', { username, passwort })
})

router.get('/user/registrierung', async ({ view }) => {
  return view.render('pages/user/registrierung')
})

router.get('/anzeigen/anzeigeaufgeben', async ({ view }) => {
  return view.render('pages/anzeigen/anzeigeaufgeben')
})

router.get('/anzeigen/anzeigeseite', async ({ view }) => {
  return view.render('pages/anzeigen/anzeigeseite')
})
