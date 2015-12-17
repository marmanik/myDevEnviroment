(function() {
  var CompositeDisposable, FindAndReplace, MinimapFindAndReplaceBinding;

  CompositeDisposable = require('atom').CompositeDisposable;

  FindAndReplace = null;

  module.exports = MinimapFindAndReplaceBinding = (function() {
    function MinimapFindAndReplaceBinding(minimap) {
      this.minimap = minimap;
      this.editor = this.minimap.getTextEditor();
      this.subscriptions = new CompositeDisposable;
      this.decorationsByMarkerId = {};
      this.subscriptionsByMarkerId = {};
      this.discoverMarkers();
      this.subscriptions.add(this.editor.displayBuffer.onDidCreateMarker((function(_this) {
        return function(marker) {
          return _this.handleCreatedMarker(marker);
        };
      })(this)));
    }

    MinimapFindAndReplaceBinding.prototype.destroy = function() {
      var decoration, id, sub, _ref, _ref1;
      _ref = this.subscriptionsByMarkerId;
      for (id in _ref) {
        sub = _ref[id];
        sub.dispose();
      }
      _ref1 = this.decorationsByMarkerId;
      for (id in _ref1) {
        decoration = _ref1[id];
        decoration.destroy();
      }
      this.subscriptions.dispose();
      this.minimap = null;
      this.editor = null;
      this.decorationsByMarkerId = {};
      return this.subscriptionsByMarkerId = {};
    };

    MinimapFindAndReplaceBinding.prototype.clear = function() {
      var decoration, id, sub, _ref, _ref1, _results;
      _ref = this.subscriptionsByMarkerId;
      for (id in _ref) {
        sub = _ref[id];
        sub.dispose();
        delete this.subscriptionsByMarkerId[id];
      }
      _ref1 = this.decorationsByMarkerId;
      _results = [];
      for (id in _ref1) {
        decoration = _ref1[id];
        decoration.destroy();
        _results.push(delete this.decorationsByMarkerId[id]);
      }
      return _results;
    };

    MinimapFindAndReplaceBinding.prototype.findAndReplace = function() {
      return FindAndReplace != null ? FindAndReplace : FindAndReplace = atom.packages.getLoadedPackage('find-and-replace').mainModule;
    };

    MinimapFindAndReplaceBinding.prototype.discoverMarkers = function() {
      return this.editor.findMarkers({
        "class": 'find-result'
      }).forEach((function(_this) {
        return function(marker) {
          return _this.createDecoration(marker);
        };
      })(this));
    };

    MinimapFindAndReplaceBinding.prototype.handleCreatedMarker = function(marker) {
      var _ref;
      if (((_ref = marker.getProperties()) != null ? _ref["class"] : void 0) === 'find-result') {
        return this.createDecoration(marker);
      }
    };

    MinimapFindAndReplaceBinding.prototype.createDecoration = function(marker) {
      var decoration;
      if (!this.findViewIsVisible()) {
        return;
      }
      if (this.decorationsByMarkerId[marker.id] != null) {
        return;
      }
      decoration = this.minimap.decorateMarker(marker, {
        type: 'highlight',
        scope: ".minimap .search-result"
      });
      if (decoration == null) {
        return;
      }
      this.decorationsByMarkerId[marker.id] = decoration;
      return this.subscriptionsByMarkerId[marker.id] = decoration.onDidDestroy((function(_this) {
        return function() {
          _this.subscriptionsByMarkerId[marker.id].dispose();
          delete _this.decorationsByMarkerId[marker.id];
          return delete _this.subscriptionsByMarkerId[marker.id];
        };
      })(this));
    };

    MinimapFindAndReplaceBinding.prototype.findViewIsVisible = function() {
      var _ref, _ref1;
      return (_ref = this.findAndReplace()) != null ? (_ref1 = _ref.findView) != null ? _ref1.is(':visible') : void 0 : void 0;
    };

    return MinimapFindAndReplaceBinding;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy9taW5pbWFwLWZpbmQtYW5kLXJlcGxhY2UvbGliL21pbmltYXAtZmluZC1hbmQtcmVwbGFjZS1iaW5kaW5nLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxpRUFBQTs7QUFBQSxFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFBRCxDQUFBOztBQUFBLEVBQ0EsY0FBQSxHQUFpQixJQURqQixDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNTLElBQUEsc0NBQUUsT0FBRixHQUFBO0FBQ1gsTUFEWSxJQUFDLENBQUEsVUFBQSxPQUNiLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQyxDQUFBLE9BQU8sQ0FBQyxhQUFULENBQUEsQ0FBVixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsYUFBRCxHQUFpQixHQUFBLENBQUEsbUJBRGpCLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxxQkFBRCxHQUF5QixFQUZ6QixDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsdUJBQUQsR0FBMkIsRUFIM0IsQ0FBQTtBQUFBLE1BS0EsSUFBQyxDQUFBLGVBQUQsQ0FBQSxDQUxBLENBQUE7QUFBQSxNQU9BLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsTUFBTSxDQUFDLGFBQWEsQ0FBQyxpQkFBdEIsQ0FBd0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsTUFBRCxHQUFBO2lCQUN6RCxLQUFDLENBQUEsbUJBQUQsQ0FBcUIsTUFBckIsRUFEeUQ7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4QyxDQUFuQixDQVBBLENBRFc7SUFBQSxDQUFiOztBQUFBLDJDQVdBLE9B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

//# sourceURL=/home/gsmyrnaios/.atom/packages/minimap-find-and-replace/lib/minimap-find-and-replace-binding.coffee
