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


router.on('/').render('pages/home')

router.get('/home', async ({ view }) => {
  return view.render('pages/home')
})

router.get('/registrierung', [UsersController, 'registerForm'])
router.post('/registrierung', [UsersController, 'registerProcess'])

router.get('/login', [UsersController, 'loginForm'])
router.post('/login', [UsersController, 'loginProcess'])
router.get('/logout', [UsersController, 'logout'])
