import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'
import db from '@adonisjs/lucid/services/db'
import env from '#start/env'

export default class ContacstController {
  public async showForm({ view }: HttpContext) {
    return view.render('pages/contact/contact')
  }

  public async sendEmail({ request, view, session }: HttpContext) {
    const current_user = session.get('user')
    const { name, email, message } = request.only(['name', 'email', 'message'])

    await mail.send((send) => {
      send
        .to(env.get('MAIL_FROM_ADDRESS'))
        .from(email)
        .subject('Neue Kontaktanfrage')
        .htmlView('pages/contact/email_template', { name, email, message })
    })

    const item = await db.from('Items').select('*')
    const itemImages = await db
      .from('itemImages')
      .select('*')
      .join('Items', 'Items.itemid', 'itemImages.itemID')
      .join('user', 'Items.email', 'user.email')
      .where('Items.isActive', 'True')
      .groupBy('Items.itemid')

    return view.render('pages/home', {
      current_user,
      item,
      itemImages,
      success: 'Ihre Nachricht wurde erfolgreich versendet.',
    })
  }

  public async imprint ({ view }: HttpContext) {
    return view.render('pages/impressum')
  }
}
