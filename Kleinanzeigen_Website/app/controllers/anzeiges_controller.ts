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

  public async Searchbar({ request, view, session, response }: HttpContext) {
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
      // No specific category and search message, return all items
      item
      itemImages
    }

    if (kategorie === 'alle' && searchmessage !== '') {
      // No specific category, but there is a search message
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
      // Specific category, but no search message
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
      // Specific category and search message
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
      // No items found
      return view.render('pages/home', {
        item,
        itemImages,
        current_user: session.get('user'),
        errorsearch: 'Keine Anzeigen gefunden',
      })
    }

    return response.redirect('/')
  }

  // This method shows the details of a specific item
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

  // This method renders the create form for a new item
  async createForm({ view, session }: HttpContext) {
    const current_user = session.get('user')
    if (!current_user) {
      return view.render('pages/user/login')
    }
    return view.render('pages/anzeigen/anzeigeaufgeben', { current_user: session.get('user') })
  }

  // This method handles the creation of a new item
  async createProcess({ request, response, session }: HttpContext) {
    const current_user = session.get('user')
    if (!current_user) {
      return response.redirect('/Login')
    }

    const images = request.files('images', {
      size: '7mb',
      extnames: ['jpg', 'png', 'jpeg', 'webp'],
    })

    if (!images || !images[0]) {
      session.flash('errornoimages', 'Es muss mindestens ein Bild hochgeladen werden')
      return response.redirect('/Anzeige_erstellen')
    }

    const imagesValidation = images.map((image) => image.isValid)

    for (const image of imagesValidation) {
      if (!image) {
        session.flash(
          'errorimages',
          'Ihr Bild darf nicht größer als 7MB sein und muss eine .jpg, .jpeg .png oder .webp Datei sein'
        )
        return response.redirect('/Anzeige_erstellen')
      }
    }

    let price = request.input('price')
    if (price === '0.00') {
      price = 'Kostenlos'
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
      await image.move(app.publicPath('item_images'), { name: `${cuid()}.${image.extname}` })
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

  // This method renders the list of items created by the current user
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

  // This method activates or deactivates an item
  async deactivateItem({ request, response, session }: HttpContext) {
    const current_user = session.get('user')
    if (!current_user) {
      return response.redirect('/Login')
    }

    const item = await db.from('Items').where('itemID', request.input('itemID')).first()

    if (item.isActive === 'False') {
      await db.from('Items').where('itemID', request.input('itemID')).update({ isActive: 'True' })
      session.flash('successactivateitem', 'Item wurde aktiviert')
    } else {
      await db.from('Items').where('itemID', request.input('itemID')).update({ isActive: 'False' })
      session.flash('successdeactivateitem', 'Item wurde deaktiviert')
    }

    return response.redirect('/Deine_Anzeigen')
  }

  // This method renders the list of favorite items for the current user
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

    const item = await db.from('Items').select('*').whereIn('itemID', itemIDs)
    const itemImages = await db
      .from('itemImages')
      .select('*')
      .join('Items', 'Items.itemid', 'itemImages.itemID')
      .join('user', 'Items.email', 'user.email')
      .whereIn('Items.itemid', itemIDs)
      .groupBy('Items.itemid')

    return view.render('pages/user/userprofile_favorites', {
      item,
      itemImages,
      favorites,
      current_user: session.get('user'),
    })
  }

  // This method handles the creation or deletion of a favorite items
  async createFavorite({ request, response, session }: HttpContext) {
    const current_user = session.get('user')
    if (!current_user) {
      return response.redirect('/Login')
    }

    const item = await db
      .from('Items')
      .select('itemID', 'email')
      .where('itemID', request.input('itemID'))

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
    return response.redirect('/Anzeige/' + item[0].itemID)
  }
}
