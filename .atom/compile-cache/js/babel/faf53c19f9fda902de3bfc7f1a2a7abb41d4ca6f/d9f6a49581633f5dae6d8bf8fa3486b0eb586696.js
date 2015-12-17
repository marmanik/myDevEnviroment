Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _atomUtils = require('atom-utils');

var _decoratorsInclude = require('./decorators/include');

var _decoratorsInclude2 = _interopRequireDefault(_decoratorsInclude);

var _decoratorsElement = require('./decorators/element');

var _decoratorsElement2 = _interopRequireDefault(_decoratorsElement);

var _mixinsDomStylesReader = require('./mixins/dom-styles-reader');

var _mixinsDomStylesReader2 = _interopRequireDefault(_mixinsDomStylesReader);

var _mixinsCanvasDrawer = require('./mixins/canvas-drawer');

var _mixinsCanvasDrawer2 = _interopRequireDefault(_mixinsCanvasDrawer);

var _minimapQuickSettingsElement = require('./minimap-quick-settings-element');

var _minimapQuickSettingsElement2 = _interopRequireDefault(_minimapQuickSettingsElement);

'use babel';

var SPEC_MODE = atom.inSpecMode();

/**
 * Public: The MinimapElement is the view meant to render a {@link Minimap}
 * instance in the DOM.
 *
 * You can retrieve the MinimapElement associated to a Minimap
 * using the `atom.views.getView` method.
 *
 * Note that most interactions with the Minimap package is done through the
 * Minimap model so you should never have to access MinimapElement
 * instances.
 *
 * @example
 * let minimapElement = atom.views.getView(minimap)
 */

