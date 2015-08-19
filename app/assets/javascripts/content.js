define(function (require) {
  'use strict';

  var defineComponent = require('flight/lib/component');
  var withDataRenderer = require('with_data_renderer');
  var withDataHandler = require('with_data_handler');
  var withMarkedRenderer = require('with_marked_renderer');
  require('jquery-touchswipe');

  return defineComponent(content, withDataRenderer, withDataHandler);

  function content() {
    this.attributes({
      articleSelector: '.content',

      // quotes
      quoteList: '.js-quote-list',
      addQuote: '.js-add-quote',
      editQuote: '.js-edit-quote',
      quoteEditor: '.js-quote-editor',
      updateQuote: '.js-update-quote',
      cancelQuote: '.js-cancel-quote',
      deleteQuote: '.js-delete-quote',
      quoteTagsModal: '.quote-tags-modal',
      saveQuoteModal: '.js-save-quote-modal',

      // edit chapter
      editChapterContainer: '.js-edit-chapter',
      editChapter: '.edit-chapter',
      editChapterModal: '.edit-chapter-modal',
      chapterPreviewTabSelector: '#js-preview-tab',
      chapterContentSelector: '#js-content-editor',
      saveChapterModal: '.js-save-chapter-modal',
      chapterDescEditorSelector: '#js-desc-editor',
      chapterDateEditorSelector: '#js-date-editor',
      editChapterModalTemplate: function () {
        return '<div class="modal fade ' + this.attr.editChapterModal.slice(1) + '" tabindex="-1" role="dialog" aria-labelledby="#modal-label" aria-hidden="true"> \
            <div class="modal-dialog modal-lg"> \
              <div class="modal-content"> \
                <div class="modal-header"> \
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button> \
                  <h4 class="modal-title" id="#modal-label">Editing “{{t}}”...</h4> \
                </div> \
                <div class="modal-body"> \
                  <div class="container-fluid"> \
                      <div class="col-lg-10 col-lg-offset-1 small"> \
                        <div class="form-group"> \
                          <label for="' + this.attr.chapterDateEditorSelector.slice(1) + '">Date</label> \
                          <input type="text" class="form-control serif" id="' + this.attr.chapterDateEditorSelector.slice(1) + '" placeholder="Enter date as YYYY-MM-DD" value="{{dt}}"> \
                        </div> \
                      </div> \
                    {{#desc}} \
                      <div class="col-lg-10 col-lg-offset-1 small"> \
                        <div class="form-group"> \
                          <label for="' + this.attr.chapterDescEditorSelector.slice(1) + '">Description</label> \
                          <textarea class="form-control serif" id="' + this.attr.chapterDescEditorSelector.slice(1) + '" style="resize: none;" rows="4">{{desc}}</textarea> \
                        </div> \
                      </div> \
                    {{/desc}} \
                    {{#txt}} \
                      <div class="col-lg-10 col-lg-offset-1"> \
                        <label for="' + this.attr.chapterContentSelector.slice(1) + '" class="small">Content</label> \
                        <div role="tabpanel"> \
                          <ul class="nav nav-tabs small" role="tablist"> \
                            <li role="presentation" class="active"><a href="#text" aria-controls="text" role="tab" data-toggle="tab">Text</a></li> \
                            <li role="presentation"><a href="' + this.attr.chapterPreviewTabSelector + '" aria-controls="preview" role="tab" data-toggle="tab">Preview</a></li> \
                          </ul> \
                          <div class="tab-content"> \
                            <div role="tabpanel" class="tab-pane active fade in" id="text"> \
                              <textarea class="form-control serif" id="' + this.attr.chapterContentSelector.slice(1) + '" style="resize: none;" rows="15">{{txt}}</textarea> \
                            </div> \
                            <div role="tabpanel" class="tab-pane fade text-bg" id="' + this.attr.chapterPreviewTabSelector.slice('1') + '"></div> \
                          </div> \
                        </div> \
                      </div> \
                    {{/txt}} \
                    {{^txt}} \
                      <div class="col-lg-10 col-lg-offset-1"> \
                        <p class="small sans-serif">Complex chapter content structure not shown.</p> \
                      </div> \
                    {{/txt}} \
                  </div> \
                </div> \
                <div class="modal-footer"> \
                  <button type="button" class="btn btn-default btn-sm" data-dismiss="modal">Close</button> \
                  <button type="button" class="btn btn-primary btn-sm js-save-chapter-modal">Save</button> \
                </div> \
              </div> \
            </div> \
          </div> \
        </div>'
      }
    });

    this.goNext = function (event, data) {
      var next = this.$node.find('li.next a');
      if (next.length > 0) {
        next[0].click();
      }
    }

    this.goPrev = function (event, data) {
      var prev = this.$node.find('li.previous a');
      if (prev.length > 0) {
        prev[0].click();
      }
    }

    this.handleRightKeyReleased = function (event, data) {
      this.goNext();
    }

    this.handleLeftKeyReleased = function (event, data) {
      this.goPrev();
    }

    this.handleEditQuote = function (event, data) {
      event.preventDefault();
      var $quoteList = $(data.el).closest(this.attr.quoteList);
      var $quotePara = $quoteList.find('.quote');
      var $quoteEditor = $quoteList.find(this.attr.quoteEditor);
      var $quoteEditField = $quoteEditor.find('textarea');
      var $tagsField = $quoteEditor.find('.js-quote-tags');
      var tags = $quoteList.attr('data-tags');
      var html = '';
      $quotePara.find('p').each(function (i, p) {
        html += '<p>' + p.innerHTML + '</p>';
      });
      $quoteEditField.val(html);
      $tagsField.val(tags);
      $quotePara.hide();
      $quoteList.find('.js-quote-controls').hide();
      $quoteList.find('.js-quote-edit-controls').show();
      $quoteEditor.show();
    }

    this.handleUpdateQuote = function (event, data) {
      event.preventDefault();
      var $quoteList = $(data.el).closest(this.attr.quoteList);
      var quoteID = $quoteList.attr('data-quote-id');
      var updatedQuote = $quoteList.find('textarea').val();
      var $quotePara = $quoteList.find('.quote').html(updatedQuote);
      var updatedTags = $quoteList.find('.js-quote-tags').val().split(',');
      var payload = {
        quote: {
          sel: updatedQuote,
          tags: updatedTags
        }
      };
      this.updateResource('/quotes/' + quoteID, payload, {
        title: "Quote updated"
      });
      this.resetButtons($quoteList);
    }

    this.handleCancelQuote = function (event, data) {
      event.preventDefault();
      var $quoteList = $(data.el).closest(this.attr.quoteList);
      this.resetButtons($quoteList);
    }

    this.resetButtons = function ($quoteList) {
      var $quotePara = $quoteList.find('.quote');
      var $quoteEditor = $quoteList.find(this.attr.quoteEditor);

      $quotePara.show();
      $quoteList.find('.js-quote-controls').show();
      $quoteList.find('.js-quote-edit-controls').hide();
      $quoteEditor.hide();
    }

    this.populateQuotesModal = function (event, data) {
      var $modal = $(event.target);
      $modal.find(this.attr.chapterContentSelector).text($modal.attr('data-selection'));
    }

    // this.updateQuotesModal = function (event, data) {
    //   var $modal = $(event.target);
    //   $modal.attr('data-selection', $modal.find('.js-quote-selection').val());
    // }

    // this.handleSaveQuoteModal = function (event, data) {
    //   //FIXME: dirty hack
    //   var $modal = this.select('quoteTagsModal');
    //   var selection = this.select('quoteTagsModal').find('.js-quote-selection').val();
    //   var tags = this.select('quoteTagsModal').find('.js-quote-tags').val().split(',');
    //   var data = {
    //     quote: {
    //       sel: selection,
    //       ref: $modal.attr('data-url'),
    //       tags: tags
    //     }
    //   }
    //   this.createResource('/quotes', data, {
    //     title: "Quote created",
    //     message: '<a href="/quotes">Go here</a> to view it'
    //   });
    //   this.select('quoteTagsModal').modal('hide');
    // }

    this.handleDeleteQuote = function (event, data) {
      event.preventDefault();
      var toDelete = confirm('Are you sure?');
      if (toDelete) {
        var $quoteList = $(data.el).closest(this.attr.quoteList);
        var quoteID = $quoteList.attr('data-quote-id');
        this.deleteResource('/quotes/' + quoteID, {
          title: "Quote deleted"
        });
        $quoteList.remove();
      }
    }

    this.handleEditChapter = function (event, data) {
      event.preventDefault();
      var chapterMeta = $(this.attr.articleSelector).data('meta');
      this.readResource('/chapters', chapterMeta);
      $(this.attr.spinnerModal).modal('show');
    }

    this.handleGotData = function (event, data) {
      if (data.caller == '/chapters') {
        var templ = Hogan.compile(this.attr.editChapterModalTemplate);
        var editChapterModalDOM = templ.render(data);
        this.select('editChapterContainer').html(editChapterModalDOM);
        this.chapterTxt = this.select('chapterContentSelector').val();
        this.chapterDesc = this.select('chapterDescEditorSelector').val();
        this.chapterDt = this.select('chapterDateEditorSelector').val();
        $(this.attr.spinnerModal).modal('hide');
        this.select('editChapterModal').modal();
      }
    }

    this.updateChapterEditorDisplay = function (event, data) {
      if (event.target.href.split('#')[1] === this.attr.chapterPreviewTabSelector.slice(1)) {
        this.select('chapterPreviewTabSelector').html(this.toHtml(this.select('chapterContentSelector').val()));
      }
    }

    this.handleSaveChapterModal = function (event, data) {
      var payload = JSON.parse(JSON.stringify($(this.attr.articleSelector).data('meta')));
      payload.chapter = {};
      var dirty = false;
      var txt = this.select('chapterContentSelector').val();
      var desc = this.select('chapterDescEditorSelector').val();
      var dt = this.select('chapterDateEditorSelector').val();
      if (txt !== this.chapterTxt || desc !== this.chapterDesc || dt !== this.chapterDt) {
        dirty = true;
        payload.chapter.txt = txt;
        payload.chapter.desc = desc;
        payload.chapter.dt = dt;
      }

      if (!dirty) {
        this.trigger('uiNotified', {
          growlOptions: {
            title: 'Nothing to save',
            message: 'Make some changes to update',
          },
          growlSettings: {
            type: 'warning',
            delay: 3000
          }
        });
        return false;
      }

      this.updateResource('/chapters/' + payload.cid, payload, {
        title: "Chapter updated"
      });
      this.select('editChapterModal').modal('hide');
    }

    this.around('initialize', function (initialize, params) {
      if (!gon.prerender) {
        initialize(params);
        this.handleNeedsData();
        var $this = this;
        if (gon.device == 'mobile' || gon.device == 'tablet') {
          this.$node.swipe({
            swipeLeft: function(event, direction, distance, duration, fingerCount) {
              if (duration > 100)
                $this.goNext();
            },
            swipeRight: function(event, direction, distance, duration, fingerCount) {
              if (duration > 100)
                $this.goPrev();
            },
            doubleTap: function (event, target) {
              var elem = $(target);
              if (elem.hasClass('para') || elem.hasClass('comment') || elem.hasClass('aside')) {
                $this.trigger('uiBookmarkClicked', {paraID: target.id});
              }
            },
            tap: function (event, target) {
              // required for doubleTap?
            },
            allowPageScroll: 'auto',
            threshold: 110,
            doubleTapThreshold: 300
          });
        }

        this.on(document, 'uiRightKeyReleased', this.handleRightKeyReleased);
        this.on(document, 'uiLeftKeyReleased', this.handleLeftKeyReleased);
        this.on('click', {
          editQuote: this.handleEditQuote,
          updateQuote: this.handleUpdateQuote,
          cancelQuote: this.handleCancelQuote,
          deleteQuote: this.handleDeleteQuote,
          saveQuoteModal: this.handleSaveQuoteModal,
          editChapter: this.handleEditChapter,
          saveChapterModal: this.handleSaveChapterModal
        });
        this.on('show.bs.modal', this.populateQuotesModal);
        // this.on('hide.bs.modal', this.updateQuotesModal);
        this.on(document, 'dataResourceRead', this.handleGotData);
        this.on('shown.bs.tab', this.updateChapterEditorDisplay);
      }
    });
  }
});
