define(function (require) {
  'use strict';

  return withEntriesRenderer;

  function withEntriesRenderer() {
    this.reorderEntries = function (entries) {
      $.each(entries.list, function (k, v) {
        var numEntries = v.w.length;
        var entriesPerColumn = Math.ceil(numEntries/3);
        var col1Entries = v.w.slice(0, entriesPerColumn);
        var col2Entries = v.w.slice(entriesPerColumn, entriesPerColumn*2);
        var col3Entries = v.w.slice(entriesPerColumn*2, entriesPerColumn*3);
        var reorderedEntries = [];
        for (var i = 0; i < col1Entries.length; i++) {
          col1Entries[i].klass = 'col-sm-offset-3';
          reorderedEntries.push(col1Entries[i]);
          if (col2Entries[i]) reorderedEntries.push(col2Entries[i]);
          if (col3Entries[i]) reorderedEntries.push(col3Entries[i]);
        }
        v.w = reorderedEntries;
      });
    }

    this.showTooltips = function () {
      var overflowed = $('#list > .col-overflow').filter(function() {
        return $(this)[0].scrollWidth > $(this)[0].offsetWidth
      });

      overflowed.map(function() {
        var anchor = $(this).find('a');
        var text = anchor.text();
        anchor.attr('data-toggle', 'tooltip');
        anchor.attr('title', text);
        anchor.tooltip({container: 'body'});
      });
    }
  }
});
