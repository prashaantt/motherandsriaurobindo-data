require(
    [
    'jquery',
    'es5-shim/es5-shim',
    'es5-shim/es5-sham',
    'init_flight',
    'init',
    'bootstrap/dropdown',
    'bootstrap/collapse',
    'bootstrap/transition',
    'bootstrap/tooltip',
    'bootstrap/modal',
    'bootstrap/tab',
    'turbolinks'
  ],

  function ($, shim, sham, flight, initialize) {
    'use strict';
    
    Turbolinks.enableProgressBar();

    var ready = function () {
      initialize();
    };

    $(document).ready(ready);
    $(document).on('page:load', ready);
  }
);