var MinimapElement = (function () {
  function MinimapElement() {
    _classCallCheck(this, _MinimapElement);
  }

  _createClass(MinimapElement, [{
    key: 'createdCallback',

    //    ##     ##  #######   #######  ##    ##  ######
    //    ##     ## ##     ## ##     ## ##   ##  ##    ##
    //    ##     ## ##     ## ##     ## ##  ##   ##
    //    ######### ##     ## ##     ## #####     ######
    //    ##     ## ##     ## ##     ## ##  ##         ##
    //    ##     ## ##     ## ##     ## ##   ##  ##    ##
    //    ##     ##  #######   #######  ##    ##  ######

    /**
     * DOM callback invoked when a new MinimapElement is created.
     *
     * @access private
     */
    value: function createdCallback() {
      var _this = this;

      // Core properties

      /**
       * @access private
       */
      this.minimap = undefined;
      /**
       * @access private
       */
      this.editorElement = undefined;
      /**
       * @access private
       */
      this.width = undefined;
      /**
       * @access private
       */
      this.height = undefined;

      // Subscriptions

      /**
       * @access private
       */
      this.subscriptions = new _atom.CompositeDisposable();
      /**
       * @access private
       */
      this.visibleAreaSubscription = undefined;
      /**
       * @access private
       */
      this.quickSettingsSubscription = undefined;
      /**
       * @access private
       */
      this.dragSubscription = undefined;
      /**
       * @access private
       */
      this.openQuickSettingSubscription = undefined;

      // Configs

      /**
      * @access private
      */
      this.displayMinimapOnLeft = false;
      /**
      * @access private
      */
      this.minimapScrollIndicator = undefined;
      /**
      * @access private
      */
      this.displayMinimapOnLeft = undefined;
      /**
      * @access private
      */
      this.displayPluginsControls = undefined;
      /**
      * @access private
      */
      this.textOpacity = undefined;
      /**
      * @access private
      */
      this.displayCodeHighlights = undefined;
      /**
      * @access private
      */
      this.adjustToSoftWrap = undefined;
      /**
      * @access private
      */
      this.useHardwareAcceleration = undefined;
      /**
      * @access private
      */
      this.absoluteMode = undefined;

      // Elements

      /**
       * @access private
       */
      this.shadowRoot = undefined;
      /**
       * @access private
       */
      this.visibleArea = undefined;
      /**
       * @access private
       */
      this.controls = undefined;
      /**
       * @access private
       */
      this.scrollIndicator = undefined;
      /**
       * @access private
       */
      this.openQuickSettings = undefined;
      /**
       * @access private
       */
      this.quickSettingsElement = undefined;

      // States

      /**
      * @access private
      */
      this.attached = undefined;
      /**
      * @access private
      */
      this.attachedToTextEditor = undefined;
      /**
      * @access private
      */
      this.standAlone = undefined;
      /**
       * @access private
       */
      this.wasVisible = undefined;

      // Other

      /**
       * @access private
       */
      this.offscreenFirstRow = undefined;
      /**
       * @access private
       */
      this.offscreenLastRow = undefined;
      /**
       * @access private
       */
      this.frameRequested = undefined;
      /**
       * @access private
       */
      this.flexBasis = undefined;

      this.initializeContent();

      return this.observeConfig({
        'minimap.displayMinimapOnLeft': function minimapDisplayMinimapOnLeft(displayMinimapOnLeft) {
          _this.displayMinimapOnLeft = displayMinimapOnLeft;

          _this.updateMinimapFlexPosition();
        },

        'minimap.minimapScrollIndicator': function minimapMinimapScrollIndicator(minimapScrollIndicator) {
          _this.minimapScrollIndicator = minimapScrollIndicator;

          if (_this.minimapScrollIndicator && !(_this.scrollIndicator != null) && !_this.standAlone) {
            _this.initializeScrollIndicator();
          } else if (_this.scrollIndicator != null) {
            _this.disposeScrollIndicator();
          }

          if (_this.attached) {
            _this.requestUpdate();
          }
        },

        'minimap.displayPluginsControls': function minimapDisplayPluginsControls(displayPluginsControls) {
          _this.displayPluginsControls = displayPluginsControls;

          if (_this.displayPluginsControls && !(_this.openQuickSettings != null) && !_this.standAlone) {
            _this.initializeOpenQuickSettings();
          } else if (_this.openQuickSettings != null) {
            _this.disposeOpenQuickSettings();
          }
        },

        'minimap.textOpacity': function minimapTextOpacity(textOpacity) {
          _this.textOpacity = textOpacity;

          if (_this.attached) {
            _this.requestForcedUpdate();
          }
        },

        'minimap.displayCodeHighlights': function minimapDisplayCodeHighlights(displayCodeHighlights) {
          _this.displayCodeHighlights = displayCodeHighlights;

          if (_this.attached) {
            _this.requestForcedUpdate();
          }
        },

        'minimap.adjustMinimapWidthToSoftWrap': function minimapAdjustMinimapWidthToSoftWrap(adjustToSoftWrap) {
          _this.adjustToSoftWrap = adjustToSoftWrap;

          if (_this.attached) {
            _this.measureHeightAndWidth();
          }
        },

        'minimap.useHardwareAcceleration': function minimapUseHardwareAcceleration(useHardwareAcceleration) {
          _this.useHardwareAcceleration = useHardwareAcceleration;

          if (_this.attached) {
            _this.requestUpdate();
          }
        },

        'minimap.absoluteMode': function minimapAbsoluteMode(absoluteMode) {
          _this.absoluteMode = absoluteMode;

          return _this.classList.toggle('absolute', _this.absoluteMode);
        },

        'editor.preferredLineLength': function editorPreferredLineLength() {
          if (_this.attached) {
            _this.measureHeightAndWidth();
          }
        },

        'editor.softWrap': function editorSoftWrap() {
          if (_this.attached) {
            _this.requestUpdate();
          }
        },

        'editor.softWrapAtPreferredLineLength': function editorSoftWrapAtPreferredLineLength() {
          if (_this.attached) {
            _this.requestUpdate();
          }
        }
      });
    }

    /**
     * DOM callback invoked when a new MinimapElement is attached to the DOM.
     *
     * @access private
     */
  }, {
    key: 'attachedCallback',
    value: function attachedCallback() {
      var _this2 = this;

      this.subscriptions.add(atom.views.pollDocument(function () {
        _this2.pollDOM();
      }));
      this.measureHeightAndWidth();
      this.updateMinimapFlexPosition();
      this.attached = true;
      this.attachedToTextEditor = this.parentNode === this.getTextEditorElementRoot();

      /*
        We use `atom.styles.onDidAddStyleElement` instead of
        `atom.themes.onDidChangeActiveThemes`.
        Why? Currently, The style element will be removed first, and then re-added
        and the `change` event has not be triggered in the process.
      */
      return this.subscriptions.add(atom.styles.onDidAddStyleElement(function () {
        _this2.invalidateDOMStylesCache();
        _this2.requestForcedUpdate();
      }));
    }

    /**
     * DOM callback invoked when a new MinimapElement is detached from the DOM.
     *
     * @access private
     */
  }, {
    key: 'detachedCallback',
    value: function detachedCallback() {
      this.attached = false;
    }

    //       ###    ######## ########    ###     ######  ##     ##
    //      ## ##      ##       ##      ## ##   ##    ## ##     ##
    //     ##   ##     ##       ##     ##   ##  ##       ##     ##
    //    ##     ##    ##       ##    ##     ## ##       #########
    //    #########    ##       ##    ######### ##       ##     ##
    //    ##     ##    ##       ##    ##     ## ##    ## ##     ##
    //    ##     ##    ##       ##    ##     ##  ######  ##     ##

    /**
     * Returns whether the MinimapElement is currently visible on screen or not.
     *
     * The visibility of the minimap is defined by testing the size of the offset
     * width and height of the element.
     *
     * @return {boolean} whether the MinimapElement is currently visible or not
     */
  }, {
    key: 'isVisible',
    value: function isVisible() {
      return this.offsetWidth > 0 || this.offsetHeight > 0;
    }

    /**
     * Attaches the MinimapElement to the DOM.
     *
     * The position at which the element is attached is defined by the
     * `displayMinimapOnLeft` setting.
     *
     * @param  {HTMLElement} [parent] the DOM node where attaching the minimap
     *                                element
     */
  }, {
    key: 'attach',
    value: function attach(parent) {
      if (this.attached) {
        return;
      }
      (parent || this.getTextEditorElementRoot()).appendChild(this);
    }

    /**
     * Detaches the MinimapElement from the DOM.
     */
  }, {
    key: 'detach',
    value: function detach() {
      if (!this.attached || this.parentNode == null) {
        return;
      }
      this.parentNode.removeChild(this);
    }

    /**
     * Toggles the minimap left/right position based on the value of the
     * `displayMinimapOnLeft` setting.
     *
     * @access private
     */
  }, {
    key: 'updateMinimapFlexPosition',
    value: function updateMinimapFlexPosition() {
      this.classList.toggle('left', this.displayMinimapOnLeft);
    }

    /**
     * Destroys this MinimapElement
     */
  }, {
    key: 'destroy',
    value: function destroy() {
      this.subscriptions.dispose();
      this.detach();
      this.minimap = null;
    }

    //     ######   #######  ##    ## ######## ######## ##    ## ########
    //    ##    ## ##     ## ###   ##    ##    ##       ###   ##    ##
    //    ##       ##     ## ####  ##    ##    ##       ####  ##    ##
    //    ##       ##     ## ## ## ##    ##    ######   ## ## ##    ##
    //    ##       ##     ## ##  ####    ##    ##       ##  ####    ##
    //    ##    ## ##     ## ##   ###    ##    ##       ##   ###    ##
    //     ######   #######  ##    ##    ##    ######## ##    ##    ##

    /**
     * Creates the content of the MinimapElement and attaches the mouse control
     * event listeners.
     *
     * @access private
     */
  }, {
    key: 'initializeContent',
    value: function initializeContent() {
      var _this3 = this;

      this.initializeCanvas();

      this.shadowRoot = this.createShadowRoot();
      this.attachCanvases(this.shadowRoot);

      this.createVisibleArea();
      this.createControls();

      this.subscriptions.add(this.subscribeTo(this, {
        'mousewheel': function mousewheel(e) {
          if (!_this3.standAlone) {
            _this3.relayMousewheelEvent(e);
          }
        }
      }));

      this.subscriptions.add(this.subscribeTo(this.getFrontCanvas(), {
        'mousedown': function mousedown(e) {
          _this3.mousePressedOverCanvas(e);
        }
      }));
    }

    /**
     * Initializes the visible area div.
     *
     * @access private
     */
  }, {
    key: 'createVisibleArea',
    value: function createVisibleArea() {
      var _this4 = this;

      if (this.visibleArea) {
        return;
      }

      this.visibleArea = document.createElement('div');
      this.visibleArea.classList.add('minimap-visible-area');
      this.shadowRoot.appendChild(this.visibleArea);
      this.visibleAreaSubscription = this.subscribeTo(this.visibleArea, {
        'mousedown': function mousedown(e) {
          _this4.startDrag(e);
        },
        'touchstart': function touchstart(e) {
          _this4.startDrag(e);
        }
      });

      this.subscriptions.add(this.visibleAreaSubscription);
    }

    /**
     * Removes the visible area div.
     *
     * @access private
     */
  }, {
    key: 'removeVisibleArea',
    value: function removeVisibleArea() {
      if (!this.visibleArea) {
        return;
      }

      this.subscriptions.remove(this.visibleAreaSubscription);
      this.visibleAreaSubscription.dispose();
      this.shadowRoot.removeChild(this.visibleArea);
      delete this.visibleArea;
    }

    /**
     * Creates the controls container div.
     *
     * @access private
     */
  }, {
    key: 'createControls',
    value: function createControls() {
      if (this.controls || this.standAlone) {
        return;
      }

      this.controls = document.createElement('div');
      this.controls.classList.add('minimap-controls');
      this.shadowRoot.appendChild(this.controls);
    }

    /**
     * Removes the controls container div.
     *
     * @access private
     */
  }, {
    key: 'removeControls',
    value: function removeControls() {
      if (!this.controls) {
        return;
      }

      this.shadowRoot.removeChild(this.controls);
      delete this.controls;
    }

    /**
     * Initializes the scroll indicator div when the `minimapScrollIndicator`
     * settings is enabled.
     *
     * @access private
     */
  }, {
    key: 'initializeScrollIndicator',
    value: function initializeScrollIndicator() {
      if (this.scrollIndicator || this.standAlone) {
        return;
      }

      this.scrollIndicator = document.createElement('div');
      this.scrollIndicator.classList.add('minimap-scroll-indicator');
      this.controls.appendChild(this.scrollIndicator);
    }

    /**
     * Disposes the scroll indicator div when the `minimapScrollIndicator`
     * settings is disabled.
     *
     * @access private
     */
  }, {
    key: 'disposeScrollIndicator',
    value: function disposeScrollIndicator() {
      if (!this.scrollIndicator) {
        return;
      }

      this.controls.removeChild(this.scrollIndicator);
      delete this.scrollIndicator;
    }

    /**
     * Initializes the quick settings openener div when the
     * `displayPluginsControls` setting is enabled.
     *
     * @access private
     */
  }, {
    key: 'initializeOpenQuickSettings',
    value: function initializeOpenQuickSettings() {
      var _this5 = this;

      if (this.openQuickSettings || this.standAlone) {
        return;
      }

      this.openQuickSettings = document.createElement('div');
      this.openQuickSettings.classList.add('open-minimap-quick-settings');
      this.controls.appendChild(this.openQuickSettings);

      this.openQuickSettingSubscription = this.subscribeTo(this.openQuickSettings, {
        'mousedown': function mousedown(e) {
          e.preventDefault();
          e.stopPropagation();

          if (_this5.quickSettingsElement != null) {
            _this5.quickSettingsElement.destroy();
            _this5.quickSettingsSubscription.dispose();
          } else {
            _this5.quickSettingsElement = new _minimapQuickSettingsElement2['default']();
            _this5.quickSettingsElement.setModel(_this5);
            _this5.quickSettingsSubscription = _this5.quickSettingsElement.onDidDestroy(function () {
              _this5.quickSettingsElement = null;
            });

            var _getFrontCanvas$getBoundingClientRect = _this5.getFrontCanvas().getBoundingClientRect();

            var _top = _getFrontCanvas$getBoundingClientRect.top;
            var left = _getFrontCanvas$getBoundingClientRect.left;
            var right = _getFrontCanvas$getBoundingClientRect.right;

            _this5.quickSettingsElement.style.top = _top + 'px';
            _this5.quickSettingsElement.attach();

            if (_this5.displayMinimapOnLeft) {
              _this5.quickSettingsElement.style.left = right + 'px';
            } else {
              _this5.quickSettingsElement.style.left = left - _this5.quickSettingsElement.clientWidth + 'px';
            }
          }
        }
      });
    }

    /**
     * Disposes the quick settings openener div when the `displayPluginsControls`
     * setting is disabled.
     *
     * @access private
     */
  }, {
    key: 'disposeOpenQuickSettings',
    value: function disposeOpenQuickSettings() {
      if (!this.openQuickSettings) {
        return;
      }

      this.controls.removeChild(this.openQuickSettings);
      this.openQuickSettingSubscription.dispose();
      delete this.openQuickSettings;
    }

    /**
     * Returns the target `TextEditor` of the Minimap.
     *
     * @return {TextEditor} the minimap's text editor
     */
  }, {
    key: 'getTextEditor',
    value: function getTextEditor() {
      return this.minimap.getTextEditor();
    }

    /**
     * Returns the `TextEditorElement` for the Minimap's `TextEditor`.
     *
     * @return {TextEditorElement} the minimap's text editor element
     */
  }, {
    key: 'getTextEditorElement',
    value: function getTextEditorElement() {
      if (this.editorElement) {
        return this.editorElement;
      }

      this.editorElement = atom.views.getView(this.getTextEditor());
      return this.editorElement;
    }

    /**
     * Returns the root of the `TextEditorElement` content.
     *
     * This method is mostly used to ensure compatibility with the `shadowDom`
     * setting.
     *
     * @return {HTMLElement} the root of the `TextEditorElement` content
     */
  }, {
    key: 'getTextEditorElementRoot',
    value: function getTextEditorElementRoot() {
      var editorElement = this.getTextEditorElement();

      if (editorElement.shadowRoot) {
        return editorElement.shadowRoot;
      } else {
        return editorElement;
      }
    }

    /**
     * Returns the root where to inject the dummy node used to read DOM styles.
     *
     * @param  {boolean} shadowRoot whether to use the text editor shadow DOM
     *                              or not
     * @return {HTMLElement} the root node where appending the dummy node
     * @access private
     */
  }, {
    key: 'getDummyDOMRoot',
    value: function getDummyDOMRoot(shadowRoot) {
      if (shadowRoot) {
        return this.getTextEditorElementRoot();
      } else {
        return this.getTextEditorElement();
      }
    }

    //    ##     ##  #######  ########  ######## ##
    //    ###   ### ##     ## ##     ## ##       ##
    //    #### #### ##     ## ##     ## ##       ##
    //    ## ### ## ##     ## ##     ## ######   ##
    //    ##     ## ##     ## ##     ## ##       ##
    //    ##     ## ##     ## ##     ## ##       ##
    //    ##     ##  #######  ########  ######## ########

    /**
     * Returns the Minimap for which this MinimapElement was created.
     *
     * @return {Minimap} this element's Minimap
     */
  }, {
    key: 'getModel',
    value: function getModel() {
      return this.minimap;
    }

    /**
     * Defines the Minimap model for this MinimapElement instance.
     *
     * @param  {Minimap} minimap the Minimap model for this instance.
     * @return {Minimap} this element's Minimap
     */
  }, {
    key: 'setModel',
    value: function setModel(minimap) {
      var _this6 = this;

      this.minimap = minimap;
      this.subscriptions.add(this.minimap.onDidChangeScrollTop(function () {
        _this6.requestUpdate();
      }));
      this.subscriptions.add(this.minimap.onDidChangeScrollLeft(function () {
        _this6.requestUpdate();
      }));
      this.subscriptions.add(this.minimap.onDidDestroy(function () {
        _this6.destroy();
      }));
      this.subscriptions.add(this.minimap.onDidChangeConfig(function () {
        if (_this6.attached) {
          return _this6.requestForcedUpdate();
        }
      }));

      this.subscriptions.add(this.minimap.onDidChangeStandAlone(function () {
        _this6.setStandAlone(_this6.minimap.isStandAlone());
        _this6.requestUpdate();
      }));

      this.subscriptions.add(this.minimap.onDidChange(function (change) {
        _this6.pendingChanges.push(change);
        _this6.requestUpdate();
      }));

      this.subscriptions.add(this.minimap.onDidChangeDecorationRange(function (change) {
        _this6.pendingDecorationChanges.push(change);
        _this6.requestUpdate();
      }));

      this.setStandAlone(this.minimap.isStandAlone());

      if (this.width != null && this.height != null) {
        this.minimap.setScreenHeightAndWidth(this.height, this.width);
      }

      return this.minimap;
    }

    /**
     * Sets the stand-alone mode for this MinimapElement.
     *
     * @param {boolean} standAlone the new mode for this MinimapElement
     */
  }, {
    key: 'setStandAlone',
    value: function setStandAlone(standAlone) {
      this.standAlone = standAlone;

      if (this.standAlone) {
        this.setAttribute('stand-alone', true);
        this.disposeScrollIndicator();
        this.disposeOpenQuickSettings();
        this.removeControls();
        this.removeVisibleArea();
      } else {
        this.removeAttribute('stand-alone');
        this.createVisibleArea();
        this.createControls();
        if (this.minimapScrollIndicator) {
          this.initializeScrollIndicator();
        }
        if (this.displayPluginsControls) {
          this.initializeOpenQuickSettings();
        }
      }
    }

    //    ##     ## ########  ########     ###    ######## ########
    //    ##     ## ##     ## ##     ##   ## ##      ##    ##
    //    ##     ## ##     ## ##     ##  ##   ##     ##    ##
    //    ##     ## ########  ##     ## ##     ##    ##    ######
    //    ##     ## ##        ##     ## #########    ##    ##
    //    ##     ## ##        ##     ## ##     ##    ##    ##
    //     #######  ##        ########  ##     ##    ##    ########

    /**
     * Requests an update to be performed on the next frame.
     */
  }, {
    key: 'requestUpdate',
    value: function requestUpdate() {
      var _this7 = this;

      if (this.frameRequested) {
        return;
      }

      this.frameRequested = true;
      requestAnimationFrame(function () {
        _this7.update();
        _this7.frameRequested = false;
      });
    }

    /**
     * Requests an update to be performed on the next frame that will completely
     * redraw the minimap.
     */
  }, {
    key: 'requestForcedUpdate',
    value: function requestForcedUpdate() {
      this.offscreenFirstRow = null;
      this.offscreenLastRow = null;
      this.requestUpdate();
    }

    /**
     * Performs the actual MinimapElement update.
     *
     * @access private
     */
  }, {
    key: 'update',
    value: function update() {
      if (!(this.attached && this.isVisible() && this.minimap)) {
        return;
      }
      var minimap = this.minimap;
      minimap.enableCache();
      var canvas = this.getFrontCanvas();

      var devicePixelRatio = this.minimap.getDevicePixelRatio();
      var visibleAreaLeft = minimap.getTextEditorScaledScrollLeft();
      var visibleAreaTop = minimap.getTextEditorScaledScrollTop() - minimap.getScrollTop();
      var visibleWidth = Math.min(canvas.width / devicePixelRatio, this.width);

      if (this.adjustToSoftWrap && this.flexBasis) {
        this.style.flexBasis = this.flexBasis + 'px';
      } else {
        this.style.flexBasis = null;
      }

      if (SPEC_MODE) {
        this.applyStyles(this.visibleArea, {
          width: visibleWidth + 'px',
          height: minimap.getTextEditorScaledHeight() + 'px',
          top: visibleAreaTop + 'px',
          left: visibleAreaLeft + 'px'
        });
      } else {
        this.applyStyles(this.visibleArea, {
          width: visibleWidth + 'px',
          height: minimap.getTextEditorScaledHeight() + 'px',
          transform: this.makeTranslate(visibleAreaLeft, visibleAreaTop)
        });
      }

      this.applyStyles(this.controls, { width: visibleWidth + 'px' });

      var canvasTop = minimap.getFirstVisibleScreenRow() * minimap.getLineHeight() - minimap.getScrollTop();

      var canvasTransform = this.makeTranslate(0, canvasTop);
      if (devicePixelRatio !== 1) {
        canvasTransform += ' ' + this.makeScale(1 / devicePixelRatio);
      }

      if (SPEC_MODE) {
        this.applyStyles(this.backLayer.canvas, { top: canvasTop + 'px' });
        this.applyStyles(this.tokensLayer.canvas, { top: canvasTop + 'px' });
        this.applyStyles(this.frontLayer.canvas, { top: canvasTop + 'px' });
      } else {
        this.applyStyles(this.backLayer.canvas, { transform: canvasTransform });
        this.applyStyles(this.tokensLayer.canvas, { transform: canvasTransform });
        this.applyStyles(this.frontLayer.canvas, { transform: canvasTransform });
      }

      if (this.minimapScrollIndicator && minimap.canScroll() && !this.scrollIndicator) {
        this.initializeScrollIndicator();
      }

      if (this.scrollIndicator != null) {
        var minimapScreenHeight = minimap.getScreenHeight();
        var indicatorHeight = minimapScreenHeight * (minimapScreenHeight / minimap.getHeight());
        var indicatorScroll = (minimapScreenHeight - indicatorHeight) * minimap.getCapedTextEditorScrollRatio();

        if (SPEC_MODE) {
          this.applyStyles(this.scrollIndicator, {
            height: indicatorHeight + 'px',
            top: indicatorScroll + 'px'
          });
        } else {
          this.applyStyles(this.scrollIndicator, {
            height: indicatorHeight + 'px',
            transform: this.makeTranslate(0, indicatorScroll)
          });
        }

        if (!minimap.canScroll()) {
          this.disposeScrollIndicator();
        }
      }

      this.updateCanvas();
      minimap.clearCache();
    }

    /**
     * Defines whether to render the code highlights or not.
     *
     * @param {Boolean} displayCodeHighlights whether to render the code
     *                                        highlights or not
     */
  }, {
    key: 'setDisplayCodeHighlights',
    value: function setDisplayCodeHighlights(displayCodeHighlights) {
      this.displayCodeHighlights = displayCodeHighlights;
      if (this.attached) {
        this.requestForcedUpdate();
      }
    }

    /**
     * Polling callback used to detect visibility and size changes.
     *
     * @access private
     */
  }, {
    key: 'pollDOM',
    value: function pollDOM() {
      var visibilityChanged = this.checkForVisibilityChange();
      if (this.isVisible()) {
        if (!this.wasVisible) {
          this.requestForcedUpdate();
        }

        this.measureHeightAndWidth(visibilityChanged, false);
      }
    }

    /**
     * A method that checks for visibility changes in the MinimapElement.
     * The method returns `true` when the visibility changed from visible to
     * hidden or from hidden to visible.
     *
     * @return {boolean} whether the visibility changed or not since the last call
     * @access private
     */
  }, {
    key: 'checkForVisibilityChange',
    value: function checkForVisibilityChange() {
      if (this.isVisible()) {
        if (this.wasVisible) {
          return false;
        } else {
          this.wasVisible = true;
          return this.wasVisible;
        }
      } else {
        if (this.wasVisible) {
          this.wasVisible = false;
          return true;
        } else {
          this.wasVisible = false;
          return this.wasVisible;
        }
      }
    }

    /**
     * A method used to measure the size of the MinimapElement and update internal
     * components based on the new size.
     *
     * @param  {boolean} visibilityChanged did the visibility changed since last
     *                                     measurement
     * @param  {[type]} [forceUpdate=true] forces the update even when no changes
     *                                     were detected
     * @access private
     */
  }, {
    key: 'measureHeightAndWidth',
    value: function measureHeightAndWidth(visibilityChanged) {
      var forceUpdate = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

      if (!this.minimap) {
        return;
      }

      var devicePixelRatio = this.minimap.getDevicePixelRatio();
      var wasResized = this.width !== this.clientWidth || this.height !== this.clientHeight;

      this.height = this.clientHeight;
      this.width = this.clientWidth;
      var canvasWidth = this.width;

      if (this.minimap != null) {
        this.minimap.setScreenHeightAndWidth(this.height, this.width);
      }

      if (wasResized || visibilityChanged || forceUpdate) {
        this.requestForcedUpdate();
      }

      if (!this.isVisible()) {
        return;
      }

      if (wasResized || forceUpdate) {
        if (this.adjustToSoftWrap) {
          var lineLength = atom.config.get('editor.preferredLineLength');
          var softWrap = atom.config.get('editor.softWrap');
          var softWrapAtPreferredLineLength = atom.config.get('editor.softWrapAtPreferredLineLength');
          var width = lineLength * this.minimap.getCharWidth();

          if (softWrap && softWrapAtPreferredLineLength && lineLength && width <= this.width) {
            this.flexBasis = width;
            canvasWidth = width;
          } else {
            delete this.flexBasis;
          }
        } else {
          delete this.flexBasis;
        }

        var canvas = this.getFrontCanvas();
        if (canvasWidth !== canvas.width || this.height !== canvas.height) {
          this.setCanvasesSize(canvasWidth * devicePixelRatio, (this.height + this.minimap.getLineHeight()) * devicePixelRatio);
        }
      }
    }

    //    ######## ##     ## ######## ##    ## ########  ######
    //    ##       ##     ## ##       ###   ##    ##    ##    ##
    //    ##       ##     ## ##       ####  ##    ##    ##
    //    ######   ##     ## ######   ## ## ##    ##     ######
    //    ##        ##   ##  ##       ##  ####    ##          ##
    //    ##         ## ##   ##       ##   ###    ##    ##    ##
    //    ########    ###    ######## ##    ##    ##     ######

    /**
     * Helper method to register config observers.
     *
     * @param  {Object} configs={} an object mapping the config name to observe
     *                             with the function to call back when a change
     *                             occurs
     * @access private
     */
  }, {
    key: 'observeConfig',
    value: function observeConfig() {
      var configs = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      for (var config in configs) {
        this.subscriptions.add(atom.config.observe(config, configs[config]));
      }
    }

    /**
     * Callback triggered when the mouse is pressed on the MinimapElement canvas.
     *
     * @param  {MouseEvent} e the mouse event object
     * @access private
     */
  }, {
    key: 'mousePressedOverCanvas',
    value: function mousePressedOverCanvas(e) {
      if (this.minimap.isStandAlone()) {
        return;
      }
      if (e.which === 1) {
        this.leftMousePressedOverCanvas(e);
      } else if (e.which === 2) {
        this.middleMousePressedOverCanvas(e);

        var _visibleArea$getBoundingClientRect = this.visibleArea.getBoundingClientRect();

        var _top2 = _visibleArea$getBoundingClientRect.top;
        var height = _visibleArea$getBoundingClientRect.height;

        this.startDrag({ which: 2, pageY: _top2 + height / 2 }); // ugly hack
      }
    }

    /**
     * Callback triggered when the mouse left button is pressed on the
     * MinimapElement canvas.
     *
     * @param  {MouseEvent} e the mouse event object
     * @param  {number} e.pageY the mouse y position in page
     * @param  {HTMLElement} e.target the source of the event
     * @access private
     */
  }, {
    key: 'leftMousePressedOverCanvas',
    value: function leftMousePressedOverCanvas(_ref) {
      var _this8 = this;

      var pageY = _ref.pageY;
      var target = _ref.target;

      var y = pageY - target.getBoundingClientRect().top;
      var row = Math.floor(y / this.minimap.getLineHeight()) + this.minimap.getFirstVisibleScreenRow();

      var textEditor = this.minimap.getTextEditor();

      var scrollTop = row * textEditor.getLineHeightInPixels() - this.minimap.getTextEditorHeight() / 2;

      if (atom.config.get('minimap.scrollAnimation')) {
        var from = this.minimap.getTextEditorScrollTop();
        var to = scrollTop;
        var step = function step(now) {
          return _this8.minimap.setTextEditorScrollTop(now);
        };
        var duration = atom.config.get('minimap.scrollAnimationDuration');
        this.animate({ from: from, to: to, duration: duration, step: step });
      } else {
        this.minimap.setTextEditorScrollTop(scrollTop);
      }
    }

    /**
     * Callback triggered when the mouse middle button is pressed on the
     * MinimapElement canvas.
     *
     * @param  {MouseEvent} e the mouse event object
     * @param  {number} e.pageY the mouse y position in page
     * @access private
     */
  }, {
    key: 'middleMousePressedOverCanvas',
    value: function middleMousePressedOverCanvas(_ref2) {
      var pageY = _ref2.pageY;

      var _getBoundingClientRect = this.getBoundingClientRect();

      var offsetTop = _getBoundingClientRect.top;

      var y = pageY - offsetTop - this.minimap.getTextEditorScaledHeight() / 2;

      var ratio = y / (this.minimap.getVisibleHeight() - this.minimap.getTextEditorScaledHeight());

      this.minimap.setTextEditorScrollTop(ratio * this.minimap.getTextEditorMaxScrollTop());
    }

    /**
     * A method that relays the `mousewheel` events received by the MinimapElement
     * to the `TextEditorElement`.
     *
     * @param  {MouseEvent} e the mouse event object
     * @access private
     */
  }, {
    key: 'relayMousewheelEvent',
    value: function relayMousewheelEvent(e) {
      this.getTextEditorElement().component.onMouseWheel(e);
    }

    //    ########    ####    ########
    //    ##     ##  ##  ##   ##     ##
    //    ##     ##   ####    ##     ##
    //    ##     ##  ####     ##     ##
    //    ##     ## ##  ## ## ##     ##
    //    ##     ## ##   ##   ##     ##
    //    ########   ####  ## ########

    /**
     * A method triggered when the mouse is pressed over the visible area that
     * starts the dragging gesture.
     *
     * @param  {MouseEvent} e the mouse event object
     * @access private
     */
  }, {
    key: 'startDrag',
    value: function startDrag(e) {
      var _this9 = this;

      var which = e.which;
      var pageY = e.pageY;

      if (!this.minimap) {
        return;
      }
      if (which !== 1 && which !== 2 && !(e.touches != null)) {
        return;
      }

      var _visibleArea$getBoundingClientRect2 = this.visibleArea.getBoundingClientRect();

      var top = _visibleArea$getBoundingClientRect2.top;

      var _getBoundingClientRect2 = this.getBoundingClientRect();

      var offsetTop = _getBoundingClientRect2.top;

      var dragOffset = pageY - top;

      var initial = { dragOffset: dragOffset, offsetTop: offsetTop };

      var mousemoveHandler = function mousemoveHandler(e) {
        return _this9.drag(e, initial);
      };
      var mouseupHandler = function mouseupHandler(e) {
        return _this9.endDrag(e, initial);
      };

      document.body.addEventListener('mousemove', mousemoveHandler);
      document.body.addEventListener('mouseup', mouseupHandler);
      document.body.addEventListener('mouseleave', mouseupHandler);

      document.body.addEventListener('touchmove', mousemoveHandler);
      document.body.addEventListener('touchend', mouseupHandler);

      this.dragSubscription = new _atom.Disposable(function () {
        document.body.removeEventListener('mousemove', mousemoveHandler);
        document.body.removeEventListener('mouseup', mouseupHandler);
        document.body.removeEventListener('mouseleave', mouseupHandler);

        document.body.removeEventListener('touchmove', mousemoveHandler);
        document.body.removeEventListener('touchend', mouseupHandler);
      });
    }

    /**
     * The method called during the drag gesture.
     *
     * @param  {MouseEvent} e the mouse event object
     * @param  {Object} initial
     * @param  {number} initial.dragOffset the mouse offset within the visible
     *                                     area
     * @param  {number} initial.offsetTop the MinimapElement offset at the moment
     *                                    of the drag start
     * @access private
     */
  }, {
    key: 'drag',
    value: function drag(e, initial) {
      if (!this.minimap) {
        return;
      }
      if (e.which !== 1 && e.which !== 2 && !(e.touches != null)) {
        return;
      }
      var y = e.pageY - initial.offsetTop - initial.dragOffset;

      var ratio = y / (this.minimap.getVisibleHeight() - this.minimap.getTextEditorScaledHeight());

      this.minimap.setTextEditorScrollTop(ratio * this.minimap.getTextEditorMaxScrollTop());
    }

    /**
     * The method that ends the drag gesture.
     *
     * @param  {MouseEvent} e the mouse event object
     * @param  {Object} initial
     * @param  {number} initial.dragOffset the mouse offset within the visible
     *                                     area
     * @param  {number} initial.offsetTop the MinimapElement offset at the moment
     *                                    of the drag start
     * @access private
     */
  }, {
    key: 'endDrag',
    value: function endDrag(e, initial) {
      if (!this.minimap) {
        return;
      }
      this.dragSubscription.dispose();
    }

    //     ######   ######   ######
    //    ##    ## ##    ## ##    ##
    //    ##       ##       ##
    //    ##        ######   ######
    //    ##             ##       ##
    //    ##    ## ##    ## ##    ##
    //     ######   ######   ######

    /**
     * Applies the passed-in styles properties to the specified element
     *
     * @param  {HTMLElement} element the element onto which apply the styles
     * @param  {Object} styles the styles to apply
     * @access private
     */
  }, {
    key: 'applyStyles',
    value: function applyStyles(element, styles) {
      if (!element) {
        return;
      }

      var cssText = '';
      for (var property in styles) {
        cssText += property + ': ' + styles[property] + '; ';
      }

      element.style.cssText = cssText;
    }

    /**
     * Returns a string with a CSS translation tranform value.
     *
     * @param  {number} [x = 0] the x offset of the translation
     * @param  {number} [y = 0] the y offset of the translation
     * @return {string} the CSS translation string
     * @access private
     */
  }, {
    key: 'makeTranslate',
    value: function makeTranslate() {
      var x = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
      var y = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

      if (this.useHardwareAcceleration) {
        return 'translate3d(' + x + 'px, ' + y + 'px, 0)';
      } else {
        return 'translate(' + x + 'px, ' + y + 'px)';
      }
    }

    /**
     * Returns a string with a CSS scaling tranform value.
     *
     * @param  {number} [x = 0] the x scaling factor
     * @param  {number} [y = 0] the y scaling factor
     * @return {string} the CSS scaling string
     * @access private
     */
  }, {
    key: 'makeScale',
    value: function makeScale() {
      var x = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
      var y = arguments.length <= 1 || arguments[1] === undefined ? x : arguments[1];
      return (function () {
        if (this.useHardwareAcceleration) {
          return 'scale3d(' + x + ', ' + y + ', 1)';
        } else {
          return 'scale(' + x + ', ' + y + ')';
        }
      }).apply(this, arguments);
    }

    /**
     * A method that return the current time as a Date.
     *
     * That method exist so that we can mock it in tests.
     *
     * @return {Date} the current time as Date
     * @access private
     */
  }, {
    key: 'getTime',
    value: function getTime() {
      return new Date();
    }

    /**
     * A method that mimic the jQuery `animate` method and used to animate the
     * scroll when clicking on the MinimapElement canvas.
     *
     * @param  {Object} param the animation data object
     * @param  {[type]} param.from the start value
     * @param  {[type]} param.to the end value
     * @param  {[type]} param.duration the animation duration
     * @param  {[type]} param.step the easing function for the animation
     * @access private
     */
  }, {
    key: 'animate',
    value: function animate(_ref3) {
      var _this10 = this;

      var from = _ref3.from;
      var to = _ref3.to;
      var duration = _ref3.duration;
      var step = _ref3.step;

      var progress = undefined;
      var start = this.getTime();

      var swing = function swing(progress) {
        return 0.5 - Math.cos(progress * Math.PI) / 2;
      };

      var update = function update() {
        var passed = _this10.getTime() - start;
        if (duration === 0) {
          progress = 1;
        } else {
          progress = passed / duration;
        }
        if (progress > 1) {
          progress = 1;
        }
        var delta = swing(progress);
        step(from + (to - from) * delta);

        if (progress < 1) {
          requestAnimationFrame(update);
        }
      };

      update();
    }
  }], [{
    key: 'registerViewProvider',

    /**
     * The method that registers the MinimapElement factory in the
     * `atom.views` registry with the Minimap model.
     */
    value: function registerViewProvider() {
      atom.views.addViewProvider(require('./minimap'), function (model) {
        var element = new MinimapElement();
        element.setModel(model);
        return element;
      });
    }
  }]);

  var _MinimapElement = MinimapElement;
  MinimapElement = (0, _decoratorsInclude2['default'])(_mixinsDomStylesReader2['default'], _mixinsCanvasDrawer2['default'], _atomUtils.EventsDelegation, _atomUtils.AncestorsMethods)(MinimapElement) || MinimapElement;
  MinimapElement = (0, _decoratorsElement2['default'])('atom-text-editor-minimap')(MinimapElement) || MinimapElement;
  return MinimapElement;
})();

