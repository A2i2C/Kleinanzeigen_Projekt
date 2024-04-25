import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'

export default class AnzeigesController {

    public async index({ view, session }: HttpContext) {
        const item = await db.from('Items').select('*')
        return view.render('pages/home', { item, user: session.get('user'), page: 'home' })
    }

    async createForm({ view, session }: HttpContext) {

        const user = session.get('user')
        if (!user) {
            return view.render('pages/user/login')
        }
        return view.render('pages/anzeigen/anzeigeaufgeben', { user: session.get('user') })
    }

    async show_site({ view, session }: HttpContext) {
        return view.render('pages/anzeigen/anzeigeseite', { user: session.get('user') })
    }

    async createProcess({ request, response, session, view }: HttpContext) {
        const images = request.files('images', { size: '5mb', extnames: ['jpg', 'png', 'jpeg'] })

        if (!images || images.length === 0) {
            return view.render('pages/anzeigen/anzeigeaufgeben', { error: 'Bitte Bilder hochladen' })
        }

        for (let image of images) {
            if (!image.isValid) {
                return view.render('pages/anzeigen/anzeigeaufgeben', { error: 'Bild Fehler: ' + image.errors[0].message })
            }
            await image.move(app.publicPath('images'), { name: `${cuid()}.${image.extname}` })

        }

        const user = session.get('user')
        if (!user) {
            return response.redirect('/login')
        }

        const verhandelbar = request.input('negotiable') === 'Ja' ? "Ja" : "Nein"
        const versand = request.input('shipping') === 'Nein' ? 0.0 : request.input('shipping_price')
        try {
            const anzeige = await db.table('Items').insert({
                itemName: request.input('title'),
                kategorie: request.input('category'),
                preis: request.input('price'),
                beschreibung: request.input('description'),
                verhandelbar: verhandelbar,
                versand: versand,
                email: user.email
            })
            for (let image of images) {
                const image_db = await db.table('itemImages').insert({
                    bildReferenz: image.fileName,
                    itemID: anzeige[0]
                })
            }
        }
        catch (error) { return error }

        response.redirect('/')
    }
}