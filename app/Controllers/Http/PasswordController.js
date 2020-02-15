'use strict'
const Hashids = require('hashids/cjs')
const hashids = new Hashids("one-time-secret", 5, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890");
const Database = use('Database')
const Drive = use('Drive')
const Helpers = use('Helpers')
const papa = require('papaparse')
const fs = require('fs')
class PasswordController {

    async GetImport({ request, response, view, session, auth }) {
        let passwords = await this.getAllPasswords(auth.user.id)
        return view.render('import', {passwords})
    }

    async PostImport({ request, response, view, session, auth }) {   
        const csv = request.file('pass_file')
        const { pass_text } = request.all()

        if (pass_text){//Handle pasted in passwords
            let json = papa.parse(pass_text)['data']
            try {
                for (var i = 1; i < json.length; i++){
                    let p = json[i]
                    await Database
                        .table(`vault_${hashids.encode(auth.user.id)}`)
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
            return response.redirect('/password/manage')

        }

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
                    .table(`vault_${hashids.encode(auth.user.id)}`)
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

    async PostPasswords({ request, response, view, session, auth }) {
        const { friendly, domain, username, password, id } = request.all()
        if (id) {
            try {
                const update = await Database
                .table(`vault_${hashids.encode(auth.user.id)}`)
                .update({label: friendly, domain, username, password})
                .where('id', hashids.decode(id))
                session.flash({ status: 'Password Updated successfully' })
            } catch(e) {
                session.flash({ error: e})
            }   
        } else {
            try {
                const update = await Database
                .table(`vault_${hashids.encode(auth.user.id)}`)
                .insert({label: friendly, domain, username, password})
                session.flash({ status: 'Password created successfully' })
            } catch(e) {
                session.flash({ error: e})
            }
        }


        return response.redirect('back')
    }

    async getAllPasswords(userId){
        let passwords = await Database
        .table(`vault_${hashids.encode(userId)}`)
        .select('id', 'label', 'domain', 'username')
    
        passwords.forEach((password) => {
            password.id = hashids.encode(password.id)
        })
        return passwords
    }

    async GetSinglePassword({ request, response, view, params, auth }) {
        const { id } = params
        const userId = auth.user.id
        let secret = await Database
            .table(`vault_${hashids.encode(userId)}`)
            .where('id', hashids.decode(id))
        let passwords = await this.getAllPasswords(auth.user.id)
        secret = secret[0]
        secret.id = id
        return view.render('passwords', {passwords, password: secret})
    }

    async RemovePassword({ request, response, view, params, session, auth }) {
        const { id } = params
        try {
            const update = await Database
            .table(`vault_${hashids.encode(auth.user.id)}`)
            .delete()
            .where('id', hashids.decode(id))
        } catch(e) {
            session.flash({error: e})
        }
        session.flash({ status: 'Success' })

        return response.redirect('back')

    }

    async GetPasswords({ view, auth }) {
        let passwords = await this.getAllPasswords(auth.user.id)
        return view.render('passwords', {passwords})

    }
}

module.exports = PasswordController
