import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class ChatsController {

  public async chat({ view, session, params }: HttpContext) {
    const current_user = session.get('user')
    if (current_user === undefined) {
      return view.render('pages/user/login')
    }



    //Hier wird die Nachrichtenliste erstellt und die verschiedenen Datenbanken einbinden

    return view.render('pages/chats/chattemplate')
  }

  public async createMessage({ request, response, session, params }: HttpContext) {
    const current_user = session.get('user')
    if (current_user === undefined) {
      return response.redirect('/login')
    }
    const message = request.input('message')
    const item = await db.from('Items').where('itemID', params.itemID).first()

    await db.table('Chats').insert({
      empfaengerID: item.email,
      senderID: current_user.email,
      itemID: params.itemID,
      nachrichten: message
    }) 

    //Fertig mit postposten

    return response.redirect('/chat')
  }


}
