define(function (require) {
  'use strict';

  var System = require('system');
  var Content = require('content');
  var ShareBar = require('sharebar');
  var SideBar = require('sidebar');

  return initialize;

  function initialize() {
    Content.attachTo('.js-content');
    ShareBar.attachTo('.js-sharebar');
    SideBar.attachTo('.js-sidebar');
    System.attachTo(document);
  }
});
