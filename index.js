var assert = require('assert')

function delay (time) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, time)
  })
}

/**
 * Create a linear incremental backoff function. Returns a function that wraps
 * a Promise-returning function.
 *
 * **Usage**
 *
 *   const func = () => Promise.resolve('done')
 *   const backoff = createBackoff({ increment: 200, max: 2200 })
 *   const throttled = backoff(func)
 *   throttled().then(console.log) // Resolves immediately
 *   throttled().then(console.log) // Resolves after 200 ms
 */
module.exports = function createBackoff (opts) {
  assert.equal(typeof opts, 'object', 'Expected an options object')
  assert.equal(typeof opts.increment, 'number', '`opts.increment` should be a number')
  assert.equal(typeof opts.max, 'number', '`opts.max` should be a number')

  var increment = opts.increment
  var max = opts.max
  var queuedCalls = 0
  var currentDelay = 0
  var lastCall = opts.Promise ? opts.Promise.resolve() : Promise.resolve()

  function queueCall () {
    queuedCalls += 1
    // Keep increasing the delay as more calls are queued.
    currentDelay = Math.min(currentDelay + increment, max)
  }
  function unqueueCall () {
    queuedCalls -= 1
    // If our queue is empty, reset the delay.
    if (queuedCalls === 0) {
      currentDelay = 0
    }
  }

  return function (fn) { return function () {
    var self = this
    var args = Array(arguments.length)
    for (var i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }
    queueCall()

    // `result` will resolve with the result of the function call.
    var result = lastCall.then(function () {
      return fn.apply(self, args)
    })

    // `lastCall` will resolve after the backoff duration is over.
    lastCall = result
      .then(function () { return null }) // Ignore return value of previous call.
      .catch(function () { return null }) // Ignore errors.
      .then(function () { return delay(currentDelay) })
      .then(function (value) {
        unqueueCall()
        return value
      })

    return result
  } }
}
