'use strict'
const Factory = use('Factory')
const Hash = use('Hash')

  // Teacher blueprint
  Factory.blueprint('App/Models/Secret', (faker) => {
    return {

      label: faker.company(),
      username: faker.username(),
      domain: faker.domain(),
      password: faker.password(),

    }
  })
  