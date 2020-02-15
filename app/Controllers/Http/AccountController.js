'use strict'
const User = use('App/Models/User')
const Database = use('Database')
const Hashids = require('hashids/cjs')
const hashids = new Hashids("one-time-secret", 5, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890");
class AccountController {

    async getAllPeasswords(userId){
        let passwords = await Database
        .table(`vault_${hashids.encode(userId)}`)
        .select('id', 'label')
    
        passwords.forEach((password) => {
            password.id = hashids.encode(password.id)
        })
        return passwords
    }

    async GetRegister({ request, response, view }) {
        return view.render('account.register')
    }

    async GetSettings({ request, response, view }){
        return view.render('settings')
    }
    async PostLogin({ request, response, session, auth, view }){
        const { email, password } = request.all()
        try {
            const { id } = await auth.attempt(email, password)

        } catch(e) {
            if (e.message.includes('E_USER_NOT_FOUND')){
                e.message = 'Email does not exist'
            }
            if (e.message.includes('E_PASSWORD_MISMATCH')){
                e.message = 'Invalid email or password'
            }
            session.flash({error: e.message})
            session.flashAll().withErrors()
            return response.redirect('/')
        }

        return response.redirect('/password/manage')
    }
    async PostAccount({ request, response, session, auth }) {
        const user = new User()
        const { username, email, password, password_confirm } = request.all()
        // session.flashAll()
        if (password != password_confirm) {
            session.withErrors({passError: 'Sorry the entered passwords don\'t match.  Try again'}).flashAll()
            return response.redirect('back')
        }
            user.username = username,
            user.email = email
            user.password = password

            try {
                await user.save(user)
                const { id } = await auth.attempt(email, password)
                const query = `
                CREATE TABLE vault_${hashids.encode(id)}(
                    id INT NOT NULL AUTO_INCREMENT,
                    label VARCHAR(255) NOT NULL,
                    domain TEXT,
                    username VARCHAR(255),
                    password VARCHAR(255),
                    PRIMARY KEY ( id )
                )`
                const db = await Database
                .raw(query)
                return response.redirect('/password/manage')
            } catch (e){
                let msg = e.sqlMessage
                if (msg.includes('users_username_unique')) {
                    msg = 'Sorry, this username is already taken.  Please try another'
                }
                if (msg.includes('users_email_unique')) {
                    msg = 'Sorry, this email is already in user.  Please try another'
                }
                session.withErrors({error: msg}).flashAll()
                return response.redirect('back')
            }
        const status = await user.save(user)
    }

    async GetLogout({ request, response, auth, view }) {
        await auth.logout()
        return response.redirect('/')
    }
}

module.exports = AccountController
