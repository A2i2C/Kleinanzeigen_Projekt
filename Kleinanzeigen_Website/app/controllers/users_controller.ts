import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import hash from '@adonisjs/core/services/hash'

export default class UsersController {
  public async registerForm({ view }: HttpContext) {
    return view.render('pages/user/registrierung')
  }

  public async registerProcess({ request, response }: HttpContext) {
    const hashedPassword = await hash.make(request.input('password_registrierung'))
    try {
      const result = await db.table('user').insert({
        email: request.input('email'),
        vorname: request.input('vorname'),
        nachname: request.input('nachname'),
        benutzername: request.input('benutzername_registrierung'),
        bundesland: request.input('bundesland'),
        password: hashedPassword
      })
      console.log(result)
    } catch (error) {
      console.log(error)
      return error
    }
    response.redirect('/login')
  }

  public async loginForm({ view }: HttpContext) {
    return view.render('pages/user/login')
  }

  public async loginProcess({ view, response, request, session }: HttpContext) {
    const result = await db
      .from('user')
      .select('*')
      .where('benutzername', request.input('username_login'))
      .first()
    const passwordOk = await hash.verify(result.password, request.input('password_login'))
    if (!result) {
      //Kontrolle ob richtiger Benutzername/Ob es den Benutzer gibt
      return view.render('pages/user/login', { error: 'Benutzername oder Passwort ist Falsch' })
    }
    if (!passwordOk) {
      //Kontrolle ob richtiges Passwort
      return view.render('pages/user/login', { error: 'Benutzername oder Passwort ist Falsch' })
    }
    session.put('user', {
      email: result.email,
      vorname: result.vorname,
      nachname: result.nachname,
      benutzername: result.username_registrierung,
      bundesland: result.bundesland,
    })

    return response.redirect('/')
  }
  public async logout({ session, response }: HttpContext) {
    session.forget('user')
    response.redirect('/')
  }
}
