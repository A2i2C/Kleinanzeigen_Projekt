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


router.get('/' , [AnzeigesController, 'index'])

router.get('/anzeigeaufgeben', [AnzeigesController, 'createForm'])
router.post('/anzeigeaufgeben', [AnzeigesController, 'createProcess'])
router.get('/anzeigeseite/:itemID', [AnzeigesController, 'show_site'])

router.get('/userprofile', [UsersController, 'userprofile'])
router.post('/userprofile', [UsersController, 'updateProfile'])

router.get('/youritems', [AnzeigesController, 'youritems'])

router.get('/registrierung', [UsersController, 'registerForm'])
router.post('/registrierung', [UsersController, 'registerProcess'])

router.get('/login', [UsersController, 'loginForm'])
router.post('/login', [UsersController, 'loginProcess'])
router.get('/logout', [UsersController, 'logout'])

