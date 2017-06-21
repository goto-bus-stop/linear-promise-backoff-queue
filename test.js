var test = require('tape')
var createBackoff = require('.')

var timePassed = 0
global.setTimeout = function (fn, delay) {
  process.nextTick(function () {
    timePassed += delay
    fn()
  })
}

test('asserts', function (t) {
  t.throws(function () {
    createBackoff()
  }, /Expected an options object/)

  t.throws(function () {
    createBackoff({ increment: '100' })
  }, /`opts.increment` should be a number/)

  t.throws(function () {
    createBackoff({ increment: 100 })
  }, /`opts.max` should be a number/)

  t.doesNotThrow(function () {
    createBackoff({
      increment: 100,
      max: 1000
    })
  })

  t.end()
})

test('backoff', function (t) {
  t.plan(5)

  timePassed = 0
  var backoff = createBackoff({
    increment: 100,
    max: 1000
  })

  var fn = backoff(function (expectedTime) {
    t.is(timePassed, expectedTime)
  })

  fn(0) // delay = 100
  fn(100) // delay = 200
  fn(300) // delay = 300
  fn(600) // delay = 400
  fn(1000).then(t.end)
})

