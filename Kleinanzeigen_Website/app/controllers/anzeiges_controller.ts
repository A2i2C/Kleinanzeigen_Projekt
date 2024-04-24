import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class AnzeigesController {

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

    async createProcess({ request, response, session }: HttpContext) {
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
            console.log(anzeige)
        }
        catch (error) {return error}
        response.redirect('/')
    }
}