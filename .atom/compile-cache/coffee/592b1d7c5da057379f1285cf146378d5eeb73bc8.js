(function() {
  var ConfigSchema, defaultGrammars, isOpeningTagLikePattern,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  isOpeningTagLikePattern = /<(?![\!\/])([a-z]{1}[^>\s=\'\"]*)[^>]*$/i;

  defaultGrammars = ['HTML', 'HTML (Go)', 'HTML (Rails)', 'HTML (Angular)', 'HTML (Mustache)', 'HTML (Handlebars)', 'HTML (Ruby - ERB)', 'PHP'];

  ConfigSchema = require('./configuration.coffee');

  module.exports = {
    config: ConfigSchema.config,
    neverClose: [],
    forceInline: [],
    forceBlock: [],
    grammars: defaultGrammars,
    makeNeverCloseSelfClosing: false,
    ignoreGrammar: false,
    activate: function() {
      atom.config.observe('autoclose-html.neverClose', (function(_this) {
        return function(value) {
          return _this.neverClose = value;
        };
      })(this));
      atom.config.observe('autoclose-html.forceInline', (function(_this) {
        return function(value) {
          return _this.forceInline = value;
        };
      })(this));
      atom.config.observe('autoclose-html.forceBlock', (function(_this) {
        return function(value) {
          return _this.forceBlock = value;
        };
      })(this));
      atom.config.observe('autoclose-html.additionalGrammars', (function(_this) {
        return function(value) {
          if (__indexOf.call(value, '*') >= 0) {
            return _this.ignoreGrammar = true;
          } else {
            return _this.grammars = defaultGrammars.concat(value);
          }
        };
      })(this));
      atom.config.observe('autoclose-html.makeNeverCloseSelfClosing', (function(_this) {
        return function(value) {
          return _this.makeNeverCloseSelfClosing = value;
        };
      })(this));
      return this._events();
    },
    isInline: function(eleTag) {
      var ele, ret, _ref, _ref1, _ref2;
      try {
        ele = document.createElement(eleTag);
      } catch (_error) {
        return false;
      }
      if (_ref = eleTag.toLowerCase(), __indexOf.call(this.forceBlock, _ref) >= 0) {
        return false;
      } else if (_ref1 = eleTag.toLowerCase(), __indexOf.call(this.forceInline, _ref1) >= 0) {
        return true;
      }
      document.body.appendChild(ele);
      ret = (_ref2 = window.getComputedStyle(ele).getPropertyValue('display')) === 'inline' || _ref2 === 'inline-block' || _ref2 === 'none';
      document.body.removeChild(ele);
      return ret;
    },
    isNeverClosed: function(eleTag) {
      var _ref;
      return _ref = eleTag.toLowerCase(), __indexOf.call(this.neverClose, _ref) >= 0;
    },
    execAutoclose: function(changedEvent, editor) {
      var doubleQuotes, eleTag, index, isInline, line, matches, oddDoubleQuotes, oddSingleQuotes, partial, singleQuotes;
      if ((changedEvent != null ? changedEvent.newText : void 0) === '>' && editor === atom.workspace.getActiveTextEditor()) {
        line = editor.buffer.getLines()[changedEvent.newRange.end.row];
        partial = line.substr(0, changedEvent.newRange.start.column);
        partial = partial.substr(partial.lastIndexOf('<'));
        if (partial.substr(partial.length - 1, 1) === '/') {
          return;
        }
        singleQuotes = partial.match(/\'/g);
        doubleQuotes = partial.match(/\"/g);
        oddSingleQuotes = singleQuotes && (singleQuotes.length % 2);
        oddDoubleQuotes = doubleQuotes && (doubleQuotes.length % 2);
        if (oddSingleQuotes || oddDoubleQuotes) {
          return;
        }
        index = -1;
        while ((index = partial.indexOf('"')) !== -1) {
          partial = partial.slice(0, index) + partial.slice(partial.indexOf('"', index + 1) + 1);
        }
        while ((index = partial.indexOf("'")) !== -1) {
          partial = partial.slice(0, index) + partial.slice(partial.indexOf("'", index + 1) + 1);
        }
        if ((matches = partial.match(isOpeningTagLikePattern)) == null) {
          return;
        }
        eleTag = matches[matches.length - 1];
        if (this.isNeverClosed(eleTag)) {
          if (this.makeNeverCloseSelfClosing) {
            setTimeout(function() {
              var tag;
              tag = '/>';
              if (partial.substr(partial.length - 1, 1 !== ' ')) {
                tag = ' ' + tag;
              }
              editor.backspace();
              return editor.insertText(tag);
            });
          }
          return;
        }
        isInline = this.isInline(eleTag);
        return setTimeout(function() {
          if (!isInline) {
            editor.insertNewline();
            editor.insertNewline();
          }
          editor.insertText('</' + eleTag + '>');
          if (isInline) {
            return editor.setCursorBufferPosition(changedEvent.newRange.end);
          } else {
            editor.autoIndentBufferRow(changedEvent.newRange.end.row + 1);
            return editor.setCursorBufferPosition([changedEvent.newRange.end.row + 1, atom.workspace.getActivePaneItem().getTabText().length * atom.workspace.getActivePaneItem().indentationForBufferRow(changedEvent.newRange.end.row + 1)]);
          }
        });
      }
    },
    _events: function() {
      return atom.workspace.observeTextEditors((function(_this) {
        return function(textEditor) {
          var bufferEvent;
          bufferEvent = null;
          return textEditor.observeGrammar(function(grammar) {
            var _ref, _ref1;
            if (bufferEvent != null) {
              bufferEvent.dispose();
            }
            if (((_ref = grammar.name) != null ? _ref.length : void 0) > 0 && (_this.ignoreGrammar || (_ref1 = grammar.name, __indexOf.call(_this.grammars, _ref1) >= 0))) {
              return bufferEvent = textEditor.buffer.onDidChange(function(e) {
                return _this.execAutoclose(e, textEditor);
              });
            }
          });
        };
      })(this));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy9hdXRvY2xvc2UtaHRtbC9saWIvYXV0b2Nsb3NlLWh0bWwuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHNEQUFBO0lBQUEscUpBQUE7O0FBQUEsRUFBQSx1QkFBQSxHQUEwQiwwQ0FBMUIsQ0FBQTs7QUFBQSxFQUNBLGVBQUEsR0FBa0IsQ0FBQyxNQUFELEVBQVMsV0FBVCxFQUFzQixjQUF0QixFQUFzQyxnQkFBdEMsRUFBd0QsaUJBQXhELEVBQTJFLG1CQUEzRSxFQUFnRyxtQkFBaEcsRUFBcUgsS0FBckgsQ0FEbEIsQ0FBQTs7QUFBQSxFQUdBLFlBQUEsR0FBZSxPQUFBLENBQVEsd0JBQVIsQ0FIZixDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FDSTtBQUFBLElBQUEsTUFBQSxFQUFRLFlBQVksQ0FBQyxNQUFyQjtBQUFBLElBRUEsVUFBQSxFQUFXLEVBRlg7QUFBQSxJQUdBLFdBQUEsRUFBYSxFQUhiO0FBQUEsSUFJQSxVQUFBLEVBQVksRUFKWjtBQUFBLElBS0EsUUFBQSxFQUFVLGVBTFY7QUFBQSxJQU1BLHlCQUFBLEVBQTJCLEtBTjNCO0FBQUEsSUFPQSxhQUFBLEVBQWUsS0FQZjtBQUFBLElBU0EsUUFBQSxFQUFVLFNBQUEsR0FBQTtBQUVOLE1BQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLDJCQUFwQixFQUFpRCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxLQUFELEdBQUE7aUJBQzdDLEtBQUMsQ0FBQSxVQUFELEdBQWMsTUFEK0I7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqRCxDQUFBLENBQUE7QUFBQSxNQUdBLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQiw0QkFBcEIs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

//# sourceURL=/home/gsmyrnaios/.atom/packages/autoclose-html/lib/autoclose-html.coffee
