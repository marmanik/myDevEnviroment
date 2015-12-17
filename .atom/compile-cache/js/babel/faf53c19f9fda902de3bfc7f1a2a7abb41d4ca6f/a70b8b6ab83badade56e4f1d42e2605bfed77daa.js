Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _decoratorsInclude = require('./decorators/include');

var _decoratorsInclude2 = _interopRequireDefault(_decoratorsInclude);

var _minimap = require('./minimap');

var _minimap2 = _interopRequireDefault(_minimap);

var _minimapElement = require('./minimap-element');

var _minimapElement2 = _interopRequireDefault(_minimapElement);

var _mixinsPluginManagement = require('./mixins/plugin-management');

var _mixinsPluginManagement2 = _interopRequireDefault(_mixinsPluginManagement);

var _minimapPluginGeneratorElement = require('./minimap-plugin-generator-element');

var _minimapPluginGeneratorElement2 = _interopRequireDefault(_minimapPluginGeneratorElement);

/**
 * The `Minimap` package provides an eagle-eye view of text buffers.
 *
 * It also provides API for plugin packages that want to interact with the
 * minimap and be available to the user through the minimap settings.
 */
'use babel';

var Main = (function () {
  /**
   * Used only at export time.
   *
   * @access private
   */

  function Main() {
    _classCallCheck(this, _Main);

    /**
     * The activation state of the package.
     *
     * @type {boolean}
     * @access private
     */
    this.active = false;
    /**
     * The toggle state of the package.
     *
     * @type {boolean}
     * @access private
     */
    this.toggled = false;
    /**
     * The `Map` where Minimap instances are stored with the text editor they
     * target as key.
     *
     * @type {Map}
     * @access private
     */
    this.editorsMinimaps = null;
    /**
     * The composite disposable that stores the package's subscriptions.
     *
     * @type {CompositeDisposable}
     * @access private
     */
    this.subscriptions = null;
    /**
     * The disposable that stores the package's commands subscription.
     *
     * @type {Disposable}
     * @access private
     */
    this.subscriptionsOfCommands = null;
    /**
     * The package's config object.
     *
     * @type {Object}
     * @access private
     */
    this.config = require('./config-schema.json');
    /**
     * The package's events emitter.
     *
     * @type {Emitter}
     * @access private
     */
    this.emitter = new _atom.Emitter();

    this.initializePlugins();
  }

  /**
   * The exposed instance of the `Main` class.
   *
   * @access private
   */

  /**
   * Activates the minimap package.
   */

  _createClass(Main, [{
    key: 'activate',
    value: function activate() {
      var _this = this;

      if (this.active) {
        return;
      }

      _minimapElement2['default'].registerViewProvider();

      this.subscriptionsOfCommands = atom.commands.add('atom-workspace', {
        'minimap:toggle': function minimapToggle() {
          _this.toggle();
        },
        'minimap:generate-coffee-plugin': function minimapGenerateCoffeePlugin() {
          _this.generatePlugin('coffee');
        },
        'minimap:generate-javascript-plugin': function minimapGenerateJavascriptPlugin() {
          _this.generatePlugin('javascript');
        },
        'minimap:generate-babel-plugin': function minimapGenerateBabelPlugin() {
          _this.generatePlugin('babel');
        }
      });

      this.editorsMinimaps = new Map();
      this.subscriptions = new _atom.CompositeDisposable();
      this.active = true;

      if (atom.config.get('minimap.autoToggle')) {
        this.toggle();
      }
    }

    /**
     * Deactivates the minimap package.
     */
  }, {
    key: 'deactivate',
    value: function deactivate() {
      var _this2 = this;

      if (!this.active) {
        return;
      }

      this.deactivateAllPlugins();

      if (this.editorsMinimaps) {
        this.editorsMinimaps.forEach(function (value, key) {
          value.destroy();
          _this2.editorsMinimaps['delete'](key);
        });
      }

      this.subscriptions.dispose();
      this.subscriptions = null;
      this.subscriptionsOfCommands.dispose();
      this.subscriptionsOfCommands = null;
      this.editorsMinimaps = undefined;
      this.toggled = false;
      this.active = false;
    }

    /**
     * Toggles the minimap display.
     */
  }, {
    key: 'toggle',
    value: function toggle() {
      var _this3 = this;

      if (!this.active) {
        return;
      }

      if (this.toggled) {
        this.toggled = false;

        if (this.editorsMinimaps) {
          this.editorsMinimaps.forEach(function (value, key) {
            value.destroy();
            _this3.editorsMinimaps['delete'](key);
          });
        }
        this.subscriptions.dispose();
      } else {
        this.toggled = true;
        this.initSubscriptions();
      }
    }

    /**
     * Opens the plugin generation view.
     *
     * @param  {string} template the name of the template to use
     */
  }, {
    key: 'generatePlugin',
    value: function generatePlugin(template) {
      var view = new _minimapPluginGeneratorElement2['default']();
      view.template = template;
      view.attach();
    }

    /**
     * Registers a callback to listen to the `did-activate` event of the package.
     *
     * @param  {function(event:Object):void} callback the callback function
     * @return {Disposable} a disposable to stop listening to the event
     */
  }, {
    key: 'onDidActivate',
    value: function onDidActivate(callback) {
      return this.emitter.on('did-activate', callback);
    }

    /**
     * Registers a callback to listen to the `did-deactivate` event of the
     * package.
     *
     * @param  {function(event:Object):void} callback the callback function
     * @return {Disposable} a disposable to stop listening to the event
     */
  }, {
    key: 'onDidDeactivate',
    value: function onDidDeactivate(callback) {
      return this.emitter.on('did-deactivate', callback);
    }

    /**
     * Registers a callback to listen to the `did-create-minimap` event of the
     * package.
     *
     * @param  {function(event:Object):void} callback the callback function
     * @return {Disposable} a disposable to stop listening to the event
     */
  }, {
    key: 'onDidCreateMinimap',
    value: function onDidCreateMinimap(callback) {
      return this.emitter.on('did-create-minimap', callback);
    }

    /**
     * Registers a callback to listen to the `did-add-plugin` event of the
     * package.
     *
     * @param  {function(event:Object):void} callback the callback function
     * @return {Disposable} a disposable to stop listening to the event
     */
  }, {
    key: 'onDidAddPlugin',
    value: function onDidAddPlugin(callback) {
      return this.emitter.on('did-add-plugin', callback);
    }

    /**
     * Registers a callback to listen to the `did-remove-plugin` event of the
     * package.
     *
     * @param  {function(event:Object):void} callback the callback function
     * @return {Disposable} a disposable to stop listening to the event
     */
  }, {
    key: 'onDidRemovePlugin',
    value: function onDidRemovePlugin(callback) {
      return this.emitter.on('did-remove-plugin', callback);
    }

    /**
     * Registers a callback to listen to the `did-activate-plugin` event of the
     * package.
     *
     * @param  {function(event:Object):void} callback the callback function
     * @return {Disposable} a disposable to stop listening to the event
     */
  }, {
    key: 'onDidActivatePlugin',
    value: function onDidActivatePlugin(callback) {
      return this.emitter.on('did-activate-plugin', callback);
    }

    /**
     * Registers a callback to listen to the `did-deactivate-plugin` event of the
     * package.
     *
     * @param  {function(event:Object):void} callback the callback function
     * @return {Disposable} a disposable to stop listening to the event
     */
  }, {
    key: 'onDidDeactivatePlugin',
    value: function onDidDeactivatePlugin(callback) {
      return this.emitter.on('did-deactivate-plugin', callback);
    }

    /**
     * Returns the `Minimap` class
     *
     * @return {Function} the `Minimap` class constructor
     */
  }, {
    key: 'minimapClass',
    value: function minimapClass() {
      return _minimap2['default'];
    }

    /**
     * Returns the `Minimap` object associated to the passed-in
     * `TextEditorElement`.
     *
     * @param  {TextEditorElement} editorElement a text editor element
     * @return {Minimap} the associated minimap
     */
  }, {
    key: 'minimapForEditorElement',
    value: function minimapForEditorElement(editorElement) {
      if (!editorElement) {
        return;
      }
      return this.minimapForEditor(editorElement.getModel());
    }

    /**
     * Returns the `Minimap` object associated to the passed-in
     * `TextEditor`.
     *
     * @param  {TextEditor} textEditor a text editor
     * @return {Minimap} the associated minimap
     */
  }, {
    key: 'minimapForEditor',
    value: function minimapForEditor(textEditor) {
      var _this4 = this;

      if (!textEditor) {
        return;
      }

      var minimap = this.editorsMinimaps.get(textEditor);

      if (!minimap) {
        minimap = new _minimap2['default']({ textEditor: textEditor });
        this.editorsMinimaps.set(textEditor, minimap);

        var editorSubscription = textEditor.onDidDestroy(function () {
          var minimaps = _this4.editorsMinimaps;
          if (minimaps) {
            minimaps['delete'](textEditor);
          }
          editorSubscription.dispose();
        });
      }

      return minimap;
    }

    /**
     * Returns a new stand-alone {Minimap} for the passed-in `TextEditor`.
     *
     * @param  {TextEditor} textEditor a text editor instance to create
     *                                 a minimap for
     * @return {Minimap} a new stand-alone Minimap for the passed-in editor
     */
  }, {
    key: 'standAloneMinimapForEditor',
    value: function standAloneMinimapForEditor(textEditor) {
      if (!textEditor) {
        return;
      }

      return new _minimap2['default']({
        textEditor: textEditor,
        standAlone: true
      });
    }

    /**
     * Returns the `Minimap` associated to the active `TextEditor`.
     *
     * @return {Minimap} the active Minimap
     */
  }, {
    key: 'getActiveMinimap',
    value: function getActiveMinimap() {
      return this.minimapForEditor(atom.workspace.getActiveTextEditor());
    }

    /**
     * Calls a function for each present and future minimaps.
     *
     * @param  {function(minimap:Minimap):void} iterator a function to call with
     *                                                   the existing and future
     *                                                   minimaps
     * @return {Disposable} a disposable to unregister the observer
     */
  }, {
    key: 'observeMinimaps',
    value: function observeMinimaps(iterator) {
      if (!iterator) {
        return;
      }

      if (this.editorsMinimaps) {
        this.editorsMinimaps.forEach(function (minimap) {
          iterator(minimap);
        });
      }
      return this.onDidCreateMinimap(function (minimap) {
        iterator(minimap);
      });
    }

    /**
     * Registers to the `observeTextEditors` method.
     *
     * @access private
     */
  }, {
    key: 'initSubscriptions',
    value: function initSubscriptions() {
      var _this5 = this;

      this.subscriptions.add(atom.workspace.observeTextEditors(function (textEditor) {
        var minimap = _this5.minimapForEditor(textEditor);
        var minimapElement = atom.views.getView(minimap);

        _this5.emitter.emit('did-create-minimap', minimap);

        minimapElement.attach();
      }));
    }
  }]);

  var _Main = Main;
  Main = (0, _decoratorsInclude2['default'])(_mixinsPluginManagement2['default'])(Main) || Main;
  return Main;
})();