exports['default'] = MinimapElement;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2dzbXlybmFpb3MvLmF0b20vcGFja2FnZXMvbWluaW1hcC9saWIvbWluaW1hcC1lbGVtZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7b0JBRThDLE1BQU07O3lCQUNILFlBQVk7O2lDQUN6QyxzQkFBc0I7Ozs7aUNBQ3RCLHNCQUFzQjs7OztxQ0FDZCw0QkFBNEI7Ozs7a0NBQy9CLHdCQUF3Qjs7OzsyQ0FDVCxrQ0FBa0M7Ozs7QUFSMUUsV0FBVyxDQUFBOztBQVVYLElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFrQmQsY0FBYztXQUFkLGNBQWM7Ozs7ZUFBZCxjQUFjOzs7Ozs7Ozs7Ozs7Ozs7O1dBMkJqQiwyQkFBRzs7Ozs7Ozs7QUFNakIsVUFBSSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUE7Ozs7QUFJeEIsVUFBSSxDQUFDLGFBQWEsR0FBRyxTQUFTLENBQUE7Ozs7QUFJOUIsVUFBSSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUE7Ozs7QUFJdEIsVUFBSSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUE7Ozs7Ozs7QUFPdkIsVUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTs7OztBQUk5QyxVQUFJLENBQUMsdUJBQXVCLEdBQUcsU0FBUyxDQUFBOzs7O0FBSXhDLFVBQUksQ0FBQyx5QkFBeUIsR0FBRyxTQUFTLENBQUE7Ozs7QUFJMUMsVUFBSSxDQUFDLGdCQUFnQixHQUFHLFNBQVMsQ0FBQTs7OztBQUlqQyxVQUFJLENBQUMsNEJBQTRCLEdBQUcsU0FBUyxDQUFBOzs7Ozs7O0FBTzdDLFVBQUksQ0FBQyxvQkFBb0IsR0FBRyxLQUFLLENBQUE7Ozs7QUFJakMsVUFBSSxDQUFDLHNCQUFzQixHQUFHLFNBQVMsQ0FBQTs7OztBQUl2QyxVQUFJLENBQUMsb0JBQW9CLEdBQUcsU0FBUyxDQUFBOzs7O0FBSXJDLFVBQUksQ0FBQyxzQkFBc0IsR0FBRyxTQUFT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LFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUN2QixlQUFPLE9BQU8sQ0FBQTtPQUNmLENBQUMsQ0FBQTtLQUNIOzs7d0JBWmtCLGNBQWM7QUFBZCxnQkFBYyxHQURsQyxrS0FBMEUsQ0FDdEQsY0FBYyxLQUFkLGNBQWM7QUFBZCxnQkFBYyxHQUZsQyxvQ0FBUSwwQkFBMEIsQ0FBQyxDQUVmLGNBQWMsS0FBZCxjQUFjO1NBQWQsY0FBYzs7O3FCQUFkLGNBQWMiLCJmaWxlIjoiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL2xpYi9taW5pbWFwLWVsZW1lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9IGZyb20gJ2F0b20nXG5pbXBvcnQge0V2ZW50c0RlbGVnYXRpb24sIEFuY2VzdG9yc01ldGhvZHN9IGZyb20gJ2F0b20tdXRpbHMnXG5pbXBvcnQgaW5jbHVkZSBmcm9tICcuL2RlY29yYXRvcnMvaW5jbHVkZSdcbmltcG9ydCBlbGVtZW50IGZyb20gJy4vZGVjb3JhdG9ycy9lbGVtZW50J1xuaW1wb3J0IERPTVN0eWxlc1JlYWRlciBmcm9tICcuL21peGlucy9kb20tc3R5bGVzLXJlYWRlcidcbmltcG9ydCBDYW52YXNEcmF3ZXIgZnJvbSAnLi9taXhpbnMvY2FudmFzLWRyYXdlcidcbmltcG9ydCBNaW5pbWFwUXVpY2tTZXR0aW5nc0VsZW1lbnQgZnJvbSAnLi9taW5pbWFwLXF1aWNrLXNldHRpbmdzLWVsZW1lbnQnXG5cbmNvbnN0IFNQRUNfTU9ERSA9IGF0b20uaW5TcGVjTW9kZSgpXG5cbi8qKlxuICogUHVibGljOiBUaGUgTWluaW1hcEVsZW1lbnQgaXMgdGhlIHZpZXcgbWVhbnQgdG8gcmVuZGVyIGEge0BsaW5rIE1pbmltYXB9XG4gKiBpbnN0YW5jZSBpbiB0aGUgRE9NLlxuICpcbiAqIFlvdSBjYW4gcmV0cmlldmUgdGhlIE1pbmltYXBFbGVtZW50IGFzc29jaWF0ZWQgdG8gYSBNaW5pbWFwXG4gKiB1c2luZyB0aGUgYGF0b20udmlld3MuZ2V0Vmlld2AgbWV0aG9kLlxuICpcbiAqIE5vdGUgdGhhdCBtb3N0IGludGVyYWN0aW9ucyB3aXRoIHRoZSBNaW5pbWFwIHBhY2thZ2UgaXMgZG9uZSB0aHJvdWdoIHRoZVxuICogTWluaW1hcCBtb2RlbCBzbyB5b3Ugc2hvdWxkIG5ldmVyIGhhdmUgdG8gYWNjZXNzIE1pbmltYXBFbGVtZW50XG4gKiBpbnN0YW5jZXMuXG4gKlxuICogQGV4YW1wbGVcbiAqIGxldCBtaW5pbWFwRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhtaW5pbWFwKVxuICovXG5AZWxlbWVudCgnYXRvbS10ZXh0LWVkaXRvci1taW5pbWFwJylcbkBpbmNsdWRlKERPTVN0eWxlc1JlYWRlciwgQ2FudmFzRHJhd2VyLCBFdmVudHNEZWxlZ2F0aW9uLCBBbmNlc3RvcnNNZXRob2RzKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWluaW1hcEVsZW1lbnQge1xuXG4gIC8qKlxuICAgKiBUaGUgbWV0aG9kIHRoYXQgcmVnaXN0ZXJzIHRoZSBNaW5pbWFwRWxlbWVudCBmYWN0b3J5IGluIHRoZVxuICAgKiBgYXRvbS52aWV3c2AgcmVnaXN0cnkgd2l0aCB0aGUgTWluaW1hcCBtb2RlbC5cbiAgICovXG4gIHN0YXRpYyByZWdpc3RlclZpZXdQcm92aWRlciAoKSB7XG4gICAgYXRvbS52aWV3cy5hZGRWaWV3UHJvdmlkZXIocmVxdWlyZSgnLi9taW5pbWFwJyksIGZ1bmN0aW9uIChtb2RlbCkge1xuICAgICAgbGV0IGVsZW1lbnQgPSBuZXcgTWluaW1hcEVsZW1lbnQoKVxuICAgICAgZWxlbWVudC5zZXRNb2RlbChtb2RlbClcbiAgICAgIHJldHVybiBlbGVtZW50XG4gICAgfSlcbiAgfVxuXG4gIC8vICAgICMjICAgICAjIyAgIyMjIyMjIyAgICMjIyMjIyMgICMjICAgICMjICAjIyMjIyNcbiAgLy8gICAgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAjIyAgIyMgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAgIyMgIyMgICMjICAgIyNcbiAgLy8gICAgIyMjIyMjIyMjICMjICAgICAjIyAjIyAgICAgIyMgIyMjIyMgICAgICMjIyMjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAjIyAgIyMgICAgICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAjIyAgICMjICAjIyAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgICMjIyMjIyMgICAjIyMjIyMjICAjIyAgICAjIyAgIyMjIyMjXG5cbiAgLyoqXG4gICAqIERPTSBjYWxsYmFjayBpbnZva2VkIHdoZW4gYSBuZXcgTWluaW1hcEVsZW1lbnQgaXMgY3JlYXRlZC5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBjcmVhdGVkQ2FsbGJhY2sgKCkge1xuICAgIC8vIENvcmUgcHJvcGVydGllc1xuXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5taW5pbWFwID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5lZGl0b3JFbGVtZW50ID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy53aWR0aCA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuaGVpZ2h0ID0gdW5kZWZpbmVkXG5cbiAgICAvLyBTdWJzY3JpcHRpb25zXG5cbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy52aXNpYmxlQXJlYVN1YnNjcmlwdGlvbiA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMucXVpY2tTZXR0aW5nc1N1YnNjcmlwdGlvbiA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuZHJhZ1N1YnNjcmlwdGlvbiA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMub3BlblF1aWNrU2V0dGluZ1N1YnNjcmlwdGlvbiA9IHVuZGVmaW5lZFxuXG4gICAgLy8gQ29uZmlnc1xuXG4gICAgLyoqXG4gICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAqL1xuICAgIHRoaXMuZGlzcGxheU1pbmltYXBPbkxlZnQgPSBmYWxzZVxuICAgIC8qKlxuICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgKi9cbiAgICB0aGlzLm1pbmltYXBTY3JvbGxJbmRpY2F0b3IgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICovXG4gICAgdGhpcy5kaXNwbGF5TWluaW1hcE9uTGVmdCA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgKi9cbiAgICB0aGlzLmRpc3BsYXlQbHVnaW5zQ29udHJvbHMgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICovXG4gICAgdGhpcy50ZXh0T3BhY2l0eSA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgKi9cbiAgICB0aGlzLmRpc3BsYXlDb2RlSGlnaGxpZ2h0cyA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgKi9cbiAgICB0aGlzLmFkanVzdFRvU29mdFdyYXAgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICovXG4gICAgdGhpcy51c2VIYXJkd2FyZUFjY2VsZXJhdGlvbiA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgKi9cbiAgICB0aGlzLmFic29sdXRlTW9kZSA9IHVuZGVmaW5lZFxuXG4gICAgLy8gRWxlbWVudHNcblxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuc2hhZG93Um9vdCA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMudmlzaWJsZUFyZWEgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLmNvbnRyb2xzID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5zY3JvbGxJbmRpY2F0b3IgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLm9wZW5RdWlja1NldHRpbmdzID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5xdWlja1NldHRpbmdzRWxlbWVudCA9IHVuZGVmaW5lZFxuXG4gICAgLy8gU3RhdGVzXG5cbiAgICAvKipcbiAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICovXG4gICAgdGhpcy5hdHRhY2hlZCA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgKi9cbiAgICB0aGlzLmF0dGFjaGVkVG9UZXh0RWRpdG9yID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAqL1xuICAgIHRoaXMuc3RhbmRBbG9uZSA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMud2FzVmlzaWJsZSA9IHVuZGVmaW5lZFxuXG4gICAgLy8gT3RoZXJcblxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMub2Zmc2NyZWVuRmlyc3RSb3cgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLm9mZnNjcmVlbkxhc3RSb3cgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLmZyYW1lUmVxdWVzdGVkID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5mbGV4QmFzaXMgPSB1bmRlZmluZWRcblxuICAgIHRoaXMuaW5pdGlhbGl6ZUNvbnRlbnQoKVxuXG4gICAgcmV0dXJuIHRoaXMub2JzZXJ2ZUNvbmZpZyh7XG4gICAgICAnbWluaW1hcC5kaXNwbGF5TWluaW1hcE9uTGVmdCc6IChkaXNwbGF5TWluaW1hcE9uTGVmdCkgPT4ge1xuICAgICAgICB0aGlzLmRpc3BsYXlNaW5pbWFwT25MZWZ0ID0gZGlzcGxheU1pbmltYXBPbkxlZnRcblxuICAgICAgICB0aGlzLnVwZGF0ZU1pbmltYXBGbGV4UG9zaXRpb24oKVxuICAgICAgfSxcblxuICAgICAgJ21pbmltYXAubWluaW1hcFNjcm9sbEluZGljYXRvcic6IChtaW5pbWFwU2Nyb2xsSW5kaWNhdG9yKSA9PiB7XG4gICAgICAgIHRoaXMubWluaW1hcFNjcm9sbEluZGljYXRvciA9IG1pbmltYXBTY3JvbGxJbmRpY2F0b3JcblxuICAgICAgICBpZiAodGhpcy5taW5pbWFwU2Nyb2xsSW5kaWNhdG9yICYmICEodGhpcy5zY3JvbGxJbmRpY2F0b3IgIT0gbnVsbCkgJiYgIXRoaXMuc3RhbmRBbG9uZSkge1xuICAgICAgICAgIHRoaXMuaW5pdGlhbGl6ZVNjcm9sbEluZGljYXRvcigpXG4gICAgICAgIH0gZWxzZSBpZiAoKHRoaXMuc2Nyb2xsSW5kaWNhdG9yICE9IG51bGwpKSB7XG4gICAgICAgICAgdGhpcy5kaXNwb3NlU2Nyb2xsSW5kaWNhdG9yKClcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmF0dGFjaGVkKSB7IHRoaXMucmVxdWVzdFVwZGF0ZSgpIH1cbiAgICAgIH0sXG5cbiAgICAgICdtaW5pbWFwLmRpc3BsYXlQbHVnaW5zQ29udHJvbHMnOiAoZGlzcGxheVBsdWdpbnNDb250cm9scykgPT4ge1xuICAgICAgICB0aGlzLmRpc3BsYXlQbHVnaW5zQ29udHJvbHMgPSBkaXNwbGF5UGx1Z2luc0NvbnRyb2xzXG5cbiAgICAgICAgaWYgKHRoaXMuZGlzcGxheVBsdWdpbnNDb250cm9scyAmJiAhKHRoaXMub3BlblF1aWNrU2V0dGluZ3MgIT0gbnVsbCkgJiYgIXRoaXMuc3RhbmRBbG9uZSkge1xuICAgICAgICAgIHRoaXMuaW5pdGlhbGl6ZU9wZW5RdWlja1NldHRpbmdzKClcbiAgICAgICAgfSBlbHNlIGlmICgodGhpcy5vcGVuUXVpY2tTZXR0aW5ncyAhPSBudWxsKSkge1xuICAgICAgICAgIHRoaXMuZGlzcG9zZU9wZW5RdWlja1NldHRpbmdzKClcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgJ21pbmltYXAudGV4dE9wYWNpdHknOiAodGV4dE9wYWNpdHkpID0+IHtcbiAgICAgICAgdGhpcy50ZXh0T3BhY2l0eSA9IHRleHRPcGFjaXR5XG5cbiAgICAgICAgaWYgKHRoaXMuYXR0YWNoZWQpIHsgdGhpcy5yZXF1ZXN0Rm9yY2VkVXBkYXRlKCkgfVxuICAgICAgfSxcblxuICAgICAgJ21pbmltYXAuZGlzcGxheUNvZGVIaWdobGlnaHRzJzogKGRpc3BsYXlDb2RlSGlnaGxpZ2h0cykgPT4ge1xuICAgICAgICB0aGlzLmRpc3BsYXlDb2RlSGlnaGxpZ2h0cyA9IGRpc3BsYXlDb2RlSGlnaGxpZ2h0c1xuXG4gICAgICAgIGlmICh0aGlzLmF0dGFjaGVkKSB7IHRoaXMucmVxdWVzdEZvcmNlZFVwZGF0ZSgpIH1cbiAgICAgIH0sXG5cbiAgICAgICdtaW5pbWFwLmFkanVzdE1pbmltYXBXaWR0aFRvU29mdFdyYXAnOiAoYWRqdXN0VG9Tb2Z0V3JhcCkgPT4ge1xuICAgICAgICB0aGlzLmFkanVzdFRvU29mdFdyYXAgPSBhZGp1c3RUb1NvZnRXcmFwXG5cbiAgICAgICAgaWYgKHRoaXMuYXR0YWNoZWQpIHsgdGhpcy5tZWFzdXJlSGVpZ2h0QW5kV2lkdGgoKSB9XG4gICAgICB9LFxuXG4gICAgICAnbWluaW1hcC51c2VIYXJkd2FyZUFjY2VsZXJhdGlvbic6ICh1c2VIYXJkd2FyZUFjY2VsZXJhdGlvbikgPT4ge1xuICAgICAgICB0aGlzLnVzZUhhcmR3YXJlQWNjZWxlcmF0aW9uID0gdXNlSGFyZHdhcmVBY2NlbGVyYXRpb25cblxuICAgICAgICBpZiAodGhpcy5hdHRhY2hlZCkgeyB0aGlzLnJlcXVlc3RVcGRhdGUoKSB9XG4gICAgICB9LFxuXG4gICAgICAnbWluaW1hcC5hYnNvbHV0ZU1vZGUnOiAoYWJzb2x1dGVNb2RlKSA9PiB7XG4gICAgICAgIHRoaXMuYWJzb2x1dGVNb2RlID0gYWJzb2x1dGVNb2RlXG5cbiAgICAgICAgcmV0dXJuIHRoaXMuY2xhc3NMaXN0LnRvZ2dsZSgnYWJzb2x1dGUnLCB0aGlzLmFic29sdXRlTW9kZSlcbiAgICAgIH0sXG5cbiAgICAgICdlZGl0b3IucHJlZmVycmVkTGluZUxlbmd0aCc6ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuYXR0YWNoZWQpIHsgdGhpcy5tZWFzdXJlSGVpZ2h0QW5kV2lkdGgoKSB9XG4gICAgICB9LFxuXG4gICAgICAnZWRpdG9yLnNvZnRXcmFwJzogKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5hdHRhY2hlZCkgeyB0aGlzLnJlcXVlc3RVcGRhdGUoKSB9XG4gICAgICB9LFxuXG4gICAgICAnZWRpdG9yLnNvZnRXcmFwQXRQcmVmZXJyZWRMaW5lTGVuZ3RoJzogKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5hdHRhY2hlZCkgeyB0aGlzLnJlcXVlc3RVcGRhdGUoKSB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBET00gY2FsbGJhY2sgaW52b2tlZCB3aGVuIGEgbmV3IE1pbmltYXBFbGVtZW50IGlzIGF0dGFjaGVkIHRvIHRoZSBET00uXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgYXR0YWNoZWRDYWxsYmFjayAoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLnZpZXdzLnBvbGxEb2N1bWVudCgoKSA9PiB7IHRoaXMucG9sbERPTSgpIH0pKVxuICAgIHRoaXMubWVhc3VyZUhlaWdodEFuZFdpZHRoKClcbiAgICB0aGlzLnVwZGF0ZU1pbmltYXBGbGV4UG9zaXRpb24oKVxuICAgIHRoaXMuYXR0YWNoZWQgPSB0cnVlXG4gICAgdGhpcy5hdHRhY2hlZFRvVGV4dEVkaXRvciA9IHRoaXMucGFyZW50Tm9kZSA9PT0gdGhpcy5nZXRUZXh0RWRpdG9yRWxlbWVudFJvb3QoKVxuXG4gICAgLypcbiAgICAgIFdlIHVzZSBgYXRvbS5zdHlsZXMub25EaWRBZGRTdHlsZUVsZW1lbnRgIGluc3RlYWQgb2ZcbiAgICAgIGBhdG9tLnRoZW1lcy5vbkRpZENoYW5nZUFjdGl2ZVRoZW1lc2AuXG4gICAgICBXaHk/IEN1cnJlbnRseSwgVGhlIHN0eWxlIGVsZW1lbnQgd2lsbCBiZSByZW1vdmVkIGZpcnN0LCBhbmQgdGhlbiByZS1hZGRlZFxuICAgICAgYW5kIHRoZSBgY2hhbmdlYCBldmVudCBoYXMgbm90IGJlIHRyaWdnZXJlZCBpbiB0aGUgcHJvY2Vzcy5cbiAgICAqL1xuICAgIHJldHVybiB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uc3R5bGVzLm9uRGlkQWRkU3R5bGVFbGVtZW50KCgpID0+IHtcbiAgICAgIHRoaXMuaW52YWxpZGF0ZURPTVN0eWxlc0NhY2hlKClcbiAgICAgIHRoaXMucmVxdWVzdEZvcmNlZFVwZGF0ZSgpXG4gICAgfSkpXG4gIH1cblxuICAvKipcbiAgICogRE9NIGNhbGxiYWNrIGludm9rZWQgd2hlbiBhIG5ldyBNaW5pbWFwRWxlbWVudCBpcyBkZXRhY2hlZCBmcm9tIHRoZSBET00uXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgZGV0YWNoZWRDYWxsYmFjayAoKSB7XG4gICAgdGhpcy5hdHRhY2hlZCA9IGZhbHNlXG4gIH1cblxuICAvLyAgICAgICAjIyMgICAgIyMjIyMjIyMgIyMjIyMjIyMgICAgIyMjICAgICAjIyMjIyMgICMjICAgICAjI1xuICAvLyAgICAgICMjICMjICAgICAgIyMgICAgICAgIyMgICAgICAjIyAjIyAgICMjICAgICMjICMjICAgICAjI1xuICAvLyAgICAgIyMgICAjIyAgICAgIyMgICAgICAgIyMgICAgICMjICAgIyMgICMjICAgICAgICMjICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgICAgIyMgICAgICAgIyMgICAgIyMgICAgICMjICMjICAgICAgICMjIyMjIyMjI1xuICAvLyAgICAjIyMjIyMjIyMgICAgIyMgICAgICAgIyMgICAgIyMjIyMjIyMjICMjICAgICAgICMjICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgICAgIyMgICAgICAgIyMgICAgIyMgICAgICMjICMjICAgICMjICMjICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgICAgIyMgICAgICAgIyMgICAgIyMgICAgICMjICAjIyMjIyMgICMjICAgICAjI1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIE1pbmltYXBFbGVtZW50IGlzIGN1cnJlbnRseSB2aXNpYmxlIG9uIHNjcmVlbiBvciBub3QuXG4gICAqXG4gICAqIFRoZSB2aXNpYmlsaXR5IG9mIHRoZSBtaW5pbWFwIGlzIGRlZmluZWQgYnkgdGVzdGluZyB0aGUgc2l6ZSBvZiB0aGUgb2Zmc2V0XG4gICAqIHdpZHRoIGFuZCBoZWlnaHQgb2YgdGhlIGVsZW1lbnQuXG4gICAqXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IHdoZXRoZXIgdGhlIE1pbmltYXBFbGVtZW50IGlzIGN1cnJlbnRseSB2aXNpYmxlIG9yIG5vdFxuICAgKi9cbiAgaXNWaXNpYmxlICgpIHsgcmV0dXJuIHRoaXMub2Zmc2V0V2lkdGggPiAwIHx8IHRoaXMub2Zmc2V0SGVpZ2h0ID4gMCB9XG5cbiAgLyoqXG4gICAqIEF0dGFjaGVzIHRoZSBNaW5pbWFwRWxlbWVudCB0byB0aGUgRE9NLlxuICAgKlxuICAgKiBUaGUgcG9zaXRpb24gYXQgd2hpY2ggdGhlIGVsZW1lbnQgaXMgYXR0YWNoZWQgaXMgZGVmaW5lZCBieSB0aGVcbiAgICogYGRpc3BsYXlNaW5pbWFwT25MZWZ0YCBzZXR0aW5nLlxuICAgKlxuICAgKiBAcGFyYW0gIHtIVE1MRWxlbWVudH0gW3BhcmVudF0gdGhlIERPTSBub2RlIHdoZXJlIGF0dGFjaGluZyB0aGUgbWluaW1hcFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudFxuICAgKi9cbiAgYXR0YWNoIChwYXJlbnQpIHtcbiAgICBpZiAodGhpcy5hdHRhY2hlZCkgeyByZXR1cm4gfVxuICAgIChwYXJlbnQgfHwgdGhpcy5nZXRUZXh0RWRpdG9yRWxlbWVudFJvb3QoKSkuYXBwZW5kQ2hpbGQodGhpcylcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRhY2hlcyB0aGUgTWluaW1hcEVsZW1lbnQgZnJvbSB0aGUgRE9NLlxuICAgKi9cbiAgZGV0YWNoICgpIHtcbiAgICBpZiAoIXRoaXMuYXR0YWNoZWQgfHwgdGhpcy5wYXJlbnROb2RlID09IG51bGwpIHsgcmV0dXJuIH1cbiAgICB0aGlzLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcylcbiAgfVxuXG4gIC8qKlxuICAgKiBUb2dnbGVzIHRoZSBtaW5pbWFwIGxlZnQvcmlnaHQgcG9zaXRpb24gYmFzZWQgb24gdGhlIHZhbHVlIG9mIHRoZVxuICAgKiBgZGlzcGxheU1pbmltYXBPbkxlZnRgIHNldHRpbmcuXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgdXBkYXRlTWluaW1hcEZsZXhQb3NpdGlvbiAoKSB7XG4gICAgdGhpcy5jbGFzc0xpc3QudG9nZ2xlKCdsZWZ0JywgdGhpcy5kaXNwbGF5TWluaW1hcE9uTGVmdClcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyB0aGlzIE1pbmltYXBFbGVtZW50XG4gICAqL1xuICBkZXN0cm95ICgpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgdGhpcy5kZXRhY2goKVxuICAgIHRoaXMubWluaW1hcCA9IG51bGxcbiAgfVxuXG4gIC8vICAgICAjIyMjIyMgICAjIyMjIyMjICAjIyAgICAjIyAjIyMjIyMjIyAjIyMjIyMjIyAjIyAgICAjIyAjIyMjIyMjI1xuICAvLyAgICAjIyAgICAjIyAjIyAgICAgIyMgIyMjICAgIyMgICAgIyMgICAgIyMgICAgICAgIyMjICAgIyMgICAgIyNcbiAgLy8gICAgIyMgICAgICAgIyMgICAgICMjICMjIyMgICMjICAgICMjICAgICMjICAgICAgICMjIyMgICMjICAgICMjXG4gIC8vICAgICMjICAgICAgICMjICAgICAjIyAjIyAjIyAjIyAgICAjIyAgICAjIyMjIyMgICAjIyAjIyAjIyAgICAjI1xuICAvLyAgICAjIyAgICAgICAjIyAgICAgIyMgIyMgICMjIyMgICAgIyMgICAgIyMgICAgICAgIyMgICMjIyMgICAgIyNcbiAgLy8gICAgIyMgICAgIyMgIyMgICAgICMjICMjICAgIyMjICAgICMjICAgICMjICAgICAgICMjICAgIyMjICAgICMjXG4gIC8vICAgICAjIyMjIyMgICAjIyMjIyMjICAjIyAgICAjIyAgICAjIyAgICAjIyMjIyMjIyAjIyAgICAjIyAgICAjI1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIHRoZSBjb250ZW50IG9mIHRoZSBNaW5pbWFwRWxlbWVudCBhbmQgYXR0YWNoZXMgdGhlIG1vdXNlIGNvbnRyb2xcbiAgICogZXZlbnQgbGlzdGVuZXJzLlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGluaXRpYWxpemVDb250ZW50ICgpIHtcbiAgICB0aGlzLmluaXRpYWxpemVDYW52YXMoKVxuXG4gICAgdGhpcy5zaGFkb3dSb290ID0gdGhpcy5jcmVhdGVTaGFkb3dSb290KClcbiAgICB0aGlzLmF0dGFjaENhbnZhc2VzKHRoaXMuc2hhZG93Um9vdClcblxuICAgIHRoaXMuY3JlYXRlVmlzaWJsZUFyZWEoKVxuICAgIHRoaXMuY3JlYXRlQ29udHJvbHMoKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLnN1YnNjcmliZVRvKHRoaXMsIHtcbiAgICAgICdtb3VzZXdoZWVsJzogKGUpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnN0YW5kQWxvbmUpIHsgdGhpcy5yZWxheU1vdXNld2hlZWxFdmVudChlKSB9XG4gICAgICB9XG4gICAgfSkpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuc3Vic2NyaWJlVG8odGhpcy5nZXRGcm9udENhbnZhcygpLCB7XG4gICAgICAnbW91c2Vkb3duJzogKGUpID0+IHsgdGhpcy5tb3VzZVByZXNzZWRPdmVyQ2FudmFzKGUpIH1cbiAgICB9KSlcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgdmlzaWJsZSBhcmVhIGRpdi5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBjcmVhdGVWaXNpYmxlQXJlYSAoKSB7XG4gICAgaWYgKHRoaXMudmlzaWJsZUFyZWEpIHsgcmV0dXJuIH1cblxuICAgIHRoaXMudmlzaWJsZUFyZWEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHRoaXMudmlzaWJsZUFyZWEuY2xhc3NMaXN0LmFkZCgnbWluaW1hcC12aXNpYmxlLWFyZWEnKVxuICAgIHRoaXMuc2hhZG93Um9vdC5hcHBlbmRDaGlsZCh0aGlzLnZpc2libGVBcmVhKVxuICAgIHRoaXMudmlzaWJsZUFyZWFTdWJzY3JpcHRpb24gPSB0aGlzLnN1YnNjcmliZVRvKHRoaXMudmlzaWJsZUFyZWEsIHtcbiAgICAgICdtb3VzZWRvd24nOiAoZSkgPT4geyB0aGlzLnN0YXJ0RHJhZyhlKSB9LFxuICAgICAgJ3RvdWNoc3RhcnQnOiAoZSkgPT4geyB0aGlzLnN0YXJ0RHJhZyhlKSB9XG4gICAgfSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy52aXNpYmxlQXJlYVN1YnNjcmlwdGlvbilcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIHRoZSB2aXNpYmxlIGFyZWEgZGl2LlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIHJlbW92ZVZpc2libGVBcmVhICgpIHtcbiAgICBpZiAoIXRoaXMudmlzaWJsZUFyZWEpIHsgcmV0dXJuIH1cblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5yZW1vdmUodGhpcy52aXNpYmxlQXJlYVN1YnNjcmlwdGlvbilcbiAgICB0aGlzLnZpc2libGVBcmVhU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxuICAgIHRoaXMuc2hhZG93Um9vdC5yZW1vdmVDaGlsZCh0aGlzLnZpc2libGVBcmVhKVxuICAgIGRlbGV0ZSB0aGlzLnZpc2libGVBcmVhXG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyB0aGUgY29udHJvbHMgY29udGFpbmVyIGRpdi5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBjcmVhdGVDb250cm9scyAoKSB7XG4gICAgaWYgKHRoaXMuY29udHJvbHMgfHwgdGhpcy5zdGFuZEFsb25lKSB7IHJldHVybiB9XG5cbiAgICB0aGlzLmNvbnRyb2xzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICB0aGlzLmNvbnRyb2xzLmNsYXNzTGlzdC5hZGQoJ21pbmltYXAtY29udHJvbHMnKVxuICAgIHRoaXMuc2hhZG93Um9vdC5hcHBlbmRDaGlsZCh0aGlzLmNvbnRyb2xzKVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgdGhlIGNvbnRyb2xzIGNvbnRhaW5lciBkaXYuXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgcmVtb3ZlQ29udHJvbHMgKCkge1xuICAgIGlmICghdGhpcy5jb250cm9scykgeyByZXR1cm4gfVxuXG4gICAgdGhpcy5zaGFkb3dSb290LnJlbW92ZUNoaWxkKHRoaXMuY29udHJvbHMpXG4gICAgZGVsZXRlIHRoaXMuY29udHJvbHNcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgc2Nyb2xsIGluZGljYXRvciBkaXYgd2hlbiB0aGUgYG1pbmltYXBTY3JvbGxJbmRpY2F0b3JgXG4gICAqIHNldHRpbmdzIGlzIGVuYWJsZWQuXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgaW5pdGlhbGl6ZVNjcm9sbEluZGljYXRvciAoKSB7XG4gICAgaWYgKHRoaXMuc2Nyb2xsSW5kaWNhdG9yIHx8IHRoaXMuc3RhbmRBbG9uZSkgeyByZXR1cm4gfVxuXG4gICAgdGhpcy5zY3JvbGxJbmRpY2F0b3IgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHRoaXMuc2Nyb2xsSW5kaWNhdG9yLmNsYXNzTGlzdC5hZGQoJ21pbmltYXAtc2Nyb2xsLWluZGljYXRvcicpXG4gICAgdGhpcy5jb250cm9scy5hcHBlbmRDaGlsZCh0aGlzLnNjcm9sbEluZGljYXRvcilcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwb3NlcyB0aGUgc2Nyb2xsIGluZGljYXRvciBkaXYgd2hlbiB0aGUgYG1pbmltYXBTY3JvbGxJbmRpY2F0b3JgXG4gICAqIHNldHRpbmdzIGlzIGRpc2FibGVkLlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGRpc3Bvc2VTY3JvbGxJbmRpY2F0b3IgKCkge1xuICAgIGlmICghdGhpcy5zY3JvbGxJbmRpY2F0b3IpIHsgcmV0dXJuIH1cblxuICAgIHRoaXMuY29udHJvbHMucmVtb3ZlQ2hpbGQodGhpcy5zY3JvbGxJbmRpY2F0b3IpXG4gICAgZGVsZXRlIHRoaXMuc2Nyb2xsSW5kaWNhdG9yXG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIHF1aWNrIHNldHRpbmdzIG9wZW5lbmVyIGRpdiB3aGVuIHRoZVxuICAgKiBgZGlzcGxheVBsdWdpbnNDb250cm9sc2Agc2V0dGluZyBpcyBlbmFibGVkLlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGluaXRpYWxpemVPcGVuUXVpY2tTZXR0aW5ncyAoKSB7XG4gICAgaWYgKHRoaXMub3BlblF1aWNrU2V0dGluZ3MgfHwgdGhpcy5zdGFuZEFsb25lKSB7IHJldHVybiB9XG5cbiAgICB0aGlzLm9wZW5RdWlja1NldHRpbmdzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICB0aGlzLm9wZW5RdWlja1NldHRpbmdzLmNsYXNzTGlzdC5hZGQoJ29wZW4tbWluaW1hcC1xdWljay1zZXR0aW5ncycpXG4gICAgdGhpcy5jb250cm9scy5hcHBlbmRDaGlsZCh0aGlzLm9wZW5RdWlja1NldHRpbmdzKVxuXG4gICAgdGhpcy5vcGVuUXVpY2tTZXR0aW5nU3Vic2NyaXB0aW9uID0gdGhpcy5zdWJzY3JpYmVUbyh0aGlzLm9wZW5RdWlja1NldHRpbmdzLCB7XG4gICAgICAnbW91c2Vkb3duJzogKGUpID0+IHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcblxuICAgICAgICBpZiAoKHRoaXMucXVpY2tTZXR0aW5nc0VsZW1lbnQgIT0gbnVsbCkpIHtcbiAgICAgICAgICB0aGlzLnF1aWNrU2V0dGluZ3NFbGVtZW50LmRlc3Ryb3koKVxuICAgICAgICAgIHRoaXMucXVpY2tTZXR0aW5nc1N1YnNjcmlwdGlvbi5kaXNwb3NlKClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnF1aWNrU2V0dGluZ3NFbGVtZW50ID0gbmV3IE1pbmltYXBRdWlja1NldHRpbmdzRWxlbWVudCgpXG4gICAgICAgICAgdGhpcy5xdWlja1NldHRpbmdzRWxlbWVudC5zZXRNb2RlbCh0aGlzKVxuICAgICAgICAgIHRoaXMucXVpY2tTZXR0aW5nc1N1YnNjcmlwdGlvbiA9IHRoaXMucXVpY2tTZXR0aW5nc0VsZW1lbnQub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucXVpY2tTZXR0aW5nc0VsZW1lbnQgPSBudWxsXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGxldCB7dG9wLCBsZWZ0LCByaWdodH0gPSB0aGlzLmdldEZyb250Q2FudmFzKCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICB0aGlzLnF1aWNrU2V0dGluZ3NFbGVtZW50LnN0eWxlLnRvcCA9IHRvcCArICdweCdcbiAgICAgICAgICB0aGlzLnF1aWNrU2V0dGluZ3NFbGVtZW50LmF0dGFjaCgpXG5cbiAgICAgICAgICBpZiAodGhpcy5kaXNwbGF5TWluaW1hcE9uTGVmdCkge1xuICAgICAgICAgICAgdGhpcy5xdWlja1NldHRpbmdzRWxlbWVudC5zdHlsZS5sZWZ0ID0gKHJpZ2h0KSArICdweCdcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5xdWlja1NldHRpbmdzRWxlbWVudC5zdHlsZS5sZWZ0ID0gKGxlZnQgLSB0aGlzLnF1aWNrU2V0dGluZ3NFbGVtZW50LmNsaWVudFdpZHRoKSArICdweCdcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIERpc3Bvc2VzIHRoZSBxdWljayBzZXR0aW5ncyBvcGVuZW5lciBkaXYgd2hlbiB0aGUgYGRpc3BsYXlQbHVnaW5zQ29udHJvbHNgXG4gICAqIHNldHRpbmcgaXMgZGlzYWJsZWQuXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgZGlzcG9zZU9wZW5RdWlja1NldHRpbmdzICgpIHtcbiAgICBpZiAoIXRoaXMub3BlblF1aWNrU2V0dGluZ3MpIHsgcmV0dXJuIH1cblxuICAgIHRoaXMuY29udHJvbHMucmVtb3ZlQ2hpbGQodGhpcy5vcGVuUXVpY2tTZXR0aW5ncylcbiAgICB0aGlzLm9wZW5RdWlja1NldHRpbmdTdWJzY3JpcHRpb24uZGlzcG9zZSgpXG4gICAgZGVsZXRlIHRoaXMub3BlblF1aWNrU2V0dGluZ3NcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB0YXJnZXQgYFRleHRFZGl0b3JgIG9mIHRoZSBNaW5pbWFwLlxuICAgKlxuICAgKiBAcmV0dXJuIHtUZXh0RWRpdG9yfSB0aGUgbWluaW1hcCdzIHRleHQgZWRpdG9yXG4gICAqL1xuICBnZXRUZXh0RWRpdG9yICgpIHsgcmV0dXJuIHRoaXMubWluaW1hcC5nZXRUZXh0RWRpdG9yKCkgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBgVGV4dEVkaXRvckVsZW1lbnRgIGZvciB0aGUgTWluaW1hcCdzIGBUZXh0RWRpdG9yYC5cbiAgICpcbiAgICogQHJldHVybiB7VGV4dEVkaXRvckVsZW1lbnR9IHRoZSBtaW5pbWFwJ3MgdGV4dCBlZGl0b3IgZWxlbWVudFxuICAgKi9cbiAgZ2V0VGV4dEVkaXRvckVsZW1lbnQgKCkge1xuICAgIGlmICh0aGlzLmVkaXRvckVsZW1lbnQpIHsgcmV0dXJuIHRoaXMuZWRpdG9yRWxlbWVudCB9XG5cbiAgICB0aGlzLmVkaXRvckVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcodGhpcy5nZXRUZXh0RWRpdG9yKCkpXG4gICAgcmV0dXJuIHRoaXMuZWRpdG9yRWxlbWVudFxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHJvb3Qgb2YgdGhlIGBUZXh0RWRpdG9yRWxlbWVudGAgY29udGVudC5cbiAgICpcbiAgICogVGhpcyBtZXRob2QgaXMgbW9zdGx5IHVzZWQgdG8gZW5zdXJlIGNvbXBhdGliaWxpdHkgd2l0aCB0aGUgYHNoYWRvd0RvbWBcbiAgICogc2V0dGluZy5cbiAgICpcbiAgICogQHJldHVybiB7SFRNTEVsZW1lbnR9IHRoZSByb290IG9mIHRoZSBgVGV4dEVkaXRvckVsZW1lbnRgIGNvbnRlbnRcbiAgICovXG4gIGdldFRleHRFZGl0b3JFbGVtZW50Um9vdCAoKSB7XG4gICAgbGV0IGVkaXRvckVsZW1lbnQgPSB0aGlzLmdldFRleHRFZGl0b3JFbGVtZW50KClcblxuICAgIGlmIChlZGl0b3JFbGVtZW50LnNoYWRvd1Jvb3QpIHtcbiAgICAgIHJldHVybiBlZGl0b3JFbGVtZW50LnNoYWRvd1Jvb3RcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGVkaXRvckVsZW1lbnRcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcm9vdCB3aGVyZSB0byBpbmplY3QgdGhlIGR1bW15IG5vZGUgdXNlZCB0byByZWFkIERPTSBzdHlsZXMuXG4gICAqXG4gICAqIEBwYXJhbSAge2Jvb2xlYW59IHNoYWRvd1Jvb3Qgd2hldGhlciB0byB1c2UgdGhlIHRleHQgZWRpdG9yIHNoYWRvdyBET01cbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvciBub3RcbiAgICogQHJldHVybiB7SFRNTEVsZW1lbnR9IHRoZSByb290IG5vZGUgd2hlcmUgYXBwZW5kaW5nIHRoZSBkdW1teSBub2RlXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgZ2V0RHVtbXlET01Sb290IChzaGFkb3dSb290KSB7XG4gICAgaWYgKHNoYWRvd1Jvb3QpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldFRleHRFZGl0b3JFbGVtZW50Um9vdCgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmdldFRleHRFZGl0b3JFbGVtZW50KClcbiAgICB9XG4gIH1cblxuICAvLyAgICAjIyAgICAgIyMgICMjIyMjIyMgICMjIyMjIyMjICAjIyMjIyMjIyAjI1xuICAvLyAgICAjIyMgICAjIyMgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAgICAjI1xuICAvLyAgICAjIyMjICMjIyMgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAgICAjI1xuICAvLyAgICAjIyAjIyMgIyMgIyMgICAgICMjICMjICAgICAjIyAjIyMjIyMgICAjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgICMjIyMjIyMgICMjIyMjIyMjICAjIyMjIyMjIyAjIyMjIyMjI1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBNaW5pbWFwIGZvciB3aGljaCB0aGlzIE1pbmltYXBFbGVtZW50IHdhcyBjcmVhdGVkLlxuICAgKlxuICAgKiBAcmV0dXJuIHtNaW5pbWFwfSB0aGlzIGVsZW1lbnQncyBNaW5pbWFwXG4gICAqL1xuICBnZXRNb2RlbCAoKSB7IHJldHVybiB0aGlzLm1pbmltYXAgfVxuXG4gIC8qKlxuICAgKiBEZWZpbmVzIHRoZSBNaW5pbWFwIG1vZGVsIGZvciB0aGlzIE1pbmltYXBFbGVtZW50IGluc3RhbmNlLlxuICAgKlxuICAgKiBAcGFyYW0gIHtNaW5pbWFwfSBtaW5pbWFwIHRoZSBNaW5pbWFwIG1vZGVsIGZvciB0aGlzIGluc3RhbmNlLlxuICAgKiBAcmV0dXJuIHtNaW5pbWFwfSB0aGlzIGVsZW1lbnQncyBNaW5pbWFwXG4gICAqL1xuICBzZXRNb2RlbCAobWluaW1hcCkge1xuICAgIHRoaXMubWluaW1hcCA9IG1pbmltYXBcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMubWluaW1hcC5vbkRpZENoYW5nZVNjcm9sbFRvcCgoKSA9PiB7XG4gICAgICB0aGlzLnJlcXVlc3RVcGRhdGUoKVxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5taW5pbWFwLm9uRGlkQ2hhbmdlU2Nyb2xsTGVmdCgoKSA9PiB7XG4gICAgICB0aGlzLnJlcXVlc3RVcGRhdGUoKVxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5taW5pbWFwLm9uRGlkRGVzdHJveSgoKSA9PiB7XG4gICAgICB0aGlzLmRlc3Ryb3koKVxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5taW5pbWFwLm9uRGlkQ2hhbmdlQ29uZmlnKCgpID0+IHtcbiAgICAgIGlmICh0aGlzLmF0dGFjaGVkKSB7IHJldHVybiB0aGlzLnJlcXVlc3RGb3JjZWRVcGRhdGUoKSB9XG4gICAgfSkpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMubWluaW1hcC5vbkRpZENoYW5nZVN0YW5kQWxvbmUoKCkgPT4ge1xuICAgICAgdGhpcy5zZXRTdGFuZEFsb25lKHRoaXMubWluaW1hcC5pc1N0YW5kQWxvbmUoKSlcbiAgICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpXG4gICAgfSkpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMubWluaW1hcC5vbkRpZENoYW5nZSgoY2hhbmdlKSA9PiB7XG4gICAgICB0aGlzLnBlbmRpbmdDaGFuZ2VzLnB1c2goY2hhbmdlKVxuICAgICAgdGhpcy5yZXF1ZXN0VXBkYXRlKClcbiAgICB9KSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5taW5pbWFwLm9uRGlkQ2hhbmdlRGVjb3JhdGlvblJhbmdlKChjaGFuZ2UpID0+IHtcbiAgICAgIHRoaXMucGVuZGluZ0RlY29yYXRpb25DaGFuZ2VzLnB1c2goY2hhbmdlKVxuICAgICAgdGhpcy5yZXF1ZXN0VXBkYXRlKClcbiAgICB9KSlcblxuICAgIHRoaXMuc2V0U3RhbmRBbG9uZSh0aGlzLm1pbmltYXAuaXNTdGFuZEFsb25lKCkpXG5cbiAgICBpZiAodGhpcy53aWR0aCAhPSBudWxsICYmIHRoaXMuaGVpZ2h0ICE9IG51bGwpIHtcbiAgICAgIHRoaXMubWluaW1hcC5zZXRTY3JlZW5IZWlnaHRBbmRXaWR0aCh0aGlzLmhlaWdodCwgdGhpcy53aWR0aClcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5taW5pbWFwXG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgc3RhbmQtYWxvbmUgbW9kZSBmb3IgdGhpcyBNaW5pbWFwRWxlbWVudC5cbiAgICpcbiAgICogQHBhcmFtIHtib29sZWFufSBzdGFuZEFsb25lIHRoZSBuZXcgbW9kZSBmb3IgdGhpcyBNaW5pbWFwRWxlbWVudFxuICAgKi9cbiAgc2V0U3RhbmRBbG9uZSAoc3RhbmRBbG9uZSkge1xuICAgIHRoaXMuc3RhbmRBbG9uZSA9IHN0YW5kQWxvbmVcblxuICAgIGlmICh0aGlzLnN0YW5kQWxvbmUpIHtcbiAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdzdGFuZC1hbG9uZScsIHRydWUpXG4gICAgICB0aGlzLmRpc3Bvc2VTY3JvbGxJbmRpY2F0b3IoKVxuICAgICAgdGhpcy5kaXNwb3NlT3BlblF1aWNrU2V0dGluZ3MoKVxuICAgICAgdGhpcy5yZW1vdmVDb250cm9scygpXG4gICAgICB0aGlzLnJlbW92ZVZpc2libGVBcmVhKClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGUoJ3N0YW5kLWFsb25lJylcbiAgICAgIHRoaXMuY3JlYXRlVmlzaWJsZUFyZWEoKVxuICAgICAgdGhpcy5jcmVhdGVDb250cm9scygpXG4gICAgICBpZiAodGhpcy5taW5pbWFwU2Nyb2xsSW5kaWNhdG9yKSB7IHRoaXMuaW5pdGlhbGl6ZVNjcm9sbEluZGljYXRvcigpIH1cbiAgICAgIGlmICh0aGlzLmRpc3BsYXlQbHVnaW5zQ29udHJvbHMpIHsgdGhpcy5pbml0aWFsaXplT3BlblF1aWNrU2V0dGluZ3MoKSB9XG4gICAgfVxuICB9XG5cbiAgLy8gICAgIyMgICAgICMjICMjIyMjIyMjICAjIyMjIyMjIyAgICAgIyMjICAgICMjIyMjIyMjICMjIyMjIyMjXG4gIC8vICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgICMjICAgIyMgIyMgICAgICAjIyAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAgIyMgICAjIyAgICAgIyMgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICMjIyMjIyMjICAjIyAgICAgIyMgIyMgICAgICMjICAgICMjICAgICMjIyMjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICAgICMjICAgICAjIyAjIyMjIyMjIyMgICAgIyMgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICMjICAgICAgICAjIyAgICAgIyMgIyMgICAgICMjICAgICMjICAgICMjXG4gIC8vICAgICAjIyMjIyMjICAjIyAgICAgICAgIyMjIyMjIyMgICMjICAgICAjIyAgICAjIyAgICAjIyMjIyMjI1xuXG4gIC8qKlxuICAgKiBSZXF1ZXN0cyBhbiB1cGRhdGUgdG8gYmUgcGVyZm9ybWVkIG9uIHRoZSBuZXh0IGZyYW1lLlxuICAgKi9cbiAgcmVxdWVzdFVwZGF0ZSAoKSB7XG4gICAgaWYgKHRoaXMuZnJhbWVSZXF1ZXN0ZWQpIHsgcmV0dXJuIH1cblxuICAgIHRoaXMuZnJhbWVSZXF1ZXN0ZWQgPSB0cnVlXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgIHRoaXMudXBkYXRlKClcbiAgICAgIHRoaXMuZnJhbWVSZXF1ZXN0ZWQgPSBmYWxzZVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogUmVxdWVzdHMgYW4gdXBkYXRlIHRvIGJlIHBlcmZvcm1lZCBvbiB0aGUgbmV4dCBmcmFtZSB0aGF0IHdpbGwgY29tcGxldGVseVxuICAgKiByZWRyYXcgdGhlIG1pbmltYXAuXG4gICAqL1xuICByZXF1ZXN0Rm9yY2VkVXBkYXRlICgpIHtcbiAgICB0aGlzLm9mZnNjcmVlbkZpcnN0Um93ID0gbnVsbFxuICAgIHRoaXMub2Zmc2NyZWVuTGFzdFJvdyA9IG51bGxcbiAgICB0aGlzLnJlcXVlc3RVcGRhdGUoKVxuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm1zIHRoZSBhY3R1YWwgTWluaW1hcEVsZW1lbnQgdXBkYXRlLlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIHVwZGF0ZSAoKSB7XG4gICAgaWYgKCEodGhpcy5hdHRhY2hlZCAmJiB0aGlzLmlzVmlzaWJsZSgpICYmIHRoaXMubWluaW1hcCkpIHsgcmV0dXJuIH1cbiAgICBsZXQgbWluaW1hcCA9IHRoaXMubWluaW1hcFxuICAgIG1pbmltYXAuZW5hYmxlQ2FjaGUoKVxuICAgIGxldCBjYW52YXMgPSB0aGlzLmdldEZyb250Q2FudmFzKClcblxuICAgIGNvbnN0IGRldmljZVBpeGVsUmF0aW8gPSB0aGlzLm1pbmltYXAuZ2V0RGV2aWNlUGl4ZWxSYXRpbygpXG4gICAgbGV0IHZpc2libGVBcmVhTGVmdCA9IG1pbmltYXAuZ2V0VGV4dEVkaXRvclNjYWxlZFNjcm9sbExlZnQoKVxuICAgIGxldCB2aXNpYmxlQXJlYVRvcCA9IG1pbmltYXAuZ2V0VGV4dEVkaXRvclNjYWxlZFNjcm9sbFRvcCgpIC0gbWluaW1hcC5nZXRTY3JvbGxUb3AoKVxuICAgIGxldCB2aXNpYmxlV2lkdGggPSBNYXRoLm1pbihjYW52YXMud2lkdGggLyBkZXZpY2VQaXhlbFJhdGlvLCB0aGlzLndpZHRoKVxuXG4gICAgaWYgKHRoaXMuYWRqdXN0VG9Tb2Z0V3JhcCAmJiB0aGlzLmZsZXhCYXNpcykge1xuICAgICAgdGhpcy5zdHlsZS5mbGV4QmFzaXMgPSB0aGlzLmZsZXhCYXNpcyArICdweCdcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zdHlsZS5mbGV4QmFzaXMgPSBudWxsXG4gICAgfVxuXG4gICAgaWYgKFNQRUNfTU9ERSkge1xuICAgICAgdGhpcy5hcHBseVN0eWxlcyh0aGlzLnZpc2libGVBcmVhLCB7XG4gICAgICAgIHdpZHRoOiB2aXNpYmxlV2lkdGggKyAncHgnLFxuICAgICAgICBoZWlnaHQ6IG1pbmltYXAuZ2V0VGV4dEVkaXRvclNjYWxlZEhlaWdodCgpICsgJ3B4JyxcbiAgICAgICAgdG9wOiB2aXNpYmxlQXJlYVRvcCArICdweCcsXG4gICAgICAgIGxlZnQ6IHZpc2libGVBcmVhTGVmdCArICdweCdcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYXBwbHlTdHlsZXModGhpcy52aXNpYmxlQXJlYSwge1xuICAgICAgICB3aWR0aDogdmlzaWJsZVdpZHRoICsgJ3B4JyxcbiAgICAgICAgaGVpZ2h0OiBtaW5pbWFwLmdldFRleHRFZGl0b3JTY2FsZWRIZWlnaHQoKSArICdweCcsXG4gICAgICAgIHRyYW5zZm9ybTogdGhpcy5tYWtlVHJhbnNsYXRlKHZpc2libGVBcmVhTGVmdCwgdmlzaWJsZUFyZWFUb3ApXG4gICAgICB9KVxuICAgIH1cblxuICAgIHRoaXMuYXBwbHlTdHlsZXModGhpcy5jb250cm9scywge3dpZHRoOiB2aXNpYmxlV2lkdGggKyAncHgnfSlcblxuICAgIGxldCBjYW52YXNUb3AgPSBtaW5pbWFwLmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpICogbWluaW1hcC5nZXRMaW5lSGVpZ2h0KCkgLSBtaW5pbWFwLmdldFNjcm9sbFRvcCgpXG5cbiAgICBsZXQgY2FudmFzVHJhbnNmb3JtID0gdGhpcy5tYWtlVHJhbnNsYXRlKDAsIGNhbnZhc1RvcClcbiAgICBpZiAoZGV2aWNlUGl4ZWxSYXRpbyAhPT0gMSkge1xuICAgICAgY2FudmFzVHJhbnNmb3JtICs9ICcgJyArIHRoaXMubWFrZVNjYWxlKDEgLyBkZXZpY2VQaXhlbFJhdGlvKVxuICAgIH1cblxuICAgIGlmIChTUEVDX01PREUpIHtcbiAgICAgIHRoaXMuYXBwbHlTdHlsZXModGhpcy5iYWNrTGF5ZXIuY2FudmFzLCB7dG9wOiBjYW52YXNUb3AgKyAncHgnfSlcbiAgICAgIHRoaXMuYXBwbHlTdHlsZXModGhpcy50b2tlbnNMYXllci5jYW52YXMsIHt0b3A6IGNhbnZhc1RvcCArICdweCd9KVxuICAgICAgdGhpcy5hcHBseVN0eWxlcyh0aGlzLmZyb250TGF5ZXIuY2FudmFzLCB7dG9wOiBjYW52YXNUb3AgKyAncHgnfSlcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5hcHBseVN0eWxlcyh0aGlzLmJhY2tMYXllci5jYW52YXMsIHt0cmFuc2Zvcm06IGNhbnZhc1RyYW5zZm9ybX0pXG4gICAgICB0aGlzLmFwcGx5U3R5bGVzKHRoaXMudG9rZW5zTGF5ZXIuY2FudmFzLCB7dHJhbnNmb3JtOiBjYW52YXNUcmFuc2Zvcm19KVxuICAgICAgdGhpcy5hcHBseVN0eWxlcyh0aGlzLmZyb250TGF5ZXIuY2FudmFzLCB7dHJhbnNmb3JtOiBjYW52YXNUcmFuc2Zvcm19KVxuICAgIH1cblxuICAgIGlmICh0aGlzLm1pbmltYXBTY3JvbGxJbmRpY2F0b3IgJiYgbWluaW1hcC5jYW5TY3JvbGwoKSAmJiAhdGhpcy5zY3JvbGxJbmRpY2F0b3IpIHtcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZVNjcm9sbEluZGljYXRvcigpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc2Nyb2xsSW5kaWNhdG9yICE9IG51bGwpIHtcbiAgICAgIGxldCBtaW5pbWFwU2NyZWVuSGVpZ2h0ID0gbWluaW1hcC5nZXRTY3JlZW5IZWlnaHQoKVxuICAgICAgbGV0IGluZGljYXRvckhlaWdodCA9IG1pbmltYXBTY3JlZW5IZWlnaHQgKiAobWluaW1hcFNjcmVlbkhlaWdodCAvIG1pbmltYXAuZ2V0SGVpZ2h0KCkpXG4gICAgICBsZXQgaW5kaWNhdG9yU2Nyb2xsID0gKG1pbmltYXBTY3JlZW5IZWlnaHQgLSBpbmRpY2F0b3JIZWlnaHQpICogbWluaW1hcC5nZXRDYXBlZFRleHRFZGl0b3JTY3JvbGxSYXRpbygpXG5cbiAgICAgIGlmIChTUEVDX01PREUpIHtcbiAgICAgICAgdGhpcy5hcHBseVN0eWxlcyh0aGlzLnNjcm9sbEluZGljYXRvciwge1xuICAgICAgICAgIGhlaWdodDogaW5kaWNhdG9ySGVpZ2h0ICsgJ3B4JyxcbiAgICAgICAgICB0b3A6IGluZGljYXRvclNjcm9sbCArICdweCdcbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuYXBwbHlTdHlsZXModGhpcy5zY3JvbGxJbmRpY2F0b3IsIHtcbiAgICAgICAgICBoZWlnaHQ6IGluZGljYXRvckhlaWdodCArICdweCcsXG4gICAgICAgICAgdHJhbnNmb3JtOiB0aGlzLm1ha2VUcmFuc2xhdGUoMCwgaW5kaWNhdG9yU2Nyb2xsKVxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICBpZiAoIW1pbmltYXAuY2FuU2Nyb2xsKCkpIHsgdGhpcy5kaXNwb3NlU2Nyb2xsSW5kaWNhdG9yKCkgfVxuICAgIH1cblxuICAgIHRoaXMudXBkYXRlQ2FudmFzKClcbiAgICBtaW5pbWFwLmNsZWFyQ2FjaGUoKVxuICB9XG5cbiAgLyoqXG4gICAqIERlZmluZXMgd2hldGhlciB0byByZW5kZXIgdGhlIGNvZGUgaGlnaGxpZ2h0cyBvciBub3QuXG4gICAqXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gZGlzcGxheUNvZGVIaWdobGlnaHRzIHdoZXRoZXIgdG8gcmVuZGVyIHRoZSBjb2RlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhpZ2hsaWdodHMgb3Igbm90XG4gICAqL1xuICBzZXREaXNwbGF5Q29kZUhpZ2hsaWdodHMgKGRpc3BsYXlDb2RlSGlnaGxpZ2h0cykge1xuICAgIHRoaXMuZGlzcGxheUNvZGVIaWdobGlnaHRzID0gZGlzcGxheUNvZGVIaWdobGlnaHRzXG4gICAgaWYgKHRoaXMuYXR0YWNoZWQpIHsgdGhpcy5yZXF1ZXN0Rm9yY2VkVXBkYXRlKCkgfVxuICB9XG5cbiAgLyoqXG4gICAqIFBvbGxpbmcgY2FsbGJhY2sgdXNlZCB0byBkZXRlY3QgdmlzaWJpbGl0eSBhbmQgc2l6ZSBjaGFuZ2VzLlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIHBvbGxET00gKCkge1xuICAgIGxldCB2aXNpYmlsaXR5Q2hhbmdlZCA9IHRoaXMuY2hlY2tGb3JWaXNpYmlsaXR5Q2hhbmdlKClcbiAgICBpZiAodGhpcy5pc1Zpc2libGUoKSkge1xuICAgICAgaWYgKCF0aGlzLndhc1Zpc2libGUpIHsgdGhpcy5yZXF1ZXN0Rm9yY2VkVXBkYXRlKCkgfVxuXG4gICAgICB0aGlzLm1lYXN1cmVIZWlnaHRBbmRXaWR0aCh2aXNpYmlsaXR5Q2hhbmdlZCwgZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEEgbWV0aG9kIHRoYXQgY2hlY2tzIGZvciB2aXNpYmlsaXR5IGNoYW5nZXMgaW4gdGhlIE1pbmltYXBFbGVtZW50LlxuICAgKiBUaGUgbWV0aG9kIHJldHVybnMgYHRydWVgIHdoZW4gdGhlIHZpc2liaWxpdHkgY2hhbmdlZCBmcm9tIHZpc2libGUgdG9cbiAgICogaGlkZGVuIG9yIGZyb20gaGlkZGVuIHRvIHZpc2libGUuXG4gICAqXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IHdoZXRoZXIgdGhlIHZpc2liaWxpdHkgY2hhbmdlZCBvciBub3Qgc2luY2UgdGhlIGxhc3QgY2FsbFxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGNoZWNrRm9yVmlzaWJpbGl0eUNoYW5nZSAoKSB7XG4gICAgaWYgKHRoaXMuaXNWaXNpYmxlKCkpIHtcbiAgICAgIGlmICh0aGlzLndhc1Zpc2libGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLndhc1Zpc2libGUgPSB0cnVlXG4gICAgICAgIHJldHVybiB0aGlzLndhc1Zpc2libGVcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMud2FzVmlzaWJsZSkge1xuICAgICAgICB0aGlzLndhc1Zpc2libGUgPSBmYWxzZVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy53YXNWaXNpYmxlID0gZmFsc2VcbiAgICAgICAgcmV0dXJuIHRoaXMud2FzVmlzaWJsZVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBIG1ldGhvZCB1c2VkIHRvIG1lYXN1cmUgdGhlIHNpemUgb2YgdGhlIE1pbmltYXBFbGVtZW50IGFuZCB1cGRhdGUgaW50ZXJuYWxcbiAgICogY29tcG9uZW50cyBiYXNlZCBvbiB0aGUgbmV3IHNpemUuXG4gICAqXG4gICAqIEBwYXJhbSAge2Jvb2xlYW59IHZpc2liaWxpdHlDaGFuZ2VkIGRpZCB0aGUgdmlzaWJpbGl0eSBjaGFuZ2VkIHNpbmNlIGxhc3RcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVhc3VyZW1lbnRcbiAgICogQHBhcmFtICB7W3R5cGVdfSBbZm9yY2VVcGRhdGU9dHJ1ZV0gZm9yY2VzIHRoZSB1cGRhdGUgZXZlbiB3aGVuIG5vIGNoYW5nZXNcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2VyZSBkZXRlY3RlZFxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIG1lYXN1cmVIZWlnaHRBbmRXaWR0aCAodmlzaWJpbGl0eUNoYW5nZWQsIGZvcmNlVXBkYXRlID0gdHJ1ZSkge1xuICAgIGlmICghdGhpcy5taW5pbWFwKSB7IHJldHVybiB9XG5cbiAgICBjb25zdCBkZXZpY2VQaXhlbFJhdGlvID0gdGhpcy5taW5pbWFwLmdldERldmljZVBpeGVsUmF0aW8oKVxuICAgIGxldCB3YXNSZXNpemVkID0gdGhpcy53aWR0aCAhPT0gdGhpcy5jbGllbnRXaWR0aCB8fCB0aGlzLmhlaWdodCAhPT0gdGhpcy5jbGllbnRIZWlnaHRcblxuICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5jbGllbnRIZWlnaHRcbiAgICB0aGlzLndpZHRoID0gdGhpcy5jbGllbnRXaWR0aFxuICAgIGxldCBjYW52YXNXaWR0aCA9IHRoaXMud2lkdGhcblxuICAgIGlmICgodGhpcy5taW5pbWFwICE9IG51bGwpKSB7IHRoaXMubWluaW1hcC5zZXRTY3JlZW5IZWlnaHRBbmRXaWR0aCh0aGlzLmhlaWdodCwgdGhpcy53aWR0aCkgfVxuXG4gICAgaWYgKHdhc1Jlc2l6ZWQgfHwgdmlzaWJpbGl0eUNoYW5nZWQgfHwgZm9yY2VVcGRhdGUpIHsgdGhpcy5yZXF1ZXN0Rm9yY2VkVXBkYXRlKCkgfVxuXG4gICAgaWYgKCF0aGlzLmlzVmlzaWJsZSgpKSB7IHJldHVybiB9XG5cbiAgICBpZiAod2FzUmVzaXplZCB8fCBmb3JjZVVwZGF0ZSkge1xuICAgICAgaWYgKHRoaXMuYWRqdXN0VG9Tb2Z0V3JhcCkge1xuICAgICAgICBsZXQgbGluZUxlbmd0aCA9IGF0b20uY29uZmlnLmdldCgnZWRpdG9yLnByZWZlcnJlZExpbmVMZW5ndGgnKVxuICAgICAgICBsZXQgc29mdFdyYXAgPSBhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5zb2Z0V3JhcCcpXG4gICAgICAgIGxldCBzb2Z0V3JhcEF0UHJlZmVycmVkTGluZUxlbmd0aCA9IGF0b20uY29uZmlnLmdldCgnZWRpdG9yLnNvZnRXcmFwQXRQcmVmZXJyZWRMaW5lTGVuZ3RoJylcbiAgICAgICAgbGV0IHdpZHRoID0gbGluZUxlbmd0aCAqIHRoaXMubWluaW1hcC5nZXRDaGFyV2lkdGgoKVxuXG4gICAgICAgIGlmIChzb2Z0V3JhcCAmJiBzb2Z0V3JhcEF0UHJlZmVycmVkTGluZUxlbmd0aCAmJiBsaW5lTGVuZ3RoICYmIHdpZHRoIDw9IHRoaXMud2lkdGgpIHtcbiAgICAgICAgICB0aGlzLmZsZXhCYXNpcyA9IHdpZHRoXG4gICAgICAgICAgY2FudmFzV2lkdGggPSB3aWR0aFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlbGV0ZSB0aGlzLmZsZXhCYXNpc1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZWxldGUgdGhpcy5mbGV4QmFzaXNcbiAgICAgIH1cblxuICAgICAgbGV0IGNhbnZhcyA9IHRoaXMuZ2V0RnJvbnRDYW52YXMoKVxuICAgICAgaWYgKGNhbnZhc1dpZHRoICE9PSBjYW52YXMud2lkdGggfHwgdGhpcy5oZWlnaHQgIT09IGNhbnZhcy5oZWlnaHQpIHtcbiAgICAgICAgdGhpcy5zZXRDYW52YXNlc1NpemUoXG4gICAgICAgICAgY2FudmFzV2lkdGggKiBkZXZpY2VQaXhlbFJhdGlvLFxuICAgICAgICAgICh0aGlzLmhlaWdodCArIHRoaXMubWluaW1hcC5nZXRMaW5lSGVpZ2h0KCkpICogZGV2aWNlUGl4ZWxSYXRpb1xuICAgICAgICApXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gICAgIyMjIyMjIyMgIyMgICAgICMjICMjIyMjIyMjICMjICAgICMjICMjIyMjIyMjICAjIyMjIyNcbiAgLy8gICAgIyMgICAgICAgIyMgICAgICMjICMjICAgICAgICMjIyAgICMjICAgICMjICAgICMjICAgICMjXG4gIC8vICAgICMjICAgICAgICMjICAgICAjIyAjIyAgICAgICAjIyMjICAjIyAgICAjIyAgICAjI1xuICAvLyAgICAjIyMjIyMgICAjIyAgICAgIyMgIyMjIyMjICAgIyMgIyMgIyMgICAgIyMgICAgICMjIyMjI1xuICAvLyAgICAjIyAgICAgICAgIyMgICAjIyAgIyMgICAgICAgIyMgICMjIyMgICAgIyMgICAgICAgICAgIyNcbiAgLy8gICAgIyMgICAgICAgICAjIyAjIyAgICMjICAgICAgICMjICAgIyMjICAgICMjICAgICMjICAgICMjXG4gIC8vICAgICMjIyMjIyMjICAgICMjIyAgICAjIyMjIyMjIyAjIyAgICAjIyAgICAjIyAgICAgIyMjIyMjXG5cbiAgLyoqXG4gICAqIEhlbHBlciBtZXRob2QgdG8gcmVnaXN0ZXIgY29uZmlnIG9ic2VydmVycy5cbiAgICpcbiAgICogQHBhcmFtICB7T2JqZWN0fSBjb25maWdzPXt9IGFuIG9iamVjdCBtYXBwaW5nIHRoZSBjb25maWcgbmFtZSB0byBvYnNlcnZlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aXRoIHRoZSBmdW5jdGlvbiB0byBjYWxsIGJhY2sgd2hlbiBhIGNoYW5nZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2NjdXJzXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgb2JzZXJ2ZUNvbmZpZyAoY29uZmlncyA9IHt9KSB7XG4gICAgZm9yIChsZXQgY29uZmlnIGluIGNvbmZpZ3MpIHtcbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZShjb25maWcsIGNvbmZpZ3NbY29uZmlnXSkpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIHRyaWdnZXJlZCB3aGVuIHRoZSBtb3VzZSBpcyBwcmVzc2VkIG9uIHRoZSBNaW5pbWFwRWxlbWVudCBjYW52YXMuXG4gICAqXG4gICAqIEBwYXJhbSAge01vdXNlRXZlbnR9IGUgdGhlIG1vdXNlIGV2ZW50IG9iamVjdFxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIG1vdXNlUHJlc3NlZE92ZXJDYW52YXMgKGUpIHtcbiAgICBpZiAodGhpcy5taW5pbWFwLmlzU3RhbmRBbG9uZSgpKSB7IHJldHVybiB9XG4gICAgaWYgKGUud2hpY2ggPT09IDEpIHtcbiAgICAgIHRoaXMubGVmdE1vdXNlUHJlc3NlZE92ZXJDYW52YXMoZSlcbiAgICB9IGVsc2UgaWYgKGUud2hpY2ggPT09IDIpIHtcbiAgICAgIHRoaXMubWlkZGxlTW91c2VQcmVzc2VkT3ZlckNhbnZhcyhlKVxuICAgICAgbGV0IHt0b3AsIGhlaWdodH0gPSB0aGlzLnZpc2libGVBcmVhLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICB0aGlzLnN0YXJ0RHJhZyh7d2hpY2g6IDIsIHBhZ2VZOiB0b3AgKyBoZWlnaHQgLyAyfSkgLy8gdWdseSBoYWNrXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIHRyaWdnZXJlZCB3aGVuIHRoZSBtb3VzZSBsZWZ0IGJ1dHRvbiBpcyBwcmVzc2VkIG9uIHRoZVxuICAgKiBNaW5pbWFwRWxlbWVudCBjYW52YXMuXG4gICAqXG4gICAqIEBwYXJhbSAge01vdXNlRXZlbnR9IGUgdGhlIG1vdXNlIGV2ZW50IG9iamVjdFxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGUucGFnZVkgdGhlIG1vdXNlIHkgcG9zaXRpb24gaW4gcGFnZVxuICAgKiBAcGFyYW0gIHtIVE1MRWxlbWVudH0gZS50YXJnZXQgdGhlIHNvdXJjZSBvZiB0aGUgZXZlbnRcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBsZWZ0TW91c2VQcmVzc2VkT3ZlckNhbnZhcyAoe3BhZ2VZLCB0YXJnZXR9KSB7XG4gICAgbGV0IHkgPSBwYWdlWSAtIHRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3BcbiAgICBsZXQgcm93ID0gTWF0aC5mbG9vcih5IC8gdGhpcy5taW5pbWFwLmdldExpbmVIZWlnaHQoKSkgKyB0aGlzLm1pbmltYXAuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KClcblxuICAgIGxldCB0ZXh0RWRpdG9yID0gdGhpcy5taW5pbWFwLmdldFRleHRFZGl0b3IoKVxuXG4gICAgbGV0IHNjcm9sbFRvcCA9IHJvdyAqIHRleHRFZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKCkgLSB0aGlzLm1pbmltYXAuZ2V0VGV4dEVkaXRvckhlaWdodCgpIC8gMlxuXG4gICAgaWYgKGF0b20uY29uZmlnLmdldCgnbWluaW1hcC5zY3JvbGxBbmltYXRpb24nKSkge1xuICAgICAgbGV0IGZyb20gPSB0aGlzLm1pbmltYXAuZ2V0VGV4dEVkaXRvclNjcm9sbFRvcCgpXG4gICAgICBsZXQgdG8gPSBzY3JvbGxUb3BcbiAgICAgIGxldCBzdGVwID0gKG5vdykgPT4gdGhpcy5taW5pbWFwLnNldFRleHRFZGl0b3JTY3JvbGxUb3Aobm93KVxuICAgICAgbGV0IGR1cmF0aW9uID0gYXRvbS5jb25maWcuZ2V0KCdtaW5pbWFwLnNjcm9sbEFuaW1hdGlvbkR1cmF0aW9uJylcbiAgICAgIHRoaXMuYW5pbWF0ZSh7ZnJvbTogZnJvbSwgdG86IHRvLCBkdXJhdGlvbjogZHVyYXRpb24sIHN0ZXA6IHN0ZXB9KVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm1pbmltYXAuc2V0VGV4dEVkaXRvclNjcm9sbFRvcChzY3JvbGxUb3ApXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIHRyaWdnZXJlZCB3aGVuIHRoZSBtb3VzZSBtaWRkbGUgYnV0dG9uIGlzIHByZXNzZWQgb24gdGhlXG4gICAqIE1pbmltYXBFbGVtZW50IGNhbnZhcy5cbiAgICpcbiAgICogQHBhcmFtICB7TW91c2VFdmVudH0gZSB0aGUgbW91c2UgZXZlbnQgb2JqZWN0XG4gICAqIEBwYXJhbSAge251bWJlcn0gZS5wYWdlWSB0aGUgbW91c2UgeSBwb3NpdGlvbiBpbiBwYWdlXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgbWlkZGxlTW91c2VQcmVzc2VkT3ZlckNhbnZhcyAoe3BhZ2VZfSkge1xuICAgIGxldCB7dG9wOiBvZmZzZXRUb3B9ID0gdGhpcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgIGxldCB5ID0gcGFnZVkgLSBvZmZzZXRUb3AgLSB0aGlzLm1pbmltYXAuZ2V0VGV4dEVkaXRvclNjYWxlZEhlaWdodCgpIC8gMlxuXG4gICAgbGV0IHJhdGlvID0geSAvICh0aGlzLm1pbmltYXAuZ2V0VmlzaWJsZUhlaWdodCgpIC0gdGhpcy5taW5pbWFwLmdldFRleHRFZGl0b3JTY2FsZWRIZWlnaHQoKSlcblxuICAgIHRoaXMubWluaW1hcC5zZXRUZXh0RWRpdG9yU2Nyb2xsVG9wKHJhdGlvICogdGhpcy5taW5pbWFwLmdldFRleHRFZGl0b3JNYXhTY3JvbGxUb3AoKSlcbiAgfVxuXG4gIC8qKlxuICAgKiBBIG1ldGhvZCB0aGF0IHJlbGF5cyB0aGUgYG1vdXNld2hlZWxgIGV2ZW50cyByZWNlaXZlZCBieSB0aGUgTWluaW1hcEVsZW1lbnRcbiAgICogdG8gdGhlIGBUZXh0RWRpdG9yRWxlbWVudGAuXG4gICAqXG4gICAqIEBwYXJhbSAge01vdXNlRXZlbnR9IGUgdGhlIG1vdXNlIGV2ZW50IG9iamVjdFxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIHJlbGF5TW91c2V3aGVlbEV2ZW50IChlKSB7XG4gICAgdGhpcy5nZXRUZXh0RWRpdG9yRWxlbWVudCgpLmNvbXBvbmVudC5vbk1vdXNlV2hlZWwoZSlcbiAgfVxuXG4gIC8vICAgICMjIyMjIyMjICAgICMjIyMgICAgIyMjIyMjIyNcbiAgLy8gICAgIyMgICAgICMjICAjIyAgIyMgICAjIyAgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICAgIyMjIyAgICAjIyAgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICAjIyMjICAgICAjIyAgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICMjICAjIyAjIyAjIyAgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICMjICAgIyMgICAjIyAgICAgIyNcbiAgLy8gICAgIyMjIyMjIyMgICAjIyMjICAjIyAjIyMjIyMjI1xuXG4gIC8qKlxuICAgKiBBIG1ldGhvZCB0cmlnZ2VyZWQgd2hlbiB0aGUgbW91c2UgaXMgcHJlc3NlZCBvdmVyIHRoZSB2aXNpYmxlIGFyZWEgdGhhdFxuICAgKiBzdGFydHMgdGhlIGRyYWdnaW5nIGdlc3R1cmUuXG4gICAqXG4gICAqIEBwYXJhbSAge01vdXNlRXZlbnR9IGUgdGhlIG1vdXNlIGV2ZW50IG9iamVjdFxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIHN0YXJ0RHJhZyAoZSkge1xuICAgIGxldCB7d2hpY2gsIHBhZ2VZfSA9IGVcbiAgICBpZiAoIXRoaXMubWluaW1hcCkgeyByZXR1cm4gfVxuICAgIGlmICh3aGljaCAhPT0gMSAmJiB3aGljaCAhPT0gMiAmJiAhKGUudG91Y2hlcyAhPSBudWxsKSkgeyByZXR1cm4gfVxuXG4gICAgbGV0IHt0b3B9ID0gdGhpcy52aXNpYmxlQXJlYS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgIGxldCB7dG9wOiBvZmZzZXRUb3B9ID0gdGhpcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuXG4gICAgbGV0IGRyYWdPZmZzZXQgPSBwYWdlWSAtIHRvcFxuXG4gICAgbGV0IGluaXRpYWwgPSB7ZHJhZ09mZnNldCwgb2Zmc2V0VG9wfVxuXG4gICAgbGV0IG1vdXNlbW92ZUhhbmRsZXIgPSAoZSkgPT4gdGhpcy5kcmFnKGUsIGluaXRpYWwpXG4gICAgbGV0IG1vdXNldXBIYW5kbGVyID0gKGUpID0+IHRoaXMuZW5kRHJhZyhlLCBpbml0aWFsKVxuXG4gICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBtb3VzZW1vdmVIYW5kbGVyKVxuICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIG1vdXNldXBIYW5kbGVyKVxuICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIG1vdXNldXBIYW5kbGVyKVxuXG4gICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBtb3VzZW1vdmVIYW5kbGVyKVxuICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBtb3VzZXVwSGFuZGxlcilcblxuICAgIHRoaXMuZHJhZ1N1YnNjcmlwdGlvbiA9IG5ldyBEaXNwb3NhYmxlKGZ1bmN0aW9uICgpIHtcbiAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgbW91c2Vtb3ZlSGFuZGxlcilcbiAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIG1vdXNldXBIYW5kbGVyKVxuICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgbW91c2V1cEhhbmRsZXIpXG5cbiAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgbW91c2Vtb3ZlSGFuZGxlcilcbiAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBtb3VzZXVwSGFuZGxlcilcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBtZXRob2QgY2FsbGVkIGR1cmluZyB0aGUgZHJhZyBnZXN0dXJlLlxuICAgKlxuICAgKiBAcGFyYW0gIHtNb3VzZUV2ZW50fSBlIHRoZSBtb3VzZSBldmVudCBvYmplY3RcbiAgICogQHBhcmFtICB7T2JqZWN0fSBpbml0aWFsXG4gICAqIEBwYXJhbSAge251bWJlcn0gaW5pdGlhbC5kcmFnT2Zmc2V0IHRoZSBtb3VzZSBvZmZzZXQgd2l0aGluIHRoZSB2aXNpYmxlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZWFcbiAgICogQHBhcmFtICB7bnVtYmVyfSBpbml0aWFsLm9mZnNldFRvcCB0aGUgTWluaW1hcEVsZW1lbnQgb2Zmc2V0IGF0IHRoZSBtb21lbnRcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZiB0aGUgZHJhZyBzdGFydFxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGRyYWcgKGUsIGluaXRpYWwpIHtcbiAgICBpZiAoIXRoaXMubWluaW1hcCkgeyByZXR1cm4gfVxuICAgIGlmIChlLndoaWNoICE9PSAxICYmIGUud2hpY2ggIT09IDIgJiYgIShlLnRvdWNoZXMgIT0gbnVsbCkpIHsgcmV0dXJuIH1cbiAgICBsZXQgeSA9IGUucGFnZVkgLSBpbml0aWFsLm9mZnNldFRvcCAtIGluaXRpYWwuZHJhZ09mZnNldFxuXG4gICAgbGV0IHJhdGlvID0geSAvICh0aGlzLm1pbmltYXAuZ2V0VmlzaWJsZUhlaWdodCgpIC0gdGhpcy5taW5pbWFwLmdldFRleHRFZGl0b3JTY2FsZWRIZWlnaHQoKSlcblxuICAgIHRoaXMubWluaW1hcC5zZXRUZXh0RWRpdG9yU2Nyb2xsVG9wKHJhdGlvICogdGhpcy5taW5pbWFwLmdldFRleHRFZGl0b3JNYXhTY3JvbGxUb3AoKSlcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgbWV0aG9kIHRoYXQgZW5kcyB0aGUgZHJhZyBnZXN0dXJlLlxuICAgKlxuICAgKiBAcGFyYW0gIHtNb3VzZUV2ZW50fSBlIHRoZSBtb3VzZSBldmVudCBvYmplY3RcbiAgICogQHBhcmFtICB7T2JqZWN0fSBpbml0aWFsXG4gICAqIEBwYXJhbSAge251bWJlcn0gaW5pdGlhbC5kcmFnT2Zmc2V0IHRoZSBtb3VzZSBvZmZzZXQgd2l0aGluIHRoZSB2aXNpYmxlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZWFcbiAgICogQHBhcmFtICB7bnVtYmVyfSBpbml0aWFsLm9mZnNldFRvcCB0aGUgTWluaW1hcEVsZW1lbnQgb2Zmc2V0IGF0IHRoZSBtb21lbnRcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZiB0aGUgZHJhZyBzdGFydFxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGVuZERyYWcgKGUsIGluaXRpYWwpIHtcbiAgICBpZiAoIXRoaXMubWluaW1hcCkgeyByZXR1cm4gfVxuICAgIHRoaXMuZHJhZ1N1YnNjcmlwdGlvbi5kaXNwb3NlKClcbiAgfVxuXG4gIC8vICAgICAjIyMjIyMgICAjIyMjIyMgICAjIyMjIyNcbiAgLy8gICAgIyMgICAgIyMgIyMgICAgIyMgIyMgICAgIyNcbiAgLy8gICAgIyMgICAgICAgIyMgICAgICAgIyNcbiAgLy8gICAgIyMgICAgICAgICMjIyMjIyAgICMjIyMjI1xuICAvLyAgICAjIyAgICAgICAgICAgICAjIyAgICAgICAjI1xuICAvLyAgICAjIyAgICAjIyAjIyAgICAjIyAjIyAgICAjI1xuICAvLyAgICAgIyMjIyMjICAgIyMjIyMjICAgIyMjIyMjXG5cbiAgLyoqXG4gICAqIEFwcGxpZXMgdGhlIHBhc3NlZC1pbiBzdHlsZXMgcHJvcGVydGllcyB0byB0aGUgc3BlY2lmaWVkIGVsZW1lbnRcbiAgICpcbiAgICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgdGhlIGVsZW1lbnQgb250byB3aGljaCBhcHBseSB0aGUgc3R5bGVzXG4gICAqIEBwYXJhbSAge09iamVjdH0gc3R5bGVzIHRoZSBzdHlsZXMgdG8gYXBwbHlcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBhcHBseVN0eWxlcyAoZWxlbWVudCwgc3R5bGVzKSB7XG4gICAgaWYgKCFlbGVtZW50KSB7IHJldHVybiB9XG5cbiAgICBsZXQgY3NzVGV4dCA9ICcnXG4gICAgZm9yIChsZXQgcHJvcGVydHkgaW4gc3R5bGVzKSB7XG4gICAgICBjc3NUZXh0ICs9IGAke3Byb3BlcnR5fTogJHtzdHlsZXNbcHJvcGVydHldfTsgYFxuICAgIH1cblxuICAgIGVsZW1lbnQuc3R5bGUuY3NzVGV4dCA9IGNzc1RleHRcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgc3RyaW5nIHdpdGggYSBDU1MgdHJhbnNsYXRpb24gdHJhbmZvcm0gdmFsdWUuXG4gICAqXG4gICAqIEBwYXJhbSAge251bWJlcn0gW3ggPSAwXSB0aGUgeCBvZmZzZXQgb2YgdGhlIHRyYW5zbGF0aW9uXG4gICAqIEBwYXJhbSAge251bWJlcn0gW3kgPSAwXSB0aGUgeSBvZmZzZXQgb2YgdGhlIHRyYW5zbGF0aW9uXG4gICAqIEByZXR1cm4ge3N0cmluZ30gdGhlIENTUyB0cmFuc2xhdGlvbiBzdHJpbmdcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBtYWtlVHJhbnNsYXRlICh4ID0gMCwgeSA9IDApIHtcbiAgICBpZiAodGhpcy51c2VIYXJkd2FyZUFjY2VsZXJhdGlvbikge1xuICAgICAgcmV0dXJuIGB0cmFuc2xhdGUzZCgke3h9cHgsICR7eX1weCwgMClgXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBgdHJhbnNsYXRlKCR7eH1weCwgJHt5fXB4KWBcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHN0cmluZyB3aXRoIGEgQ1NTIHNjYWxpbmcgdHJhbmZvcm0gdmFsdWUuXG4gICAqXG4gICAqIEBwYXJhbSAge251bWJlcn0gW3ggPSAwXSB0aGUgeCBzY2FsaW5nIGZhY3RvclxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IFt5ID0gMF0gdGhlIHkgc2NhbGluZyBmYWN0b3JcbiAgICogQHJldHVybiB7c3RyaW5nfSB0aGUgQ1NTIHNjYWxpbmcgc3RyaW5nXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgbWFrZVNjYWxlICh4ID0gMCwgeSA9IHgpIHtcbiAgICBpZiAodGhpcy51c2VIYXJkd2FyZUFjY2VsZXJhdGlvbikge1xuICAgICAgcmV0dXJuIGBzY2FsZTNkKCR7eH0sICR7eX0sIDEpYFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYHNjYWxlKCR7eH0sICR7eX0pYFxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBIG1ldGhvZCB0aGF0IHJldHVybiB0aGUgY3VycmVudCB0aW1lIGFzIGEgRGF0ZS5cbiAgICpcbiAgICogVGhhdCBtZXRob2QgZXhpc3Qgc28gdGhhdCB3ZSBjYW4gbW9jayBpdCBpbiB0ZXN0cy5cbiAgICpcbiAgICogQHJldHVybiB7RGF0ZX0gdGhlIGN1cnJlbnQgdGltZSBhcyBEYXRlXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgZ2V0VGltZSAoKSB7IHJldHVybiBuZXcgRGF0ZSgpIH1cblxuICAvKipcbiAgICogQSBtZXRob2QgdGhhdCBtaW1pYyB0aGUgalF1ZXJ5IGBhbmltYXRlYCBtZXRob2QgYW5kIHVzZWQgdG8gYW5pbWF0ZSB0aGVcbiAgICogc2Nyb2xsIHdoZW4gY2xpY2tpbmcgb24gdGhlIE1pbmltYXBFbGVtZW50IGNhbnZhcy5cbiAgICpcbiAgICogQHBhcmFtICB7T2JqZWN0fSBwYXJhbSB0aGUgYW5pbWF0aW9uIGRhdGEgb2JqZWN0XG4gICAqIEBwYXJhbSAge1t0eXBlXX0gcGFyYW0uZnJvbSB0aGUgc3RhcnQgdmFsdWVcbiAgICogQHBhcmFtICB7W3R5cGVdfSBwYXJhbS50byB0aGUgZW5kIHZhbHVlXG4gICAqIEBwYXJhbSAge1t0eXBlXX0gcGFyYW0uZHVyYXRpb24gdGhlIGFuaW1hdGlvbiBkdXJhdGlvblxuICAgKiBAcGFyYW0gIHtbdHlwZV19IHBhcmFtLnN0ZXAgdGhlIGVhc2luZyBmdW5jdGlvbiBmb3IgdGhlIGFuaW1hdGlvblxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGFuaW1hdGUgKHtmcm9tLCB0bywgZHVyYXRpb24sIHN0ZXB9KSB7XG4gICAgbGV0IHByb2dyZXNzXG4gICAgbGV0IHN0YXJ0ID0gdGhpcy5nZXRUaW1lKClcblxuICAgIGxldCBzd2luZyA9IGZ1bmN0aW9uIChwcm9ncmVzcykge1xuICAgICAgcmV0dXJuIDAuNSAtIE1hdGguY29zKHByb2dyZXNzICogTWF0aC5QSSkgLyAyXG4gICAgfVxuXG4gICAgbGV0IHVwZGF0ZSA9ICgpID0+IHtcbiAgICAgIGxldCBwYXNzZWQgPSB0aGlzLmdldFRpbWUoKSAtIHN0YXJ0XG4gICAgICBpZiAoZHVyYXRpb24gPT09IDApIHtcbiAgICAgICAgcHJvZ3Jlc3MgPSAxXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwcm9ncmVzcyA9IHBhc3NlZCAvIGR1cmF0aW9uXG4gICAgICB9XG4gICAgICBpZiAocHJvZ3Jlc3MgPiAxKSB7IHByb2dyZXNzID0gMSB9XG4gICAgICBsZXQgZGVsdGEgPSBzd2luZyhwcm9ncmVzcylcbiAgICAgIHN0ZXAoZnJvbSArICh0byAtIGZyb20pICogZGVsdGEpXG5cbiAgICAgIGlmIChwcm9ncmVzcyA8IDEpIHsgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHVwZGF0ZSkgfVxuICAgIH1cblxuICAgIHVwZGF0ZSgpXG4gIH1cbn1cbiJdfQ==
//# sourceURL=/home/gsmyrnaios/.atom/packages/minimap/lib/minimap-element.js
