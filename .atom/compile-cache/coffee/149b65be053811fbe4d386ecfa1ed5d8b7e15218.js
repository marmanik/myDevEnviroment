(function() {
  var CompositeDisposable, Mixin, PluginManagement,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Mixin = require('mixto');

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = PluginManagement = (function(_super) {
    __extends(PluginManagement, _super);

    function PluginManagement() {
      return PluginManagement.__super__.constructor.apply(this, arguments);
    }


    /* Public */

    PluginManagement.prototype.provideMinimapServiceV1 = function() {
      return this;
    };

    PluginManagement.prototype.plugins = {};

    PluginManagement.prototype.pluginsSubscriptions = {};

    PluginManagement.prototype.registerPlugin = function(name, plugin) {
      var event;
      this.plugins[name] = plugin;
      this.pluginsSubscriptions[name] = new CompositeDisposable;
      event = {
        name: name,
        plugin: plugin
      };
      this.emitter.emit('did-add-plugin', event);
      if (atom.config.get('minimap.displayPluginsControls')) {
        this.registerPluginControls(name, plugin);
      }
      return this.updatesPluginActivationState(name);
    };

    PluginManagement.prototype.unregisterPlugin = function(name) {
      var event, plugin;
      plugin = this.plugins[name];
      if (atom.config.get('minimap.displayPluginsControls')) {
        this.unregisterPluginControls(name);
      }
      delete this.plugins[name];
      event = {
        name: name,
        plugin: plugin
      };
      return this.emitter.emit('did-remove-plugin', event);
    };

    PluginManagement.prototype.togglePluginActivation = function(name, boolean) {
      var settingsKey;
      if (boolean == null) {
        boolean = void 0;
      }
      settingsKey = "minimap.plugins." + name;
      if (boolean != null) {
        atom.config.set(settingsKey, boolean);
      } else {
        atom.config.set(settingsKey, !atom.config.get(settingsKey));
      }
      return this.updatesPluginActivationState(name);
    };

    PluginManagement.prototype.deactivateAllPlugins = function() {
      var name, plugin, _ref, _results;
      _ref = this.plugins;
      _results = [];
      for (name in _ref) {
        plugin = _ref[name];
        _results.push(plugin.deactivatePlugin());
      }
      return _results;
    };

    PluginManagement.prototype.updatesPluginActivationState = function(name) {
      var event, plugin, pluginActive, settingActive;
      plugin = this.plugins[name];
      pluginActive = plugin.isActive();
      settingActive = atom.config.get("minimap.plugins." + name);
      event = {
        name: name,
        plugin: plugin
      };
      if (settingActive && !pluginActive) {
        plugin.activatePlugin();
        return this.emitter.emit('did-activate-plugin', event);
      } else if (pluginActive && !settingActive) {
        plugin.deactivatePlugin();
        return this.emitter.emit('did-deactivate-plugin', event);
      }
    };

    PluginManagement.prototype.registerPluginControls = function(name, plugin) {
      var commands, settingsKey;
      settingsKey = "minimap.plugins." + name;
      this.config.plugins.properties[name] = {
        type: 'boolean',
        "default": true
      };
      if (atom.config.get(settingsKey) == null) {
        atom.config.set(settingsKey, true);
      }
      this.pluginsSubscriptions[name].add(atom.config.observe(settingsKey, (function(_this) {
        return function() {
          return _this.updatesPluginActivationState(name);
        };
      })(this)));
      commands = {};
      commands["minimap:toggle-" + name] = (function(_this) {
        return function() {
          return _this.togglePluginActivation(name);
        };
      })(this);
      return this.pluginsSubscriptions[name].add(atom.commands.add('atom-workspace', commands));
    };

    PluginManagement.prototype.unregisterPluginControls = function(name) {
      this.pluginsSubscriptions[name].dispose();
      delete this.pluginsSubscriptions[name];
      return delete this.config.plugins.properties[name];
    };

    return PluginManagement;

  })(Mixin);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL2xpYi9taXhpbnMvcGx1Z2luLW1hbmFnZW1lbnQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDRDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLE9BQVIsQ0FBUixDQUFBOztBQUFBLEVBQ0Msc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQURELENBQUE7O0FBQUEsRUFjQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBRUosdUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBO0FBQUEsZ0JBQUE7O0FBQUEsK0JBR0EsdUJBQUEsR0FBeUIsU0FBQSxHQUFBO2FBQUcsS0FBSDtJQUFBLENBSHpCLENBQUE7O0FBQUEsK0JBTUEsT0FBQSxHQUFTLEVBTlQsQ0FBQTs7QUFBQSwrQkFTQSxvQkFBQSxHQUFzQixFQVR0QixDQUFBOztBQUFBLCtCQWlCQSxjQUFBLEdBQWdCLFNBQUMsSUFBRCxFQUFPLE1BQVAsR0FBQTtBQUNkLFVBQUEsS0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLE9BQVEsQ0FBQSxJQUFBLENBQVQsR0FBaUIsTUFBakIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLG9CQUFxQixDQUFBLElBQUEsQ0FBdEIsR0FBOEIsR0FBQSxDQUFBLG1CQUQ5QixDQUFBO0FBQUEsTUFHQSxLQUFBLEdBQVE7QUFBQSxRQUFDLE1BQUEsSUFBRDtBQUFBLFFBQU8sUUFBQSxNQUFQO09BSFIsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsZ0JBQWQsRUFBZ0MsS0FBaEMsQ0FKQSxDQUFBO0FBTUEsTUFBQSxJQUF5QyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsZ0NBQWhCLENBQXpD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

//# sourceURL=/home/gsmyrnaios/.atom/packages/minimap/lib/mixins/plugin-management.coffee
