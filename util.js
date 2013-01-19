exports.log = function () {
  var args = Array.prototype.slice.call(arguments)
  args = [(new Date).toISOString()].concat(args)
  console.log.apply({}, args)
}
