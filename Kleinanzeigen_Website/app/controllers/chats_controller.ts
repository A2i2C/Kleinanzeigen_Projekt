import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class ChatsController {
  public async createChat({ view, session, params }: HttpContext) {
    const current_user = session.get('user')
    if (current_user === undefined) {
      return view.render('pages/user/login')
    }
    return view.render('pages/chats/chattemplate', {
      current_user: session.get('user'),
      chatID: params.chatID,
    })
  }

  public async createMessage({ view, request, response, session, params }: HttpContext) {
    const current_user = session.get('user')
    if (current_user === undefined) {
      return view.render('pages/user/login')
    }

    const chatID = params.chatID
    const message = request.input('message')
    const item = await db.from('Items').where('itemID', chatID)
    
    if (item === null) {
      return response.redirect('/')
    }

    await db
      .table('Chats')
      .insert({
        chatID: chatID,
        senderID: current_user.email,
        empfaengerID: item[0].email,
        nachrichten: message,
      })

    const chat = await db.from('Chats').where('chatID', chatID).where('senderID', current_user.email)

    return view.render('pages/chats/chattemplate', {
      current_user, chat
    })
  }
}
