import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'

export default class AnzeigesController {
  public async index({ view, session }: HttpContext) {
    const item = await db.from('Items').select('*')
    const itemImages = await db
      .from('itemImages')
      .select('*')
      .join('Items', 'Items.itemid', 'itemImages.itemID')
      .groupBy('Items.itemid')
    return view.render('pages/home', { item, itemImages, current_user: session.get('user') })
  }

  async createForm({ view, session }: HttpContext) {
    const current_user = session.get('user')
    if (!current_user) {
      return view.render('pages/user/login')
    }
    return view.render('pages/anzeigen/anzeigeaufgeben', { current_user: session.get('user') })
  }

  async show_site({ view, session, request }: HttpContext) {


    const item = await db.from('Items').select('*').where('itemID', request.params().itemID).first()
    const itemImages = await db.from('itemImages').select('*').where('itemID', request.params().itemID)
    const user = await db.from('user').select('*').where('email', item.email).first()
    
    if (!item || !user || !itemImages) {
      return view.render('pages/anzeigen/anzeigeseite', { error: 'Item nicht gefunden' })
    }
    const current_user = session.get('user')
    return view.render('pages/anzeigen/anzeigeseite', { item, itemImages, user, current_user })
  }

  async createProcess({ request, response, session, view }: HttpContext) {
    const images = request.files('images', { size: '2mb', extnames: ['jpg', 'png', 'jpeg'] })

    if (!images || !images[0]) {
      return view.render('pages/anzeigen/anzeigeaufgeben', { error: 'Bitte Bilder hochladen' })
    }

    for (const image of images) {
      await image.move(app.publicPath('images'), { name: `${cuid()}.${image.extname}` })
    }

    const current_user = session.get('user')
    if (!current_user) {
      return response.redirect('/login')
    }

    const verhandelbar = request.input('negotiable') === 'Ja' ? 'Ja' : 'Nein'
    const versand =
      request.input('shipping') === 'Nein'
        ? ''
        : request.input('shipping_price') === ''
          ? 0.0
          : request.input('shipping_price')

    try {
      const anzeige = await db.table('Items').insert({
        itemName: request.input('title'),
        kategorie: request.input('category'),
        preis: request.input('price'),
        beschreibung: request.input('description'),
        verhandelbar: verhandelbar,
        versand: versand,
        email: current_user.email,
      })
      for (const image of images) {
        await db.table('itemImages').insert({
          bildReferenz: image.fileName,
          itemID: anzeige[0],
        })
      }
    } catch (error) {
      return error
    }

    response.redirect('/')
  }

  async youritems({ view, session }: HttpContext) {
    const current_user = session.get('user')
    if (!current_user) {
      return view.render('pages/user/login')
    }

    console.log(current_user.email)

    const item = await db.from('Items').select('*').where('email', current_user.email)
    console.log(item[0])
    const itemImages = await db
      .from('itemImages')
      .select('*')
      .join('Items', 'Items.itemid', 'itemImages.itemID')
      .where('Items.email', current_user.email)
      .groupBy('Items.itemid')
    return view.render('pages/user/userprofile_items', {
      item,
      itemImages,
      current_user: session.get('user'),
    })
  }

  async favorites({ view, session }: HttpContext) {
    const current_user = session.get('user')
    if (!current_user) {
      return view.render('pages/user/login')
    }

    console.log(current_user.email)
    console.log(await db.from('Items').select('*').where('email', current_user.email))

    const favorites = await db
      .from('favorisierteItems')
      .select('*')
      .where('email', current_user.email)
      .groupBy('itemID')

    const itemIDs = favorites.map((favorite) => favorite.itemID)

    const items = await db.from('Items').select('*').whereIn('itemID', itemIDs)
    const itemImages = await db
      .from('itemImages')
      .select('*')
      .join('Items', 'Items.itemid', 'itemImages.itemID')
      .whereIn('Items.itemid', itemIDs)
      .groupBy('Items.itemid')

    console.log(favorites)

    return view.render('pages/user/userprofile_favorites', {
      items,
      itemImages,
      favorites,
      current_user: session.get('user'),
    })
  }

  async createFavorite({ request, response, session }: HttpContext) {
    const current_user = session.get('user')
    if (!current_user) {
      return response.redirect('/login')
    }

    const item = await db.from('Items').select('itemID').where('itemID', request.input('itemID'))

    try {
      await db.table('favorisierteItems').insert({
        itemID: item[0].itemID,
        email: current_user.email,
      })
    } catch (error) {
      session.flash('notification', 'Item schon favorisiert')
      return response.redirect('/anzeigeseite/' + item[0].itemID) 
    }
    response.redirect('/anzeigeseite/' + item[0].itemID)
  }
}
