define(function(require) {
  'use strict';

  var component = require('flight/lib/component');
  var utils = require('flight/lib/utils');
  var growl = require('bootstrap-growl');

  return component(systemEvents);
  
  function systemEvents() {
    this.attributes({
      growlSettings: {
        mouse_over: 'pause',
        placement: {
          from: "bottom",
          align: "right"
        },
        animate: {
          enter: gon.device == 'desktop' ? 'animated fadeInUp' : '',
          exit: gon.device == 'desktop' ? 'animated fadeOutDown' : ''
        },
        offset: gon.device != 'desktop' ? 0 : 20,
        delay: 3000,
        z_index: 1041,
        template: '<div data-growl="container" class="alert col-sm-12 col-md-3 small" role="alert">\
          <button type="button" class="close close-notif" data-growl="dismiss">\
            <span aria-hidden="true" style="font-size:20px">×</span>\
            <span class="sr-only">Close</span>\
          </button>\
          <span data-growl="icon"></span>\
          <span data-growl="title"></span>\
          <span data-growl="message"></span>\
          <a href="#" data-growl="url"></a>\
        </div>'
      },
      spinnerModal: '.spinner-modal'
    });

    this.resized = function(event) {
      if (!this.bootstrapEnv) {
        this.bootstrapEnv = this.getBootstrapEnvironment();
      } else {
        var newBootstrapEnv = this.getBootstrapEnvironment();
        if (newBootstrapEnv != this.bootstrapEnv) {
          this.bootstrapEnv = newBootstrapEnv;
          this.trigger('dataBootstrapEnvChanged', {env: newBootstrapEnv});
        }
      }
    }

    this.getBootstrapEnvironment = function () {
      var envs = ['xs', 'sm', 'md', 'lg'];
      var $el = $('<div>');
      $el.appendTo($('body'));
      for (var i = envs.length - 1; i >= 0; i--) {
        var env = envs[i];
        $el.addClass('hidden-'+env);
        if ($el.is(':hidden')) {
          $el.remove();
          $('body').attr('data-bootstrap-env', env);
          return env;
        }
      };
    }

    this.hashChanged = function (event) {
      var $this = this;
      setTimeout(function() {
        $this.trigger('dataHashChanged');
      }, 60);
    }

    this.handleKeyDown = function (event) {
      if (event.keyCode == 16) {
        this.trigger('uiShiftPressed');
      }
    }

    this.handleKeyUp = function (event) {
      if (event.keyCode == 16) {
        this.trigger('uiShiftReleased');
      } /* else if (event.keyCode == 37) || event.keyCode == 74) {
        this.trigger('uiLeftKeyReleased');
      } else if (event.keyCode == 39) || event.keyCode == 75) {
        this.trigger('uiRightKeyReleased');
      } */
    }

    this.handleNotified = function (event, data) {
      if (data.once) {
        if ($.inArray(data.once.id, this.onceEvents) != -1) {
          return false;
        } else {
          this.onceEvents.push(data.once.id);
        }
      }
      var settings = this.attr.growlSettings;
      if (data.growlSettings) {
        utils.push(settings, data.growlSettings);
      }
      $.growl(data.growlOptions, settings);
    }

    this.handlePageLoaded = function (event, data) {
      this.getBootstrapEnvironment();
      $(this.attr.spinnerModal).modal('show');
    }

    this.handleTeardown = function () {
      component.teardownAll();
    }

    this.after('initialize', function () {
      this.onceEvents = [];

      // handle growl notifications
      this.on('uiNotified', this.handleNotified);

      // mediate inter-component communication
      this.on('dataTOCNeeded', 'dataTOCShown');
      this.on('uiParaHovered', 'dataParaHovered');
      this.on('uiBookmarkClicked', 'dataBookmarkClicked');
      this.on('uiSidebarClicked', 'dataSidebarClicked');
      this.on('readyToView', function () {
        $(this.attr.spinnerModal).modal('hide');
      });

      // monitor bootstrap environment
      this.trigger('dataBootstrapEnvChanged', {env: this.getBootstrapEnvironment()});
      this.on(window, 'resize', this.resized);

      // monitor hash change in url
      this.on(window, 'hashchange', this.hashChanged);

      // monitor keypresses
      this.on(window, 'keydown', this.handleKeyDown);
      this.on(window, 'keyup', this.handleKeyUp);
      this.on(window, 'blur', function () {
        this.trigger('uiShiftReleased');
      });

      // set Turbolinks event triggers as needed
      this.on('page:before-change', 'turboLinkClicked');
      // this.on('page:fetch', 'turboPageFetched');
      // this.on('page:receive', 'turboPageReceived');
      this.on('page:before-unload', this.handleTeardown);
      // this.on('page:change', 'turboPageChanged');
      // this.on('page:update', 'turboPageUpdated');
      this.on('page:load', this.handlePageLoaded);

      // trigger when browser is refreshed
      this.on(window, 'unload', 'dataWindowUnloaded');

      // document ready: avoid unless absolutely necessary
      var $this = this;
      $(document).ready(function () {
        if (!gon.prerender)
          $($this.attr.spinnerModal).modal('show');
      });
    });
  }
});
