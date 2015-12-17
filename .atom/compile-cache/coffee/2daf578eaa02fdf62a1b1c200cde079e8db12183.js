(function() {
  var BetaAdater, CompositeDisposable, DecorationManagement, Emitter, LegacyAdater, Minimap, nextModelId, _ref;

  _ref = require('atom'), Emitter = _ref.Emitter, CompositeDisposable = _ref.CompositeDisposable;

  DecorationManagement = require('./mixins/decoration-management');

  LegacyAdater = require('./adapters/legacy-adapter');

  BetaAdater = require('./adapters/beta-adapter');

  nextModelId = 1;

  module.exports = Minimap = (function() {
    DecorationManagement.includeInto(Minimap);


    /* Public */

    function Minimap(options) {
      var subs;
      if (options == null) {
        options = {};
      }
      this.textEditor = options.textEditor, this.standAlone = options.standAlone, this.width = options.width, this.height = options.height;
      if (this.textEditor == null) {
        throw new Error('Cannot create a minimap without an editor');
      }
      this.id = nextModelId++;
      this.emitter = new Emitter;
      this.subscriptions = subs = new CompositeDisposable;
      this.initializeDecorations();
      if (atom.views.getView(this.textEditor).getScrollTop != null) {
        this.adapter = new BetaAdater(this.textEditor);
      } else {
        this.adapter = new LegacyAdater(this.textEditor);
      }
      if (this.standAlone) {
        this.scrollTop = 0;
      }
      subs.add(atom.config.observe('editor.scrollPastEnd', (function(_this) {
        return function(scrollPastEnd) {
          _this.scrollPastEnd = scrollPastEnd;
          _this.adapter.scrollPastEnd = _this.scrollPastEnd;
          return _this.emitter.emit('did-change-config', {
            config: 'editor.scrollPastEnd',
            value: _this.scrollPastEnd
          });
        };
      })(this)));
      subs.add(atom.config.observe('minimap.charHeight', (function(_this) {
        return function(configCharHeight) {
          _this.configCharHeight = configCharHeight;
          return _this.emitter.emit('did-change-config', {
            config: 'minimap.charHeight',
            value: _this.getCharHeight()
          });
        };
      })(this)));
      subs.add(atom.config.observe('minimap.charWidth', (function(_this) {
        return function(configCharWidth) {
          _this.configCharWidth = configCharWidth;
          return _this.emitter.emit('did-change-config', {
            config: 'minimap.charWidth',
            value: _this.getCharWidth()
          });
        };
      })(this)));
      subs.add(atom.config.observe('minimap.interline', (function(_this) {
        return function(configInterline) {
          _this.configInterline = configInterline;
          return _this.emitter.emit('did-change-config', {
            config: 'minimap.interline',
            value: _this.getInterline()
          });
        };
      })(this)));
      subs.add(this.adapter.onDidChangeScrollTop((function(_this) {
        return function() {
          if (!_this.standAlone) {
            return _this.emitter.emit('did-change-scroll-top', _this);
          }
        };
      })(this)));
      subs.add(this.adapter.onDidChangeScrollLeft((function(_this) {
        return function() {
          if (!_this.standAlone) {
            return _this.emitter.emit('did-change-scroll-left', _this);
          }
        };
      })(this)));
      subs.add(this.textEditor.onDidChange((function(_this) {
        return function(changes) {
          return _this.emitChanges(changes);
        };
      })(this)));
      subs.add(this.textEditor.onDidDestroy((function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this)));
      subs.add(this.textEditor.displayBuffer.onDidTokenize((function(_this) {
        return function() {
          return _this.emitter.emit('did-change-config');
        };
      })(this)));
    }

    Minimap.prototype.destroy = function() {
      if (this.destroyed) {
        return;
      }
      this.removeAllDecorations();
      this.subscriptions.dispose();
      this.subscriptions = null;
      this.textEditor = null;
      this.emitter.emit('did-destroy');
      this.emitter.dispose();
      return this.destroyed = true;
    };

    Minimap.prototype.isDestroyed = function() {
      return this.destroyed;
    };

    Minimap.prototype.onDidChange = function(callback) {
      return this.emitter.on('did-change', callback);
    };

    Minimap.prototype.onDidChangeConfig = function(callback) {
      return this.emitter.on('did-change-config', callback);
    };

    Minimap.prototype.onDidChangeScrollTop = function(callback) {
      return this.emitter.on('did-change-scroll-top', callback);
    };

    Minimap.prototype.onDidChangeScrollLeft = function(callback) {
      return this.emitter.on('did-change-scroll-left', callback);
    };

    Minimap.prototype.onDidChangeStandAlone = function(callback) {
      return this.emitter.on('did-change-stand-alone', callback);
    };

    Minimap.prototype.onDidDestroy = function(callback) {
      return this.emitter.on('did-destroy', callback);
    };

    Minimap.prototype.isStandAlone = function() {
      return this.standAlone;
    };

    Minimap.prototype.setStandAlone = function(standAlone) {
      if (standAlone !== this.standAlone) {
        this.standAlone = standAlone;
        return this.emitter.emit('did-change-stand-alone', this);
      }
    };

    Minimap.prototype.getTextEditor = function() {
      return this.textEditor;
    };

    Minimap.prototype.getTextEditorScaledHeight = function() {
      return this.adapter.getHeight() * this.getVerticalScaleFactor();
    };

    Minimap.prototype.getTextEditorScaledScrollTop = function() {
      return this.adapter.getScrollTop() * this.getVerticalScaleFactor();
    };

    Minimap.prototype.getTextEditorScaledScrollLeft = function() {
      return this.adapter.getScrollLeft() * this.getHorizontalScaleFactor();
    };

    Minimap.prototype.getTextEditorMaxScrollTop = function() {
      return this.adapter.getMaxScrollTop();
    };

    Minimap.prototype.getTextEditorScrollTop = function() {
      return this.adapter.getScrollTop();
    };

    Minimap.prototype.setTextEditorScrollTop = function(scrollTop) {
      return this.adapter.setScrollTop(scrollTop);
    };

    Minimap.prototype.getTextEditorScrollLeft = function() {
      return this.adapter.getScrollLeft();
    };

    Minimap.prototype.getTextEditorHeight = function() {
      return this.adapter.getHeight();
    };

    Minimap.prototype.getTextEditorScrollRatio = function() {
      return this.adapter.getScrollTop() / (this.getTextEditorMaxScrollTop() || 1);
    };

    Minimap.prototype.getCapedTextEditorScrollRatio = function() {
      return Math.min(1, this.getTextEditorScrollRatio());
    };

    Minimap.prototype.getHeight = function() {
      return this.textEditor.getScreenLineCount() * this.getLineHeight();
    };

    Minimap.prototype.getWidth = function() {
      return this.textEditor.getMaxScreenLineLength() * this.getCharWidth();
    };

    Minimap.prototype.getVisibleHeight = function() {
      return Math.min(this.getScreenHeight(), this.getHeight());
    };

    Minimap.prototype.getScreenHeight = function() {
      if (this.isStandAlone()) {
        if (this.height != null) {
          return this.height;
        } else {
          return this.getHeight();
        }
      } else {
        return this.adapter.getHeight();
      }
    };

    Minimap.prototype.getVisibleWidth = function() {
      return Math.min(this.getScreenWidth(), this.getWidth());
    };

    Minimap.prototype.getScreenWidth = function() {
      if (this.isStandAlone() && (this.width != null)) {
        return this.width;
      } else {
        return this.getWidth();
      }
    };

    Minimap.prototype.setScreenHeightAndWidth = function(height, width) {
      this.height = height;
      this.width = width;
    };

    Minimap.prototype.getVerticalScaleFactor = function() {
      return this.getLineHeight() / this.textEditor.getLineHeightInPixels();
    };

    Minimap.prototype.getHorizontalScaleFactor = function() {
      return this.getCharWidth() / this.textEditor.getDefaultCharWidth();
    };

    Minimap.prototype.getLineHeight = function() {
      return this.getCharHeight() + this.getInterline();
    };

    Minimap.prototype.getCharWidth = function() {
      var _ref1;
      return (_ref1 = this.charWidth) != null ? _ref1 : this.configCharWidth;
    };

    Minimap.prototype.setCharWidth = function(charWidth) {
      this.charWidth = Math.floor(charWidth);
      return this.emitter.emit('did-change-config');
    };

    Minimap.prototype.getCharHeight = function() {
      var _ref1;
      return (_ref1 = this.charHeight) != null ? _ref1 : this.configCharHeight;
    };

    Minimap.prototype.setCharHeight = function(charHeight) {
      this.charHeight = Math.floor(charHeight);
      return this.emitter.emit('did-change-config');
    };

    Minimap.prototype.getInterline = function() {
      var _ref1;
      return (_ref1 = this.interline) != null ? _ref1 : this.configInterline;
    };

    Minimap.prototype.setInterline = function(interline) {
      this.interline = Math.floor(interline);
      return this.emitter.emit('did-change-config');
    };

    Minimap.prototype.getFirstVisibleScreenRow = function() {
      return Math.floor(this.getScrollTop() / this.getLineHeight());
    };

    Minimap.prototype.getLastVisibleScreenRow = function() {
      return Math.ceil((this.getScrollTop() + this.getScreenHeight()) / this.getLineHeight());
    };

    Minimap.prototype.getScrollTop = function() {
      if (this.standAlone) {
        return this.scrollTop;
      } else {
        return Math.abs(this.getCapedTextEditorScrollRatio() * this.getMaxScrollTop());
      }
    };

    Minimap.prototype.setScrollTop = function(scrollTop) {
      this.scrollTop = scrollTop;
      if (this.standAlone) {
        return this.emitter.emit('did-change-scroll-top', this);
      }
    };

    Minimap.prototype.getMaxScrollTop = function() {
      return Math.max(0, this.getHeight() - this.getScreenHeight());
    };

    Minimap.prototype.canScroll = function() {
      return this.getMaxScrollTop() > 0;
    };

    Minimap.prototype.getMarker = function(id) {
      return this.textEditor.getMarker(id);
    };

    Minimap.prototype.findMarkers = function(o) {
      try {
        return this.textEditor.findMarkers(o);
      } catch (_error) {
        return [];
      }
    };

    Minimap.prototype.markBufferRange = function(range) {
      return this.textEditor.markBufferRange(range);
    };

    Minimap.prototype.emitChanges = function(changes) {
      return this.emitter.emit('did-change', changes);
    };

    Minimap.prototype.enableCache = function() {
      return this.adapter.enableCache();
    };

    Minimap.prototype.clearCache = function() {
      return this.adapter.clearCache();
    };

    return Minimap;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL2xpYi9taW5pbWFwLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx3R0FBQTs7QUFBQSxFQUFBLE9BQWlDLE9BQUEsQ0FBUSxNQUFSLENBQWpDLEVBQUMsZUFBQSxPQUFELEVBQVUsMkJBQUEsbUJBQVYsQ0FBQTs7QUFBQSxFQUNBLG9CQUFBLEdBQXVCLE9BQUEsQ0FBUSxnQ0FBUixDQUR2QixDQUFBOztBQUFBLEVBRUEsWUFBQSxHQUFlLE9BQUEsQ0FBUSwyQkFBUixDQUZmLENBQUE7O0FBQUEsRUFHQSxVQUFBLEdBQWEsT0FBQSxDQUFRLHlCQUFSLENBSGIsQ0FBQTs7QUFBQSxFQUtBLFdBQUEsR0FBYyxDQUxkLENBQUE7O0FBQUEsRUFhQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osSUFBQSxvQkFBb0IsQ0FBQyxXQUFyQixDQUFpQyxPQUFqQyxDQUFBLENBQUE7O0FBRUE7QUFBQSxnQkFGQTs7QUFRYSxJQUFBLGlCQUFDLE9BQUQsR0FBQTtBQUNYLFVBQUEsSUFBQTs7UUFEWSxVQUFRO09BQ3BCO0FBQUEsTUFBQyxJQUFDLENBQUEscUJBQUEsVUFBRixFQUFjLElBQUMsQ0FBQSxxQkFBQSxVQUFmLEVBQTJCLElBQUMsQ0FBQSxnQkFBQSxLQUE1QixFQUFtQyxJQUFDLENBQUEsaUJBQUEsTUFBcEMsQ0FBQTtBQUVBLE1BQUEsSUFBTyx1QkFBUDtBQUNFLGNBQVUsSUFBQSxLQUFBLENBQU0sMkNBQU4sQ0FBVixDQURGO09BRkE7QUFBQSxNQUtBLElBQUMsQ0FBQSxFQUFELEdBQU0sV0FBQSxFQUxOLENBQUE7QUFBQSxNQU1BLElBQUMsQ0FBQSxPQUFELEdBQVcsR0FBQSxDQUFBLE9BTlgsQ0FBQTtBQUFBLE1BT0EsSUFBQyxDQUFBLGFBQUQs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

//# sourceURL=/home/gsmyrnaios/.atom/packages/minimap/lib/minimap.coffee
