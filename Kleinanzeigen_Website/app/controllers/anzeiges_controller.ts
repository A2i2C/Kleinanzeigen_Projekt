import { cuid } from '@adonisjs/core/helpers'
import { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'
import { createAnzeigeValidator, shippingValidator } from '#validators/anzeigen'

export default class AnzeigesController {
  public async index({ view, session }: HttpContext) {
    const item = await db.from('Items').select('*')
    const itemImages = await db
      .from('itemImages')
      .select('*')
      .join('Items', 'Items.itemid', 'itemImages.itemID')
      .join('user', 'Items.email', 'user.email')
      .where('Items.isActive', 'True')
      .groupBy('Items.itemid')
    return view.render('pages/home', { item, itemImages, current_user: session.get('user') })
  }

  public async Searchbar({ request, view, session }: HttpContext) {
    const kategorie = request.input('category')

    const searchmessage = request.input('search') === null ? '' : request.input('search')

    let item = await db.from('Items').select('*')
    let itemImages = await db
      .from('itemImages')
      .select('*')
      .join('Items', 'Items.itemid', 'itemImages.itemID')
      .join('user', 'Items.email', 'user.email')
      .where('Items.isActive', 'True')
      .groupBy('Items.itemid')

    if (kategorie === 'alle' && searchmessage === '') {
      item
      itemImages
    }

    if (kategorie === 'alle' && searchmessage !== '') {
      item = await db
        .from('Items')
        .select('*')
        .where('itemName', 'like', '%' + searchmessage + '%')
      itemImages = await db
        .from('itemImages')
        .select('*')
        .join('Items', 'Items.itemid', 'itemImages.itemID')
        .join('user', 'Items.email', 'user.email')
        .where('Items.isActive', 'True')
        .where('Items.itemName', 'like', '%' + searchmessage + '%')
        .groupBy('Items.itemid')
    }

    if (kategorie !== 'alle' && searchmessage === '') {
      item = await db.from('Items').select('*').where('kategorie', kategorie)
      itemImages = await db
        .from('itemImages')
        .select('*')
        .join('Items', 'Items.itemid', 'itemImages.itemID')
        .join('user', 'Items.email', 'user.email')
        .where('Items.isActive', 'True')
        .where('Items.kategorie', kategorie)
        .groupBy('Items.itemid')
    }

    if (kategorie !== 'alle' && searchmessage !== '') {
      item = await db
        .from('Items')
        .select('*')
        .where('kategorie', kategorie)
        .andWhere('itemName', 'like', '%' + searchmessage + '%')
      itemImages = await db
        .from('itemImages')
        .select('*')
        .join('Items', 'Items.itemid', 'itemImages.itemID')
        .join('user', 'Items.email', 'user.email')
        .where('Items.isActive', 'True')
        .where('Items.kategorie', kategorie)
        .where('Items.itemName', 'like', '%' + searchmessage + '%')
        .groupBy('Items.itemid')
    }

    if (item.length === 0) {
      return view.render('pages/home', {
        item, itemImages, current_user: session.get('user'), errorsearch: 'Keine Anzeigen gefunden'})
      }
    

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
    if (!item) {
      return view.render('pages/anzeigen/anzeigeseite', { error: 'Item nicht gefunden' })
    }
    const itemImages = await db
      .from('itemImages')
      .select('*')
      .where('itemID', request.params().itemID)
    const user = await db.from('user').select('*').where('email', item.email).first()
    const current_user = session.get('user')
    if (!current_user) {
      return view.render('pages/anzeigen/anzeigeseite', {
        item,
        itemImages,
        user,
        current_user: null,
      })
    }
    const favorisiert = await db
      .from('favorisierteItems')
      .select('*')
      .where('itemID', item.itemID)
      .andWhere('email', current_user.email)
      .first()

    return view.render('pages/anzeigen/anzeigeseite', {
      item,
      itemImages,
      user,
      current_user,
      favorisiert,
    })
  }

  async createProcess({ request, response, session, view }: HttpContext) {
    const current_user = session.get('user')
    if (!current_user) {
      return response.redirect('/login')
    }

    const images = request.files('images')
    if (!images || !images[0]) {
      session.flash('errornoimages', 'Es muss mindestens ein Bild hochgeladen werden')
      return view.render('pages/anzeigen/anzeigeaufgeben')
    }
    const verhandelbar = request.input('negotiable') === 'Ja' ? 'Ja' : 'Nein'
    let versand =
      request.input('shipping') === 'Nein'
        ? ''
        : request.input('shipping_price') === ''
          ? 0.0
          : request.input('shipping_price')
    if (request.input('shipping') >= 0) {
      await request.validateUsing(shippingValidator)
    }
    await request.validateUsing(createAnzeigeValidator)

    for (const image of images) {
      //await imageValidator.validate({ image })
      await image.move(app.publicPath('images'), { name: `${cuid()}.${image.extname}` })
    }

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
      session.flash('successcreate', 'Anzeige wurde erstellt')
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

    const item = await db.from('Items').select('*').where('email', current_user.email)
    const itemImages = await db
      .from('itemImages')
      .select('*')
      .join('Items', 'Items.itemid', 'itemImages.itemID')
      .join('user', 'Items.email', 'user.email')
      .where('Items.email', current_user.email)
      .groupBy('Items.itemid')
    return view.render('pages/user/userprofile_items', {
      item,
      itemImages,
      current_user: session.get('user'),
    })
  }

  async deactivateItem({ request, response, session }: HttpContext) {
    const current_user = session.get('user')
    if (!current_user) {
      return response.redirect('/login')
    }
    const item = await db.from('Items').where('itemID', request.input('itemID')).first()

    if (item.isActive === 'False') {
      await db.from('Items').where('itemID', request.input('itemID')).update({ isActive: 'True' })
      session.flash('successactivateitem', 'Item wurde aktiviert')
    } else {
      await db.from('Items').where('itemID', request.input('itemID')).update({ isActive: 'False' })
      session.flash('successdeactivateitem', 'Item wurde deaktiviert')
    }

    return response.redirect('/youritems')
  }

  async favorites({ view, session }: HttpContext) {
    const current_user = session.get('user')
    if (!current_user) {
      return view.render('pages/user/login')
    }

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

    const item = await db
      .from('Items')
      .select('itemID', 'email')
      .where('itemID', request.input('itemID'))

    if (item[0].email === current_user.email) {
      session.flash('errorownfavorising', 'Du kannst dein eigenes Item nicht favorisieren')
      return response.redirect('/Item/' + item[0].itemID)
    }

    try {
      await db.table('favorisierteItems').insert({
        itemID: item[0].itemID,
        email: current_user.email,
      })
      session.flash('succesfavorised', 'Item wurde favorisiert')
    } catch (error) {
      await db
        .from('favorisierteItems')
        .where('itemID', item[0].itemID)
        .andWhere('email', current_user.email)
        .delete()
      session.flash('succesdefavorised', 'Item wurde entfavorisiert')
    }
    return response.redirect('/Item/' + item[0].itemID)
  }
}
