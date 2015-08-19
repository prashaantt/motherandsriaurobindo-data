define(function (require) {
  'use strict';

  var component = require('flight/lib/component');
  var Hogan = require('hogan');

  return component(sidebar);

  function sidebar() {
    this.attributes({
      bootstrapMobile: 'xs',
      tocExpandButton: '.js-toc-expand',
      tocCollapseButton: '.js-toc-collapse',
      tocMobileButton: '.js-toc-dropdown',
      tocExpandedTempl: function () {
        var expanded = "<div class='panel panel-default'>\
                    <div>\
                      <button class='btn btn-default btn-custom small " + this.attr.tocExpandButton.slice(1) + "' style='width: 100%;'>\
                        <span class='small'>Sections</span> <i class='fa fa-chevron-circle-right'></i></span>\
                      </button>\
                    </div>\
                    <div class='panel-body toc'>\
                      <ul class='list-unstyled small'>\
                        {{#toc}}\
                          <li class={{level}}><a href=#{{url}}>{{text}}</a></li>\
                        {{/toc}}\
                      </ul>\
                    </div>\
                  </div>"
        return expanded;
      },
      tocCollapsedTempl: function () {
        var collapsed = "<button class='btn btn-default " + this.attr.tocCollapseButton.slice(1) + "' style='width:100%'>\
                    <span>\
                      <i class='fa fa-chevron-circle-left'></i>\
                      <span class='small'>Sections</span>\
                    </span>\
                  </button>";
        return collapsed;
      },
      tocDropdown: function () {
        return "<button type='button' class='btn-toc dropdown-toggle' id='tocDropdownMenu' data-toggle='dropdown' aria-expanded='true'>\
          <i class='fa fa-chevron-circle-down'></i>\
        </button>\
        <ul class='toc-dropdown' role='menu' aria-labelledby='tocDropdownMenu'>\
          <li role='presentation' class='dropdown-header'>Sections</li>\
          <li role='presentation' class='toc-divider'></li>\
          {{#toc}}\
            <li class='{{level}} toc-overflow' role='presentation'><a role='menuitem' tabindex='-1' href=#{{url}}>{{text}}</a></li>\
          {{/toc}}\
        </ul>"
      }
    });
    this.handleTOCShown = function (event, data) {
      // var tocs = [];
      // this.toc.forEach(function (v) {
      //   if ($.inArray(v.level, tocs) == -1) {
      //     tocs.push(v.level);
      //   }
      // });
      // tocs.sort(function (a, b) {
      //   return parseInt(b.slice(1)) - parseInt(a.slice(1));
      // });
      // var largestTitle = tocs[0];
      // var smallestTitle = tocs[tocs.length - 1];

      if ($('body').attr('data-bootstrap-env') == this.attr.bootstrapMobile) {
        var templ = Hogan.compile(this.attr.tocDropdown);
        $(this.attr.tocMobileButton).html(templ.render(data));
      } else {
        var templ = Hogan.compile(this.attr.tocExpandedTempl);
        this.tocDOM = templ.render(data);
        this.$node.html(this.attr.tocCollapsedTempl);
      }
    }

    this.handleExpandClicked = function (event, data) {
      this.$node.toggleClass('col-md-2 col-md-3');
      this.$node.html(this.attr.tocCollapsedTempl);
      this.trigger('uiSidebarClicked');
    }

    this.handleCollapseClicked = function (event, data) {
      this.$node.toggleClass('col-md-2 col-md-3');
      var $this = this;
      setTimeout(function() {
        $this.$node.html($this.tocDOM);
      }, 10);
      this.trigger('uiSidebarClicked');
    }

    this.after('initialize', function () {
      this.on(document, 'dataTOCShown', this.handleTOCShown);
      this.on('click', {
        tocCollapseButton: this.handleCollapseClicked,
        tocExpandButton: this.handleExpandClicked
      })
    });
  }
});
