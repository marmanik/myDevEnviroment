(function() {
  var CompositeDisposable, Disposable, MinimapGitDiff, MinimapGitDiffBinding, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ref = require('atom'), CompositeDisposable = _ref.CompositeDisposable, Disposable = _ref.Disposable;

  MinimapGitDiffBinding = null;

  MinimapGitDiff = (function() {
    MinimapGitDiff.prototype.pluginActive = false;

    function MinimapGitDiff() {
      this.destroyBindings = __bind(this.destroyBindings, this);
      this.createBindings = __bind(this.createBindings, this);
      this.activateBinding = __bind(this.activateBinding, this);
      this.subscriptions = new CompositeDisposable;
    }

    MinimapGitDiff.prototype.isActive = function() {
      return this.pluginActive;
    };

    MinimapGitDiff.prototype.activate = function() {
      return this.bindings = new WeakMap;
    };

    MinimapGitDiff.prototype.consumeMinimapServiceV1 = function(minimap) {
      this.minimap = minimap;
      return this.minimap.registerPlugin('git-diff', this);
    };

    MinimapGitDiff.prototype.deactivate = function() {
      this.destroyBindings();
      return this.minimap = null;
    };

    MinimapGitDiff.prototype.activatePlugin = function() {
      var e;
      if (this.pluginActive) {
        return;
      }
      try {
        this.activateBinding();
        this.pluginActive = true;
        this.subscriptions.add(this.minimap.onDidActivate(this.activateBinding));
        return this.subscriptions.add(this.minimap.onDidDeactivate(this.destroyBindings));
      } catch (_error) {
        e = _error;
        return console.log(e);
      }
    };

    MinimapGitDiff.prototype.deactivatePlugin = function() {
      if (!this.pluginActive) {
        return;
      }
      this.pluginActive = false;
      this.subscriptions.dispose();
      return this.destroyBindings();
    };

    MinimapGitDiff.prototype.activateBinding = function() {
      if (this.getRepositories().length > 0) {
        this.createBindings();
      }
      return this.subscriptions.add(atom.project.onDidChangePaths((function(_this) {
        return function() {
          if (_this.getRepositories().length > 0) {
            return _this.createBindings();
          } else {
            return _this.destroyBindings();
          }
        };
      })(this)));
    };

    MinimapGitDiff.prototype.createBindings = function() {
      MinimapGitDiffBinding || (MinimapGitDiffBinding = require('./minimap-git-diff-binding'));
      return this.subscriptions.add(this.minimap.observeMinimaps((function(_this) {
        return function(o) {
          var binding, editor, minimap, _ref1;
          minimap = (_ref1 = o.view) != null ? _ref1 : o;
          editor = minimap.getTextEditor();
          if (editor == null) {
            return;
          }
          binding = new MinimapGitDiffBinding(minimap);
          return _this.bindings.set(minimap, binding);
        };
      })(this)));
    };

    MinimapGitDiff.prototype.getRepositories = function() {
      return atom.project.getRepositories().filter(function(repo) {
        return repo != null;
      });
    };

    MinimapGitDiff.prototype.destroyBindings = function() {
      if (!((this.minimap != null) && (this.minimap.editorsMinimaps != null))) {
        return;
      }
      return this.minimap.editorsMinimaps.forEach((function(_this) {
        return function(minimap) {
          var _ref1;
          if ((_ref1 = _this.bindings.get(minimap)) != null) {
            _ref1.destroy();
          }
          return _this.bindings["delete"](minimap);
        };
      })(this));
    };

    return MinimapGitDiff;

  })();

  module.exports = new MinimapGitDiff;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy9taW5pbWFwLWdpdC1kaWZmL2xpYi9taW5pbWFwLWdpdC1kaWZmLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw0RUFBQTtJQUFBLGtGQUFBOztBQUFBLEVBQUEsT0FBb0MsT0FBQSxDQUFRLE1BQVIsQ0FBcEMsRUFBQywyQkFBQSxtQkFBRCxFQUFzQixrQkFBQSxVQUF0QixDQUFBOztBQUFBLEVBRUEscUJBQUEsR0FBd0IsSUFGeEIsQ0FBQTs7QUFBQSxFQUlNO0FBRUosNkJBQUEsWUFBQSxHQUFjLEtBQWQsQ0FBQTs7QUFDYSxJQUFBLHdCQUFBLEdBQUE7QUFDWCwrREFBQSxDQUFBO0FBQUEsNkRBQUEsQ0FBQTtBQUFBLCtEQUFBLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBQUEsQ0FBQSxtQkFBakIsQ0FEVztJQUFBLENBRGI7O0FBQUEsNkJBSUEsUUFBQSxHQUFVLFNBQUEsR0FBQTthQUFHLElBQUMsQ0FBQSxhQUFKO0lBQUEsQ0FKVixDQUFBOztBQUFBLDZCQU1BLFFBQUEsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsUUFBRCxHQUFZLEdBQUEsQ0FBQSxRQURKO0lBQUEsQ0FOVixDQUFBOztBQUFBLDZCQVNBLHVCQUFBLEdBQXlCLFNBQUUsT0FBRixHQUFBO0FBQ3ZCLE1BRHdCLElBQUMsQ0FBQSxVQUFBLE9BQ3pCLENBQUE7YUFBQSxJQUFDLENBQUEsT0FBTyxDQUFDLGNBQVQsQ0FBd0IsVUFBeEIsRUFBb0MsSUFBcEMsRUFEdUI7SUFBQSxDQVR6QixDQUFBOztBQUFBLDZCQVlBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDVixNQUFBLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FBQSxDQUFBO2FBQ0EsSUFBQyxDQUFBLE9B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

//# sourceURL=/home/gsmyrnaios/.atom/packages/minimap-git-diff/lib/minimap-git-diff.coffee
