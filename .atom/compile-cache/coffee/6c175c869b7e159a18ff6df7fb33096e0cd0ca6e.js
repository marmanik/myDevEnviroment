(function() {
  var Decoration, Emitter, idCounter, nextId, _,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('underscore-plus');

  Emitter = require('event-kit').Emitter;

  idCounter = 0;

  nextId = function() {
    return idCounter++;
  };

  module.exports = Decoration = (function() {
    Decoration.isType = function(decorationProperties, type) {
      if (_.isArray(decorationProperties.type)) {
        if (__indexOf.call(decorationProperties.type, type) >= 0) {
          return true;
        }
        return false;
      } else {
        return type === decorationProperties.type;
      }
    };


    /*
    Section: Construction and Destruction
     */

    function Decoration(marker, minimap, properties) {
      this.marker = marker;
      this.minimap = minimap;
      this.emitter = new Emitter;
      this.id = nextId();
      this.setProperties(properties);
      this.properties.id = this.id;
      this.destroyed = false;
      this.markerDestroyDisposable = this.marker.onDidDestroy((function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this));
    }

    Decoration.prototype.destroy = function() {
      if (this.destroyed) {
        return;
      }
      this.markerDestroyDisposable.dispose();
      this.markerDestroyDisposable = null;
      this.destroyed = true;
      this.emitter.emit('did-destroy');
      return this.emitter.dispose();
    };

    Decoration.prototype.isDestroyed = function() {
      return this.destroyed;
    };


    /*
    Section: Event Subscription
     */

    Decoration.prototype.onDidChangeProperties = function(callback) {
      return this.emitter.on('did-change-properties', callback);
    };

    Decoration.prototype.onDidDestroy = function(callback) {
      return this.emitter.on('did-destroy', callback);
    };


    /*
    Section: Decoration Details
     */

    Decoration.prototype.getId = function() {
      return this.id;
    };

    Decoration.prototype.getMarker = function() {
      return this.marker;
    };

    Decoration.prototype.isType = function(type) {
      return Decoration.isType(this.properties, type);
    };


    /*
    Section: Properties
     */

    Decoration.prototype.getProperties = function() {
      return this.properties;
    };

    Decoration.prototype.setProperties = function(newProperties) {
      var oldProperties;
      if (this.destroyed) {
        return;
      }
      oldProperties = this.properties;
      this.properties = newProperties;
      this.properties.id = this.id;
      if (newProperties.type != null) {
        this.minimap.decorationDidChangeType(this);
      }
      return this.emitter.emit('did-change-properties', {
        oldProperties: oldProperties,
        newProperties: newProperties
      });
    };


    /*
    Section: Private methods
     */

    Decoration.prototype.matchesPattern = function(decorationPattern) {
      var key, value;
      if (decorationPattern == null) {
        return false;
      }
      for (key in decorationPattern) {
        value = decorationPattern[key];
        if (this.properties[key] !== value) {
          return false;
        }
      }
      return true;
    };

    return Decoration;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL2xpYi9kZWNvcmF0aW9uLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx5Q0FBQTtJQUFBLHFKQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQyxVQUFXLE9BQUEsQ0FBUSxXQUFSLEVBQVgsT0FERCxDQUFBOztBQUFBLEVBR0EsU0FBQSxHQUFZLENBSFosQ0FBQTs7QUFBQSxFQUlBLE1BQUEsR0FBUyxTQUFBLEdBQUE7V0FBRyxTQUFBLEdBQUg7RUFBQSxDQUpULENBQUE7O0FBQUEsRUFNQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBWUosSUFBQSxVQUFDLENBQUEsTUFBRCxHQUFTLFNBQUMsb0JBQUQsRUFBdUIsSUFBdkIsR0FBQTtBQUVQLE1BQUEsSUFBRyxDQUFDLENBQUMsT0FBRixDQUFVLG9CQUFvQixDQUFDLElBQS9CLENBQUg7QUFDRSxRQUFBLElBQWUsZUFBUSxvQkFBb0IsQ0FBQyxJQUE3QixFQUFBLElBQUEsTUFBZjtBQUFBLGlCQUFPLElBQVAsQ0FBQTtTQUFBO0FBQ0EsZUFBTyxLQUFQLENBRkY7T0FBQSxNQUFBO2VBSUUsSUFBQSxLQUFRLG9CQUFvQixDQUFDLEtBSi9CO09BRk87SUFBQSxDQUFULENBQUE7O0FBUUE7QUFBQTs7T0FSQTs7QUFZYSxJQUFBLG9CQUFFLE1BQUYsRUFBVyxPQUFYLEVBQW9CLFVBQXBCLEdBQUE7QUFDWCxNQURZLElBQUMsQ0FBQSxTQUFBLE1BQ2IsQ0FBQTtBQUFBLE1BRHFCLElBQUMsQ0FBQSxVQUFBLE9BQ3RCLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxPQUFELEdBQVcsR0FBQSxDQUFBLE9BQVgsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxD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

//# sourceURL=/home/gsmyrnaios/.atom/packages/minimap/lib/decoration.coffee
