Tidal.js
===================

<img src="https://travis-ci.org/Wildhoney/Tidal.js.png?branch=master" alt="Travis CI" />
&nbsp;
<img src="https://badge.fury.io/js/tidal.png" alt="NPM Version" />

Getting Started
--------

 * Install Tidal globally: `npm install -g tidal`;
 * Install all dependencies: `npm install`, `bower install`;
 * Run benchmarking with `tidal example.com:8889`;

Adding Responder
--------

Basic responder that listens for an event (`on`), and replies with a response (`respond`), with some content (`with`).

```javascript
tidal.addResponder({
    on: 'content/updated',
    respond: 'content/updated/acknowledged',
    with: { receipt: 01234 }
});
```

After the response has been sent we can begin a strategy.

```javascript
tidal.addResponder({
    on: 'content/updated',
    respond: 'content/updated/acknowledged',
    with: { receipt: 01234 },
    then: someStrategy
});
```