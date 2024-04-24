import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import app from '@adonisjs/core/services/app'


export default class AnzeigesController {

    async createForm({ view, session }: HttpContext) {

        return view.render('pages/anzeigen/anzeigeaufgeben')
    }

    async show_site({ view, session }: HttpContext) {
    
        return view.render('pages/anzeigen/anzeigeseite')
    }


}