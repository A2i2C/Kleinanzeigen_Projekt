import type { HttpContext } from '@adonisjs/core/http'

import db from '@adonisjs/lucid/services/db'
import { connected } from 'process'
import { send } from 'vite'

export default class ChatsController {
  public async chat({ view, params, session }: HttpContext) {
    const current_user = session.get('user')
    const itemID = params.itemID
    const empfaengerID = params.empfaengerID
    const senderID = params.senderID
    const item = await db.from('Items').where('itemID', itemID).first()
    const existingChat = await db
      .from('Chats')
      .where('itemID', itemID)
      .andWhere('senderID', current_user.email)
      .andWhere('empfaengerID', item.email)
      .select('*').first()

    const messagessender = await db
      .from('Nachrichten')
      .where('chatID', existingChat.chatID)
      .select('*')
    

    if (!current_user) {
      return view.render('pages/user/login')
    }
    if (current_user.email === item.email) {
      return view.render('/', { error: 'Sie können sich nicht selbst schreiben' })
    }

    console.log(existingChat.empfaengerID === current_user.email || existingChat.senderID === current_user.email)
    if (existingChat) {
      if (item.itemID === params.itemID && existingChat.empfaengerID === current_user.email || existingChat.senderID === current_user.email) {
      } else {
        return view.render('/', { error: 'Sie können sich nicht selbst schreiben' })
      }
      
      return view.render('pages/chats/chat', {
        item,
        current_user,
        messagessender,
      })
    }

    await db.table('Chats').insert({
      itemID: itemID,
      empfaengerID: item.email,
      senderID: current_user.email,
    })

    return view.render('pages/chats/chat', { itemID, empfaengerID, senderID, item, current_user, messagessender})
  }

  async createMessage({ request, response, params, session }: HttpContext) {
    const current_user = session.get('user')
    const item = await db.from('Items').where('itemID', params.itemID).first()
    const user = await db.from('user').join('Items', 'Items.email', 'user.email').where('Items.itemID', params.itemID).first()
    const chatID = await db.from('Chats')
      .where('itemID', params.itemID)
      .andWhere('empfaengerID', item.email)
      .andWhere('senderID', current_user.email).first()
    console.log(chatID)
    const message = request.input('message')

    const date = new Date()
    if (date.getMonth() >= 4 && date.getMonth() <= 11) {
      date.setHours(date.getHours() + 2)
    } else {
      date.setHours(date.getHours() + 1)
    }

    const formattedDate = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} ${date.getHours() < 10 ? '0' + date.getHours() : date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}`

    await db.table('Nachrichten').insert({
      chatID: chatID.chatID,
      Nachrichten: message,
      absender: current_user.benutzername,
      date: formattedDate,
    })

    response.redirect(`/chat/${item.itemID}/${user.benutzername}/${current_user.benutzername}`, params.itemID)
  }
}
