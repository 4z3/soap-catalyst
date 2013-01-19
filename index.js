var log = require('./util').log

var wsdl_url = process.argv[2]

log('wsdl_url =', JSON.stringify(wsdl_url))
require('soap').createClient(wsdl_url, function(err, client) {

  var listener = require('./proxy').createRequestListener(client, {
    prefix: process.argv[3],
    suffix: process.argv[4],
  })

  var port = process.env.PORT || 1337
  var host = '0.0.0.0'

  require('http').createServer(listener).listen(port, host, function () {
    log('proxy_url =', JSON.stringify('http://' + host + ':' + port))
  })
})
