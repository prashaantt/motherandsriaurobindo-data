define(function (require) {
  'use strict';

  return withDataHandler;

  function withDataHandler () {
    this.attributes({
      spinnerModal: '.spinner-modal'
    });

    this.createResource = function (url, data, msg) {
      var $this = this;
      $.ajax({
        beforeSend: function(xhr) {
          xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'));
        },
        method: 'POST',
        url: url,
        data: data,
        success: function (data) {
          $this.trigger('uiNotified', {
            growlOptions: {
              title: msg && msg.title ? msg.title : 'Created',
              message: msg && msg.message ? msg.message : undefined,
            },
            growlSettings: {
              type: 'success',
              delay: 3000
            }
          });
        },
        error: function (e) {
          $($this.attr.spinnerModal).modal('hide');
          $this.trigger('uiNotified', {
            growlOptions: {
              title: msg && msg.errorTitle ? msg.errorTitle : 'Error',
              message: msg && msg.errorMessage ? msg.errorMessage : 'There was an error',
            },
            growlSettings: {
              type: 'danger',
              delay: 0
            }
          });
        }
      });
    }

    this.readResource = function (url, data, msg) {
      var $this = this;
      $.ajax({
        beforeSend: function(xhr) {
          xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'));
        },
        method: 'GET',
        url: url,
        data: data,
        success: function (data) {
          data.caller = url;
          $this.trigger('dataResourceRead', data);
        },
        error: function (e) {
          $($this.attr.spinnerModal).modal('hide');
          $this.trigger('uiNotified', {
            growlOptions: {
              title: msg && msg.errorTitle ? msg.errorTitle : 'Error',
              message: msg && msg.errorMessage ? msg.errorMessage : 'There was an error',
            },
            growlSettings: {
              type: 'danger',
              delay: 0
            }
          });
        }
      });
    }

    this.updateResource = function (url, data, msg) {
      var $this = this;
      data._method = 'put';
      $.ajax({
        beforeSend: function(xhr) {
          xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'));
        },
        method: 'POST',
        url: url,
        data: data,
        success: function (data) {
          $this.trigger('uiNotified', {
            growlOptions: {
              title: msg && msg.title ? msg.title : 'Updated',
              message: msg && msg.message ? msg.message : 'Refresh to see updates',
            },
            growlSettings: {
              type: 'success',
              delay: 3000
            }
          });
        },
        error: function (e) {
          $($this.attr.spinnerModal).modal('hide');
          $this.trigger('uiNotified', {
            growlOptions: {
              title: msg && msg.errorTitle ? msg.errorTitle : 'Error',
              message: msg && msg.errorMessage ? msg.errorMessage : 'There was an error',
            },
            growlSettings: {
              type: 'danger',
              delay: 0
            }
          });
        }
      });
    }

    this.deleteResource = function (url, msg) {
      var $this = this;
      $.ajax({
        beforeSend: function(xhr) {
          xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'));
        },
        method: 'DELETE',
        url: url,
        success: function (data) {
          $this.trigger('uiNotified', {
            growlOptions: {
              title: msg && msg.title ? msg.title : 'Deleted',
              message: msg && msg.message ? msg.message : 'Refresh to see updates',
            },
            growlSettings: {
              type: 'success',
              delay: 3000
            }
          });
        },
        error: function (e) {
          $this.trigger('uiNotified', {
            growlOptions: {
              title: msg && msg.errorTitle ? msg.errorTitle : 'Error',
              message: msg && msg.errorMessage ? msg.errorMessage : 'There was an error',
            },
            growlSettings: {
              type: 'danger',
              delay: 0
            }
          });
        }
      })
    }
  }
});
