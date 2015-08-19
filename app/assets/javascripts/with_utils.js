define(function (require) {
  'use strict';

  var compose = require('flight/lib/compose');
  var withStorage = require('with_storage');
  var jqueryColor = require('jquery-color/jquery.color');

  return utils;

  function utils() {

    compose.mixin(this, [withStorage]);

    this.attributes({
      bootstrapMobile: 'xs',
      contentSelector: '.js-content',
      navbarSelector: '.navbar-custom'
    });

    this.thisUrl = function() {
      return window.location.protocol + '//' + window.location.host + window.location.pathname.replace('.html', '');
    }

    this.jumpToAnchor = function() {
      var hash = window.location.hash;
      if (hash != '' && hash.match(/#p\d[-\d]*/)) {
        var paras = hash.split('-');
        var paraExists = $(paras[0]).length > 0;
        var offset;
        if (!paraExists) {
          if (paras[0].slice(2) < 1) {
            offset = $('#p1').offset().top;
          } else {
            offset = $(document).height();
          }
        }
        this.scrollIntoView(offset ? offset - this.margin : $(paras[0]).offset().top - this.margin, 
          {highlight: [paras[0].slice(2), paras[1] ? paras[1].slice(1) : 0]});
      } else if (hash != '') {
        if ($(hash).offset()) {
          this.scrollIntoView($(hash).offset().top - this.margin);
        } else {
          this.trigger('readyToView');
        }
      } else {
        this.scrollIntoView(this.readSession(window.location.pathname));
        this.removeSession(window.location.pathname);
      }
    }

    this.scrollIntoView = function(offset, options) {
      var $this = this;
      var duration = options && options.duration ? options.duration : gon.device == 'desktop' ? 500 : 0;
      var elems = options && options.highlight ? options.highlight : null;
      $('html, body').stop().animate({
        scrollTop: parseInt(offset)
      }, duration, function () {
        $this.trigger('readyToView');
      });
      if (elems) {
        for (var i = elems[0]; i <= (elems[1] ? elems[1] : elems[0]); i++) {
          $('#p' + i).attr('data-selected', true);
        }
      }
    }

    this.handleBootstrapEnvChanged = function (event, data) {
      var bootstrapEnv = $('body').attr('data-bootstrap-env');
      if (bootstrapEnv == this.attr.bootstrapMobile) {
        $('html').removeClass('top-padding');
        $(this.attr.navbarSelector).removeClass('navbar-fixed-top').addClass('navbar-static-top');
        $(this.attr.contentSelector).addClass('xs-wide');
      } else {
        $('html').addClass('top-padding');
        $(this.attr.navbarSelector).removeClass('navbar-static-top').addClass('navbar-fixed-top');
        $(this.attr.contentSelector).removeClass('xs-wide');
      }
    }

    this.handleBeforePageChange = function () {
      var scrollTop = $(document).scrollTop();
      if (scrollTop > 0) {
        this.writeSession(window.location.pathname, scrollTop);
      }
    }

    this.handleHashChanged = function () {
      if ($(window.location.hash).length == 0)
        return;
      window.scrollTo(0, parseInt($(window.location.hash).offset().top - this.margin));
    }

    this.after('initialize', function () {
      this.margin = (gon.device == 'mobile' ? 14 : 62);
      this.on(document, 'dataBootstrapEnvChanged', this.handleBootstrapEnvChanged);
      this.on(document, 'dataAjaxSuccess', this.handleBootstrapEnvChanged);
      this.on(document, 'turboLinkClicked', this.handleBeforePageChange);
      if (!gon.prerender)
        this.on('dataPageRendered', this.jumpToAnchor);
      this.on(document, 'dataHashChanged', this.handleHashChanged);
    });
  }
});
