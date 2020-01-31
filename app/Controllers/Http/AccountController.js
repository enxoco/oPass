'use strict'
const User = use('App/Models/User')

class AccountController {

    async GetRegister({ request, response, view }) {
        return view.render('account.register')
    }
    async PostAccount({ request, response, session }) {
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
}

module.exports = AccountController
