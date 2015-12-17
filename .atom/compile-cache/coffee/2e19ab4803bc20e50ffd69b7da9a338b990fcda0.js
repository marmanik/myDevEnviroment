(function() {
  var $, $$$, AtomHtmlPreviewView, CompositeDisposable, Disposable, ScrollView, fs, os, path, _ref, _ref1,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  fs = require('fs');

  _ref = require('atom'), CompositeDisposable = _ref.CompositeDisposable, Disposable = _ref.Disposable;

  _ref1 = require('atom-space-pen-views'), $ = _ref1.$, $$$ = _ref1.$$$, ScrollView = _ref1.ScrollView;

  path = require('path');

  os = require('os');

  module.exports = AtomHtmlPreviewView = (function(_super) {
    __extends(AtomHtmlPreviewView, _super);

    atom.deserializers.add(AtomHtmlPreviewView);

    AtomHtmlPreviewView.prototype.editorSub = null;

    AtomHtmlPreviewView.prototype.onDidChangeTitle = function() {
      return new Disposable();
    };

    AtomHtmlPreviewView.prototype.onDidChangeModified = function() {
      return new Disposable();
    };

    AtomHtmlPreviewView.deserialize = function(state) {
      return new AtomHtmlPreviewView(state);
    };

    AtomHtmlPreviewView.content = function() {
      return this.div({
        "class": 'atom-html-preview native-key-bindings',
        tabindex: -1
      });
    };

    function AtomHtmlPreviewView(_arg) {
      var filePath;
      this.editorId = _arg.editorId, filePath = _arg.filePath;
      this.handleEvents = __bind(this.handleEvents, this);
      AtomHtmlPreviewView.__super__.constructor.apply(this, arguments);
      if (this.editorId != null) {
        this.resolveEditor(this.editorId);
        this.tmpPath = this.getPath();
      } else {
        if (atom.workspace != null) {
          this.subscribeToFilePath(filePath);
        } else {
          atom.packages.onDidActivatePackage((function(_this) {
            return function() {
              return _this.subscribeToFilePath(filePath);
            };
          })(this));
        }
      }
    }

    AtomHtmlPreviewView.prototype.serialize = function() {
      return {
        deserializer: 'AtomHtmlPreviewView',
        filePath: this.getPath(),
        editorId: this.editorId
      };
    };

    AtomHtmlPreviewView.prototype.destroy = function() {
      return this.editorSub.dispose();
    };

    AtomHtmlPreviewView.prototype.subscribeToFilePath = function(filePath) {
      this.trigger('title-changed');
      this.handleEvents();
      return this.renderHTML();
    };

    AtomHtmlPreviewView.prototype.resolveEditor = function(editorId) {
      var resolve;
      resolve = (function(_this) {
        return function() {
          var _ref2, _ref3;
          _this.editor = _this.editorForId(editorId);
          if (_this.editor != null) {
            if (_this.editor != null) {
              _this.trigger('title-changed');
            }
            return _this.handleEvents();
          } else {
            return (_ref2 = atom.workspace) != null ? (_ref3 = _ref2.paneForItem(_this)) != null ? _ref3.destroyItem(_this) : void 0 : void 0;
          }
        };
      })(this);
      if (atom.workspace != null) {
        return resolve();
      } else {
        return atom.packages.onDidActivatePackage((function(_this) {
          return function() {
            resolve();
            return _this.renderHTML();
          };
        })(this));
      }
    };

    AtomHtmlPreviewView.prototype.editorForId = function(editorId) {
      var editor, _i, _len, _ref2, _ref3;
      _ref2 = atom.workspace.getTextEditors();
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        editor = _ref2[_i];
        if (((_ref3 = editor.id) != null ? _ref3.toString() : void 0) === editorId.toString()) {
          return editor;
        }
      }
      return null;
    };

    AtomHtmlPreviewView.prototype.handleEvents = function() {
      var changeHandler;
      changeHandler = (function(_this) {
        return function() {
          var pane;
          _this.renderHTML();
          pane = atom.workspace.paneForURI(_this.getURI());
          if ((pane != null) && pane !== atom.workspace.getActivePane()) {
            return pane.activateItem(_this);
          }
        };
      })(this);
      this.editorSub = new CompositeDisposable;
      if (this.editor != null) {
        if (atom.config.get("atom-html-preview.triggerOnSave")) {
          this.editorSub.add(this.editor.onDidSave(changeHandler));
        } else {
          this.editorSub.add(this.editor.onDidStopChanging(changeHandler));
        }
        return this.editorSub.add(this.editor.onDidChangePath((function(_this) {
          return function() {
            return _this.trigger('title-changed');
          };
        })(this)));
      }
    };

    AtomHtmlPreviewView.prototype.renderHTML = function() {
      this.showLoading();
      if (this.editor != null) {
        return this.renderHTMLCode();
      }
    };

    AtomHtmlPreviewView.prototype.save = function(callback) {
      var out, outPath;
      outPath = path.resolve(os.tmpdir() + this.editor.getTitle());
      out = "<base href=\"" + this.getPath() + "\">" + this.editor.getText();
      this.tmpPath = outPath;
      return fs.writeFile(outPath, out, callback);
    };

    AtomHtmlPreviewView.prototype.renderHTMLCode = function(text) {
      if (!atom.config.get("atom-html-preview.triggerOnSave") && (this.editor.getPath() != null)) {
        return this.save((function(_this) {
          return function() {
            var iframe;
            iframe = document.createElement("iframe");
            iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
            iframe.src = _this.tmpPath;
            _this.html($(iframe));
            return atom.commands.dispatch('atom-html-preview', 'html-changed');
          };
        })(this));
      }
    };

    AtomHtmlPreviewView.prototype.getTitle = function() {
      if (this.editor != null) {
        return "" + (this.editor.getTitle()) + " Preview";
      } else {
        return "HTML Preview";
      }
    };

    AtomHtmlPreviewView.prototype.getURI = function() {
      return "html-preview://editor/" + this.editorId;
    };

    AtomHtmlPreviewView.prototype.getPath = function() {
      if (this.editor != null) {
        return this.editor.getPath();
      }
    };

    AtomHtmlPreviewView.prototype.showError = function(result) {
      var failureMessage;
      failureMessage = result != null ? result.message : void 0;
      return this.html($$$(function() {
        this.h2('Previewing HTML Failed');
        if (failureMessage != null) {
          return this.h3(failureMessage);
        }
      }));
    };

    AtomHtmlPreviewView.prototype.showLoading = function() {
      return this.html($$$(function() {
        return this.div({
          "class": 'atom-html-spinner'
        }, 'Loading HTML Preview\u2026');
      }));
    };

    return AtomHtmlPreviewView;

  })(ScrollView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy9hdG9tLWh0bWwtcHJldmlldy9saWIvYXRvbS1odG1sLXByZXZpZXctdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsbUdBQUE7SUFBQTs7bVNBQUE7O0FBQUEsRUFBQSxFQUFBLEdBQXdCLE9BQUEsQ0FBUSxJQUFSLENBQXhCLENBQUE7O0FBQUEsRUFDQSxPQUFvQyxPQUFBLENBQVEsTUFBUixDQUFwQyxFQUFDLDJCQUFBLG1CQUFELEVBQXNCLGtCQUFBLFVBRHRCLENBQUE7O0FBQUEsRUFFQSxRQUF3QixPQUFBLENBQVEsc0JBQVIsQ0FBeEIsRUFBQyxVQUFBLENBQUQsRUFBSSxZQUFBLEdBQUosRUFBUyxtQkFBQSxVQUZULENBQUE7O0FBQUEsRUFHQSxJQUFBLEdBQXdCLE9BQUEsQ0FBUSxNQUFSLENBSHhCLENBQUE7O0FBQUEsRUFJQSxFQUFBLEdBQXdCLE9BQUEsQ0FBUSxJQUFSLENBSnhCLENBQUE7O0FBQUEsRUFNQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osMENBQUEsQ0FBQTs7QUFBQSxJQUFBLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBbkIsQ0FBdUIsbUJBQXZCLENBQUEsQ0FBQTs7QUFBQSxrQ0FFQSxTQUFBLEdBQXNCLElBRnRCLENBQUE7O0FBQUEsa0NBR0EsZ0JBQUEsR0FBc0IsU0FBQSxHQUFBO2FBQU8sSUFBQSxVQUFBLENBQUEsRUFBUDtJQUFBLENBSHRCLENBQUE7O0FBQUEsa0NBSUEsbUJBQUEsR0FBc0IsU0FBQSxHQUFBO2FBQU8sSUFBQSxVQUFBLENBQUEsRUFBUDtJQUFBLENBSnRCLENBQUE7O0FBQUEsSUFNQSxtQkFBQyxDQUFBLFdBQUQsR0FBYyxTQUFDLEtBQUQsR0FBQTthQUNSLElBQUEsbUJBQUEsQ0FBb0IsS0FB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

//# sourceURL=/home/gsmyrnaios/.atom/packages/atom-html-preview/lib/atom-html-preview-view.coffee
