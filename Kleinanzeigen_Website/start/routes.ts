/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import UsersController from '../app/controllers/users_controller.js'

router.get('/', async ({ view, session }) => {
  return view.render('pages/home', { user: session.get('user') })
})

router.get('/anzeigen/anzeigeaufgeben', async ({ view }) => {
  return view.render('pages/anzeigen/anzeigeaufgeben')
})

router.get('/anzeigen/anzeigeseite', async ({ view }) => {
  return view.render('pages/anzeigen/anzeigeseite')
})

router.get('/registrierung', [UsersController, 'registerForm'])
router.post('/registrierung', [UsersController, 'registerProcess'])

router.get('/login', [UsersController, 'loginForm'])
router.post('/login', [UsersController, 'loginProcess'])
router.get('/logout', [UsersController, 'logout'])
