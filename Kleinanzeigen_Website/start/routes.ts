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
import ChatsController from '../app/controllers/chats_controller.js'
import { sep, normalize } from 'node:path'
import app from '@adonisjs/core/services/app'
import ContacstController from '#controllers/contacts_controller'

const PATH_TRAVERSAL_REGEX = /(?:^|[\\/])\.\.(?:[\\/]|$)/

router.get('/images/*', ({ request, response }) => {
  const filePath = request.param('*').join(sep)
  const normalizedPath = normalize(filePath)

  if (PATH_TRAVERSAL_REGEX.test(normalizedPath)) {
    return response.badRequest('Malformed path')
  }

  const absolutePath = app.makePath('images', normalizedPath)
  return response.download(absolutePath)
})



router.get('/', [AnzeigesController, 'index'])
router.post('/', [AnzeigesController, 'Searchbar'])

router.get('/anzeigeaufgeben', [AnzeigesController, 'createForm'])
router.post('/anzeigeaufgeben', [AnzeigesController, 'createProcess'])

router.get('/anzeigeseite/:itemID', [AnzeigesController, 'show_site'])
router.post('/anzeigeseite/:itemID', [AnzeigesController, 'createFavorite'])
router.get('/favorites', [AnzeigesController, 'favorites'])

router.get('/youritems', [AnzeigesController, 'youritems'])
router.post('/youritems', [AnzeigesController, 'deactivateItem'])

router.get('/userprofile', [UsersController, 'userprofile'])
router.post('/userprofile', [UsersController, 'updateProfile'])

router.get('/registrierung', [UsersController, 'registerForm'])
router.post('/registrierung', [UsersController, 'registerProcess'])

router.get('/login', [UsersController, 'loginForm'])
router.post('/login', [UsersController, 'loginProcess'])
router.get('/logout', [UsersController, 'logout'])

router.get('/chat/:itemID/:empfaengerID/:senderID', [ChatsController, 'chat'])
router.post('/chat/:itemID/:empfaengerID/:senderID', [ChatsController, 'createMessage'])
router.get('/yourchats', [ChatsController, 'chatlist'])

router.get('/kontaktieren', [ContacstController, 'showForm'])
router.post('/kontaktieren', [ContacstController, 'sendEmail'])
