'use strict'

/*
|--------------------------------------------------------------------------
| SecretSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

class SecretSeeder {
  async run () {
    const password = await Factory
    .model('App/Models/Secret')
    .createMany(10)
  }
}

module.exports = SecretSeeder
