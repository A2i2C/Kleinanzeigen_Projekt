import type { HttpContext } from '@adonisjs/core/http'

import db from '@adonisjs/lucid/services/db'
import { format, parse } from "@formkit/tempo"

export default class ChatsController {
  public async chat({ view, params, session }: HttpContext) {
    const current_user = session.get('user')
    if (!current_user) {
      return view.render('pages/user/login')
    }
    const itemID = params.itemID
    const empfaengerID = params.empfaengerID
    const senderID = params.senderID

    const item = await db.from('Items')
      .join('user', 'Items.email', 'user.email')
      .where('itemID', itemID).first()

        if (
          item.email === current_user.email &&
          senderID === current_user.benutzername &&
          empfaengerID === item.benutzername
        ) {
          return 'Du kannst nicht mit dir selbst chatten'
        }

    const existingChat = await db
      .from('Chats')
      .where('itemID', itemID)
      .andWhere('senderID', current_user.email)
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
      return view.render('pages/chats/chat_errorpage', { current_user })
    }
  }

  async createMessage({ request, view, response, params, session }: HttpContext) {
    const current_user = session.get('user')
    if (!current_user) {
      return view.render('pages/user/login')
    }
    const item = await db.from('Items').where('itemID', params.itemID).first()
    const existingChat = await db
      .from('Chats')
      .where('itemID', params.itemID)
      .andWhere('senderID', current_user.email)
      .andWhere('empfaengerID', item.email)
      .select('empfaengerID', 'senderID', 'chatID')
      .first()
    
    if (existingChat === null) {
      await db.table('Chats').insert({
        itemID: params.itemID,
        empfaengerID: item.email,
        senderID: current_user.email,
      })
    }

    const user = await db
      .from('user')
      .join('Items', 'Items.email', 'user.email')
      .where('Items.itemID', params.itemID)
      .first()

    const chatID = await db
      .from('Chats')
      .where('itemID', params.itemID)
      .andWhere('empfaengerID', item.email)
      .andWhere('senderID', current_user.email)
      .first()

    const message = request.input('message')

 const date = format({
   date: new Date(),
   format: { date: 'medium', time: 'short' },
   tz: 'Europe/Berlin',
 })
    
    await db.table('Nachrichten').insert({
      chatID: chatID.chatID,
      Nachrichten: message,
      absender: current_user.benutzername,
      date: date,
    })

    response.redirect(
      `/chat/${item.itemID}/${user.benutzername}/${current_user.benutzername}`,
      params.itemID
    )
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
      .join('Nachrichten', 'Nachrichten.chatID', 'Chats.chatID')
      .where('empfaengerID', current_user.email)
      .orWhere('senderID', current_user.email)
      .max('date')
      .select('*')

    return view.render('pages/user/userprofile_chats', { current_user, chats })
  }
}
