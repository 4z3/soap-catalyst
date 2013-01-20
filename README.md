# SOAP Catalyst

  A proxy server that maps URIs to SOAP operations.

## Installation

    git clone https://github.com/4z3/soap-catalyst
    (cd soap-catalyst && npm install)

## Example

### Start Proxy Server

  Start proxy server to accept requests on
  [http://localhost:8080](http://localhost:8080):

    PORT=8080 node soap-catalyst $my_wsdl_file_or_url
  
  The server will stay in the foreground and print debugging messages to
  stdout.

### Invoke Operations with [cURL](http://curl.haxx.se/)

    curl -d $par1=$arg1 http://localhost:8080/$myService/$myPort/$myOperation

## API

### GET /{service}/{port}/{operation}

  Retrieve description of operation's input and output parameters.

### POST /{service}/{port}/{operation}

  Invoke an operation. Arguments may be provided as form data.
