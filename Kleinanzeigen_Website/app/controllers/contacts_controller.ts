import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'
import env from '#start/env'
import { contactValidator } from '#validators/contact'


export default class ContacstController {
  // Show the contact form
  public async showForm({ view }: HttpContext) {
    return view.render('pages/contact/contact')
  }

  // Send an email
  public async sendEmail({ request, session, response}: HttpContext) {
    const { name, email, message } = request.only(['name', 'email', 'message'])


    try {
      await contactValidator.validate({ name, email, message })
    } catch (error) {
      session.flash('error', 'Bitte füllen Sie alle Felder aus.')
      return response.redirect('/Kontaktieren')
    }

    await mail.send((send) => {
      send
        .to(env.get('MAIL_FROM_ADDRESS'))
        .from(email)
        .subject('Neue Kontaktanfrage')
        .htmlView('pages/contact/email_template', { name, email, message })
    })
    
    session.flash('successsend', 'Ihre Nachricht wurde erfolgreich versendet.')
    return response.redirect('/')
  }

  // Render the Impressum page
  public async imprint({ view, session }: HttpContext) {
    const current_user = session.get('user')
    return view.render('pages/impressum', { current_user })
  }

  // Render the AGB (terms and conditions) page
  public async agb({ view, session }: HttpContext) {
    const current_user = session.get('user')
    return view.render('pages/agb', { current_user })
  }
}
