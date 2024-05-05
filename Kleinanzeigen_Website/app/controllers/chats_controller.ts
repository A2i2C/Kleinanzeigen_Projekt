import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class ChatsController {
  public async chat({ view, params, session }: HttpContext) {
    const current_user = session.get('user')
    const item = await db.from('Items').where('itemID', params.itemID).first()
    const existingChat = await db.from('Chats').where('itemID', params.itemID).first()
    if (!current_user) {
      return view.render('pages/user/login')
    }
    const itemID = params.itemID

    if (existingChat) {
      return view.render('pages/chats/chat', { itemID })
    }

    await db.table('Chats').insert({
      itemID: itemID,
      empfaengerID: item.email,
      senderID: current_user.email,
    })
    return view.render('pages/chats/chat', { itemID })
  }

}
  