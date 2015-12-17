(function() {
  var AncestorsMethods, CanvasDrawer, CompositeDisposable, DOMStylesReader, Disposable, EventsDelegation, MinimapElement, MinimapQuickSettingsElement, SPEC_MODE, debounce, registerOrUpdateElement, _ref, _ref1,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  debounce = require('underscore-plus').debounce;

  _ref = require('atom'), CompositeDisposable = _ref.CompositeDisposable, Disposable = _ref.Disposable;

  _ref1 = require('atom-utils'), registerOrUpdateElement = _ref1.registerOrUpdateElement, EventsDelegation = _ref1.EventsDelegation, AncestorsMethods = _ref1.AncestorsMethods;

  DOMStylesReader = require('./mixins/dom-styles-reader');

  CanvasDrawer = require('./mixins/canvas-drawer');

  MinimapQuickSettingsElement = null;

  SPEC_MODE = atom.inSpecMode();

  MinimapElement = (function() {
    function MinimapElement() {
      this.relayMousewheelEvent = __bind(this.relayMousewheelEvent, this);
    }

    DOMStylesReader.includeInto(MinimapElement);

    CanvasDrawer.includeInto(MinimapElement);

    EventsDelegation.includeInto(MinimapElement);

    AncestorsMethods.includeInto(MinimapElement);


    /* Public */

    MinimapElement.prototype.displayMinimapOnLeft = false;

    MinimapElement.prototype.createdCallback = function() {
      this.subscriptions = new CompositeDisposable;
      this.initializeContent();
      return this.observeConfig({
        'minimap.displayMinimapOnLeft': (function(_this) {
          return function(displayMinimapOnLeft) {
            var swapPosition;
            swapPosition = (_this.minimap != null) && displayMinimapOnLeft !== _this.displayMinimapOnLeft;
            _this.displayMinimapOnLeft = displayMinimapOnLeft;
            return _this.updateMinimapFlexPosition();
          };
        })(this),
        'minimap.minimapScrollIndicator': (function(_this) {
          return function(minimapScrollIndicator) {
            _this.minimapScrollIndicator = minimapScrollIndicator;
            if (_this.minimapScrollIndicator && (_this.scrollIndicator == null) && !_this.standAlone) {
              _this.initializeScrollIndicator();
            } else if (_this.scrollIndicator != null) {
              _this.disposeScrollIndicator();
            }
            if (_this.attached) {
              return _this.requestUpdate();
            }
          };
        })(this),
        'minimap.displayPluginsControls': (function(_this) {
          return function(displayPluginsControls) {
            _this.displayPluginsControls = displayPluginsControls;
            if (_this.displayPluginsControls && (_this.openQuickSettings == null) && !_this.standAlone) {
              return _this.initializeOpenQuickSettings();
            } else if (_this.openQuickSettings != null) {
              return _this.disposeOpenQuickSettings();
            }
          };
        })(this),
        'minimap.textOpacity': (function(_this) {
          return function(textOpacity) {
            _this.textOpacity = textOpacity;
            if (_this.attached) {
              return _this.requestForcedUpdate();
            }
          };
        })(this),
        'minimap.displayCodeHighlights': (function(_this) {
          return function(displayCodeHighlights) {
            _this.displayCodeHighlights = displayCodeHighlights;
            if (_this.attached) {
              return _this.requestForcedUpdate();
            }
          };
        })(this),
        'minimap.adjustMinimapWidthToSoftWrap': (function(_this) {
          return function(adjustToSoftWrap) {
            _this.adjustToSoftWrap = adjustToSoftWrap;
            if (_this.attached) {
              return _this.measureHeightAndWidth();
            }
          };
        })(this),
        'minimap.useHardwareAcceleration': (function(_this) {
          return function(useHardwareAcceleration) {
            _this.useHardwareAcceleration = useHardwareAcceleration;
            if (_this.attached) {
              return _this.requestUpdate();
            }
          };
        })(this),
        'minimap.absoluteMode': (function(_this) {
          return function(absoluteMode) {
            _this.absoluteMode = absoluteMode;
            return _this.classList.toggle('absolute', _this.absoluteMode);
          };
        })(this),
        'editor.preferredLineLength': (function(_this) {
          return function() {
            if (_this.attached) {
              return _this.measureHeightAndWidth();
            }
          };
        })(this),
        'editor.softWrap': (function(_this) {
          return function() {
            if (_this.attached) {
              return _this.requestUpdate();
            }
          };
        })(this),
        'editor.softWrapAtPreferredLineLength': (function(_this) {
          return function() {
            if (_this.attached) {
              return _this.requestUpdate();
            }
          };
        })(this)
      });
    };

    MinimapElement.prototype.attachedCallback = function() {
      this.subscriptions.add(atom.views.pollDocument((function(_this) {
        return function() {
          return _this.pollDOM();
        };
      })(this)));
      this.measureHeightAndWidth();
      this.updateMinimapFlexPosition();
      this.attached = true;
      this.attachedToTextEditor = this.parentNode === this.getTextEditorElementRoot();
      return this.subscriptions.add(atom.styles.onDidAddStyleElement((function(_this) {
        return function() {
          _this.invalidateCache();
          return _this.requestForcedUpdate();
        };
      })(this)));
    };

    MinimapElement.prototype.detachedCallback = function() {
      return this.attached = false;
    };

    MinimapElement.prototype.isVisible = function() {
      return this.offsetWidth > 0 || this.offsetHeight > 0;
    };

    MinimapElement.prototype.attach = function(parent) {
      if (this.attached) {
        return;
      }
      return (parent != null ? parent : this.getTextEditorElementRoot()).appendChild(this);
    };

    MinimapElement.prototype.detach = function() {
      if (!this.attached) {
        return;
      }
      if (this.parentNode == null) {
        return;
      }
      return this.parentNode.removeChild(this);
    };

    MinimapElement.prototype.updateMinimapFlexPosition = function() {
      return this.classList.toggle('left', this.displayMinimapOnLeft);
    };

    MinimapElement.prototype.destroy = function() {
      this.subscriptions.dispose();
      this.detach();
      return this.minimap = null;
    };

    MinimapElement.prototype.initializeContent = function() {
      this.initializeCanvas();
      this.shadowRoot = this.createShadowRoot();
      this.shadowRoot.appendChild(this.canvas);
      this.createVisibleArea();
      this.createControls();
      this.subscriptions.add(this.subscribeTo(this, {
        'mousewheel': (function(_this) {
          return function(e) {
            if (!_this.standAlone) {
              return _this.relayMousewheelEvent(e);
            }
          };
        })(this)
      }));
      return this.subscriptions.add(this.subscribeTo(this.canvas, {
        'mousedown': (function(_this) {
          return function(e) {
            return _this.mousePressedOverCanvas(e);
          };
        })(this)
      }));
    };

    MinimapElement.prototype.createVisibleArea = function() {
      if (this.visibleArea != null) {
        return;
      }
      this.visibleArea = document.createElement('div');
      this.visibleArea.classList.add('minimap-visible-area');
      this.shadowRoot.appendChild(this.visibleArea);
      this.visibleAreaSubscription = this.subscribeTo(this.visibleArea, {
        'mousedown': (function(_this) {
          return function(e) {
            return _this.startDrag(e);
          };
        })(this),
        'touchstart': (function(_this) {
          return function(e) {
            return _this.startDrag(e);
          };
        })(this)
      });
      return this.subscriptions.add(this.visibleAreaSubscription);
    };

    MinimapElement.prototype.removeVisibleArea = function() {
      if (this.visibleArea == null) {
        return;
      }
      this.subscriptions.remove(this.visibleAreaSubscription);
      this.visibleAreaSubscription.dispose();
      this.shadowRoot.removeChild(this.visibleArea);
      return delete this.visibleArea;
    };

    MinimapElement.prototype.createControls = function() {
      if ((this.controls != null) || this.standAlone) {
        return;
      }
      this.controls = document.createElement('div');
      this.controls.classList.add('minimap-controls');
      return this.shadowRoot.appendChild(this.controls);
    };

    MinimapElement.prototype.removeControls = function() {
      if (this.controls == null) {
        return;
      }
      this.shadowRoot.removeChild(this.controls);
      return delete this.controls;
    };

    MinimapElement.prototype.initializeScrollIndicator = function() {
      if ((this.scrollIndicator != null) || this.standAlone) {
        return;
      }
      this.scrollIndicator = document.createElement('div');
      this.scrollIndicator.classList.add('minimap-scroll-indicator');
      return this.controls.appendChild(this.scrollIndicator);
    };

    MinimapElement.prototype.disposeScrollIndicator = function() {
      if (this.scrollIndicator == null) {
        return;
      }
      this.controls.removeChild(this.scrollIndicator);
      return delete this.scrollIndicator;
    };

    MinimapElement.prototype.initializeOpenQuickSettings = function() {
      if ((this.openQuickSettings != null) || this.standAlone) {
        return;
      }
      this.openQuickSettings = document.createElement('div');
      this.openQuickSettings.classList.add('open-minimap-quick-settings');
      this.controls.appendChild(this.openQuickSettings);
      return this.openQuickSettingSubscription = this.subscribeTo(this.openQuickSettings, {
        'mousedown': (function(_this) {
          return function(e) {
            var left, right, top, _ref2;
            e.preventDefault();
            e.stopPropagation();
            if (_this.quickSettingsElement != null) {
              _this.quickSettingsElement.destroy();
              return _this.quickSettingsSubscription.dispose();
            } else {
              if (MinimapQuickSettingsElement == null) {
                MinimapQuickSettingsElement = require('./minimap-quick-settings-element');
              }
              _this.quickSettingsElement = new MinimapQuickSettingsElement;
              _this.quickSettingsElement.setModel(_this);
              _this.quickSettingsSubscription = _this.quickSettingsElement.onDidDestroy(function() {
                return _this.quickSettingsElement = null;
              });
              _ref2 = _this.canvas.getBoundingClientRect(), top = _ref2.top, left = _ref2.left, right = _ref2.right;
              _this.quickSettingsElement.style.top = top + 'px';
              _this.quickSettingsElement.attach();
              if (_this.displayMinimapOnLeft) {
                return _this.quickSettingsElement.style.left = right + 'px';
              } else {
                return _this.quickSettingsElement.style.left = (left - _this.quickSettingsElement.clientWidth) + 'px';
              }
            }
          };
        })(this)
      });
    };

    MinimapElement.prototype.disposeOpenQuickSettings = function() {
      if (this.openQuickSettings == null) {
        return;
      }
      this.controls.removeChild(this.openQuickSettings);
      this.openQuickSettingSubscription.dispose();
      return this.openQuickSettings = void 0;
    };

    MinimapElement.prototype.getTextEditor = function() {
      return this.minimap.getTextEditor();
    };

    MinimapElement.prototype.getTextEditorElement = function() {
      return this.editorElement != null ? this.editorElement : this.editorElement = atom.views.getView(this.getTextEditor());
    };

    MinimapElement.prototype.getTextEditorElementRoot = function() {
      var editorElement, _ref2;
      editorElement = this.getTextEditorElement();
      return (_ref2 = editorElement.shadowRoot) != null ? _ref2 : editorElement;
    };

    MinimapElement.prototype.getDummyDOMRoot = function(shadowRoot) {
      if (shadowRoot) {
        return this.getTextEditorElementRoot();
      } else {
        return this.getTextEditorElement();
      }
    };

    MinimapElement.prototype.getModel = function() {
      return this.minimap;
    };

    MinimapElement.prototype.setModel = function(minimap) {
      this.minimap = minimap;
      this.subscriptions.add(this.minimap.onDidChangeScrollTop((function(_this) {
        return function() {
          return _this.requestUpdate();
        };
      })(this)));
      this.subscriptions.add(this.minimap.onDidChangeScrollLeft((function(_this) {
        return function() {
          return _this.requestUpdate();
        };
      })(this)));
      this.subscriptions.add(this.minimap.onDidDestroy((function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this)));
      this.subscriptions.add(this.minimap.onDidChangeConfig((function(_this) {
        return function() {
          if (_this.attached) {
            return _this.requestForcedUpdate();
          }
        };
      })(this)));
      this.subscriptions.add(this.minimap.onDidChangeStandAlone((function(_this) {
        return function() {
          _this.setStandAlone(_this.minimap.isStandAlone());
          return _this.requestUpdate();
        };
      })(this)));
      this.subscriptions.add(this.minimap.onDidChange((function(_this) {
        return function(change) {
          _this.pendingChanges.push(change);
          return _this.requestUpdate();
        };
      })(this)));
      this.setStandAlone(this.minimap.isStandAlone());
      if ((this.width != null) && (this.height != null)) {
        this.minimap.setScreenHeightAndWidth(this.height, this.width);
      }
      return this.minimap;
    };

    MinimapElement.prototype.setStandAlone = function(standAlone) {
      this.standAlone = standAlone;
      if (this.standAlone) {
        this.setAttribute('stand-alone', true);
        this.disposeScrollIndicator();
        this.disposeOpenQuickSettings();
        this.removeControls();
        return this.removeVisibleArea();
      } else {
        this.removeAttribute('stand-alone');
        this.createVisibleArea();
        this.createControls();
        if (this.minimapScrollIndicator) {
          this.initializeScrollIndicator();
        }
        if (this.displayPluginsControls) {
          return this.initializeOpenQuickSettings();
        }
      }
    };

    MinimapElement.prototype.requestUpdate = function() {
      if (this.frameRequested) {
        return;
      }
      this.frameRequested = true;
      return requestAnimationFrame((function(_this) {
        return function() {
          _this.update();
          return _this.frameRequested = false;
        };
      })(this));
    };

    MinimapElement.prototype.requestForcedUpdate = function() {
      this.offscreenFirstRow = null;
      this.offscreenLastRow = null;
      return this.requestUpdate();
    };

    MinimapElement.prototype.update = function() {
      var canvasTop, canvasTransform, indicatorHeight, indicatorScroll, minimap, minimapScreenHeight, visibleAreaLeft, visibleAreaTop, visibleWidth;
      if (!(this.attached && this.isVisible() && (this.minimap != null))) {
        return;
      }
      minimap = this.minimap;
      minimap.enableCache();
      visibleAreaLeft = minimap.getTextEditorScaledScrollLeft();
      visibleAreaTop = minimap.getTextEditorScaledScrollTop() - minimap.getScrollTop();
      visibleWidth = Math.min(this.canvas.width / devicePixelRatio, this.width);
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
      this.applyStyles(this.controls, {
        width: visibleWidth + 'px'
      });
      canvasTop = minimap.getFirstVisibleScreenRow() * minimap.getLineHeight() - minimap.getScrollTop();
      canvasTransform = this.makeTranslate(0, canvasTop);
      if (devicePixelRatio !== 1) {
        canvasTransform += " " + this.makeScale(1 / devicePixelRatio);
      }
      if (SPEC_MODE) {
        this.applyStyles(this.canvas, {
          top: canvasTop + 'px'
        });
      } else {
        this.applyStyles(this.canvas, {
          transform: canvasTransform
        });
      }
      if (this.minimapScrollIndicator && minimap.canScroll() && !this.scrollIndicator) {
        this.initializeScrollIndicator();
      }
      if (this.scrollIndicator != null) {
        minimapScreenHeight = minimap.getScreenHeight();
        indicatorHeight = minimapScreenHeight * (minimapScreenHeight / minimap.getHeight());
        indicatorScroll = (minimapScreenHeight - indicatorHeight) * minimap.getCapedTextEditorScrollRatio();
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
      return minimap.clearCache();
    };

    MinimapElement.prototype.setDisplayCodeHighlights = function(displayCodeHighlights) {
      this.displayCodeHighlights = displayCodeHighlights;
      if (this.attached) {
        return this.requestForcedUpdate();
      }
    };

    MinimapElement.prototype.pollDOM = function() {
      var visibilityChanged;
      visibilityChanged = this.checkForVisibilityChange();
      if (this.isVisible()) {
        if (!this.wasVisible) {
          this.requestForcedUpdate();
        }
        return this.measureHeightAndWidth(visibilityChanged, false);
      }
    };

    MinimapElement.prototype.checkForVisibilityChange = function() {
      if (this.isVisible()) {
        if (this.wasVisible) {
          return false;
        } else {
          return this.wasVisible = true;
        }
      } else {
        if (this.wasVisible) {
          this.wasVisible = false;
          return true;
        } else {
          return this.wasVisible = false;
        }
      }
    };

    MinimapElement.prototype.measureHeightAndWidth = function(visibilityChanged, forceUpdate) {
      var canvasWidth, lineLength, softWrap, softWrapAtPreferredLineLength, wasResized, width;
      if (forceUpdate == null) {
        forceUpdate = true;
      }
      if (this.minimap == null) {
        return;
      }
      wasResized = this.width !== this.clientWidth || this.height !== this.clientHeight;
      this.height = this.clientHeight;
      this.width = this.clientWidth;
      canvasWidth = this.width;
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
          lineLength = atom.config.get('editor.preferredLineLength');
          softWrap = atom.config.get('editor.softWrap');
          softWrapAtPreferredLineLength = atom.config.get('editor.softWrapAtPreferredLineLength');
          width = lineLength * this.minimap.getCharWidth();
          if (softWrap && softWrapAtPreferredLineLength && lineLength && width <= this.width) {
            this.flexBasis = width;
            canvasWidth = width;
          } else {
            delete this.flexBasis;
          }
        } else {
          delete this.flexBasis;
        }
        if (canvasWidth !== this.canvas.width || this.height !== this.canvas.height) {
          this.canvas.width = canvasWidth * devicePixelRatio;
          return this.canvas.height = (this.height + this.minimap.getLineHeight()) * devicePixelRatio;
        }
      }
    };

    MinimapElement.prototype.observeConfig = function(configs) {
      var callback, config, _results;
      if (configs == null) {
        configs = {};
      }
      _results = [];
      for (config in configs) {
        callback = configs[config];
        _results.push(this.subscriptions.add(atom.config.observe(config, callback)));
      }
      return _results;
    };

    MinimapElement.prototype.mousePressedOverCanvas = function(e) {
      var height, top, _ref2;
      if (this.minimap.isStandAlone()) {
        return;
      }
      if (e.which === 1) {
        return this.leftMousePressedOverCanvas(e);
      } else if (e.which === 2) {
        this.middleMousePressedOverCanvas(e);
        _ref2 = this.visibleArea.getBoundingClientRect(), top = _ref2.top, height = _ref2.height;
        return this.startDrag({
          which: 2,
          pageY: top + height / 2
        });
      } else {

      }
    };

    MinimapElement.prototype.leftMousePressedOverCanvas = function(_arg) {
      var duration, from, pageY, row, scrollTop, step, target, textEditor, to, y;
      pageY = _arg.pageY, target = _arg.target;
      y = pageY - target.getBoundingClientRect().top;
      row = Math.floor(y / this.minimap.getLineHeight()) + this.minimap.getFirstVisibleScreenRow();
      textEditor = this.minimap.getTextEditor();
      scrollTop = row * textEditor.getLineHeightInPixels() - this.minimap.getTextEditorHeight() / 2;
      if (atom.config.get('minimap.scrollAnimation')) {
        from = this.minimap.getTextEditorScrollTop();
        to = scrollTop;
        step = (function(_this) {
          return function(now) {
            return _this.minimap.setTextEditorScrollTop(now);
          };
        })(this);
        duration = atom.config.get('minimap.scrollAnimationDuration');
        return this.animate({
          from: from,
          to: to,
          duration: duration,
          step: step
        });
      } else {
        return this.minimap.setTextEditorScrollTop(scrollTop);
      }
    };

    MinimapElement.prototype.middleMousePressedOverCanvas = function(_arg) {
      var offsetTop, pageY, ratio, y;
      pageY = _arg.pageY;
      offsetTop = this.getBoundingClientRect().top;
      y = pageY - offsetTop - this.minimap.getTextEditorScaledHeight() / 2;
      ratio = y / (this.minimap.getVisibleHeight() - this.minimap.getTextEditorScaledHeight());
      return this.minimap.setTextEditorScrollTop(ratio * this.minimap.getTextEditorMaxScrollTop());
    };

    MinimapElement.prototype.relayMousewheelEvent = function(e) {
      var editorElement;
      editorElement = atom.views.getView(this.minimap.textEditor);
      return editorElement.component.onMouseWheel(e);
    };

    MinimapElement.prototype.startDrag = function(e) {
      var dragOffset, initial, mousemoveHandler, mouseupHandler, offsetTop, pageY, top, which;
      which = e.which, pageY = e.pageY;
      if (!this.minimap) {
        return;
      }
      if (which !== 1 && which !== 2 && (e.touches == null)) {
        return;
      }
      top = this.visibleArea.getBoundingClientRect().top;
      offsetTop = this.getBoundingClientRect().top;
      dragOffset = pageY - top;
      initial = {
        dragOffset: dragOffset,
        offsetTop: offsetTop
      };
      mousemoveHandler = (function(_this) {
        return function(e) {
          return _this.drag(e, initial);
        };
      })(this);
      mouseupHandler = (function(_this) {
        return function(e) {
          return _this.endDrag(e, initial);
        };
      })(this);
      document.body.addEventListener('mousemove', mousemoveHandler);
      document.body.addEventListener('mouseup', mouseupHandler);
      document.body.addEventListener('mouseleave', mouseupHandler);
      document.body.addEventListener('touchmove', mousemoveHandler);
      document.body.addEventListener('touchend', mouseupHandler);
      return this.dragSubscription = new Disposable(function() {
        document.body.removeEventListener('mousemove', mousemoveHandler);
        document.body.removeEventListener('mouseup', mouseupHandler);
        document.body.removeEventListener('mouseleave', mouseupHandler);
        document.body.removeEventListener('touchmove', mousemoveHandler);
        return document.body.removeEventListener('touchend', mouseupHandler);
      });
    };

    MinimapElement.prototype.drag = function(e, initial) {
      var ratio, y;
      if (!this.minimap) {
        return;
      }
      if (e.which !== 1 && e.which !== 2 && (e.touches == null)) {
        return;
      }
      y = e.pageY - initial.offsetTop - initial.dragOffset;
      ratio = y / (this.minimap.getVisibleHeight() - this.minimap.getTextEditorScaledHeight());
      return this.minimap.setTextEditorScrollTop(ratio * this.minimap.getTextEditorMaxScrollTop());
    };

    MinimapElement.prototype.endDrag = function(e, initial) {
      if (!this.minimap) {
        return;
      }
      return this.dragSubscription.dispose();
    };

    MinimapElement.prototype.applyStyles = function(element, styles) {
      var cssText, property, value;
      if (element == null) {
        return;
      }
      cssText = '';
      for (property in styles) {
        value = styles[property];
        cssText += "" + property + ": " + value + "; ";
      }
      return element.style.cssText = cssText;
    };

    MinimapElement.prototype.makeTranslate = function(x, y) {
      if (x == null) {
        x = 0;
      }
      if (y == null) {
        y = 0;
      }
      if (this.useHardwareAcceleration) {
        return "translate3d(" + x + "px, " + y + "px, 0)";
      } else {
        return "translate(" + x + "px, " + y + "px)";
      }
    };

    MinimapElement.prototype.makeScale = function(x, y) {
      if (x == null) {
        x = 0;
      }
      if (y == null) {
        y = x;
      }
      if (this.useHardwareAcceleration) {
        return "scale3d(" + x + ", " + y + ", 1)";
      } else {
        return "scale(" + x + ", " + y + ")";
      }
    };

    MinimapElement.prototype.getTime = function() {
      return new Date();
    };

    MinimapElement.prototype.animate = function(_arg) {
      var duration, from, start, step, swing, to, update;
      from = _arg.from, to = _arg.to, duration = _arg.duration, step = _arg.step;
      start = this.getTime();
      swing = function(progress) {
        return 0.5 - Math.cos(progress * Math.PI) / 2;
      };
      update = (function(_this) {
        return function() {
          var delta, passed, progress;
          passed = _this.getTime() - start;
          if (duration === 0) {
            progress = 1;
          } else {
            progress = passed / duration;
          }
          if (progress > 1) {
            progress = 1;
          }
          delta = swing(progress);
          step(from + (to - from) * delta);
          if (progress < 1) {
            return requestAnimationFrame(update);
          }
        };
      })(this);
      return update();
    };

    return MinimapElement;

  })();

  module.exports = MinimapElement = registerOrUpdateElement('atom-text-editor-minimap', MinimapElement.prototype);

  MinimapElement.registerViewProvider = function() {
    return atom.views.addViewProvider(require('./minimap'), function(model) {
      var element;
      element = new MinimapElement;
      element.setModel(model);
      return element;
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL2xpYi9taW5pbWFwLWVsZW1lbnQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDBNQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQyxXQUFZLE9BQUEsQ0FBUSxpQkFBUixFQUFaLFFBQUQsQ0FBQTs7QUFBQSxFQUNBLE9BQW9DLE9BQUEsQ0FBUSxNQUFSLENBQXBDLEVBQUMsMkJBQUEsbUJBQUQsRUFBc0Isa0JBQUEsVUFEdEIsQ0FBQTs7QUFBQSxFQUVBLFFBQWdFLE9BQUEsQ0FBUSxZQUFSLENBQWhFLEVBQUMsZ0NBQUEsdUJBQUQsRUFBMEIseUJBQUEsZ0JBQTFCLEVBQTRDLHlCQUFBLGdCQUY1QyxDQUFBOztBQUFBLEVBR0EsZUFBQSxHQUFrQixPQUFBLENBQVEsNEJBQVIsQ0FIbEIsQ0FBQTs7QUFBQSxFQUlBLFlBQUEsR0FBZSxPQUFBLENBQVEsd0JBQVIsQ0FKZixDQUFBOztBQUFBLEVBTUEsMkJBQUEsR0FBOEIsSUFOOUIsQ0FBQTs7QUFBQSxFQVFBLFNBQUEsR0FBWSxJQUFJLENBQUMsVUFBTCxDQUFBLENBUlosQ0FBQTs7QUFBQSxFQXNCTTs7O0tBQ0o7O0FBQUEsSUFBQSxlQUFlLENBQUMsV0FBaEIsQ0FBNEIsY0FBNUIsQ0FBQSxDQUFBOztBQUFBLElBQ0EsWUFBWSxDQUFDLFdBQWIsQ0FBeUIsY0FBekIsQ0FEQSxDQUFBOztBQUFBLElBRUEsZ0JBQWdCLENBQUMsV0FBakIsQ0FBNkIsY0FBN0IsQ0FGQSxDQUFBOztBQUFBLElBR0EsZ0JBQWdCLENBQUMsV0FBakIsQ0FBNkIsY0FBN0IsQ0FIQSxDQUFBOztBQUtBO0FBQUEsZ0JBTEE7O0FBQUEsNkJBT0Esb0JBQUEsR0FBc0IsS0FQdEIsQ0FBQTs7QUFBQSw2QkFrQkEsZUFBQSxH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

//# sourceURL=/home/gsmyrnaios/.atom/packages/minimap/lib/minimap-element.coffee
