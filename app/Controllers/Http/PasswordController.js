'use strict'
const Hashids = require('hashids/cjs')
const hashids = new Hashids("one-time-secret", 5, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890");
const Database = use('Database')
const Drive = use('Drive')
const Helpers = use('Helpers')
const papa = require('papaparse')
const fs = require('fs')
class PasswordController {

    async GetImport({ request, response, view, session }) {
        return view.render('import')
    }

    async PostImport({ request, response, view, session }) {   
        const csv = request.file('pass_file')

        
        await csv.move(Helpers.tmpPath('uploads'), {
            name: 'custom-name.csv',
            overwrite: true
        })
        let saved = await Drive.get(Helpers.tmpPath('uploads') + '/custom-name.csv', 'utf-8')
        let json = papa.parse(saved)['data']
        try {
            for (var i = 1; i < json.length; i++){
                let p = json[i]
                await Database
                    .table('secrets')
                    .insert({
                        'domain': p[0],
                        'username': p[1],
                        'password': p[2],
                        'label': p[4]
                    })
            }
        } catch(e){
            session.flash({error: e})
        }
        session.flash( {status: 'success'})

        await Drive.delete(Helpers.tmpPath('uploads') + '/custom-name.csv')
        return response.redirect('/password/manage')

        
    }

    async PostPasswords({ request, response, view, session }) {
        const { friendly, domain, username, password, id } = request.all()
        try {
            const update = await Database
            .table('secrets')
            .update({label: friendly, domain, username, password})
            .where('id', hashids.decode(id))
            console.log(`update ${update}`)
            session.flash({ status: update })
        } catch(e) {
            console.log(`error: ${e}`)
            session.flash({ error: e})
        }

        return response.redirect('back')
    }

    async getAllPasswords(){
        let passwords = await Database
        .table('secrets')
        .select('id', 'label')
    
        passwords.forEach((password) => {
            console.log(password)
            password.id = hashids.encode(password.id)
        })
        return passwords
    }

    async GetSinglePassword({ request, response, view, params }) {
        const { id } = params
        let secret = await Database
            .table('secrets')
            .where('id', hashids.decode(id))
        let passwords = await this.getAllPasswords()
        secret = secret[0]
        secret.id = id
        return view.render('passwords', {passwords, password: secret})
    }

    async GetPasswords({ view }) {
        let passwords = await this.getAllPasswords()

        return view.render('passwords', {passwords})

    }
}

module.exports = PasswordController
