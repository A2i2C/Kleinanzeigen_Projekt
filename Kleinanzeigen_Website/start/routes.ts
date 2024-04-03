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

router.get('/login', async ({ view }) => {
  return view.render('pages/login')
})

router.get('/registrierung', async ({ view }) => {
  return view.render('pages/registrierung')
})
