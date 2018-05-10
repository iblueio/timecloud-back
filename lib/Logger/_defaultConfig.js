const path = require('path')

module.exports = {
  appenders: {
    local: {
      type: 'multiFile',
      base: path.resolve(config.directory),
      property: 'categoryName',
      extension: '.log',
    }
  },
  categories: {
    default: {
      appenders: ['local'], level: 'trace',
    },
    local: {
      appenders: ['local'], level: 'trace',
    }
  }
}
