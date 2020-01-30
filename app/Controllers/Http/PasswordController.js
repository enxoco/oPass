'use strict'
const Hashids = require('hashids/cjs')
const hashids = new Hashids("one-time-secret", 5, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890");
const Database = use('Database')

class PasswordController {

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
        let password = await Database
            .table('secrets')
            .where('id', hashids.decode(id))
        let passwords = await this.getAllPasswords()
        return view.render('passwords', {passwords, password: password[0]})
    }

    async GetPasswords({ view }) {
        let passwords = await this.getAllPasswords()

        return view.render('passwords', {passwords})

    }
}

module.exports = PasswordController
