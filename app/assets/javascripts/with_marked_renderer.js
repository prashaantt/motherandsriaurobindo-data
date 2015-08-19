define(function (require) {
  'use strict';

  var marked = require('marked/lib/marked');
  var utils = require('flight/lib/utils');

  return withMarkedRenderer;

  function withMarkedRenderer() {
    this.renderer = function (id, clean) {
      var $this = this;
      var id_counter = 1;
      var renderer = new marked.Renderer();

      renderer.list = function(body, ordered) {
        if (id) {
          var type = ordered ? 'ol' : 'ul';
          return '<' + type + " id='p" + id_counter++ + "'>\n" + body + '</' + type + '>\n';
        }
        return marked.Renderer.prototype.list.call(this, body, ordered);
      };

      renderer.heading = function(text, level, raw) {
        var levels = ['', 't1', 't2', 't3', 't4', 't5', 't6'];
        $this.toc.push(
          {
            text: text,
            level: levels[level],
            url: raw.toLowerCase().replace(/[^\w]+/g, '-')
          }
        );
        return marked.Renderer.prototype.heading.call(this, text, level, raw);
      }

      renderer.blockquote = function (quote) {
        // the ugly hack
        if (quote.indexOf("class='comment'") != -1) {
          quote = quote.replace(/ class='comment'/g, '');
        }
        if (quote.indexOf("class='aside'") != -1) {
          quote = quote.replace(/ class='aside'/g, '');
        }
        if (quote.indexOf("class='para'") != -1) {
          quote = quote.replace(/ class='para'/g, '');
        }
        return marked.Renderer.prototype.blockquote.call(this, quote);
      }

      renderer.paragraph = function(text) {
        var str = '';
        var html = '';
        var img = false;
        if (clean) {
          if ($this.hasBadTag(text)) {
            html = $.parseHTML(text);
            if (html.length == 1 && html[0].nodeName == 'IMG') {
              img = true;
            } else {
              $.each(html, function (k, v) {
                if (!this.isBadLinkOrStyle(v)) {
                  if (v.nodeName == '#text') {
                    str += v.textContent;
                  } else {
                    str += v.outerHTML;
                  }
                }
              });
            }
          }
        } else {
          str = text;
        }
        var aside = false;
        var comment = false;
        aside = (str[0] == '(' && str[str.length - 1] == ')');
        
        if (!aside && !img) {
          if (!html)
            html = $.parseHTML(str);
          if (html.length == 1 && html[0].nodeName == 'IMG') {
            img = true;
          }
        }

        if (!aside && !img && str[0] == '<') {
          var elem = $(str);
          if (elem.length == 1) {
            comment = (str.substring(0, 4) == '<em>' && str.substring(str.length - 5) == '</em>');
          } else {
            // if not last element and not EM
            // or if last element and not EM or SUP
            for (var i = 0; i < elem.length; i++) {
              if ((i < elem.length - 1 && elem[i].tagName != 'EM') ||
                (i == elem.length - 1 && (elem[i].tagName != 'SUP' && elem[i].tagName != 'EM'))) {
                comment = false;
                break;
              } else {
                comment = true;
              }
            }
          }
        }
        if (!aside && !comment && !img)
          var para = true;
        return "<p" + (id && !img ? " id='p" + id_counter++ + "'" : '') + (aside ? " class='aside'" : '') + (comment ? " class='comment'" : '') + (para ? " class='para'" : '') + '>' + str + "</p>\n";
      }

      if (clean) {
        renderer.html = function(html) {
          if (this.hasBadTag(html))
            return '';
          return html;
        };

        renderer.link = function(href, title, text) {
          if (href.toLowerCase().indexOf('javascript:') != -1)
            return '';

          return marked.Renderer.prototype.link.call(this, href, title, text);
        };
      }

      return renderer;
    }

    this.isBadLinkOrStyle = function (node) {
      if (node.nodeName == 'A') {
        attribs = node.attributes;
        bad = false;
        $.each(attribs, function (i, j) {
          if (j.name == 'onmouseover' || j.name == 'href' && j.value.indexOf('javascript') != -1) {
            bad = true;
            return false;
          }
        });
        return bad;
      } else if (node.nodeName == 'STYLE') {
        return true;
      }
      return false;
    }

    this.hasBadTag = function (html) {
      if (html.toLowerCase().indexOf('script') != -1 ||
        html.toLowerCase().indexOf('onmouseover') != -1 ||
        html.toLowerCase().indexOf('alert') != -1 ||
        html.toLowerCase().indexOf('link') != -1 ||
        html.toLowerCase().indexOf('style') != -1) {
        return true;
      }
      return false;
    }

    this.toHtml = function (str, options) {
      if (typeof options == 'undefined') {
        marked.setOptions(utils.merge(this.defaultOptions, {renderer: new marked.Renderer()}));
        return marked(str);
      }

      // adds ids to p, ol if options.id == true
      var id = options.id || false;
      delete options.id;

      // eliminates xss attacks if options.clean == true
      var clean = options.clean || false;
      delete options.clean;

      options = utils.merge(this.defaultOptions, options);

      if (!id && !clean) {
        marked.setOptions(utils.merge(options, {renderer: new marked.Renderer()}));
      } else {
        var $this = this;
        marked.setOptions(utils.merge(options, {renderer: $this.renderer(id, clean)}));
      }
      return marked(str);
    }

    this.after('initialize', function () {
      this.defaultOptions = {
        breaks: true,
        smartypants: true,
        footnotes: true,
        gfm: true
      }
      this.toc = [];
    });
  }
});
