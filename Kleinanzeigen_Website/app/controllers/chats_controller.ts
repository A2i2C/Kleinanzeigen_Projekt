import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class ChatsController {
  public async chat({ view, params, session }: HttpContext) {
    const current_user = session.get('user')
    const item = await db.from('Items').where('itemID', params.itemID).first()
    const existingChat = await db.from('Chats').where('itemID', params.itemID).first()
    const itemID = params.itemID
    const existingMessages = await db
      .from('Nachrichten')
      .where('chatID', existingChat.chatID)
    

    if (!current_user) {
      return view.render('pages/user/login')
    }

    if (existingChat) {
      return view.render('pages/chats/chat', { itemID, current_user })
    }

    await db.table('Chats').insert({
      itemID: itemID,
      empfaengerID: item.email,
      senderID: current_user.email,
    })

    return view.render('pages/chats/chat', { itemID })
  }

  async createMessage({ request, response, params }: HttpContext) {
    const chatID = await db.from('Chats').where('itemID', params.itemID).first()
    const message = request.input('message')
    const item = await db.from('Items').where('itemID', params.itemID).first()

    await db.table('Nachrichten').insert({
      chatID: chatID.chatID,
      Nachrichten: message,
      date: new Date(),
    })

    response.redirect(`/chat/${item.itemID}`, params.itemID)
  }
}
