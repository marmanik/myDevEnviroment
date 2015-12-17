(function() {
  var CompositeDisposable, MinimapGitDiffBinding, repositoryForPath,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  CompositeDisposable = require('atom').CompositeDisposable;

  repositoryForPath = require('./helpers').repositoryForPath;

  module.exports = MinimapGitDiffBinding = (function() {
    MinimapGitDiffBinding.prototype.active = false;

    function MinimapGitDiffBinding(minimap) {
      var repository;
      this.minimap = minimap;
      this.destroy = __bind(this.destroy, this);
      this.updateDiffs = __bind(this.updateDiffs, this);
      this.decorations = {};
      this.markers = null;
      this.subscriptions = new CompositeDisposable;
      if (this.minimap == null) {
        return console.warn('minimap-git-diff binding created without a minimap');
      }
      this.editor = this.minimap.getTextEditor();
      this.subscriptions.add(this.editor.getBuffer().onDidStopChanging(this.updateDiffs));
      this.subscriptions.add(this.minimap.onDidDestroy(this.destroy));
      if (repository = this.getRepo()) {
        this.subscriptions.add(repository.onDidChangeStatuses((function(_this) {
          return function() {
            return _this.scheduleUpdate();
          };
        })(this)));
        this.subscriptions.add(repository.onDidChangeStatus((function(_this) {
          return function(changedPath) {
            if (changedPath === _this.editor.getPath()) {
              return _this.scheduleUpdate();
            }
          };
        })(this)));
        this.subscriptions.add(repository.onDidDestroy((function(_this) {
          return function() {
            return _this.destroy();
          };
        })(this)));
      }
      this.scheduleUpdate();
    }

    MinimapGitDiffBinding.prototype.cancelUpdate = function() {
      return clearImmediate(this.immediateId);
    };

    MinimapGitDiffBinding.prototype.scheduleUpdate = function() {
      this.cancelUpdate();
      return this.immediateId = setImmediate(this.updateDiffs);
    };

    MinimapGitDiffBinding.prototype.updateDiffs = function() {
      this.removeDecorations();
      if (this.getPath() && (this.diffs = this.getDiffs())) {
        return this.addDecorations(this.diffs);
      }
    };

    MinimapGitDiffBinding.prototype.addDecorations = function(diffs) {
      var endRow, newLines, newStart, oldLines, oldStart, startRow, _i, _len, _ref, _results;
      _results = [];
      for (_i = 0, _len = diffs.length; _i < _len; _i++) {
        _ref = diffs[_i], oldStart = _ref.oldStart, newStart = _ref.newStart, oldLines = _ref.oldLines, newLines = _ref.newLines;
        startRow = newStart - 1;
        endRow = newStart + newLines - 2;
        if (oldLines === 0 && newLines > 0) {
          _results.push(this.markRange(startRow, endRow, '.minimap .git-line-added'));
        } else if (newLines === 0 && oldLines > 0) {
          _results.push(this.markRange(startRow, startRow, '.minimap .git-line-removed'));
        } else {
          _results.push(this.markRange(startRow, endRow, '.minimap .git-line-modified'));
        }
      }
      return _results;
    };

    MinimapGitDiffBinding.prototype.removeDecorations = function() {
      var marker, _i, _len, _ref;
      if (this.markers == null) {
        return;
      }
      _ref = this.markers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        marker = _ref[_i];
        marker.destroy();
      }
      return this.markers = null;
    };

    MinimapGitDiffBinding.prototype.markRange = function(startRow, endRow, scope) {
      var marker;
      if (this.editor.displayBuffer.isDestroyed()) {
        return;
      }
      marker = this.editor.markBufferRange([[startRow, 0], [endRow, Infinity]], {
        invalidate: 'never'
      });
      this.minimap.decorateMarker(marker, {
        type: 'line',
        scope: scope
      });
      if (this.markers == null) {
        this.markers = [];
      }
      return this.markers.push(marker);
    };

    MinimapGitDiffBinding.prototype.destroy = function() {
      this.removeDecorations();
      this.subscriptions.dispose();
      this.diffs = null;
      return this.minimap = null;
    };

    MinimapGitDiffBinding.prototype.getPath = function() {
      var _ref;
      return (_ref = this.editor.getBuffer()) != null ? _ref.getPath() : void 0;
    };

    MinimapGitDiffBinding.prototype.getRepositories = function() {
      return atom.project.getRepositories().filter(function(repo) {
        return repo != null;
      });
    };

    MinimapGitDiffBinding.prototype.getRepo = function() {
      return this.repository != null ? this.repository : this.repository = repositoryForPath(this.editor.getPath());
    };

    MinimapGitDiffBinding.prototype.getDiffs = function() {
      var e, _ref;
      try {
        return (_ref = this.getRepo()) != null ? _ref.getLineDiffs(this.getPath(), this.editor.getBuffer().getText()) : void 0;
      } catch (_error) {
        e = _error;
        return null;
      }
    };

    return MinimapGitDiffBinding;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy9taW5pbWFwLWdpdC1kaWZmL2xpYi9taW5pbWFwLWdpdC1kaWZmLWJpbmRpbmcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDZEQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUNDLG9CQUFxQixPQUFBLENBQVEsV0FBUixFQUFyQixpQkFERCxDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUVKLG9DQUFBLE1BQUEsR0FBUSxLQUFSLENBQUE7O0FBRWEsSUFBQSwrQkFBRSxPQUFGLEdBQUE7QUFDWCxVQUFBLFVBQUE7QUFBQSxNQURZLElBQUMsQ0FBQSxVQUFBLE9BQ2IsQ0FBQTtBQUFBLCtDQUFBLENBQUE7QUFBQSx1REFBQSxDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsV0FBRCxHQUFlLEVBQWYsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQURYLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBQUEsQ0FBQSxtQkFGakIsQ0FBQTtBQUlBLE1BQUEsSUFBTyxvQkFBUDtBQUNFLGVBQU8sT0FBTyxDQUFDLElBQVIsQ0FBYSxvREFBYixDQUFQLENBREY7T0FKQTtBQUFBLE1BT0EsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsT0FBTyxDQUFDLGFBQVQsQ0FBQSxDQVBWLENBQUE7QUFBQSxNQVNBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsTUFBTSxDQUFDLFNBQVIsQ0FBQSxDQUFtQixDQUFDLGlCQUFwQixDQUFzQyxJQUFDLENBQUEsV0FBdkMsQ0FBbkIsQ0FUQSxDQUFBO0FB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

//# sourceURL=/home/gsmyrnaios/.atom/packages/minimap-git-diff/lib/minimap-git-diff-binding.coffee
