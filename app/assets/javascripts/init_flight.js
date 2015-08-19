define([
    'flight/lib/compose',
    'flight/lib/registry',
    'flight/lib/advice',
    'flight/lib/logger',
    'flight/lib/debug',
  ],

  function(compose, registry, advice, withLogging, debug) {
    'use strict';

    // enable debug in development
    // debug.enable(true);
    compose.mixin(registry, [advice.withAdvice]);
  }
);
