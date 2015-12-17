(function() {
  var Minimap;

  require('./helpers/workspace');

  Minimap = require('../lib/minimap');

  describe('Minimap package', function() {
    var editor, editorElement, minimap, minimapElement, minimapPackage, workspaceElement, _ref;
    _ref = [], editor = _ref[0], minimap = _ref[1], editorElement = _ref[2], minimapElement = _ref[3], workspaceElement = _ref[4], minimapPackage = _ref[5];
    beforeEach(function() {
      atom.config.set('minimap.autoToggle', true);
      workspaceElement = atom.views.getView(atom.workspace);
      jasmine.attachToDOM(workspaceElement);
      waitsForPromise(function() {
        return atom.workspace.open('sample.coffee');
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage('minimap').then(function(pkg) {
          return minimapPackage = pkg.mainModule;
        });
      });
      waitsFor(function() {
        return workspaceElement.querySelector('atom-text-editor');
      });
      runs(function() {
        editor = atom.workspace.getActiveTextEditor();
        return editorElement = atom.views.getView(editor);
      });
      return waitsFor(function() {
        return workspaceElement.querySelector('atom-text-editor::shadow atom-text-editor-minimap');
      });
    });
    it('registers the minimap views provider', function() {
      var textEditor;
      textEditor = atom.workspace.buildTextEditor({});
      minimap = new Minimap({
        textEditor: textEditor
      });
      minimapElement = atom.views.getView(minimap);
      return expect(minimapElement).toExist();
    });
    describe('when an editor is opened', function() {
      it('creates a minimap model for the editor', function() {
        return expect(minimapPackage.minimapForEditor(editor)).toBeDefined();
      });
      return it('attaches a minimap element to the editor view', function() {
        return expect(editorElement.shadowRoot.querySelector('atom-text-editor-minimap')).toExist();
      });
    });
    describe('::observeMinimaps', function() {
      var spy;
      spy = [][0];
      beforeEach(function() {
        spy = jasmine.createSpy('observeMinimaps');
        return minimapPackage.observeMinimaps(spy);
      });
      it('calls the callback with the existing minimaps', function() {
        return expect(spy).toHaveBeenCalled();
      });
      return it('calls the callback when a new editor is opened', function() {
        waitsForPromise(function() {
          return atom.workspace.open('other-sample.js');
        });
        return runs(function() {
          return expect(spy.calls.length).toEqual(2);
        });
      });
    });
    describe('::deactivate', function() {
      beforeEach(function() {
        return minimapPackage.deactivate();
      });
      it('destroys all the minimap models', function() {
        return expect(minimapPackage.editorsMinimaps).toBeUndefined();
      });
      return it('destroys all the minimap elements', function() {
        return expect(editorElement.shadowRoot.querySelector('atom-text-editor-minimap')).not.toExist();
      });
    });
    describe('service', function() {
      it('returns the minimap main module', function() {
        return expect(minimapPackage.provideMinimapServiceV1()).toEqual(minimapPackage);
      });
      return it('creates standalone minimap with provided text editor', function() {
        var standaloneMinimap, textEditor;
        textEditor = atom.workspace.buildTextEditor({});
        standaloneMinimap = minimapPackage.standAloneMinimapForEditor(textEditor);
        return expect(standaloneMinimap.getTextEditor()).toEqual(textEditor);
      });
    });
    return describe('plugins', function() {
      var plugin, registerHandler, unregisterHandler, _ref1;
      _ref1 = [], registerHandler = _ref1[0], unregisterHandler = _ref1[1], plugin = _ref1[2];
      beforeEach(function() {
        atom.config.set('minimap.displayPluginsControls', true);
        atom.config.set('minimap.plugins.dummy', void 0);
        plugin = {
          active: false,
          activatePlugin: function() {
            return this.active = true;
          },
          deactivatePlugin: function() {
            return this.active = false;
          },
          isActive: function() {
            return this.active;
          }
        };
        spyOn(plugin, 'activatePlugin').andCallThrough();
        spyOn(plugin, 'deactivatePlugin').andCallThrough();
        registerHandler = jasmine.createSpy('register handler');
        return unregisterHandler = jasmine.createSpy('unregister handler');
      });
      describe('when registered', function() {
        beforeEach(function() {
          minimapPackage.onDidAddPlugin(registerHandler);
          return minimapPackage.registerPlugin('dummy', plugin);
        });
        it('makes the plugin available in the minimap', function() {
          return expect(minimapPackage.plugins['dummy']).toBe(plugin);
        });
        it('emits an event', function() {
          return expect(registerHandler).toHaveBeenCalled();
        });
        it('creates a default config for the plugin', function() {
          return expect(minimapPackage.config.plugins.properties.dummy).toBeDefined();
        });
        it('sets the corresponding config', function() {
          return expect(atom.config.get('minimap.plugins.dummy')).toBeTruthy();
        });
        describe('triggering the corresponding plugin command', function() {
          beforeEach(function() {
            return atom.commands.dispatch(workspaceElement, 'minimap:toggle-dummy');
          });
          return it('receives a deactivation call', function() {
            return expect(plugin.deactivatePlugin).toHaveBeenCalled();
          });
        });
        describe('and then unregistered', function() {
          beforeEach(function() {
            return minimapPackage.unregisterPlugin('dummy');
          });
          it('has been unregistered', function() {
            return expect(minimapPackage.plugins['dummy']).toBeUndefined();
          });
          return describe('when the config is modified', function() {
            beforeEach(function() {
              return atom.config.set('minimap.plugins.dummy', false);
            });
            return it('does not activates the plugin', function() {
              return expect(plugin.deactivatePlugin).not.toHaveBeenCalled();
            });
          });
        });
        return describe('on minimap deactivation', function() {
          beforeEach(function() {
            expect(plugin.active).toBeTruthy();
            return minimapPackage.deactivate();
          });
          return it('deactivates all the plugins', function() {
            return expect(plugin.active).toBeFalsy();
          });
        });
      });
      describe('when the config for it is false', function() {
        beforeEach(function() {
          atom.config.set('minimap.plugins.dummy', false);
          return minimapPackage.registerPlugin('dummy', plugin);
        });
        return it('does not receive an activation call', function() {
          return expect(plugin.activatePlugin).not.toHaveBeenCalled();
        });
      });
      return describe('the registered plugin', function() {
        beforeEach(function() {
          return minimapPackage.registerPlugin('dummy', plugin);
        });
        it('receives an activation call', function() {
          return expect(plugin.activatePlugin).toHaveBeenCalled();
        });
        it('activates the plugin', function() {
          return expect(plugin.active).toBeTruthy();
        });
        return describe('when the config is modified after registration', function() {
          beforeEach(function() {
            return atom.config.set('minimap.plugins.dummy', false);
          });
          return it('receives a deactivation call', function() {
            return expect(plugin.deactivatePlugin).toHaveBeenCalled();
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL3NwZWMvbWluaW1hcC1tYWluLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLE9BQUE7O0FBQUEsRUFBQSxPQUFBLENBQVEscUJBQVIsQ0FBQSxDQUFBOztBQUFBLEVBRUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxnQkFBUixDQUZWLENBQUE7O0FBQUEsRUFJQSxRQUFBLENBQVMsaUJBQVQsRUFBNEIsU0FBQSxHQUFBO0FBQzFCLFFBQUEsc0ZBQUE7QUFBQSxJQUFBLE9BQXFGLEVBQXJGLEVBQUMsZ0JBQUQsRUFBUyxpQkFBVCxFQUFrQix1QkFBbEIsRUFBaUMsd0JBQWpDLEVBQWlELDBCQUFqRCxFQUFtRSx3QkFBbkUsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG9CQUFoQixFQUFzQyxJQUF0QyxDQUFBLENBQUE7QUFBQSxNQUVBLGdCQUFBLEdBQW1CLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixJQUFJLENBQUMsU0FBeEIsQ0FGbkIsQ0FBQTtBQUFBLE1BR0EsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsZ0JBQXBCLENBSEEsQ0FBQTtBQUFBLE1BS0EsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDZCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsZUFBcEIsRUFEYztNQUFBLENBQWhCLENBTEEsQ0FBQTtBQUFBLE1BUUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsU0FBOUIsQ0FBd0MsQ0FBQyxJQUF6QyxDQUE4QyxTQUFDLEdBQUQsR0FBQTtpQkFDNUMsY0FBQSxHQUFpQixH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

//# sourceURL=/home/gsmyrnaios/.atom/packages/minimap/spec/minimap-main-spec.coffee
