define(function (require) {
  'use strict';

  return withLocalStorage;

  function withLocalStorage() {
    this.readLocal = function (key) {
      if (!this.hasLocalStorage) 
        return false;
      var value = localStorage[key];
      if (value != undefined && value != 'undefined') {
        return JSON.parse(value);
      }
    }

    this.writeLocal = function (key, value) {
      if (!this.hasLocalStorage)
        return false;
      try {
        localStorage[key] = JSON.stringify(value);
      } catch (e) {
        console.error('Unserializable data');
        return false;
      }
    }

    this.removeLocal = function (key) {
      if (!this.hasLocalStorage)
        return false;
      localStorage.removeItem(key);
    }

    this.readOrWriteLocal = function (key, value) {
      var obj = {}
      var val = this.readLocal(key);
      var cached;
      if (val == undefined) {
        this.writeLocal(key, value);
        cached = false;
      } else {
        cached = true;
      }
      return cached;
    }

    this.readOrUpdateLocal = function (key, value) {
      var obj = {}
      var val = this.readLocal(key);
      obj.value = value;
      if (val == undefined || val != value) {
        this.writeLocal(key, value);
        obj.cached = false;
      } else {
        obj.cached = true;
      }
      return obj;
    }

    // this.readOrBustLocal = function (refKey, refValue, key, value) {
    //   if (this.readLocal(refKey) == refValue) {
    //     var val = this.readLocal(key);
    //     obj.value = val;
    //     if (val == undefined) {
    //       this.writeLocal(key, value);
    //       obj.cached = false;
    //     } else {
    //       obj.cached = true;
    //     }
    //     // return obj;
    //   } else {
    //     this.writeLocal(key, value);
    //   }
    // }

    this.readSession = function (key) {
      if (!this.hasSessionStorage)
        return false;
      var value = sessionStorage[key];
      if (value != undefined && value != 'undefined') {
        return JSON.parse(value);
      }
    }

    this.writeSession = function (key, value) {
      if (!this.hasSessionStorage)
        return false;
      try {
        sessionStorage[key] = JSON.stringify(value);
      } catch (e) {
        console.error('Unserializable data');
        return false;
      }
    }

    this.removeSession = function (key) {
      if (!this.hasSessionStorage)
        return false;
      sessionStorage.removeItem(key);
    }

    this.supportsLocalStorage = function () {
      var data = 'd';
      try {
        localStorage.setItem(data, data);
        localStorage.removeItem(data);
        return true;
      } catch(e) {
        return false;
      }
    }

    this.supportsSessionStorage = function () {
      var data = 'd';
      try {
        sessionStorage.setItem(data, data);
        sessionStorage.removeItem(data);
        return true;
      } catch(e) {
        return false;
      }
    }

    this.after('initialize', function () {
      this.hasLocalStorage = this.supportsLocalStorage();
      this.hasSessionStorage = this.supportsSessionStorage();
    });

    // this.around('readLocal writeLocal removeLocal', function (func, key, value) {
    //   if (this.hasLocalStorage) {
    //     return func(key, value);
    //   }
    //   return false;
    // });

    // this.around('readSession writeSession removeSession', function (func, key, value) {
    //   if (this.hasSessionStorage) {
    //     return func(key, value);
    //   }
    //   return false;
    // });
  }
});
