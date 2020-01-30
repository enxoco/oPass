'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class SecretsSchema extends Schema {
  up () {
    this.create('secrets', (table) => {
      table.increments()
      table.string('label')
      table.string('domain')
      table.string('username')
      table.string('password')
      table.timestamps()
    })
  }

  down () {
    this.drop('secrets')
  }
}

module.exports = SecretsSchema
