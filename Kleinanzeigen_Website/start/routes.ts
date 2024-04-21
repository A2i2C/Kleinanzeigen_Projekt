/* eslint-disable @adonisjs/prefer-lazy-controller-import */
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
import AnzeigesController from '../app/controllers/anzeiges_controller.js'

router.get('/anzeigeaufgeben', [AnzeigesController, 'createForm'])
/*
router.post('/posts', [AnzeigesController, 'createProcess'])

router.get('/post/:id', [AnzeigesController, 'show'])
router.get('/post/:id/edit', [AnzeigesController, 'editForm'])
router.post('/post/:id/edit', [AnzeigesController, 'editProcess'])
*/

router.get('/', async ({ view, session }) => {
  return view.render('pages/home', { user: session.get('user') })
})

router.get('/anzeigen/anzeigeseite', async ({ view }) => {
  return view.render('pages/anzeigen/anzeigeseite')
})

router.get('/registrierung', [UsersController, 'registerForm'])
router.post('/registrierung', [UsersController, 'registerProcess'])

router.get('/login', [UsersController, 'loginForm'])
router.post('/login', [UsersController, 'loginProcess'])
router.get('/logout', [UsersController, 'logout'])
