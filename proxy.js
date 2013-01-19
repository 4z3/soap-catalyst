var log = require('./util').log
var url_parse = require('url').parse
var Form = require('formidable').IncomingForm

exports.createRequestListener = function (client, options) {
  if (!options) {
    options = {}
  }

  var path_prefix = options.prefix ? options.prefix.split('/') : []
  var path_suffix = options.suffix ? options.suffix.split('/') : []
  var client_description = client.describe()

  function make_path (req) {
    var url = url_parse(req.url, true)
    var path = path_prefix
      .concat(url.pathname.slice(1).split('/'))
      .concat(path_suffix)
    if (path.length === 1 && path[0] === '') {
      path.pop()
    }
    return path
  }

  return function (req, res) {
    var start_date = new Date

    // end(statusCode, [headers], [body])
    function end (code, headers, body) {
      res.writeHead(code, headers)
      res.end(body)
      var end_date = new Date
      var duration = end_date - start_date
      log(req.method, req.url, '->', code, '[' + duration + 'ms]')
    }

    // end_json(statusCode, [headers,] object)
    function end_json (code, headers, object) {
      if (arguments.length === 2) {
        object = headers
        headers = {}
      }

      // TODO fail if headers['content-type']
      headers['Content-Type'] = 'application/json'
      // TODO try JSON.stringify
      try {
        object = JSON.stringify(object)
      } catch (err) {
        // TODO be more specific than 500
        log(err.message)
        return end(500)
      }
      return end(code, headers, object)
    }

    var path = make_path(req)

    log(req.method, req.url)

    var proxy = find_proxy(path, client)
    if (!proxy) {
      return end(404)
    }

    switch (req.method) {
      case 'GET':
        return end_json(200, proxy.description)
      case 'POST':
        // TODO check typeof proxy_method
        // TODO limit form
        return new Form().parse(req, function(err, fields, files) {
          if (err) {
            log(err.message)
            return end(500)
          }

          // TODO check fields against proxy.description.input

          var input = {}
          Object.keys(proxy.description.input).forEach(function (key) {
            input[key] = fields[key]
          })

          proxy.method(input, function (err, output) {
            if (err) {
              return end(409, { 'Content-Type': 'plain/text' }, err.message)
            }

            // TODO check output against proxy.description.output

            if (proxy.output_path) {
              output = find_object(proxy.output_path, output)
              if (!output) {
                return end(404)
              }
            }

            // TODO Accept handling
            return end_json(200, output)
          })
        })
      default:
        return end(405, { 'Allow': 'GET, POST' })
    }
  }
}

function find_proxy (path, client) {
  // TODO? cache description in client
  var description = client.describe()
  for (var i = 0, n = path.length; i < n; ++i) {
    var key = path[i]

    if (!description.hasOwnProperty(key)) {
      break
    }

    // descent
    client = client[key]
    description = description[key]

    if (Object.keys(description).length === 2
        && description.hasOwnProperty('input')
        && description.hasOwnProperty('output')
        // TODO? check if typeof client === 'function'
        ) {
      var proxy = {
        method: client,
        description: description,
      }
      if (i < n) {
        proxy.output_path = path.slice(i + 1)
      }
      return proxy
    }
  }
}

function find_object (path, object) {
  for (var i = 0, n = path.length; i < n; ++i) {
    var key = path[i]

    if (!object.hasOwnProperty(key)) {
      return
    }

    // descent
    object = object[key]
  }
  return object
}
