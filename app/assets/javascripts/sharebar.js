define(function (require) {
  'use strict';

  var component = require('flight/lib/component');
  var withStorage = require('with_storage');
  return component(sharebar, withStorage);

  function sharebar() {
    this.attributes({
      contentSelector: '.js-content',
      shareButtonSelector: '.share-btn',
      bookmarkButtonSelector: '.bookmark-btn',
      bootstrapMobile: 'xs',
      bootstrapTablet: 'sm',
      shareButtonTempl: function () {
        var shareBtn = "<div class='btn-group " + this.attr.shareButtonSelector.slice(1) + "'>\
                          <button type='button' class='btn btn-default " + this.attr.bookmarkButtonSelector.slice(1) + "'>\
                            <i class='fa fa-bookmark-o'></i>\
                          </button>\
                        </div>";
        return shareBtn;
      }
    });
    this.handleShareClick = function (event, data) {
      var paraID = $(data.el).data('para-id');
      this.trigger('uiBookmarkClicked', {paraID: paraID});
      this.trigger('uiNotified', {
        growlOptions: {
          title: 'Tip',
          message: 'Press Shift and click to select multiple paragraphs at once',
        },
        growlSettings: {
          delay: 0,
          type: 'info'
        },
        once: {
          id: 'handleShareClick'
        }
      });
    }

    this.handleParaHovered = function (event, data) {
      // var button = $("<div class='btn-group share-btn'>\
      //   <button type='button' class='btn btn-default btn-xs bookmark-btn' style='padding-left:10px;padding-right:10px' data-para-id=" + data.hoveredID + ">\
      //     <i class='fa fa-bookmark-o'></i>\
      //   </button>\
      //   <button type='button' class='btn btn-default btn-xs dropdown-toggle' data-toggle='dropdown'>\
      //     <span class='caret'></span>\
      //     <span class='sr-only'>Toggle Dropdown</span>\
      //   </button>\
      //   <ul class='dropdown-menu' role='menu'>\
      //     <li class='small'><a href='#'>Copy paragraph link</a></li>\
      //     <li class='small'><a href='#'>Share</a></li>\
      //     <li class='small'><a href='#'>Save to collection</a></li>\
      //   </ul>\
      // </div>");
      // var bar = "<span class='qbar' style='margin-top:" + top + ";border-left:5px solid #ccc;float:right;height:" + $('#'+data.hoveredID).height() + "px'><span>"

      this.select('shareButtonSelector').remove();
      var bootstrapEnv = $('body').attr('data-bootstrap-env');
      if (bootstrapEnv == this.attr.bootstrapMobile || bootstrapEnv == this.attr.bootstrapTablet) {
        return false;
      }

      // get the height of the hovered paragraph and find its center
      if (data.hoveredID){
        var top = $('#'+ data.hoveredID).offset().top - $(this.attr.contentSelector).offset().top + $('#' + data.hoveredID).height()/2 - 14;
        var shareButtonDivTempl = "<div class='btn-group " + this.attr.shareButtonSelector.slice(1) + "'>\
                                    <button type='button' class='btn btn-default " + this.attr.bookmarkButtonSelector.slice(1) + "'\
                                        data-para-id=" + data.hoveredID + ">\
                                      <i class='fa fa-bookmark-o'></i>\
                                    </button>\
                                  </div>";
        var shareButtonDiv = $(shareButtonDivTempl).css('top', top + 'px');
        this.$node.append(shareButtonDiv);
      }
    }

    this.handleSidebarClicked = function (event, data) {
      this.$node.toggleClass('col-lg-offset-1');
    }

    this.after('initialize', function () {
      this.on(document, 'dataParaHovered', this.handleParaHovered);
      this.on(document, 'dataSidebarClicked', this.handleSidebarClicked);
      this.on('click', {
        bookmarkButtonSelector: this.handleShareClick
      });
    });
  }
});
