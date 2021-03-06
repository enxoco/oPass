'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.on('/').render('home')

Route.get('/password/manage', 'PasswordController.GetPasswords')
Route.post('/password/manage', 'PasswordController.PostPasswords')
Route.get('/password/remove/:id', 'PasswordController.RemovePassword')
Route.get('/password/:id', 'PasswordController.GetSinglePassword')
Route.get('/import', 'PasswordController.GetImport')
Route.post('/import', 'PasswordController.PostImport')
Route.get('/register', 'AccountController.GetRegister')
Route.post('/account/create/', 'AccountController.PostAccount')
Route.post('/account/login', 'AccountController.PostLogin')
Route.get('/logout', 'AccountController.GetLogout')
Route.get('/settings', 'AccountController.GetSettings')
// Route.post('/password/retrieve', 'PasswordController.GetSinglePassword')