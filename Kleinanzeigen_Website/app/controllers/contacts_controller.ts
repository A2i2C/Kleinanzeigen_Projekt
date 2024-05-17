import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'
import env from '#start/env'

export default class ContacstController {

  public async showForm({ view }: HttpContext) {
    return view.render('pages/contact/contact')
  }

  public async sendEmail({ request, view }: HttpContext) {
    const { name, email, message } = request.only(['name', 'email', 'message'])

    await mail.send((send) => {
      send
        .to(env.get('MAIL_FROM_ADDRESS'))
        .from(email)
        .subject('Neue Kontaktanfrage')
        .htmlView('pages/contact/email_template', { name, email, message })
    })

    return view.render('pages/contact/contact' )
  }
}
