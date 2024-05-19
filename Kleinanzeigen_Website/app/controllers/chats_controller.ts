import type { HttpContext } from '@adonisjs/core/http'

import db from '@adonisjs/lucid/services/db'
import { format } from '@formkit/tempo'
import { messageValidator } from '#validators/chat'

export default class ChatsController {
  public async chat({ view, params, session }: HttpContext) {
    const current_user = session.get('user')
    if (!current_user) {
      return view.render('pages/user/login')
    }
    const itemID = params.itemID
    const empfaengerID = params.empfaengerID
    const senderID = params.senderID
    const user = await db.from('user').where('benutzername', empfaengerID).first()

    const item = await db
      .from('Items')
      .join('user', 'Items.email', 'user.email')
      .where('itemID', itemID)
      .first()

    if (item.email !== user.email) {
      const error = session.flash('nonexisting', 'Das Item gehört nicht dem User')
      return view.render('pages/chats/chat_errorpage', { current_user, error: error })
    }

    const usersender = await db
      .from('user')
      .where('benutzername', params.senderID)
      .select('email')
      .first()
    
    const existingChat = await db
      .from('Chats')
      .where('itemID', itemID)
      .andWhere('senderID', usersender.email)
      .andWhere('empfaengerID', item.email)
      .select('empfaengerID', 'senderID', 'chatID')
      .first()

    if (existingChat === null) {
      return view.render('pages/chats/chat', { itemID, empfaengerID, senderID, item, current_user })
    }

    const messagessender = await db
      .from('Nachrichten')
      .where('chatID', existingChat.chatID)
      .select('*')

    if (empfaengerID === current_user.benutzername || senderID === current_user.benutzername) {
      return view.render('pages/chats/chat', { item, current_user, messagessender })
    } else {
      const error = session.flash('noaccess', 'Du hast keinen Zugriff auf diesen Chat')
      return view.render('pages/chats/chat_errorpage', { current_user, error: error })
    }
  }

  async createMessage({ request, view, response, params, session }: HttpContext) {
    const current_user = session.get('user')
    if (!current_user) {
      return view.render('pages/user/login')
    }

    if (
      current_user.benutzername === params.empfaengerID &&
      current_user.benutzername === params.senderID
    ) {
      return 'Du kannst nicht mit dir selbst chatten'
    }

    const item = await db.from('Items').where('itemID', params.itemID).first()

    const usersender = await db
      .from('user')
      .where('benutzername', params.senderID)
      .select('email')
      .first()

    let existingChat = await db
      .from('Chats')
      .where('itemID', params.itemID)
      .andWhere('senderID', usersender.email)
      .andWhere('empfaengerID', item.email)
      .select('empfaengerID', 'senderID', 'chatID')
      .first()

    if (existingChat === null) {
      await db.table('Chats').insert({
        itemID: params.itemID,
        empfaengerID: item.email,
        senderID: current_user.email,
      })

      existingChat = await db
        .from('Chats')
        .where('itemID', params.itemID)
        .andWhere('senderID', usersender.email)
        .andWhere('empfaengerID', item.email)
        .select('empfaengerID', 'senderID', 'chatID')
        .first()
    }

    const user = await db
      .from('user')
      .join('Items', 'Items.email', 'user.email')
      .where('Items.itemID', params.itemID)
      .first()

    const message = request.input('message')

    const date = format({
      date: new Date(),
      format: { date: 'medium', time: 'short' },
      tz: 'Europe/Berlin',
    })

    await request.validateUsing(messageValidator)

    await db.table('Nachrichten').insert({
      chatID: existingChat.chatID,
      Nachrichten: message,
      absender: current_user.benutzername,
      date: date,
    })

    response.redirect(`/Chat/${item.itemID}/${user.benutzername}/${params.senderID}`, params.itemID)
  }

  async chatlist({ view, session }: HttpContext) {
    const current_user = session.get('user')
    if (!current_user) {
      return view.render('pages/user/login')
    }

    const chats = await db
      .from('Chats')
      .join('Items', 'Items.itemID', 'Chats.itemID')
      .join('user', 'user.email', 'Chats.empfaengerID')
      .join('user as userzwei', 'userzwei.email', 'Chats.senderID')
      .join('Nachrichten', 'Nachrichten.chatID', 'Chats.chatID')
      .where('empfaengerID', current_user.email)
      .orWhere('senderID', current_user.email)
      .groupBy('Chats.chatID')
      .max('date')
      .select(
        'Items.itemID',
        'itemName',
        'user.benutzername',
        'Nachrichten',
        'userzwei.benutzername as sender'
      )

    return view.render('pages/user/userprofile_chats', { current_user, chats })
  }
}
