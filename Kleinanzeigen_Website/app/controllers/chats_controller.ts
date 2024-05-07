import type { HttpContext } from '@adonisjs/core/http'

import db from '@adonisjs/lucid/services/db'

export default class ChatsController {
  public async chat({ view, params, session }: HttpContext) {
    const current_user = session.get('user')
    const item = await db.from('Items').where('itemID', params.itemID).first()
    const existingChat = await db.from('Chats').where('itemID', params.itemID).first()
    const itemID = params.itemID
    const messagessender = await db.from('user')
      .join('Nachrichten', 'Nachrichten.absender', 'user.benutzername')
      .join('Chats', 'Chats.chatID', 'Nachrichten.chatID')
      .select('*')
    
    if (!current_user) {
      return view.render('pages/user/login')
    }

    if (existingChat) {
      return view.render('pages/chats/chat', { itemID, current_user, messagessender })
    }

    await db.table('Chats').insert({
      itemID: itemID,
      empfaengerID: item.email,
      senderID: current_user.email,
    })

    return view.render('pages/chats/chat', { itemID })
  }

  async createMessage({ request, response, params, session }: HttpContext) {
    const current_user = session.get('user')
    const chatID = await db.from('Chats').where('itemID', params.itemID).first()
    const message = request.input('message')
    const item = await db.from('Items').where('itemID', params.itemID).first()
    const date = new Date()
    if (date.getMonth() >= 4 && date.getMonth() <= 11) {
      date.setHours(date.getHours() + 2)
    }
    else {
      date.setHours(date.getHours() + 1)
    }
    const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}: ${date.getHours()}:${date.getMinutes()}`

    await db.table('Nachrichten').insert({
      chatID: chatID.chatID,
      Nachrichten: message,
      absender: current_user.benutzername,
      date: formattedDate,
    })

    response.redirect(`/chat/${item.itemID}`, params.itemID)
  }
}
