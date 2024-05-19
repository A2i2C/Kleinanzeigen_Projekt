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

router.get('/Anzeige_erstellen', [AnzeigesController, 'createForm'])
router.post('/Anzeige_erstellen', [AnzeigesController, 'createProcess'])

router.get('/Anzeige/:itemID', [AnzeigesController, 'show_site'])
router.post('/Anzeige/:itemID', [AnzeigesController, 'createFavorite'])
router.get('/Favorisierte_Anzeigen', [AnzeigesController, 'favorites'])

router.get('/Deine_Anzeigen', [AnzeigesController, 'youritems'])
router.post('/Deine_Anzeigen', [AnzeigesController, 'deactivateItem'])

router.get('/Profil', [UsersController, 'userprofile'])
router.post('/Profil', [UsersController, 'updateProfile'])

router.get('/Registrierung', [UsersController, 'registerForm'])
router.post('/Registrierung', [UsersController, 'registerProcess'])

router.get('/Login', [UsersController, 'loginForm'])
router.post('/Login', [UsersController, 'loginProcess'])
router.get('/Logout', [UsersController, 'logout'])

router.get('/Chat/:itemID/:empfaengerID/:senderID', [ChatsController, 'chat'])
router.post('/Chat/:itemID/:empfaengerID/:senderID', [ChatsController, 'createMessage'])
router.get('/Deine_Chats', [ChatsController, 'chatlist'])

router.get('/Kontaktieren', [ContacstController, 'showForm'])
router.post('/Kontaktieren', [ContacstController, 'sendEmail'])
