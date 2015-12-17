(function() {
  var CompositeDisposable, Emitter, Main, Minimap, MinimapElement, MinimapPluginGeneratorElement, PluginManagement, deprecate, semver, _ref, _ref1;

  _ref = require('event-kit'), Emitter = _ref.Emitter, CompositeDisposable = _ref.CompositeDisposable;

  PluginManagement = require('./mixins/plugin-management');

  _ref1 = [], Minimap = _ref1[0], MinimapElement = _ref1[1], MinimapPluginGeneratorElement = _ref1[2], deprecate = _ref1[3], semver = _ref1[4];

  Main = (function() {
    PluginManagement.includeInto(Main);


    /* Public */

    Main.prototype.config = {
      plugins: {
        type: 'object',
        properties: {}
      },
      autoToggle: {
        type: 'boolean',
        "default": true
      },
      displayMinimapOnLeft: {
        type: 'boolean',
        "default": false
      },
      displayCodeHighlights: {
        type: 'boolean',
        "default": true,
        description: 'Toggles the render of the buffer tokens in the minimap.'
      },
      displayPluginsControls: {
        type: 'boolean',
        "default": true,
        description: 'You need to restart Atom for this setting to be effective.'
      },
      minimapScrollIndicator: {
        type: 'boolean',
        "default": true,
        description: 'Toggles the display of a side line showing which part of the buffer is currently displayed by the minimap. This side line will only appear if the minimap is taller than the editor view height.'
      },
      useHardwareAcceleration: {
        type: 'boolean',
        "default": true
      },
      adjustMinimapWidthToSoftWrap: {
        type: 'boolean',
        "default": true,
        description: 'If this option is enabled and Soft Wrap is checked then the Minimap max width is set to the Preferred Line Length value.'
      },
      charWidth: {
        type: 'number',
        "default": 1,
        minimum: .5
      },
      charHeight: {
        type: 'number',
        "default": 2,
        minimum: .5
      },
      interline: {
        type: 'number',
        "default": 1,
        minimum: 0,
        description: 'The space between lines in the minimap in pixels.'
      },
      textOpacity: {
        type: 'number',
        "default": 0.6,
        minimum: 0,
        maximum: 1,
        description: "The opacity used to render the line's text in the minimap."
      },
      scrollAnimation: {
        type: 'boolean',
        "default": false,
        description: 'Enables animations when scrolling by clicking on the minimap.'
      },
      scrollAnimationDuration: {
        type: 'integer',
        "default": 300,
        description: 'The duration of scrolling animations when clicking on the minimap.'
      },
      createPluginInDevMode: {
        type: 'boolean',
        "default": false
      },
      absoluteMode: {
        type: 'boolean',
        "default": false,
        description: 'When enabled the text editor content will be able to flow below the minimap.'
      }
    };

    Main.prototype.active = false;

    function Main() {
      this.emitter = new Emitter;
    }

    Main.prototype.activate = function() {
      if (this.active) {
        return;
      }
      if (MinimapElement == null) {
        MinimapElement = require('./minimap-element');
      }
      MinimapElement.registerViewProvider();
      this.subscriptionsOfCommands = atom.commands.add('atom-workspace', {
        'minimap:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this),
        'minimap:generate-coffee-plugin': (function(_this) {
          return function() {
            return _this.generatePlugin('coffee');
          };
        })(this),
        'minimap:generate-javascript-plugin': (function(_this) {
          return function() {
            return _this.generatePlugin('javascript');
          };
        })(this),
        'minimap:generate-babel-plugin': (function(_this) {
          return function() {
            return _this.generatePlugin('babel');
          };
        })(this)
      });
      this.subscriptions = new CompositeDisposable;
      this.active = true;
      if (atom.config.get('minimap.autoToggle')) {
        return this.toggle();
      }
    };

    Main.prototype.deactivate = function() {
      var _ref2;
      if (!this.active) {
        return;
      }
      this.deactivateAllPlugins();
      if ((_ref2 = this.editorsMinimaps) != null) {
        _ref2.forEach((function(_this) {
          return function(value, key) {
            value.destroy();
            return _this.editorsMinimaps["delete"](key);
          };
        })(this));
      }
      this.subscriptions.dispose();
      this.subscriptions = null;
      this.subscriptionsOfCommands.dispose();
      this.subscriptionsOfCommands = null;
      this.editorsMinimaps = void 0;
      this.toggled = false;
      return this.active = false;
    };

    Main.prototype.toggle = function() {
      var _ref2;
      if (!this.active) {
        return;
      }
      if (this.toggled) {
        this.toggled = false;
        if ((_ref2 = this.editorsMinimaps) != null) {
          _ref2.forEach((function(_this) {
            return function(value, key) {
              value.destroy();
              return _this.editorsMinimaps["delete"](key);
            };
          })(this));
        }
        return this.subscriptions.dispose();
      } else {
        this.toggled = true;
        return this.initSubscriptions();
      }
    };

    Main.prototype.generatePlugin = function(template) {
      var view;
      if (MinimapPluginGeneratorElement == null) {
        MinimapPluginGeneratorElement = require('./minimap-plugin-generator-element');
      }
      view = new MinimapPluginGeneratorElement();
      view.template = template;
      return view.attach();
    };

    Main.prototype.onDidActivate = function(callback) {
      return this.emitter.on('did-activate', callback);
    };

    Main.prototype.onDidDeactivate = function(callback) {
      return this.emitter.on('did-deactivate', callback);
    };

    Main.prototype.onDidCreateMinimap = function(callback) {
      return this.emitter.on('did-create-minimap', callback);
    };

    Main.prototype.onDidAddPlugin = function(callback) {
      return this.emitter.on('did-add-plugin', callback);
    };

    Main.prototype.onDidRemovePlugin = function(callback) {
      return this.emitter.on('did-remove-plugin', callback);
    };

    Main.prototype.onDidActivatePlugin = function(callback) {
      return this.emitter.on('did-activate-plugin', callback);
    };

    Main.prototype.onDidDeactivatePlugin = function(callback) {
      return this.emitter.on('did-deactivate-plugin', callback);
    };

    Main.prototype.minimapClass = function() {
      return Minimap != null ? Minimap : Minimap = require('./minimap');
    };

    Main.prototype.minimapForEditorElement = function(editorElement) {
      if (editorElement == null) {
        return;
      }
      return this.minimapForEditor(editorElement.getModel());
    };

    Main.prototype.minimapForEditor = function(textEditor) {
      var editorSubscription, minimap;
      if (textEditor == null) {
        return;
      }
      if (Minimap == null) {
        Minimap = require('./minimap');
      }
      if (this.editorsMinimaps == null) {
        this.editorsMinimaps = new Map;
      }
      minimap = this.editorsMinimaps.get(textEditor);
      if (minimap == null) {
        minimap = new Minimap({
          textEditor: textEditor
        });
        this.editorsMinimaps.set(textEditor, minimap);
        editorSubscription = textEditor.onDidDestroy((function(_this) {
          return function() {
            var _ref2;
            if ((_ref2 = _this.editorsMinimaps) != null) {
              _ref2["delete"](textEditor);
            }
            return editorSubscription.dispose();
          };
        })(this));
      }
      return minimap;
    };

    Main.prototype.standAloneMinimapForEditor = function(textEditor) {
      if (textEditor == null) {
        return;
      }
      if (Minimap == null) {
        Minimap = require('./minimap');
      }
      return new Minimap({
        textEditor: textEditor,
        standAlone: true
      });
    };

    Main.prototype.getActiveMinimap = function() {
      return this.minimapForEditor(atom.workspace.getActiveTextEditor());
    };

    Main.prototype.observeMinimaps = function(iterator) {
      var createdCallback, _ref2;
      if (iterator == null) {
        return;
      }
      if ((_ref2 = this.editorsMinimaps) != null) {
        _ref2.forEach(function(minimap) {
          return iterator(minimap);
        });
      }
      createdCallback = function(minimap) {
        return iterator(minimap);
      };
      return this.onDidCreateMinimap(createdCallback);
    };

    Main.prototype.initSubscriptions = function() {
      return this.subscriptions.add(atom.workspace.observeTextEditors((function(_this) {
        return function(textEditor) {
          var editorElement, minimap, minimapElement;
          minimap = _this.minimapForEditor(textEditor);
          editorElement = atom.views.getView(textEditor);
          minimapElement = atom.views.getView(minimap);
          _this.emitter.emit('did-create-minimap', minimap);
          return minimapElement.attach();
        };
      })(this)));
    };

    return Main;

  })();

  module.exports = new Main();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL2xpYi9tYWluLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw0SUFBQTs7QUFBQSxFQUFBLE9BQWlDLE9BQUEsQ0FBUSxXQUFSLENBQWpDLEVBQUMsZUFBQSxPQUFELEVBQVUsMkJBQUEsbUJBQVYsQ0FBQTs7QUFBQSxFQUVBLGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSw0QkFBUixDQUZuQixDQUFBOztBQUFBLEVBSUEsUUFBOEUsRUFBOUUsRUFBQyxrQkFBRCxFQUFVLHlCQUFWLEVBQTBCLHdDQUExQixFQUF5RCxvQkFBekQsRUFBb0UsaUJBSnBFLENBQUE7O0FBQUEsRUFxQk07QUFDSixJQUFBLGdCQUFnQixDQUFDLFdBQWpCLENBQTZCLElBQTdCLENBQUEsQ0FBQTs7QUFFQTtBQUFBLGdCQUZBOztBQUFBLG1CQUtBLE1BQUEsR0FDRTtBQUFBLE1BQUEsT0FBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFFBQ0EsVUFBQSxFQUFZLEVBRFo7T0FERjtBQUFBLE1BR0EsVUFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLElBRFQ7T0FKRjtBQUFBLE1BTUEsb0JBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxLQURUO09BUEY7QUFBQSxNQVNBLHFCQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsSUFEVDtBQUFBLFFBRUEsV0FBQSxFQUFhLHlEQUZiO09BVkY7QUFBQSxNQWFBLHNCQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsSUFEVDtB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

//# sourceURL=/home/gsmyrnaios/.atom/packages/minimap/lib/main.coffee
