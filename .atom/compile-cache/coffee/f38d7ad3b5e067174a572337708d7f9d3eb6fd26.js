(function() {
  var CompositeDisposable, MinimapFindAndReplaceBinding;

  CompositeDisposable = require('atom').CompositeDisposable;

  MinimapFindAndReplaceBinding = null;

  module.exports = {
    active: false,
    bindingsById: {},
    subscriptionsById: {},
    isActive: function() {
      return this.active;
    },
    activate: function(state) {
      return this.subscriptions = new CompositeDisposable;
    },
    consumeMinimapServiceV1: function(minimap) {
      this.minimap = minimap;
      return this.minimap.registerPlugin('find-and-replace', this);
    },
    deactivate: function() {
      this.minimap.unregisterPlugin('find-and-replace');
      return this.minimap = null;
    },
    activatePlugin: function() {
      if (this.active) {
        return;
      }
      this.active = true;
      this.subscriptions.add(this.minimap.observeMinimaps((function(_this) {
        return function(minimap) {
          var binding;
          if (MinimapFindAndReplaceBinding == null) {
            MinimapFindAndReplaceBinding = require('./minimap-find-and-replace-binding');
          }
          binding = new MinimapFindAndReplaceBinding(minimap);
          _this.bindingsById[minimap.id] = binding;
          return _this.subscriptionsById[minimap.id] = minimap.onDidDestroy(function() {
            var _ref, _ref1;
            if ((_ref = _this.subscriptionsById[minimap.id]) != null) {
              _ref.dispose();
            }
            if ((_ref1 = _this.bindingsById[minimap.id]) != null) {
              _ref1.destroy();
            }
            delete _this.bindingsById[minimap.id];
            return delete _this.subscriptionsById[minimap.id];
          });
        };
      })(this)));
      return this.subscriptions.add(atom.commands.add('atom-workspace', {
        'find-and-replace:show': (function(_this) {
          return function() {
            return _this.discoverMarkers();
          };
        })(this),
        'find-and-replace:toggle': (function(_this) {
          return function() {
            return _this.discoverMarkers();
          };
        })(this),
        'find-and-replace:show-replace': (function(_this) {
          return function() {
            return _this.discoverMarkers();
          };
        })(this),
        'core:cancel': (function(_this) {
          return function() {
            return _this.clearBindings();
          };
        })(this),
        'core:close': (function(_this) {
          return function() {
            return _this.clearBindings();
          };
        })(this)
      }));
    },
    deactivatePlugin: function() {
      var binding, id, sub, _ref, _ref1;
      if (!this.active) {
        return;
      }
      this.active = false;
      this.subscriptions.dispose();
      _ref = this.subscriptionsById;
      for (id in _ref) {
        sub = _ref[id];
        sub.dispose();
      }
      _ref1 = this.bindingsById;
      for (id in _ref1) {
        binding = _ref1[id];
        binding.destroy();
      }
      this.bindingsById = {};
      return this.subscriptionsById = {};
    },
    discoverMarkers: function() {
      var binding, id, _ref, _results;
      _ref = this.bindingsById;
      _results = [];
      for (id in _ref) {
        binding = _ref[id];
        _results.push(binding.discoverMarkers());
      }
      return _results;
    },
    clearBindings: function() {
      var binding, id, _ref, _results;
      _ref = this.bindingsById;
      _results = [];
      for (id in _ref) {
        binding = _ref[id];
        _results.push(binding.clear());
      }
      return _results;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy9taW5pbWFwLWZpbmQtYW5kLXJlcGxhY2UvbGliL21pbmltYXAtZmluZC1hbmQtcmVwbGFjZS5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsaURBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUNBLDRCQUFBLEdBQStCLElBRC9CLENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxNQUFBLEVBQVEsS0FBUjtBQUFBLElBQ0EsWUFBQSxFQUFjLEVBRGQ7QUFBQSxJQUVBLGlCQUFBLEVBQW1CLEVBRm5CO0FBQUEsSUFJQSxRQUFBLEVBQVUsU0FBQSxHQUFBO2FBQUcsSUFBQyxDQUFBLE9BQUo7SUFBQSxDQUpWO0FBQUEsSUFNQSxRQUFBLEVBQVUsU0FBQyxLQUFELEdBQUE7YUFDUixJQUFDLENBQUEsYUFBRCxHQUFpQixHQUFBLENBQUEsb0JBRFQ7SUFBQSxDQU5WO0FBQUEsSUFTQSx1QkFBQSxFQUF5QixTQUFFLE9BQUYsR0FBQTtBQUN2QixNQUR3QixJQUFDLENBQUEsVUFBQSxPQUN6QixDQUFBO2FBQUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxjQUFULENBQXdCLGtCQUF4QixFQUE0QyxJQUE1QyxFQUR1QjtJQUFBLENBVHpCO0FBQUEsSUFZQSxVQUFBLEVBQVksU0FBQSxHQUFBO0FBQ1YsTUFBQSxJQUFDLENBQUEsT0FBTyxDQUFDLGdCQUFULENBQTBCLGtCQUExQixDQUFBLENBQUE7YUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXLEtBRkQ7SUFBQSxDQVpaO0FBQUEsSUFnQkEsY0FBQSxFQUFnQixTQUFBLEdBQUE7QUFDZCxNQUFBLElBQVUsSUFBQyxDQUFBLE1BQVg7QUFBQSxjQUFBLENBQUE7T0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUZWLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsT0FBTyxDQUFDLGVBQVQsQ0FBeUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsT0FBRCxHQUFBO0FBQzFDLGNBQUEsT0FBQTs7WUFBQSwrQkFBZ0MsT0FBQSxDQUFRLG9DQUFSO1dBQWhDO0FBQUEsVUFFQSxPQUFBLEdBQWMsSUFBQSw0QkFBQSxDQUE2QixPQUE3QixDQUZkLENBQUE7QUFBQSxVQUdBLEtBQUMsQ0FBQSxZQUFhLENBQUEsT0FBTyxDQUFDLEVBQVIsQ0FBZCxHQUE0QixPQUg1QixDQUFBO2lCQUtBLEtBQUMsQ0FBQSxpQkFBa0IsQ0FBQSxPQUFPLENBQUMsRUFBUixDQUFuQixHQUFpQyxPQUFPLENBQUMsWUFBUixDQUFxQixTQUFBLEdBQUE7QUFDcEQsZ0JBQUEsV0FBQTs7a0JBQThCLENBQUUsT0FBaEMsQ0FBQTthQUFBOzttQkFDeUIsQ0FBRSxPQUEzQixDQUFBO2FBREE7QUFBQSxZQUdBLE1BQUEsQ0FBQSxLQUFRLENBQUEsWUFBYSxDQUFBLE9BQU8sQ0FBQyxFQUFSLENBSHJCLENBQUE7bUJBSUEsTUFBQSxDQUFBLEtBQVEsQ0FBQSxpQkFBa0IsQ0FBQSxPQUFPLENBQUMsRUFBUixFQUwwQjtVQUFBLENBQXJCLEVBTlM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF6QixDQUFuQixDQUpBLENBQUE7YUFpQkEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFDakI7QUFBQSxRQUFBLHVCQUFBLEVBQXlCLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO21CQUFHLEtBQUMsQ0FBQSxlQUFELENBQUEsRUFBSDtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXpCO0FBQUEsUUFDQSx5QkFBQSxFQUEyQixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsZUFBRCxDQUFBLEVBQUg7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUQzQjtBQUFBLFFBRUEsK0JBQUEsRUFBaUMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7bUJBQUcsS0FBQyxDQUFBLGVBQUQsQ0FBQSxFQUFIO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FGakM7QUFBQSxRQUdBLGFBQUEsRUFBZSxDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsYUFBRCxDQUFBLEVBQUg7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUhmO0FBQUEsUUFJQSxZQUFBLEVBQWMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7bUJBQUcsS0FBQyxDQUFBLGFBQUQsQ0FBQSxFQUFIO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FKZDtPQURpQixDQUFuQixFQWxCYztJQUFBLENBaEJoQjtBQUFBLElBeUNBLGdCQUFBLEVBQWtCLFNBQUEsR0FBQTtBQUNoQixVQUFBLDZCQUFBO0FBQUEsTUFBQSxJQUFBLENBQUEsSUFBZSxDQUFBLE1BQWY7QUFBQSxjQUFBLENBQUE7T0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxLQUZWLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBLENBSEEsQ0FBQTtBQUtBO0FBQUEsV0FBQSxVQUFBO3VCQUFBO0FBQUEsUUFBQSxHQUFHLENBQUMsT0FBSixDQUFBLENBQUEsQ0FBQTtBQUFBLE9BTEE7QUFNQTtBQUFBLFdBQUEsV0FBQTs0QkFBQTtBQUFBLFFBQUEsT0FBTyxDQUFDLE9BQVIsQ0FBQSxDQUFBLENBQUE7QUFBQSxPQU5BO0FBQUEsTUFRQSxJQUFDLENBQUEsWUFBRCxHQUFnQixFQVJoQixDQUFBO2FBU0EsSUFBQyxDQUFBLGlCQUFELEdBQXFCLEdBVkw7SUFBQSxDQXpDbEI7QUFBQSxJQXFEQSxlQUFBLEVBQWlCLFNBQUEsR0FBQTtBQUNmLFVBQUEsMkJBQUE7QUFBQTtBQUFBO1dBQUEsVUFBQTsyQkFBQTtBQUFBLHNCQUFBLE9BQU8sQ0FBQyxlQUFSLENBQUEsRUFBQSxDQUFBO0FBQUE7c0JBRGU7SUFBQSxDQXJEakI7QUFBQSxJQXdEQSxhQUFBLEVBQWUsU0FBQSxHQUFBO0FBQ2IsVUFBQSwyQkFBQTtBQUFBO0FBQUE7V0FBQSxVQUFBOzJCQUFBO0FBQUEsc0JBQUEsT0FBTyxDQUFDLEtBQVIsQ0FBQSxFQUFBLENBQUE7QUFBQTtzQkFEYTtJQUFBLENBeERmO0dBSkYsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/gsmyrnaios/.atom/packages/minimap-find-and-replace/lib/minimap-find-and-replace.coffee
