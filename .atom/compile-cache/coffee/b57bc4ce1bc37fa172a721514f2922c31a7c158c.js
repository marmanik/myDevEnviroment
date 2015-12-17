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
      var fnrHasServiceAPI, fnrVersion;
      if (this.active) {
        return;
      }
      this.active = true;
      fnrVersion = atom.packages.getLoadedPackage('find-and-replace').metadata.version;
      fnrHasServiceAPI = parseFloat(fnrVersion) >= 0.194;
      if (fnrHasServiceAPI) {
        this.initializeServiceAPI();
      } else {
        this.initializeLegacyAPI();
      }
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
    initializeServiceAPI: function() {
      return atom.packages.serviceHub.consume('find-and-replace', '0.0.1', (function(_this) {
        return function(fnr) {
          return _this.subscriptions.add(_this.minimap.observeMinimaps(function(minimap) {
            var binding, id;
            if (MinimapFindAndReplaceBinding == null) {
              MinimapFindAndReplaceBinding = require('./minimap-find-and-replace-binding');
            }
            id = minimap.id;
            binding = new MinimapFindAndReplaceBinding(minimap, fnr);
            _this.bindingsById[id] = binding;
            return _this.subscriptionsById[id] = minimap.onDidDestroy(function() {
              var _ref, _ref1;
              if ((_ref = _this.subscriptionsById[id]) != null) {
                _ref.dispose();
              }
              if ((_ref1 = _this.bindingsById[id]) != null) {
                _ref1.destroy();
              }
              delete _this.bindingsById[id];
              return delete _this.subscriptionsById[id];
            });
          }));
        };
      })(this));
    },
    initializeLegacyAPI: function() {
      return this.subscriptions.add(this.minimap.observeMinimaps((function(_this) {
        return function(minimap) {
          var binding, id;
          if (MinimapFindAndReplaceBinding == null) {
            MinimapFindAndReplaceBinding = require('./minimap-find-and-replace-binding');
          }
          id = minimap.id;
          binding = new MinimapFindAndReplaceBinding(minimap);
          _this.bindingsById[id] = binding;
          return _this.subscriptionsById[id] = minimap.onDidDestroy(function() {
            var _ref, _ref1;
            if ((_ref = _this.subscriptionsById[id]) != null) {
              _ref.dispose();
            }
            if ((_ref1 = _this.bindingsById[id]) != null) {
              _ref1.destroy();
            }
            delete _this.bindingsById[id];
            return delete _this.subscriptionsById[id];
          });
        };
      })(this)));
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy9taW5pbWFwLWZpbmQtYW5kLXJlcGxhY2UvbGliL21pbmltYXAtZmluZC1hbmQtcmVwbGFjZS5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsaURBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUNBLDRCQUFBLEdBQStCLElBRC9CLENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxNQUFBLEVBQVEsS0FBUjtBQUFBLElBQ0EsWUFBQSxFQUFjLEVBRGQ7QUFBQSxJQUVBLGlCQUFBLEVBQW1CLEVBRm5CO0FBQUEsSUFJQSxRQUFBLEVBQVUsU0FBQSxHQUFBO2FBQUcsSUFBQyxDQUFBLE9BQUo7SUFBQSxDQUpWO0FBQUEsSUFNQSxRQUFBLEVBQVUsU0FBQyxLQUFELEdBQUE7YUFDUixJQUFDLENBQUEsYUFBRCxHQUFpQixHQUFBLENBQUEsb0JBRFQ7SUFBQSxDQU5WO0FBQUEsSUFTQSx1QkFBQSxFQUF5QixTQUFFLE9BQUYsR0FBQTtBQUN2QixNQUR3QixJQUFDLENBQUEsVUFBQSxPQUN6QixDQUFBO2FBQUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxjQUFULENBQXdCLGtCQUF4QixFQUE0QyxJQUE1QyxFQUR1QjtJQUFBLENBVHpCO0FBQUEsSUFZQSxVQUFBLEVBQVksU0FBQSxHQUFBO0FBQ1YsTUFBQSxJQUFDLENBQUEsT0FBTyxDQUFDLGdCQUFULENBQTBCLGtCQUExQixDQUFBLENBQUE7YUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXLEtBRkQ7SUFBQSxDQVpaO0FBQUEsSUFnQkEsY0FBQSxFQUFnQixTQUFBLEdBQUE7QUFDZCxVQUFBLDRCQUFBO0FBQUEsTUFBQSxJQUFVLElBQUMsQ0FBQSxNQUFYO0FBQUEsY0FBQSxDQUFBO09BQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFGVixDQUFBO0FBQUEsTUFJQSxVQUFBLEdBQWEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUErQixrQkFBL0IsQ0FBa0QsQ0FBQyxRQUFRLENBQUMsT0FKekUsQ0FBQTtBQUFBLE1BS0EsZ0JBQUEsR0FBbUIsVUFBQSxDQUFXLFVBQVgsQ0FBQSxJQUEwQixLQUw3QyxDQUFBO0FBT0EsTUFBQSxJQUFHLGdCQUFIO0FBQ0UsUUFBQSxJQUFDLENBQUEsb0JBQUQsQ0FBQSxDQUFBLENBREY7T0FBQSxNQUFBO0FBR0UsUUFBQSxJQUFDLENBQUEsbUJBQUQsQ0FBQSxDQUFBLENBSEY7T0FQQTthQVlBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQ2pCO0FBQUEsUUFBQSx1QkFBQSxFQUF5QixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsZUFBRCxDQUFBLEVBQUg7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF6QjtBQUFBLFFBQ0EseUJBQUEsRUFBMkIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7bUJBQUcsS0FBQyxDQUFBLGVBQUQsQ0FBQSxFQUFIO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FEM0I7QUFBQSxRQUVBLCtCQUFBLEVBQWlDLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO21CQUFHLEtBQUMsQ0FBQSxlQUFELENBQUEsRUFBSDtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRmpDO0FBQUEsUUFHQSxhQUFBLEVBQWUsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7bUJBQUcsS0FBQyxDQUFBLGFBQUQsQ0FBQSxFQUFIO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FIZjtBQUFBLFFBSUEsWUFBQSxFQUFjLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO21CQUFHLEtBQUMsQ0FBQSxhQUFELENBQUEsRUFBSDtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBSmQ7T0FEaUIsQ0FBbkIsRUFiYztJQUFBLENBaEJoQjtBQUFBLElBb0NBLG9CQUFBLEVBQXNCLFNBQUEsR0FBQTthQUNwQixJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxPQUF6QixDQUFpQyxrQkFBakMsRUFBcUQsT0FBckQsRUFBOEQsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsR0FBRCxHQUFBO2lCQUM1RCxLQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsS0FBQyxDQUFBLE9BQU8sQ0FBQyxlQUFULENBQXlCLFNBQUMsT0FBRCxHQUFBO0FBQzFDLGdCQUFBLFdBQUE7O2NBQUEsK0JBQWdDLE9BQUEsQ0FBUSxvQ0FBUjthQUFoQztBQUFBLFlBRUEsRUFBQSxHQUFLLE9BQU8sQ0FBQyxFQUZiLENBQUE7QUFBQSxZQUdBLE9BQUEsR0FBYyxJQUFBLDRCQUFBLENBQTZCLE9BQTdCLEVBQXNDLEdBQXRDLENBSGQsQ0FBQTtBQUFBLFlBSUEsS0FBQyxDQUFBLFlBQWEsQ0FBQSxFQUFBLENBQWQsR0FBb0IsT0FKcEIsQ0FBQTttQkFNQSxLQUFDLENBQUEsaUJBQWtCLENBQUEsRUFBQSxDQUFuQixHQUF5QixPQUFPLENBQUMsWUFBUixDQUFxQixTQUFBLEdBQUE7QUFDNUMsa0JBQUEsV0FBQTs7b0JBQXNCLENBQUUsT0FBeEIsQ0FBQTtlQUFBOztxQkFDaUIsQ0FBRSxPQUFuQixDQUFBO2VBREE7QUFBQSxjQUdBLE1BQUEsQ0FBQSxLQUFRLENBQUEsWUFBYSxDQUFBLEVBQUEsQ0FIckIsQ0FBQTtxQkFJQSxNQUFBLENBQUEsS0FBUSxDQUFBLGlCQUFrQixDQUFBLEVBQUEsRUFMa0I7WUFBQSxDQUFyQixFQVBpQjtVQUFBLENBQXpCLENBQW5CLEVBRDREO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBOUQsRUFEb0I7SUFBQSxDQXBDdEI7QUFBQSxJQW9EQSxtQkFBQSxFQUFxQixTQUFBLEdBQUE7YUFDbkIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxPQUFPLENBQUMsZUFBVCxDQUF5QixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxPQUFELEdBQUE7QUFDMUMsY0FBQSxXQUFBOztZQUFBLCtCQUFnQyxPQUFBLENBQVEsb0NBQVI7V0FBaEM7QUFBQSxVQUVBLEVBQUEsR0FBSyxPQUFPLENBQUMsRUFGYixDQUFBO0FBQUEsVUFHQSxPQUFBLEdBQWMsSUFBQSw0QkFBQSxDQUE2QixPQUE3QixDQUhkLENBQUE7QUFBQSxVQUlBLEtBQUMsQ0FBQSxZQUFhLENBQUEsRUFBQSxDQUFkLEdBQW9CLE9BSnBCLENBQUE7aUJBTUEsS0FBQyxDQUFBLGlCQUFrQixDQUFBLEVBQUEsQ0FBbkIsR0FBeUIsT0FBTyxDQUFDLFlBQVIsQ0FBcUIsU0FBQSxHQUFBO0FBQzVDLGdCQUFBLFdBQUE7O2tCQUFzQixDQUFFLE9BQXhCLENBQUE7YUFBQTs7bUJBQ2lCLENBQUUsT0FBbkIsQ0FBQTthQURBO0FBQUEsWUFHQSxNQUFBLENBQUEsS0FBUSxDQUFBLFlBQWEsQ0FBQSxFQUFBLENBSHJCLENBQUE7bUJBSUEsTUFBQSxDQUFBLEtBQVEsQ0FBQSxpQkFBa0IsQ0FBQSxFQUFBLEVBTGtCO1VBQUEsQ0FBckIsRUFQaUI7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF6QixDQUFuQixFQURtQjtJQUFBLENBcERyQjtBQUFBLElBbUVBLGdCQUFBLEVBQWtCLFNBQUEsR0FBQTtBQUNoQixVQUFBLDZCQUFBO0FBQUEsTUFBQSxJQUFBLENBQUEsSUFBZSxDQUFBLE1BQWY7QUFBQSxjQUFBLENBQUE7T0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxLQUZWLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBLENBSEEsQ0FBQTtBQUtBO0FBQUEsV0FBQSxVQUFBO3VCQUFBO0FBQUEsUUFBQSxHQUFHLENBQUMsT0FBSixDQUFBLENBQUEsQ0FBQTtBQUFBLE9BTEE7QUFNQTtBQUFBLFdBQUEsV0FBQTs0QkFBQTtBQUFBLFFBQUEsT0FBTyxDQUFDLE9BQVIsQ0FBQSxDQUFBLENBQUE7QUFBQSxPQU5BO0FBQUEsTUFRQSxJQUFDLENBQUEsWUFBRCxHQUFnQixFQVJoQixDQUFBO2FBU0EsSUFBQyxDQUFBLGlCQUFELEdBQXFCLEdBVkw7SUFBQSxDQW5FbEI7QUFBQSxJQStFQSxlQUFBLEVBQWlCLFNBQUEsR0FBQTtBQUNmLFVBQUEsMkJBQUE7QUFBQTtBQUFBO1dBQUEsVUFBQTsyQkFBQTtBQUFBLHNCQUFBLE9BQU8sQ0FBQyxlQUFSLENBQUEsRUFBQSxDQUFBO0FBQUE7c0JBRGU7SUFBQSxDQS9FakI7QUFBQSxJQWtGQSxhQUFBLEVBQWUsU0FBQSxHQUFBO0FBQ2IsVUFBQSwyQkFBQTtBQUFBO0FBQUE7V0FBQSxVQUFBOzJCQUFBO0FBQUEsc0JBQUEsT0FBTyxDQUFDLEtBQVIsQ0FBQSxFQUFBLENBQUE7QUFBQTtzQkFEYTtJQUFBLENBbEZmO0dBSkYsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/gsmyrnaios/.atom/packages/minimap-find-and-replace/lib/minimap-find-and-replace.coffee
