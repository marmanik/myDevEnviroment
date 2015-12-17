(function() {
  var ColorMarkerElement, CompositeDisposable, Emitter, RENDERERS, registerOrUpdateElement, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), CompositeDisposable = _ref.CompositeDisposable, Emitter = _ref.Emitter;

  registerOrUpdateElement = require('atom-utils').registerOrUpdateElement;

  RENDERERS = {
    'background': require('./renderers/background'),
    'outline': require('./renderers/outline'),
    'underline': require('./renderers/underline'),
    'dot': require('./renderers/dot'),
    'square-dot': require('./renderers/square-dot')
  };

  ColorMarkerElement = (function(_super) {
    __extends(ColorMarkerElement, _super);

    function ColorMarkerElement() {
      return ColorMarkerElement.__super__.constructor.apply(this, arguments);
    }

    ColorMarkerElement.prototype.renderer = new RENDERERS.background;

    ColorMarkerElement.prototype.createdCallback = function() {
      this.emitter = new Emitter;
      return this.released = true;
    };

    ColorMarkerElement.prototype.attachedCallback = function() {};

    ColorMarkerElement.prototype.detachedCallback = function() {};

    ColorMarkerElement.prototype.onDidRelease = function(callback) {
      return this.emitter.on('did-release', callback);
    };

    ColorMarkerElement.prototype.getModel = function() {
      return this.colorMarker;
    };

    ColorMarkerElement.prototype.setModel = function(colorMarker) {
      this.colorMarker = colorMarker;
      if (!this.released) {
        return;
      }
      this.released = false;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(this.colorMarker.marker.onDidDestroy((function(_this) {
        return function() {
          return _this.release();
        };
      })(this)));
      this.subscriptions.add(this.colorMarker.marker.onDidChange((function(_this) {
        return function(data) {
          var isValid;
          isValid = data.isValid;
          if (isValid) {
            return _this.render();
          } else {
            return _this.release();
          }
        };
      })(this)));
      return this.subscriptions.add(atom.config.observe('pigments.markerType', (function(_this) {
        return function(type) {
          if (type !== 'gutter') {
            return _this.render();
          }
        };
      })(this)));
    };

    ColorMarkerElement.prototype.destroy = function() {
      var _ref1, _ref2;
      if ((_ref1 = this.parentNode) != null) {
        _ref1.removeChild(this);
      }
      if ((_ref2 = this.subscriptions) != null) {
        _ref2.dispose();
      }
      return this.clear();
    };

    ColorMarkerElement.prototype.render = function() {
      var cls, k, region, regions, style, v, _i, _len, _ref1;
      if (this.colorMarker.marker.displayBuffer.isDestroyed()) {
        return;
      }
      this.innerHTML = '';
      _ref1 = this.renderer.render(this.colorMarker), style = _ref1.style, regions = _ref1.regions, cls = _ref1["class"];
      if (regions != null) {
        for (_i = 0, _len = regions.length; _i < _len; _i++) {
          region = regions[_i];
          this.appendChild(region);
        }
      }
      if (cls != null) {
        this.className = cls;
      } else {
        this.className = '';
      }
      if (style != null) {
        for (k in style) {
          v = style[k];
          this.style[k] = v;
        }
      } else {
        this.style.cssText = '';
      }
      return this.lastMarkerScreenRange = this.colorMarker.getScreenRange();
    };

    ColorMarkerElement.prototype.checkScreenRange = function() {
      if (this.colorMarker == null) {
        return;
      }
      if (!this.lastMarkerScreenRange.isEqual(this.colorMarker.getScreenRange())) {
        return this.render();
      }
    };

    ColorMarkerElement.prototype.isReleased = function() {
      return this.released;
    };

    ColorMarkerElement.prototype.release = function(dispatchEvent) {
      var marker;
      if (dispatchEvent == null) {
        dispatchEvent = true;
      }
      if (this.released) {
        return;
      }
      this.subscriptions.dispose();
      marker = this.colorMarker;
      this.clear();
      if (dispatchEvent) {
        return this.emitter.emit('did-release', {
          marker: marker,
          view: this
        });
      }
    };

    ColorMarkerElement.prototype.clear = function() {
      this.subscriptions = null;
      this.colorMarker = null;
      this.released = true;
      this.innerHTML = '';
      this.className = '';
      return this.style.cssText = '';
    };

    return ColorMarkerElement;

  })(HTMLElement);

  module.exports = ColorMarkerElement = registerOrUpdateElement('pigments-color-marker', ColorMarkerElement.prototype);

  ColorMarkerElement.setMarkerType = function(markerType) {
    if (markerType === 'gutter') {
      return;
    }
    return this.prototype.renderer = new RENDERERS[markerType];
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvY29sb3ItbWFya2VyLWVsZW1lbnQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDBGQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxPQUFpQyxPQUFBLENBQVEsTUFBUixDQUFqQyxFQUFDLDJCQUFBLG1CQUFELEVBQXNCLGVBQUEsT0FBdEIsQ0FBQTs7QUFBQSxFQUNDLDBCQUEyQixPQUFBLENBQVEsWUFBUixFQUEzQix1QkFERCxDQUFBOztBQUFBLEVBR0EsU0FBQSxHQUNFO0FBQUEsSUFBQSxZQUFBLEVBQWMsT0FBQSxDQUFRLHdCQUFSLENBQWQ7QUFBQSxJQUNBLFNBQUEsRUFBVyxPQUFBLENBQVEscUJBQVIsQ0FEWDtBQUFBLElBRUEsV0FBQSxFQUFhLE9BQUEsQ0FBUSx1QkFBUixDQUZiO0FBQUEsSUFHQSxLQUFBLEVBQU8sT0FBQSxDQUFRLGlCQUFSLENBSFA7QUFBQSxJQUlBLFlBQUEsRUFBYyxPQUFBLENBQVEsd0JBQVIsQ0FKZDtHQUpGLENBQUE7O0FBQUEsRUFVTTtBQUNKLHlDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxpQ0FBQSxRQUFBLEdBQVUsR0FBQSxDQUFBLFNBQWEsQ0FBQyxVQUF4QixDQUFBOztBQUFBLGlDQUVBLGVBQUEsR0FBaUIsU0FBQSxHQUFBO0FBQ2YsTUFBQSxJQUFDLENBQUEsT0FBRCxHQUFXLEdBQUEsQ0FBQSxPQUFYLENBQUE7YUFDQSxJQUFDLENBQUEsUUFBRCxHQUFZLEtBRkc7SUFBQSxDQUZqQixDQUFBOztBQUFBLGlDQU1BLGdCQUFBLEdBQWtCLFNBQUEsR0FBQSxDQU5sQixDQUFBOztBQUFBLGlDQVFBLGdCQUFBLEdBQWtCLFNBQUEsR0FBQSxDQVJsQixDQUFBOztBQUFBLGlDQVVBLFlBQUEs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

//# sourceURL=/home/gsmyrnaios/.atom/packages/pigments/lib/color-marker-element.coffee