exports['default'] = new Main();
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2dzbXlybmFpb3MvLmF0b20vcGFja2FnZXMvbWluaW1hcC9saWIvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O29CQUUyQyxNQUFNOztpQ0FDN0Isc0JBQXNCOzs7O3VCQUN0QixXQUFXOzs7OzhCQUNKLG1CQUFtQjs7OztzQ0FDakIsNEJBQTRCOzs7OzZDQUNmLG9DQUFvQzs7Ozs7Ozs7OztBQVA5RSxXQUFXLENBQUE7O0lBZ0JMLElBQUk7Ozs7Ozs7QUFNSSxXQU5SLElBQUksR0FNTzs7Ozs7Ozs7O0FBT2IsUUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUE7Ozs7Ozs7QUFPbkIsUUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUE7Ozs7Ozs7O0FBUXBCLFFBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFBOzs7Ozs7O0FBTzNCLFFBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFBOzs7Ozs7O0FBT3pCLFFBQUksQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLENBQUE7Ozs7Ozs7QUFPbkMsUUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQTs7Ozs7OztBQU83QyxRQUFJLENBQUMsT0FBTyxHQUFHLG1CQUFhLENBQUE7O0FBRTVCLFFBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFBO0dBQ3pCOzs7Ozs7Ozs7Ozs7ZUEzREcsSUFBSTs7V0FnRUMsb0JBQUc7OztBQUNWLFVBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtBQUFFLGVBQU07T0FBRTs7QUFFM0Isa0NBQWUsb0JBQW9CLEVBQUUsQ0FBQTs7QUFFckMsVUFBSSxDQUFDLHVCQUF1QixHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFO0FBQ2pFLHdCQUFnQixFQUFFLHlCQUFNO0FBQ3RCLGdCQUFLLE1BQU0sRUFBRSxDQUFBO1NBQ2Q7QUFDRCx3Q0FBZ0MsRUFBRSx1Q0FBTTtBQUN0QyxnQkFBSyxjQUFj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U0FBUyxDQUFDLGtCQUFrQixDQUFDLFVBQUMsVUFBVSxFQUFLO0FBQ3ZFLFlBQUksT0FBTyxHQUFHLE9BQUssZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUE7QUFDL0MsWUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUE7O0FBRWhELGVBQUssT0FBTyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxPQUFPLENBQUMsQ0FBQTs7QUFFaEQsc0JBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FBQTtPQUN4QixDQUFDLENBQUMsQ0FBQTtLQUNKOzs7Y0FyVUcsSUFBSTtBQUFKLE1BQUksR0FEVCx3RUFBeUIsQ0FDcEIsSUFBSSxLQUFKLElBQUk7U0FBSixJQUFJOzs7cUJBNlVLLElBQUksSUFBSSxFQUFFIiwiZmlsZSI6Ii9ob21lL2dzbXlybmFpb3MvLmF0b20vcGFja2FnZXMvbWluaW1hcC9saWIvbWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCB7RW1pdHRlciwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSdcbmltcG9ydCBpbmNsdWRlIGZyb20gJy4vZGVjb3JhdG9ycy9pbmNsdWRlJ1xuaW1wb3J0IE1pbmltYXAgZnJvbSAnLi9taW5pbWFwJ1xuaW1wb3J0IE1pbmltYXBFbGVtZW50IGZyb20gJy4vbWluaW1hcC1lbGVtZW50J1xuaW1wb3J0IFBsdWdpbk1hbmFnZW1lbnQgZnJvbSAnLi9taXhpbnMvcGx1Z2luLW1hbmFnZW1lbnQnXG5pbXBvcnQgTWluaW1hcFBsdWdpbkdlbmVyYXRvckVsZW1lbnQgZnJvbSAnLi9taW5pbWFwLXBsdWdpbi1nZW5lcmF0b3ItZWxlbWVudCdcblxuLyoqXG4gKiBUaGUgYE1pbmltYXBgIHBhY2thZ2UgcHJvdmlkZXMgYW4gZWFnbGUtZXllIHZpZXcgb2YgdGV4dCBidWZmZXJzLlxuICpcbiAqIEl0IGFsc28gcHJvdmlkZXMgQVBJIGZvciBwbHVnaW4gcGFja2FnZXMgdGhhdCB3YW50IHRvIGludGVyYWN0IHdpdGggdGhlXG4gKiBtaW5pbWFwIGFuZCBiZSBhdmFpbGFibGUgdG8gdGhlIHVzZXIgdGhyb3VnaCB0aGUgbWluaW1hcCBzZXR0aW5ncy5cbiAqL1xuQGluY2x1ZGUoUGx1Z2luTWFuYWdlbWVudClcbmNsYXNzIE1haW4ge1xuICAvKipcbiAgICogVXNlZCBvbmx5IGF0IGV4cG9ydCB0aW1lLlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICAvKipcbiAgICAgKiBUaGUgYWN0aXZhdGlvbiBzdGF0ZSBvZiB0aGUgcGFja2FnZS5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuYWN0aXZlID0gZmFsc2VcbiAgICAvKipcbiAgICAgKiBUaGUgdG9nZ2xlIHN0YXRlIG9mIHRoZSBwYWNrYWdlLlxuICAgICAqXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy50b2dnbGVkID0gZmFsc2VcbiAgICAvKipcbiAgICAgKiBUaGUgYE1hcGAgd2hlcmUgTWluaW1hcCBpbnN0YW5jZXMgYXJlIHN0b3JlZCB3aXRoIHRoZSB0ZXh0IGVkaXRvciB0aGV5XG4gICAgICogdGFyZ2V0IGFzIGtleS5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtNYXB9XG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5lZGl0b3JzTWluaW1hcHMgPSBudWxsXG4gICAgLyoqXG4gICAgICogVGhlIGNvbXBvc2l0ZSBkaXNwb3NhYmxlIHRoYXQgc3RvcmVzIHRoZSBwYWNrYWdlJ3Mgc3Vic2NyaXB0aW9ucy5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtDb21wb3NpdGVEaXNwb3NhYmxlfVxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG51bGxcbiAgICAvKipcbiAgICAgKiBUaGUgZGlzcG9zYWJsZSB0aGF0IHN0b3JlcyB0aGUgcGFja2FnZSdzIGNvbW1hbmRzIHN1YnNjcmlwdGlvbi5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtEaXNwb3NhYmxlfVxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuc3Vic2NyaXB0aW9uc09mQ29tbWFuZHMgPSBudWxsXG4gICAgLyoqXG4gICAgICogVGhlIHBhY2thZ2UncyBjb25maWcgb2JqZWN0LlxuICAgICAqXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLmNvbmZpZyA9IHJlcXVpcmUoJy4vY29uZmlnLXNjaGVtYS5qc29uJylcbiAgICAvKipcbiAgICAgKiBUaGUgcGFja2FnZSdzIGV2ZW50cyBlbWl0dGVyLlxuICAgICAqXG4gICAgICogQHR5cGUge0VtaXR0ZXJ9XG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKVxuXG4gICAgdGhpcy5pbml0aWFsaXplUGx1Z2lucygpXG4gIH1cblxuICAvKipcbiAgICogQWN0aXZhdGVzIHRoZSBtaW5pbWFwIHBhY2thZ2UuXG4gICAqL1xuICBhY3RpdmF0ZSAoKSB7XG4gICAgaWYgKHRoaXMuYWN0aXZlKSB7IHJldHVybiB9XG5cbiAgICBNaW5pbWFwRWxlbWVudC5yZWdpc3RlclZpZXdQcm92aWRlcigpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnNPZkNvbW1hbmRzID0gYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgJ21pbmltYXA6dG9nZ2xlJzogKCkgPT4ge1xuICAgICAgICB0aGlzLnRvZ2dsZSgpXG4gICAgICB9LFxuICAgICAgJ21pbmltYXA6Z2VuZXJhdGUtY29mZmVlLXBsdWdpbic6ICgpID0+IHtcbiAgICAgICAgdGhpcy5nZW5lcmF0ZVBsdWdpbignY29mZmVlJylcbiAgICAgIH0sXG4gICAgICAnbWluaW1hcDpnZW5lcmF0ZS1qYXZhc2NyaXB0LXBsdWdpbic6ICgpID0+IHtcbiAgICAgICAgdGhpcy5nZW5lcmF0ZVBsdWdpbignamF2YXNjcmlwdCcpXG4gICAgICB9LFxuICAgICAgJ21pbmltYXA6Z2VuZXJhdGUtYmFiZWwtcGx1Z2luJzogKCkgPT4ge1xuICAgICAgICB0aGlzLmdlbmVyYXRlUGx1Z2luKCdiYWJlbCcpXG4gICAgICB9XG4gICAgfSlcblxuICAgIHRoaXMuZWRpdG9yc01pbmltYXBzID0gbmV3IE1hcCgpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIHRoaXMuYWN0aXZlID0gdHJ1ZVxuXG4gICAgaWYgKGF0b20uY29uZmlnLmdldCgnbWluaW1hcC5hdXRvVG9nZ2xlJykpIHsgdGhpcy50b2dnbGUoKSB9XG4gIH1cblxuICAvKipcbiAgICogRGVhY3RpdmF0ZXMgdGhlIG1pbmltYXAgcGFja2FnZS5cbiAgICovXG4gIGRlYWN0aXZhdGUgKCkge1xuICAgIGlmICghdGhpcy5hY3RpdmUpIHsgcmV0dXJuIH1cblxuICAgIHRoaXMuZGVhY3RpdmF0ZUFsbFBsdWdpbnMoKVxuXG4gICAgaWYgKHRoaXMuZWRpdG9yc01pbmltYXBzKSB7XG4gICAgICB0aGlzLmVkaXRvcnNNaW5pbWFwcy5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgIHZhbHVlLmRlc3Ryb3koKVxuICAgICAgICB0aGlzLmVkaXRvcnNNaW5pbWFwcy5kZWxldGUoa2V5KVxuICAgICAgfSlcbiAgICB9XG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbnVsbFxuICAgIHRoaXMuc3Vic2NyaXB0aW9uc09mQ29tbWFuZHMuZGlzcG9zZSgpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zT2ZDb21tYW5kcyA9IG51bGxcbiAgICB0aGlzLmVkaXRvcnNNaW5pbWFwcyA9IHVuZGVmaW5lZFxuICAgIHRoaXMudG9nZ2xlZCA9IGZhbHNlXG4gICAgdGhpcy5hY3RpdmUgPSBmYWxzZVxuICB9XG5cbiAgLyoqXG4gICAqIFRvZ2dsZXMgdGhlIG1pbmltYXAgZGlzcGxheS5cbiAgICovXG4gIHRvZ2dsZSAoKSB7XG4gICAgaWYgKCF0aGlzLmFjdGl2ZSkgeyByZXR1cm4gfVxuXG4gICAgaWYgKHRoaXMudG9nZ2xlZCkge1xuICAgICAgdGhpcy50b2dnbGVkID0gZmFsc2VcblxuICAgICAgaWYgKHRoaXMuZWRpdG9yc01pbmltYXBzKSB7XG4gICAgICAgIHRoaXMuZWRpdG9yc01pbmltYXBzLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgICB2YWx1ZS5kZXN0cm95KClcbiAgICAgICAgICB0aGlzLmVkaXRvcnNNaW5pbWFwcy5kZWxldGUoa2V5KVxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnRvZ2dsZWQgPSB0cnVlXG4gICAgICB0aGlzLmluaXRTdWJzY3JpcHRpb25zKClcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogT3BlbnMgdGhlIHBsdWdpbiBnZW5lcmF0aW9uIHZpZXcuXG4gICAqXG4gICAqIEBwYXJhbSAge3N0cmluZ30gdGVtcGxhdGUgdGhlIG5hbWUgb2YgdGhlIHRlbXBsYXRlIHRvIHVzZVxuICAgKi9cbiAgZ2VuZXJhdGVQbHVnaW4gKHRlbXBsYXRlKSB7XG4gICAgdmFyIHZpZXcgPSBuZXcgTWluaW1hcFBsdWdpbkdlbmVyYXRvckVsZW1lbnQoKVxuICAgIHZpZXcudGVtcGxhdGUgPSB0ZW1wbGF0ZVxuICAgIHZpZXcuYXR0YWNoKClcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYSBjYWxsYmFjayB0byBsaXN0ZW4gdG8gdGhlIGBkaWQtYWN0aXZhdGVgIGV2ZW50IG9mIHRoZSBwYWNrYWdlLlxuICAgKlxuICAgKiBAcGFyYW0gIHtmdW5jdGlvbihldmVudDpPYmplY3QpOnZvaWR9IGNhbGxiYWNrIHRoZSBjYWxsYmFjayBmdW5jdGlvblxuICAgKiBAcmV0dXJuIHtEaXNwb3NhYmxlfSBhIGRpc3Bvc2FibGUgdG8gc3RvcCBsaXN0ZW5pbmcgdG8gdGhlIGV2ZW50XG4gICAqL1xuICBvbkRpZEFjdGl2YXRlIChjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1hY3RpdmF0ZScsIGNhbGxiYWNrKVxuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhIGNhbGxiYWNrIHRvIGxpc3RlbiB0byB0aGUgYGRpZC1kZWFjdGl2YXRlYCBldmVudCBvZiB0aGVcbiAgICogcGFja2FnZS5cbiAgICpcbiAgICogQHBhcmFtICB7ZnVuY3Rpb24oZXZlbnQ6T2JqZWN0KTp2b2lkfSBjYWxsYmFjayB0aGUgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICogQHJldHVybiB7RGlzcG9zYWJsZX0gYSBkaXNwb3NhYmxlIHRvIHN0b3AgbGlzdGVuaW5nIHRvIHRoZSBldmVudFxuICAgKi9cbiAgb25EaWREZWFjdGl2YXRlIChjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1kZWFjdGl2YXRlJywgY2FsbGJhY2spXG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGEgY2FsbGJhY2sgdG8gbGlzdGVuIHRvIHRoZSBgZGlkLWNyZWF0ZS1taW5pbWFwYCBldmVudCBvZiB0aGVcbiAgICogcGFja2FnZS5cbiAgICpcbiAgICogQHBhcmFtICB7ZnVuY3Rpb24oZXZlbnQ6T2JqZWN0KTp2b2lkfSBjYWxsYmFjayB0aGUgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICogQHJldHVybiB7RGlzcG9zYWJsZX0gYSBkaXNwb3NhYmxlIHRvIHN0b3AgbGlzdGVuaW5nIHRvIHRoZSBldmVudFxuICAgKi9cbiAgb25EaWRDcmVhdGVNaW5pbWFwIChjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1jcmVhdGUtbWluaW1hcCcsIGNhbGxiYWNrKVxuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhIGNhbGxiYWNrIHRvIGxpc3RlbiB0byB0aGUgYGRpZC1hZGQtcGx1Z2luYCBldmVudCBvZiB0aGVcbiAgICogcGFja2FnZS5cbiAgICpcbiAgICogQHBhcmFtICB7ZnVuY3Rpb24oZXZlbnQ6T2JqZWN0KTp2b2lkfSBjYWxsYmFjayB0aGUgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICogQHJldHVybiB7RGlzcG9zYWJsZX0gYSBkaXNwb3NhYmxlIHRvIHN0b3AgbGlzdGVuaW5nIHRvIHRoZSBldmVudFxuICAgKi9cbiAgb25EaWRBZGRQbHVnaW4gKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWFkZC1wbHVnaW4nLCBjYWxsYmFjaylcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYSBjYWxsYmFjayB0byBsaXN0ZW4gdG8gdGhlIGBkaWQtcmVtb3ZlLXBsdWdpbmAgZXZlbnQgb2YgdGhlXG4gICAqIHBhY2thZ2UuXG4gICAqXG4gICAqIEBwYXJhbSAge2Z1bmN0aW9uKGV2ZW50Ok9iamVjdCk6dm9pZH0gY2FsbGJhY2sgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAqIEByZXR1cm4ge0Rpc3Bvc2FibGV9IGEgZGlzcG9zYWJsZSB0byBzdG9wIGxpc3RlbmluZyB0byB0aGUgZXZlbnRcbiAgICovXG4gIG9uRGlkUmVtb3ZlUGx1Z2luIChjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1yZW1vdmUtcGx1Z2luJywgY2FsbGJhY2spXG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGEgY2FsbGJhY2sgdG8gbGlzdGVuIHRvIHRoZSBgZGlkLWFjdGl2YXRlLXBsdWdpbmAgZXZlbnQgb2YgdGhlXG4gICAqIHBhY2thZ2UuXG4gICAqXG4gICAqIEBwYXJhbSAge2Z1bmN0aW9uKGV2ZW50Ok9iamVjdCk6dm9pZH0gY2FsbGJhY2sgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAqIEByZXR1cm4ge0Rpc3Bvc2FibGV9IGEgZGlzcG9zYWJsZSB0byBzdG9wIGxpc3RlbmluZyB0byB0aGUgZXZlbnRcbiAgICovXG4gIG9uRGlkQWN0aXZhdGVQbHVnaW4gKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWFjdGl2YXRlLXBsdWdpbicsIGNhbGxiYWNrKVxuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhIGNhbGxiYWNrIHRvIGxpc3RlbiB0byB0aGUgYGRpZC1kZWFjdGl2YXRlLXBsdWdpbmAgZXZlbnQgb2YgdGhlXG4gICAqIHBhY2thZ2UuXG4gICAqXG4gICAqIEBwYXJhbSAge2Z1bmN0aW9uKGV2ZW50Ok9iamVjdCk6dm9pZH0gY2FsbGJhY2sgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAqIEByZXR1cm4ge0Rpc3Bvc2FibGV9IGEgZGlzcG9zYWJsZSB0byBzdG9wIGxpc3RlbmluZyB0byB0aGUgZXZlbnRcbiAgICovXG4gIG9uRGlkRGVhY3RpdmF0ZVBsdWdpbiAoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtZGVhY3RpdmF0ZS1wbHVnaW4nLCBjYWxsYmFjaylcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBgTWluaW1hcGAgY2xhc3NcbiAgICpcbiAgICogQHJldHVybiB7RnVuY3Rpb259IHRoZSBgTWluaW1hcGAgY2xhc3MgY29uc3RydWN0b3JcbiAgICovXG4gIG1pbmltYXBDbGFzcyAoKSB7IHJldHVybiBNaW5pbWFwIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYE1pbmltYXBgIG9iamVjdCBhc3NvY2lhdGVkIHRvIHRoZSBwYXNzZWQtaW5cbiAgICogYFRleHRFZGl0b3JFbGVtZW50YC5cbiAgICpcbiAgICogQHBhcmFtICB7VGV4dEVkaXRvckVsZW1lbnR9IGVkaXRvckVsZW1lbnQgYSB0ZXh0IGVkaXRvciBlbGVtZW50XG4gICAqIEByZXR1cm4ge01pbmltYXB9IHRoZSBhc3NvY2lhdGVkIG1pbmltYXBcbiAgICovXG4gIG1pbmltYXBGb3JFZGl0b3JFbGVtZW50IChlZGl0b3JFbGVtZW50KSB7XG4gICAgaWYgKCFlZGl0b3JFbGVtZW50KSB7IHJldHVybiB9XG4gICAgcmV0dXJuIHRoaXMubWluaW1hcEZvckVkaXRvcihlZGl0b3JFbGVtZW50LmdldE1vZGVsKCkpXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYE1pbmltYXBgIG9iamVjdCBhc3NvY2lhdGVkIHRvIHRoZSBwYXNzZWQtaW5cbiAgICogYFRleHRFZGl0b3JgLlxuICAgKlxuICAgKiBAcGFyYW0gIHtUZXh0RWRpdG9yfSB0ZXh0RWRpdG9yIGEgdGV4dCBlZGl0b3JcbiAgICogQHJldHVybiB7TWluaW1hcH0gdGhlIGFzc29jaWF0ZWQgbWluaW1hcFxuICAgKi9cbiAgbWluaW1hcEZvckVkaXRvciAodGV4dEVkaXRvcikge1xuICAgIGlmICghdGV4dEVkaXRvcikgeyByZXR1cm4gfVxuXG4gICAgbGV0IG1pbmltYXAgPSB0aGlzLmVkaXRvcnNNaW5pbWFwcy5nZXQodGV4dEVkaXRvcilcblxuICAgIGlmICghbWluaW1hcCkge1xuICAgICAgbWluaW1hcCA9IG5ldyBNaW5pbWFwKHt0ZXh0RWRpdG9yfSlcbiAgICAgIHRoaXMuZWRpdG9yc01pbmltYXBzLnNldCh0ZXh0RWRpdG9yLCBtaW5pbWFwKVxuXG4gICAgICB2YXIgZWRpdG9yU3Vic2NyaXB0aW9uID0gdGV4dEVkaXRvci5vbkRpZERlc3Ryb3koKCkgPT4ge1xuICAgICAgICBsZXQgbWluaW1hcHMgPSB0aGlzLmVkaXRvcnNNaW5pbWFwc1xuICAgICAgICBpZiAobWluaW1hcHMpIHsgbWluaW1hcHMuZGVsZXRlKHRleHRFZGl0b3IpIH1cbiAgICAgICAgZWRpdG9yU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxuICAgICAgfSlcbiAgICB9XG5cbiAgICByZXR1cm4gbWluaW1hcFxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBuZXcgc3RhbmQtYWxvbmUge01pbmltYXB9IGZvciB0aGUgcGFzc2VkLWluIGBUZXh0RWRpdG9yYC5cbiAgICpcbiAgICogQHBhcmFtICB7VGV4dEVkaXRvcn0gdGV4dEVkaXRvciBhIHRleHQgZWRpdG9yIGluc3RhbmNlIHRvIGNyZWF0ZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGEgbWluaW1hcCBmb3JcbiAgICogQHJldHVybiB7TWluaW1hcH0gYSBuZXcgc3RhbmQtYWxvbmUgTWluaW1hcCBmb3IgdGhlIHBhc3NlZC1pbiBlZGl0b3JcbiAgICovXG4gIHN0YW5kQWxvbmVNaW5pbWFwRm9yRWRpdG9yICh0ZXh0RWRpdG9yKSB7XG4gICAgaWYgKCF0ZXh0RWRpdG9yKSB7IHJldHVybiB9XG5cbiAgICByZXR1cm4gbmV3IE1pbmltYXAoe1xuICAgICAgdGV4dEVkaXRvcjogdGV4dEVkaXRvcixcbiAgICAgIHN0YW5kQWxvbmU6IHRydWVcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGBNaW5pbWFwYCBhc3NvY2lhdGVkIHRvIHRoZSBhY3RpdmUgYFRleHRFZGl0b3JgLlxuICAgKlxuICAgKiBAcmV0dXJuIHtNaW5pbWFwfSB0aGUgYWN0aXZlIE1pbmltYXBcbiAgICovXG4gIGdldEFjdGl2ZU1pbmltYXAgKCkge1xuICAgIHJldHVybiB0aGlzLm1pbmltYXBGb3JFZGl0b3IoYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpKVxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxzIGEgZnVuY3Rpb24gZm9yIGVhY2ggcHJlc2VudCBhbmQgZnV0dXJlIG1pbmltYXBzLlxuICAgKlxuICAgKiBAcGFyYW0gIHtmdW5jdGlvbihtaW5pbWFwOk1pbmltYXApOnZvaWR9IGl0ZXJhdG9yIGEgZnVuY3Rpb24gdG8gY2FsbCB3aXRoXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlIGV4aXN0aW5nIGFuZCBmdXR1cmVcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW5pbWFwc1xuICAgKiBAcmV0dXJuIHtEaXNwb3NhYmxlfSBhIGRpc3Bvc2FibGUgdG8gdW5yZWdpc3RlciB0aGUgb2JzZXJ2ZXJcbiAgICovXG4gIG9ic2VydmVNaW5pbWFwcyAoaXRlcmF0b3IpIHtcbiAgICBpZiAoIWl0ZXJhdG9yKSB7IHJldHVybiB9XG5cbiAgICBpZiAodGhpcy5lZGl0b3JzTWluaW1hcHMpIHtcbiAgICAgIHRoaXMuZWRpdG9yc01pbmltYXBzLmZvckVhY2goKG1pbmltYXApID0+IHsgaXRlcmF0b3IobWluaW1hcCkgfSlcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMub25EaWRDcmVhdGVNaW5pbWFwKChtaW5pbWFwKSA9PiB7IGl0ZXJhdG9yKG1pbmltYXApIH0pXG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIHRvIHRoZSBgb2JzZXJ2ZVRleHRFZGl0b3JzYCBtZXRob2QuXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgaW5pdFN1YnNjcmlwdGlvbnMgKCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzKCh0ZXh0RWRpdG9yKSA9PiB7XG4gICAgICBsZXQgbWluaW1hcCA9IHRoaXMubWluaW1hcEZvckVkaXRvcih0ZXh0RWRpdG9yKVxuICAgICAgbGV0IG1pbmltYXBFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KG1pbmltYXApXG5cbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY3JlYXRlLW1pbmltYXAnLCBtaW5pbWFwKVxuXG4gICAgICBtaW5pbWFwRWxlbWVudC5hdHRhY2goKVxuICAgIH0pKVxuICB9XG59XG5cbi8qKlxuICogVGhlIGV4cG9zZWQgaW5zdGFuY2Ugb2YgdGhlIGBNYWluYCBjbGFzcy5cbiAqXG4gKiBAYWNjZXNzIHByaXZhdGVcbiAqL1xuZXhwb3J0IGRlZmF1bHQgbmV3IE1haW4oKVxuIl19
//# sourceURL=/home/gsmyrnaios/.atom/packages/minimap/lib/main.js
