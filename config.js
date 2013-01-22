var url = require('url')

exports.createConfig = function () {

  // default configuration
  var config = {
    listen_uri: url.parse('http://localhost:1337'),
  }

  // load listen_uri from 
  ;[ 'hostname', 'port' ].forEach(function (key) {
    var env = process.env[key.toUpperCase()]
    if (env) {
      config.listen_uri[key] = env
    }
  })

  switch (process.argv.length) {
    default:
      throw { message: 'bad argument count' }
    case 3:
      config.wsdl_uri = process.argv[2]
      break
    case 4:
      config.listen_uri = url.parse(process.argv[2])
      config.wsdl_uri = process.argv[3]
  }

  if (!config.listen_uri.protocol) {
    config.listen_uri.protocol = 'unix:'
  }

  switch (config.listen_uri.protocol) {
    case 'http:':
      if (config.listen_uri.path !== '/') {
        throw { message: 'bad path' }
      }
      // TODO? getent services
      config.listen_uri.port = Number(config.listen_uri.port || 80)
      break
    case 'unix:':
      // TODO? check port
      // TODO ck: file must not exist
      // nothing to do
      break
    default:
      throw { message: 'bad protocol' }
  }

  delete config.listen_uri.host
  delete config.listen_uri.href

  config.listen_uri.toString = function () {
    // TODO? when protocol === 'http:' strip :80
    return url.format(config.listen_uri)
  }

  // TODO check if config.wsdl_uri is bad:
  // /dev/null causes soap.createClient throws an exception
  // /dev/zero causes soap.createClient to try to allocate unlimited memory
  // and possibly more...

  return config
}
