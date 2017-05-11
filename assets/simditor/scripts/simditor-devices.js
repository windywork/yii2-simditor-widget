(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (function(factory) {
    if ((typeof define === 'function') && define.amd) {
      return define(['simditor'], factory);
    } else {
      return factory(window.Simditor);
    }
  })(function(Simditor) {
    var DevicesButton;
    DevicesButton = (function(_super) {
      __extends(DevicesButton, _super);

      DevicesButton.i18n = {
        'zh-CN': {
          'devices view': '设备预览',
          'pc view': '电脑预览',
          'mobile view': '手机预览'
        },
        'en-US': {
          'devices view': 'devices view',
          'pc view': 'pc view',
          'mobile view': 'mobile view'
        }
      };

      DevicesButton.prototype.name = 'devices';

      DevicesButton.prototype.title = DevicesButton._t('devices view');

      DevicesButton.prototype.menu = true;

      function DevicesButton() {
        DevicesButton.__super__.constructor.apply(this, arguments);
      }

      DevicesButton.prototype._init = function() {
        var item, key, _ref;
        this.actions = [
          {
            text: this._t('pc view'),
            css: './styles/simditor-devices-pc.css'
          }, {
            text: this._t('mobile view'),
            css: './styles/simditor-devices-mobile.css'
          }
        ];
        if (this.editor.opts.devices) {
          this.actions = this.editor.opts.devices;
        }
        console.log(this.editor.opts.devices);
        this.menu = [];
        _ref = this.actions;
        for (key in _ref) {
          item = _ref[key];
          this.menu.push({
            name: "m" + key,
            text: item.text,
            param: key
          });
        }
        DevicesButton.__super__._init.apply(this, arguments);
        return this.setIcon('devices-viewer');
      };

      DevicesButton.prototype.setIcon = function(icon) {
        return this.el.find('span').removeClass().addClass('icon-' + icon);
      };

      DevicesButton.prototype.openViewer = function(content, action) {
        var cssfile, html, title;
        title = action.title || action.text;
        cssfile = action.css;
        html = "<html>\n  <head>\n    <title>" + title + "</title>\n    <link rel=\"stylesheet\" href=\"" + cssfile + "\">\n  </head>\n  <body>\n    <div class=\"simditor-device\">\n      <div class=\"simditor-content\">\n        " + content + "\n      </div>\n    </div>\n  </body>\n</html>";
        this.win = window.open('about:blank');
        return this.win.document.write(html);
      };

      DevicesButton.prototype.command = function(param, m2) {
        return this.openViewer(this.editor.getValue(), this.actions[param]);
      };

      return DevicesButton;

    })(Simditor.Button);
    return Simditor.Toolbar.addButton(DevicesButton);
  });

}).call(this);
