define(function (require) {
  'use strict';

  var compose = require('flight/lib/compose');
  var withUtils = require('with_utils');
  var withMarkedRenderer = require('with_marked_renderer');
  var withStorage = require('with_storage');
  var withEntriesRenderer = require('with_entries_renderer');
  var withChaptersHandler = require('with_chapters_handler');
  var Hogan = require('hogan');

  return withDataHandler;

  function withDataHandler() {
    compose.mixin(this, [withUtils, withMarkedRenderer, withStorage, withEntriesRenderer, withChaptersHandler]);

    this.attributes({
      templateSelector: '#template',
      outputSelector: '#output',
      listSelector: '#list',
      spinnerModal: '.spinner-modal'
    });

    this.handleNeedsData = function (event) {
      var $this = event ? event.data : this;
      $.ajax({
        url: (gon.dataEndpoint ? gon.dataEndpoint : $this.thisUrl()) + '.json',
        success: function (data) {
          $this.trigger('dataAjaxSuccess', data);
        }
      });
    }

    this.handleSuccess = function (event, data) {
      var $this = this;
      var mainObject = Object.getOwnPropertyNames(data)[0];

      if (mainObject)
        this.setDocumentTitle(data[mainObject]);

      if (gon.env == 'production' && !gon.prerender)
        this.updateAnalytics();

      if (!mainObject || data[mainObject].length == 0) {
        $(this.attr.spinnerModal).modal('hide');
        return;
      }

      if (((gon.controller == 'entries' && gon.action == 'index') || gon.concordance) & $('body').attr('data-bootstrap-env') != this.attr.bootstrapMobile) {
        this.reorderEntries(data[mainObject]);
      }

      if (data[mainObject].meta) {
        data[mainObject].meta = JSON.stringify(data[mainObject].meta);
      }

      this.applyLambdas(data, mainObject);

      var htmlTemplate = this.select('templateSelector').html();

      var templatePrefix = gon.controller + '_' + gon.action;
      var templateKey = templatePrefix + '_template';
      var compiledTemplateKey = templatePrefix + '_compiled';

      var useCache = true;
      var compiledTemplate;
      var template = this.readLocal(templateKey);
      if (template != htmlTemplate) {
        this.writeLocal(templateKey, htmlTemplate);
        useCache = false;
      } else {
        compiledTemplate = this.readLocal(compiledTemplateKey);
      }

      if (!useCache || compiledTemplate == undefined) {
        compiledTemplate = Hogan.compile(htmlTemplate, {asString: true});
        this.writeLocal(compiledTemplateKey, compiledTemplate);
      }

      var hoganTemplate = eval('var hoganTemplate = new Hogan.Template(' + compiledTemplate + ', htmlTemplate, Hogan); hoganTemplate;');

      var partials = {};

      if (gon.controller == 'volumes' && gon.action == 'show') {
        partials._book = Hogan.compile($('#bookTemplate').html());
        partials._part = Hogan.compile($('#partTemplate').html());
        partials._section = Hogan.compile($('#sectionTemplate').html());
        partials._chapter = Hogan.compile($('#chapterTemplate').html());
      }

      setTimeout(function () {
        var renderedHtml = hoganTemplate.render(data, partials);
        $this.select('outputSelector').html(renderedHtml);

        if ($this.toc.length > 0) {
          $this.trigger('dataTOCNeeded', {toc: $this.toc});
        }

        if (gon.controller == 'chapters' && gon.action == 'show') {
          var chapter = data[mainObject];
          $this.showDate({
            date: chapter.dt,
            month: chapter.mo,
            year: chapter.yr,
            dateStart: chapter.dts,
            dateEnd: chapter.dte,
            monthStart: chapter.mts,
            monthEnd: chapter.mte,
            yearStart: chapter.yrs,
            yearEnd: chapter.yre
          });
        }

        if ((gon.controller == 'entries' && gon.action == 'index') || gon.concordance) {
          $this.select('listSelector').css('height',
            (parseInt($this.select('listSelector').children().last().offset().top
              - $this.select('listSelector').offset().top) + 115) + 'px');
          if ($('body').attr('data-bootstrap-env') != $this.attr.bootstrapMobile)
            $this.showTooltips();
        }

        setTimeout(function () {
          $this.trigger('dataPageRendered');
        }, gon.device == 'desktop' ? 400 : 800);
      }, 100);
    }

    this.applyLambdas = function (data, mainObject) {
      var $this = this;

      data.marked = function () {
        return function (text) {
          return $this.toHtml(Hogan.compile(text).render(this), {id: true});
        }
      }

      data.markedBasic = function () {
        return function (text) {
          return $this.toHtml(Hogan.compile(text).render(this), {footnotes: false});
        }
      }

      data.padNum = function () {
        return function (text) {
          var val = Hogan.compile(text).render(data[mainObject]);
          return val <= 9 ? '0' + val : val;
        }
      }

      data.prv = function () {
        return function (text) {
          var bootstrapEnv = $('body').attr('data-bootstrap-env');
          if (bootstrapEnv != 'xs') {
            var prvt = Hogan.compile(text).render(this);
            return prvt.length <= 40 ? '« ' + prvt : '« ' + prvt.substr(0, 40) + '...';
          } else {
            return '&laquo; Previous';
          }
        }
      }

      data.nxt = function () {
        return function (text) {
          var bootstrapEnv = $('body').attr('data-bootstrap-env');
          if (bootstrapEnv != 'xs') {
            var nxtt = Hogan.compile(text).render(this);
            return nxtt.length <= 40 ? nxtt + ' »' : nxtt.substr(0, 40) + '... »';
          } else {
            return 'Next &raquo;';
          }
        }
      }

      data.asset = function () {
        return function (text) {
          var asset;
          if (text.indexOf('{{') != -1) {
            asset = Hogan.compile(text).render(this);
          } else {
            asset = text;
          }

          if (gon.env == 'development')
            return '/assets/' + asset;

          // var referenceAssetUrl = $('link[data-turbolinks-track=true]').attr('href');
          // var referenceDigest = referenceAssetUrl.split('-')[1].split('.')[0];
          // var cached = $this.readOrUpdateLocal('referenceDigest', referenceDigest).cached;

          var cached = $this.readOrUpdateLocal('assets', true).cached;

          var path;

          if (cached) {
            path = $this.readSession(asset)
            if (path)
              return path;
          }

          var split_asset = asset.split('.');
          var data = $.ajax({
            async: false,
            url: window.location.protocol + '//' + window.location.host + '/get_asset_digest',
            data: 'asset=' + asset
          }).responseText;
          var digest = JSON.parse(data).digest;
          path = '/assets/' + split_asset[0] + (digest != '' ? '-' + digest : '') + '.' + split_asset[1];
          $this.writeSession(asset, path);
          return path;
        }
      }

      data.editable = function () {
        return gon.editable;
      }

      data.deletable = function () {
        return gon.deletable;
      }
    }

    this.setDocumentTitle = function (data) {
      var pageTitle = '';
      if (!(gon.controller == 'volumes' && gon.action == 'show'))
        pageTitle = data.t || data.cmpn || data.autn || data.word || '';
      var compilation = ''
      if (gon.action == 'show') {
        if (gon.controller == 'chapters') {
          compilation = ' · ' + data.path[0].t + ' - ' + data.path[1].t;
        } else if (gon.controller == 'volumes') {
          compilation = data.cmpa + ' - ' + data.t;
        } else if (gon.controller == 'entries') {
          compilation = ' · Dictionary';
        }
      }
      var title = pageTitle + compilation
      document.title =  (title ? title + ' · ' : '') + 'The Incarnate Word';
    }

    this.updateAnalytics = function () {
      ga('send', 'pageview', {
        'page': location.pathname + location.search,
        'title': document.title
      });
    }

    this.handleWindowUnloaded = function (event, data) {
      this.removeLocal('assets');
    }

    this.after('initialize', function () {
      this.on(document, 'dataAjaxSuccess', this.handleSuccess);
      this.on(document, 'dataWindowUnloaded', this.handleWindowUnloaded);
    });
  }
});
