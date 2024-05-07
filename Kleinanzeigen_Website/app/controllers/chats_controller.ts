import type { HttpContext } from '@adonisjs/core/http'

import db from '@adonisjs/lucid/services/db'

export default class ChatsController {
  public async chat({ view, params, session }: HttpContext) {
    const current_user = session.get('user')
    const item = await db.from('Items').where('itemID', params.itemID).first()
    const existingChat = await db.from('Chats').where('itemID', params.itemID).first()
    const itemID = params.itemID
    const messagessender = await db
      .from('user')
      .join('Nachrichten', 'Nachrichten.absender', 'user.benutzername')
      .join('Chats', 'Chats.chatID', 'Nachrichten.chatID')
      .select('*')

    console.log(messagessender[1].absender === current_user.benutzername)
    console.log(current_user.benutzername)
    console.log(messagessender[1].absender === 'tester')

    if (!current_user) {
      return view.render('pages/user/login')
    }

    if (existingChat) {
      if (
        !existingChat.empfaengerID === current_user.email ||
        !existingChat.senderID === current_user.email
      ) {
        return view.render('/', { error: 'Sie haben keine Berechtigung, diesen Chat zu öffnen' })
      }
      return view.render('pages/chats/chat', {
        item,
        current_user,
        messagessender,
      })
    }

    return view.render('pages/chats/chat', { itemID })
  }

  async createMessage({ request, response, params, session }: HttpContext) {
    const current_user = session.get('user')
    const item = await db.from('Items').where('itemID', params.itemID).first()
    
    await db.table('Chats').insert({
      itemID: params.itemID,
      empfaengerID: item.email,
      senderID: current_user.email,
    })
    
    const chatID = await db.from('Chats').where('itemID', params.itemID).first()
    const message = request.input('message')


    const date = new Date()
    if (date.getMonth() >= 4 && date.getMonth() <= 11) {
      date.setHours(date.getHours() + 2)
    } else {
      date.setHours(date.getHours() + 1)
    }

    const formattedDate = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} ${date.getHours() < 10 ? '0' + date.getHours() : date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}`
    console.log(formattedDate)

    await db.table('Nachrichten').insert({
      chatID: chatID.chatID,
      Nachrichten: message,
      absender: current_user.benutzername,
      date: formattedDate,
    })

    response.redirect(`/chat/${item.itemID}`, params.itemID)
  }
}
