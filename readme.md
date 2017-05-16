# linear-promise-backoff-queue

Rate limit calls to promise-returning functions with linear backoff.

## Install

With npm do:

```
npm install --save linear-promise-backoff-queue
```

## Usage

Create a backoff queue:

```js
var createBackoff = require('linear-promise-backoff-queue')

var backoff = createBackoff({
  increment: 200, // amount of additional `ms` to wait between each call
  max: 2200, // max backoff time between calls
})
```

Wrap promise-returning functions to use the backoff queue:

```js
var request = backoff(function () {
  // do your API request
})
```

Use your functions as normal:

```js
// Called immediately
request('/api/hello').then(function () {
  console.log('done 1')
})
// Called after 200ms
request('/api/hello').then(function () {
  console.log('done 2')
})
```

## API

### var backoff = createBackoff(opts)

Create a backoff queue.
The return value is a function that wraps functions passed to it so they will use this backoff queue.
Multiple functions can share the same queue.

`opts` is an object with possible options:

 - `increment` - The time in milliseconds to add on top of the delay between function calls.
   If this is eg. 200, the first call will wait 0ms, the second will wait 200ms, and the third will wait 400ms.
   When the queue empties, when all waiting functions have been called _and_ the remaining delay has passed, the delay will reset to 0ms.
 - `max` - The maximum amount of delay between function calls.
   Once the delay reaches this value, the `increment` will no longer be added on top each time.
 - `Promise` - Optional Promise constructor to use.
   The global Promise is used by default.

### var fnB = backoff(fn)

Wrap `fn` so it will use the backoff queue `backoff`.
`fn` should return a thenable.
When called, `fnB` will wait for the queue to empty and then call `fn`, passing through arguments and `this`.
It returns a Promise that resolves with the result of `fn`.

## License

[MIT](./LICENSE)

