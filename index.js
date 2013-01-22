try {
  var config = require('./config').createConfig()
} catch (err) {
  console.error('error:', err.message)
  console.error('usage: node soap-catalyst [http://HOSTNAME:PORT] WSDL_FILE')
  process.exit(23)
}

var log = require('./util').log
var soap = require('soap')
var http = require('http')
var proxy = require('./proxy')

log('wsdl_uri:', config.wsdl_uri)
log('listen_uri:', config.listen_uri.toString())

soap.createClient(config.wsdl_uri, function (err, client) {
  if (err) {
    console.error('error:', err.message)
    process.exit(23)
  }

  var listener = proxy.createRequestListener(client)
  var server = http.createServer(listener)
  
  server.on('listening', function () { log('ready') })

  switch (config.listen_uri.protocol) {
    case 'http:':
      server.listen(config.listen_uri.port, config.listen_uri.hostname)
      break
    case 'unix:':
      server.listen(config.listen_uri.pathname)
      break
    default:
      console.error('error: bad protocol: ' + config.listen_uri.protocol)
      process.exit(23)
  }
})
