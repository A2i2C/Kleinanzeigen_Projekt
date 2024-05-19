import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import hash from '@adonisjs/core/services/hash'
import { cuid } from '@adonisjs/core/helpers'
import {
  registrierungsValidator,
  passwordValidator,
  updateProfileValidator,
} from '#validators/user'

export default class UsersController {
  public async registerForm({ view }: HttpContext) {
    return view.render('pages/user/registrierung')
  }

  public async userprofile({ view, session }: HttpContext) {
    const current_user = session.get('user')
    if (current_user === undefined) {
      return view.render('pages/user/login')
    }
    return view.render('pages/user/userprofile_edit', { current_user: session.get('user') })
  }

  public async registerProcess({ request, response }: HttpContext) {
    
    await request.validateUsing(registrierungsValidator)
    const hashedPassword = await hash.make(request.input('password'))

    try {
      await db.table('user').insert({
        email: request.input('email'),
        vorname: request.input('vorname'),
        nachname: request.input('nachname'),
        benutzername: request.input('benutzername'),
        profilbild: 'standard_user_profilepicture.png',
        password: hashedPassword,
      })
    } catch (error) {
      return error
    }
    response.redirect('/Login')
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

    if (!result) {
      return view.render('pages/user/login', { error: 'Benutzername oder Passwort ist Falsch' })
    }

    const passwordOk = await hash.verify(result.password, request.input('password'))

    if (!passwordOk) {
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

    return response.redirect('/')
  }
  public async logout({ session, response }: HttpContext) {
    session.forget('user')
    session.flash({ succeslogout: 'Erfolgreich ausgeloggt' })
    response.redirect('/')
  }

  public async updateProfile({ view, request, session }: HttpContext) {
    const current_user = session.get('user')
    if (current_user === undefined) {
      return view.render('pages/user/login')
    }
    const user = await db.from('user').where('email', current_user.email).first()

    const file = request.file('profilepicture')

    let wahr = 'falsch'

    if (file) {
//      await profilepictureValidator.validate({ file })
      await file.move('public/images', { name: `${cuid()}.${file.extname}` })
    }

    if (!request.input('oldpasswort') && !request.input('password')) {
    } else {
      if (!request.input('oldpasswort') && request.input('password')) {
        return view.render('pages/user/userprofile_edit', {
          error: 'Bitte geben sie ihr altes Passwort ein, vor dem ändern des neuen Passwortes',
          current_user: session.get('user'),
        })
      } else {
        const checkpassword = await hash.verify(user.password, request.input('oldpasswort'))
        if (!checkpassword) {
          return view.render('pages/user/userprofile_edit', {
            error: 'Altes Passwort ist Falsch',
            current_user: session.get('user'),
          })
        }
        await request.validateUsing(passwordValidator)
        wahr = 'wahr'
        session.flash( 'succespasswordchange', 'Passwort erfolgreich geändert' )
      }
    }

    await request.validateUsing(updateProfileValidator)
    try {
      await db
        .from('user')
        .where('email', current_user.email)
        .update({
          email: request.input('email'),
          vorname: request.input('vorname'),
          nachname: request.input('nachname'),
          benutzername: request.input('benutzername'),
          profilbild: file ? file.fileName : current_user.profilbild,
        })
    } catch (error) {
      return error
    }

    if (wahr === 'wahr') {
      const hashedPassword = await hash.make(request.input('password'))
      await db.from('user').where('email', current_user.email).update({
        password: hashedPassword,
      })
    }

    session.put('user', {
      email: request.input('email'),
      vorname: request.input('vorname'),
      nachname: request.input('nachname'),
      benutzername: request.input('benutzername'),
      bundesland: request.input('bundesland'),
      profilbild: file ? file.fileName : current_user.profilbild,
    })

    return view.render('pages/user/userprofile_edit', { current_user: session.get('user') })
  }
}
