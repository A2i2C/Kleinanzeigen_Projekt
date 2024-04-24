/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import hash from '@adonisjs/core/services/hash'

export default class UsersController {

  public async registerForm({ view }: HttpContext) {
    return view.render('pages/user/registrierung')
  }

  public async userprofile({ view }: HttpContext) { 
    return view.render('pages/user/userprofile_edit')
  }

  public async registerProcess({ request, response }: HttpContext) {
    const hashedPassword = await hash.make(request.input('password'))
    try {
      const result = await db.table('user').insert({
        email: request.input('email'),
        vorname: request.input('vorname'),
        nachname: request.input('nachname'),
        benutzername: request.input('benutzername'),
        bundesland: request.input('bundesland'),
        profilbild: 'standard_user_profilepicture.png',
        password: hashedPassword,
      })
      console.log(result)
    } catch (error) {
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
      .where('benutzername', request.input('benutzername'))
      .first()
    const passwordOk = await hash.verify(result.password, request.input('password'))
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
      benutzername: result.benutzername,
      bundesland: result.bundesland,
      profilbild: result.profilbild,
    })
    console.log(session.get('user'))
    return response.redirect('/')
  }
  public async logout({ session, response }: HttpContext) {
    session.forget('user')
    response.redirect('/')
  }
}
