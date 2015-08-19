define(function (require) {
  'use strict';

  var compose = require('flight/lib/compose');
  var bootstrapContextmenu = require('bootstrap-contextmenu');
  var withUtils = require('with_utils');
  var withDataHandler = require('with_data_handler');

  return withParaHandler;

  function withParaHandler() {
    compose.mixin(this, [withUtils, withDataHandler]);

    this.attributes({
      paraSelector: '.text p:not(.footnotes > li > p)',
      paraPrefix: 'p',
      dateBadge: '.date-badge',
      calendarSelector: '.calendar',
      addQuoteSelector: 'js-add-quote',
      addTagSelector: 'js-add-tags',
      quoteTagsModal: '.quote-tags-modal',
      months: {
        1: 'JANUARY',
        2: 'FEBRUARY',
        3: 'MARCH',
        4: 'APRIL',
        5: 'MAY',
        6: 'JUNE',
        7: 'JULY',
        8: 'AUGUST',
        9: 'SEPTEMBER',
        10: 'OCTOBER',
        11: 'NOVEMBER',
        12: 'DECEMBER'
      },
      days: {
        0: 'SUN',
        1: 'MON',
        2: 'TUE',
        3: 'WED',
        4: 'THU',
        5: 'FRI',
        6: 'SAT'
      }
    });

    this.handleHoveredIn = function (event, data) {
      if (gon.device == 'mobile')
        return;
      this.hoveredID = $(data.el).attr('id');
      this.trigger('uiParaHovered', {hoveredID: this.hoveredID});
      if (this.shiftPressed) {
        $('#' + this.hoveredID).addClass('no-selection');
      }
    }

    this.handleHoveredOut = function (event, data) {
      if ($(data.el).attr('id') == this.hoveredID) {
        $('#' + this.hoveredID).removeClass('no-selection');
      }
      this.hoveredID = null;
    }

    this.handleShiftPressed = function () {
      if (!window.getSelection().toString()) {
        this.shiftPressed = true;
        if (this.hoveredID) {
          $('#' + this.hoveredID).addClass('no-selection');
        }
      }
    }

    this.handleShiftReleased = function () {
      this.shiftPressed = false;
      if (this.hoveredID) {
        $('#' + this.hoveredID).removeClass('no-selection');
      }
    }

    this.handleMouseDown = function (event, data) {
      if (this.shiftPressed) {
        var paraID = $(data.el).attr('id');
        this.highlightSelectedPara(paraID);
      }
    }

    this.handleMouseUp = function (event, data) {
      if (!gon.editable) {
        return false;
      }

      var html;
      if (typeof window.getSelection !== 'undefined') {
        var sel = window.getSelection();
        if (sel.rangeCount) {
          var container = document.createElement('div');
          for (var i = 0, len = sel.rangeCount; i < len; ++i) {
            container.appendChild(sel.getRangeAt(i).cloneContents());
          }
          html = container.innerHTML;
        }
      } else if (typeof document.selection !== 'undefined') {
        if (document.selection.type == 'Text') {
          html = document.selection.createRange().htmlText;
        }
      }

      if (html && html.trim().length > 0) {
        $(this).attr('data-url', this.thisUrl() + '#' + $(data.el).attr('id'));
        $(this).attr('data-selection', html);
        var $this = this;
        $(data.el).contextmenu({
          target:'#context-menu',
          before: function(e, context) {
            // execute code before context menu if shown
          },
          onItem: function(context, e) {
            var ref = $($this).attr('data-url');
            var sel = $($this).attr('data-selection');
            if (e.currentTarget.className == $this.attr.addQuoteSelector) {
              var data = {
                quote: {
                  ref: $($this).attr('data-url'),
                  sel: $($this).attr('data-selection')
                }
              }
              $this.createResource('/quotes', data, {
                title: "Quote created",
                message: '<a href="/quotes">Go here</a> to view it'
              });
            } else if (e.currentTarget.className == $this.attr.addTagSelector) {
              $this.select('quoteTagsModal').attr('data-url', ref);
              $this.select('quoteTagsModal').attr('data-selection', sel);
              $this.select('quoteTagsModal').modal();
            }
          }
        });
      } else if (window.getSelection().type == 'None') {
        $(data.el).unbind('contextmenu');
        // $('.para').contextmenu().remove();
        // $('.para').contextmenu({
        //   before: function () {
        //     console.log('return flase')
        //     return false;
        //   }
        // })
      }
    }

    this.highlightSelectedPara = function (paraID) {
      // 1. if no range already selected
      //    a. push paraSelected to paraRange
      // 2. else if higher range doesn't exist and paraSelected != lower range
      //    a. push higher range
      // 3. else if paraSelected matches either endpoints
      //    a. remove corresponding endpoint
      // 4. else if paraSelected before first paraRange
      //    a. set lower range to paraSelected
      // 5. else if paraSelected after last paraRange
      //    a. set higher range to paraSelected
      // 6. else
      //    a. save previous higher range
      //    b. update higher range to paraSelected

      var thisPara = parseInt(paraID.slice(1));
      var firstSelectedPara = this.selectedParaRange[0] ? parseInt(this.selectedParaRange[0].slice(1)) : 0;
      var lastSelectedPara = this.selectedParaRange[1] ? parseInt(this.selectedParaRange[1].slice(1)) : 0;
      var firstPara = firstSelectedPara;
      var lastPara = lastSelectedPara;
      
      var changed = [];
      
      if (!firstSelectedPara) {
        firstPara = thisPara;
        changed.push(thisPara);
      } else if (!lastSelectedPara && firstSelectedPara != thisPara) {
        if (thisPara > firstSelectedPara) {
          lastPara = thisPara;
          for (var i = firstSelectedPara + 1; i <= thisPara; i++) {
            changed.push(i);
          }
        } else {
          lastPara = firstSelectedPara;
          firstPara = thisPara;
          for (var i = thisPara; i < firstSelectedPara; i++) {
            changed.push(i);
          }
        }
      } else if (firstSelectedPara == thisPara) {
        if (!lastSelectedPara || (lastSelectedPara - firstSelectedPara == 1)) {
          firstPara = -1;
        } else {
          firstPara = firstSelectedPara + 1;
        }
        changed.push(firstSelectedPara);
      } else if (lastSelectedPara == thisPara) {
        if (lastSelectedPara - firstSelectedPara == 1) {
          lastPara = -1
        } else {
          lastPara = lastSelectedPara - 1;
        }
        changed.push(lastSelectedPara);
      } else if (thisPara < firstSelectedPara) {
        firstPara = thisPara;
        for (var i = thisPara; i < firstSelectedPara; i++) {
          changed.push(i);
        }
      } else if (thisPara > lastSelectedPara) {
        lastPara = thisPara;
        for (var i = lastSelectedPara + 1; i <= thisPara; i++) {
          changed.push(i);
        }
      } else {
        lastPara = thisPara;
        for (var i = thisPara + 1; i <= lastSelectedPara; i++) {
          changed.push(i);
        }
      }

      changed.forEach(function (v, k) {
        var dataSelected = $('#' + this.attr.paraPrefix + v).attr('data-selected') || false;
        $('#' + this.attr.paraPrefix + v).attr('data-selected', !$.parseJSON(dataSelected));
      }, this);

      if (firstPara) {
        if (firstPara == -1) {
          this.selectedParaRange.splice(0, 1);
        } else {
          this.selectedParaRange[0] = 'p' + firstPara;
        }
      }
      if (lastPara) {
        if (lastPara == -1) {
          this.selectedParaRange.splice(1, 1);
        } else {
          this.selectedParaRange[1] = 'p' + lastPara;
        }
      }
      if (this.selectedParaRange[0] == this.selectedParaRange[1]) {
        this.selectedParaRange.splice(1, 1);
      }
      var hash = this.selectedParaRange[0] ? '#' + this.selectedParaRange[0] : 0;
      if (hash && this.selectedParaRange[1])
        hash += '-' + this.selectedParaRange[1];
      if (hash) {
        history.pushState(null, document.title, hash);
      } else {
        history.pushState(null, document.title, window.location.origin + window.location.pathname);
      }
      var title, message, id, type;
      if (hash) {
        title = 'URL updated';
        message = gon.device == 'desktop' ?
          'Copy the link from the address bar to share highlighted paragraphs' :
          "Tap the browser's share button to share highlighted paragraphs";
        id = 'highlightSelectedPara_share';
        type = 'success';
      }
      // else {
      //   title = 'Tip';
      //   message = gon.device == 'mobile' ?
      //     "Double tap a paragraph to share" : ""
      //   id = 'highlightSelectedPara_hint';
      //   type = 'info';
      // }
      if (message != undefined && message != "") {
        this.trigger('uiNotified', {
          growlOptions: {
            title: title,
            message: message,
          },
          growlSettings: {
            type: type,
            delay: 0
          },
          once: {
            id: id
          }
        });
      }
    }

    this.handleBookmarkClicked = function (event, data) {
      this.highlightSelectedPara(data.paraID);
    }

    this.showDate = function (data) {
      if (data.date) {
        var date = new Date(data.date);
        if (!isNaN(date.getTime())){
          var dateDom = "<time datetime='" + data.date + "' class='" + this.attr.calendarSelector.slice(1) + "'>\
                      <span class='year'>" + date.getFullYear() + "</span>\
                      <span class='day'>" + this.attr.days[date.getDay()] + "</span>\
                      <span class='date'>" + date.getDate() + "</span>\
                      <span class='month'>" + this.attr.months[date.getMonth() + 1] + "</span class='month'>\
                    </time>";
          this.select('dateBadge').html(dateDom);
        }
      }
    }

    this.after('initialize', function () {
      if (gon.prerender)
        return;
      this.selectedParaRange = [];
      if (window.location.hash) {
        var hash = window.location.hash.split('-'); // split #p1-p3
        this.selectedParaRange.push(hash[0].slice(1));
        if (hash[1]) {
          this.selectedParaRange.push(hash[1]);
        }
      }
      this.on('mouseover', {
        paraSelector: this.handleHoveredIn
      });
      this.on('mouseout', {
        paraSelector: this.handleHoveredOut
      });
      this.on('mousedown', {
        paraSelector: this.handleMouseDown
      });
      this.on('mouseup', {
        paraSelector: this.handleMouseUp
      });
      this.on(document, 'uiShiftPressed', this.handleShiftPressed);
      this.on(document, 'uiShiftReleased', this.handleShiftReleased);
      this.on(document, 'dataBookmarkClicked', this.handleBookmarkClicked);
    });
  }
});
