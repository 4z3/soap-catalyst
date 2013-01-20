var log = require('./util').log

var wsdl_uri
var proxy_uri
var hostname = process.env.HOSTNAME || '0.0.0.0'
var port = process.env.PORT || 1337

try {
  switch (process.argv.length) {
    default:
      throw { message: 'bad argument count' }
    case 3:
      wsdl_uri = process.argv[2]
      break
    case 4:
      var listen_uri = require('url').parse(process.argv[2])
      var listen_protocol = listen_uri.protocol || 'unix:'
      switch (listen_protocol) {
        default:
          throw { message: 'bad protocol' }
        case 'unix:':
          hostname = undefined
          port = listen_uri.pathname
          proxy_uri = listen_protocol + '//' + port
          break
        case 'http:':
          if (listen_uri.hostname) {
            hostname = listen_uri.hostname
          }
          if (listen_uri.port) {
            // TODO? getent services
            port = Number(listen_uri.port)
          }

          proxy_uri = listen_protocol + '//' + hostname + ':' + port

          if (!port) {
            throw { message: 'bad port' }
          }
          if (listen_uri.path !== '/') {
            throw { message: 'bad path' }
          }
      }
      wsdl_uri = process.argv[3]
  }
} catch (err) {
  console.error('error:', err.message)
  console.error('usage: node soap-catalyst [http://HOSTNAME:PORT] WSDL_FILE')
  process.exit(23)
}

log('wsdl_uri:', wsdl_uri)
log('proxy_uri:', proxy_uri)
require('soap').createClient(wsdl_uri, function (err, client) {
  if (err) {
    console.error('error:', err.message)
    process.exit(23)
  }

  var listener = require('./proxy').createRequestListener(client)
  var server = require('http').createServer(listener)
  
  server.on('listening', function () { log('ready') })
  server.listen(port, hostname)
})
