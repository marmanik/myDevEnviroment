(function() {
  var CompositeDisposable, FindAndReplace, MinimapFindAndReplaceBinding;

  CompositeDisposable = require('atom').CompositeDisposable;

  FindAndReplace = null;

  module.exports = MinimapFindAndReplaceBinding = (function() {
    function MinimapFindAndReplaceBinding(minimap, fnrAPI) {
      this.minimap = minimap;
      this.fnrAPI = fnrAPI;
      this.editor = this.minimap.getTextEditor();
      this.subscriptions = new CompositeDisposable;
      this.decorationsByMarkerId = {};
      this.subscriptionsByMarkerId = {};
      this.discoverMarkers();
      if (this.fnrAPI != null) {
        this.layer = this.fnrAPI.resultsMarkerLayerForTextEditor(this.editor);
        this.subscriptions.add(this.layer.onDidCreateMarker((function(_this) {
          return function(marker) {
            return _this.handleCreatedMarker(marker);
          };
        })(this)));
      } else {
        this.subscriptions.add(this.editor.displayBuffer.onDidCreateMarker((function(_this) {
          return function(marker) {
            return _this.handleCreatedMarker(marker);
          };
        })(this)));
      }
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
      var _ref;
      return ((_ref = this.layer) != null ? _ref : this.editor).findMarkers({
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
      var decoration, id;
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
      id = marker.id;
      this.decorationsByMarkerId[id] = decoration;
      return this.subscriptionsByMarkerId[id] = decoration.onDidDestroy((function(_this) {
        return function() {
          _this.subscriptionsByMarkerId[id].dispose();
          delete _this.decorationsByMarkerId[id];
          return delete _this.subscriptionsByMarkerId[id];
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy9taW5pbWFwLWZpbmQtYW5kLXJlcGxhY2UvbGliL21pbmltYXAtZmluZC1hbmQtcmVwbGFjZS1iaW5kaW5nLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxpRUFBQTs7QUFBQSxFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFBRCxDQUFBOztBQUFBLEVBQ0EsY0FBQSxHQUFpQixJQURqQixDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNTLElBQUEsc0NBQUUsT0FBRixFQUFZLE1BQVosR0FBQTtBQUNYLE1BRFksSUFBQyxDQUFBLFVBQUEsT0FDYixDQUFBO0FBQUEsTUFEc0IsSUFBQyxDQUFBLFNBQUEsTUFDdkIsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsT0FBTyxDQUFDLGFBQVQsQ0FBQSxDQUFWLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBQUEsQ0FBQSxtQkFEakIsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLHFCQUFELEdBQXlCLEVBRnpCLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSx1QkFBRCxHQUEyQixFQUgzQixDQUFBO0FBQUEsTUFLQSxJQUFDLENBQUEsZUFBRCxDQUFBLENBTEEsQ0FBQTtBQU9BLE1BQUEsSUFBRyxtQkFBSDtBQUNFLFFBQUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFDLENBQUEsTUFBTSxDQUFDLCtCQUFSLENBQXdDLElBQUMsQ0FBQSxNQUF6QyxDQUFULENBQUE7QUFBQSxRQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsS0FBSyxDQUFDLGlCQUFQLENBQXlCLENBQUEsU0FBQSxLQUFBLEdB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

//# sourceURL=/home/gsmyrnaios/.atom/packages/minimap-find-and-replace/lib/minimap-find-and-replace-binding.coffee
