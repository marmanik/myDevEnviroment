(function() {
  var Decoration, DecorationManagement, Emitter, Mixin, path,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Mixin = require('mixto');

  path = require('path');

  Emitter = require('event-kit').Emitter;

  Decoration = null;

  module.exports = DecorationManagement = (function(_super) {
    __extends(DecorationManagement, _super);

    function DecorationManagement() {
      return DecorationManagement.__super__.constructor.apply(this, arguments);
    }


    /* Public */

    DecorationManagement.prototype.initializeDecorations = function() {
      if (this.emitter == null) {
        this.emitter = new Emitter;
      }
      this.decorationsById = {};
      this.decorationsByMarkerId = {};
      this.decorationMarkerChangedSubscriptions = {};
      this.decorationMarkerDestroyedSubscriptions = {};
      this.decorationUpdatedSubscriptions = {};
      this.decorationDestroyedSubscriptions = {};
      return Decoration != null ? Decoration : Decoration = require('../decoration');
    };

    DecorationManagement.prototype.getDecorations = function() {
      var decoration, id, _ref, _results;
      _ref = this.decorationsById;
      _results = [];
      for (id in _ref) {
        decoration = _ref[id];
        _results.push(decoration);
      }
      return _results;
    };

    DecorationManagement.prototype.onDidAddDecoration = function(callback) {
      return this.emitter.on('did-add-decoration', callback);
    };

    DecorationManagement.prototype.onDidRemoveDecoration = function(callback) {
      return this.emitter.on('did-remove-decoration', callback);
    };

    DecorationManagement.prototype.onDidChangeDecoration = function(callback) {
      return this.emitter.on('did-change-decoration', callback);
    };

    DecorationManagement.prototype.onDidUpdateDecoration = function(callback) {
      return this.emitter.on('did-update-decoration', callback);
    };

    DecorationManagement.prototype.decorationForId = function(id) {
      return this.decorationsById[id];
    };

    DecorationManagement.prototype.decorationsForScreenRowRange = function(startScreenRow, endScreenRow) {
      var decorations, decorationsByMarkerId, marker, _i, _len, _ref;
      decorationsByMarkerId = {};
      _ref = this.findMarkers({
        intersectsScreenRowRange: [startScreenRow, endScreenRow]
      });
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        marker = _ref[_i];
        if (decorations = this.decorationsByMarkerId[marker.id]) {
          decorationsByMarkerId[marker.id] = decorations;
        }
      }
      return decorationsByMarkerId;
    };

    DecorationManagement.prototype.decorationsByTypeThenRows = function(startScreenRow, endScreenRow) {
      var cache, decoration, id, range, row, rows, type, _base, _i, _j, _len, _ref, _ref1, _ref2, _results;
      if (this.decorationsByTypeThenRowsCache != null) {
        return this.decorationsByTypeThenRowsCache;
      }
      cache = {};
      _ref = this.decorationsById;
      for (id in _ref) {
        decoration = _ref[id];
        range = decoration.marker.getScreenRange();
        rows = (function() {
          _results = [];
          for (var _i = _ref1 = range.start.row, _ref2 = range.end.row; _ref1 <= _ref2 ? _i <= _ref2 : _i >= _ref2; _ref1 <= _ref2 ? _i++ : _i--){ _results.push(_i); }
          return _results;
        }).apply(this);
        type = decoration.getProperties().type;
        if (cache[type] == null) {
          cache[type] = {};
        }
        for (_j = 0, _len = rows.length; _j < _len; _j++) {
          row = rows[_j];
          if ((_base = cache[type])[row] == null) {
            _base[row] = [];
          }
          cache[type][row].push(decoration);
        }
      }
      return this.decorationsByTypeThenRowsCache = cache;
    };

    DecorationManagement.prototype.invalidateDecorationForScreenRowsCache = function() {
      return this.decorationsByTypeThenRowsCache = null;
    };

    DecorationManagement.prototype.decorateMarker = function(marker, decorationParams) {
      var cls, decoration, _base, _base1, _base2, _base3, _base4, _name, _name1, _name2, _name3, _name4;
      if (this.destroyed) {
        return;
      }
      if (marker == null) {
        return;
      }
      marker = this.getMarker(marker.id);
      if (marker == null) {
        return;
      }
      if (decorationParams.type === 'highlight') {
        decorationParams.type = 'highlight-over';
      }
      if ((decorationParams.scope == null) && (decorationParams["class"] != null)) {
        cls = decorationParams["class"].split(' ').join('.');
        decorationParams.scope = ".minimap ." + cls;
      }
      if ((_base = this.decorationMarkerDestroyedSubscriptions)[_name = marker.id] == null) {
        _base[_name] = marker.onDidDestroy((function(_this) {
          return function() {
            return _this.removeAllDecorationsForMarker(marker);
          };
        })(this));
      }
      if ((_base1 = this.decorationMarkerChangedSubscriptions)[_name1 = marker.id] == null) {
        _base1[_name1] = marker.onDidChange((function(_this) {
          return function(event) {
            var decoration, decorations, end, newEnd, newStart, oldEnd, oldStart, rangesDiffs, start, _i, _j, _len, _len1, _ref, _ref1, _ref2, _results;
            decorations = _this.decorationsByMarkerId[marker.id];
            _this.invalidateDecorationForScreenRowsCache();
            if (decorations != null) {
              for (_i = 0, _len = decorations.length; _i < _len; _i++) {
                decoration = decorations[_i];
                _this.emitter.emit('did-change-decoration', {
                  marker: marker,
                  decoration: decoration,
                  event: event
                });
              }
            }
            oldStart = event.oldTailScreenPosition;
            oldEnd = event.oldHeadScreenPosition;
            newStart = event.newTailScreenPosition;
            newEnd = event.newHeadScreenPosition;
            if (oldStart.row > oldEnd.row) {
              _ref = [oldEnd, oldStart], oldStart = _ref[0], oldEnd = _ref[1];
            }
            if (newStart.row > newEnd.row) {
              _ref1 = [newEnd, newStart], newStart = _ref1[0], newEnd = _ref1[1];
            }
            rangesDiffs = _this.computeRangesDiffs(oldStart, oldEnd, newStart, newEnd);
            _results = [];
            for (_j = 0, _len1 = rangesDiffs.length; _j < _len1; _j++) {
              _ref2 = rangesDiffs[_j], start = _ref2[0], end = _ref2[1];
              _results.push(_this.emitRangeChanges({
                start: start,
                end: end
              }, 0));
            }
            return _results;
          };
        })(this));
      }
      decoration = new Decoration(marker, this, decorationParams);
      if ((_base2 = this.decorationsByMarkerId)[_name2 = marker.id] == null) {
        _base2[_name2] = [];
      }
      this.decorationsByMarkerId[marker.id].push(decoration);
      this.decorationsById[decoration.id] = decoration;
      if ((_base3 = this.decorationUpdatedSubscriptions)[_name3 = decoration.id] == null) {
        _base3[_name3] = decoration.onDidChangeProperties((function(_this) {
          return function(event) {
            return _this.emitDecorationChanges(decoration);
          };
        })(this));
      }
      if ((_base4 = this.decorationDestroyedSubscriptions)[_name4 = decoration.id] == null) {
        _base4[_name4] = decoration.onDidDestroy((function(_this) {
          return function(event) {
            return _this.removeDecoration(decoration);
          };
        })(this));
      }
      this.emitDecorationChanges(decoration);
      this.emitter.emit('did-add-decoration', {
        marker: marker,
        decoration: decoration
      });
      return decoration;
    };

    DecorationManagement.prototype.computeRangesDiffs = function(oldStart, oldEnd, newStart, newEnd) {
      var diffs;
      diffs = [];
      if (oldStart.isLessThan(newStart)) {
        diffs.push([oldStart, newStart]);
      } else if (newStart.isLessThan(oldStart)) {
        diffs.push([newStart, oldStart]);
      }
      if (oldEnd.isLessThan(newEnd)) {
        diffs.push([oldEnd, newEnd]);
      } else if (newEnd.isLessThan(oldEnd)) {
        diffs.push([newEnd, oldEnd]);
      }
      return diffs;
    };

    DecorationManagement.prototype.emitDecorationChanges = function(decoration) {
      var range;
      if (decoration.marker.displayBuffer.isDestroyed()) {
        return;
      }
      this.invalidateDecorationForScreenRowsCache();
      range = decoration.marker.getScreenRange();
      if (range == null) {
        return;
      }
      return this.emitRangeChanges(range, 0);
    };

    DecorationManagement.prototype.emitRangeChanges = function(range, screenDelta) {
      var changeEvent, endScreenRow, firstRenderedScreenRow, lastRenderedScreenRow, startScreenRow;
      startScreenRow = range.start.row;
      endScreenRow = range.end.row;
      lastRenderedScreenRow = this.getLastVisibleScreenRow();
      firstRenderedScreenRow = this.getFirstVisibleScreenRow();
      if (screenDelta == null) {
        screenDelta = (lastRenderedScreenRow - firstRenderedScreenRow) - (endScreenRow - startScreenRow);
      }
      changeEvent = {
        start: startScreenRow,
        end: endScreenRow,
        screenDelta: screenDelta
      };
      return this.emitChanges(changeEvent);
    };

    DecorationManagement.prototype.removeDecoration = function(decoration) {
      var decorations, index, marker, _ref, _ref1;
      if (decoration == null) {
        return;
      }
      marker = decoration.marker;
      delete this.decorationsById[decoration.id];
      if ((_ref = this.decorationUpdatedSubscriptions[decoration.id]) != null) {
        _ref.dispose();
      }
      if ((_ref1 = this.decorationDestroyedSubscriptions[decoration.id]) != null) {
        _ref1.dispose();
      }
      delete this.decorationUpdatedSubscriptions[decoration.id];
      delete this.decorationDestroyedSubscriptions[decoration.id];
      if (!(decorations = this.decorationsByMarkerId[marker.id])) {
        return;
      }
      this.emitDecorationChanges(decoration);
      index = decorations.indexOf(decoration);
      if (index > -1) {
        decorations.splice(index, 1);
        this.emitter.emit('did-remove-decoration', {
          marker: marker,
          decoration: decoration
        });
        if (decorations.length === 0) {
          return this.removedAllMarkerDecorations(marker);
        }
      }
    };

    DecorationManagement.prototype.removeAllDecorationsForMarker = function(marker) {
      var decoration, decorations, _i, _len, _ref;
      if (marker == null) {
        return;
      }
      decorations = (_ref = this.decorationsByMarkerId[marker.id]) != null ? _ref.slice() : void 0;
      if (!decorations) {
        return;
      }
      for (_i = 0, _len = decorations.length; _i < _len; _i++) {
        decoration = decorations[_i];
        this.emitter.emit('did-remove-decoration', {
          marker: marker,
          decoration: decoration
        });
        this.emitDecorationChanges(decoration);
      }
      return this.removedAllMarkerDecorations(marker);
    };

    DecorationManagement.prototype.removedAllMarkerDecorations = function(marker) {
      if (marker == null) {
        return;
      }
      this.decorationMarkerChangedSubscriptions[marker.id].dispose();
      this.decorationMarkerDestroyedSubscriptions[marker.id].dispose();
      delete this.decorationsByMarkerId[marker.id];
      delete this.decorationMarkerChangedSubscriptions[marker.id];
      return delete this.decorationMarkerDestroyedSubscriptions[marker.id];
    };

    DecorationManagement.prototype.removeAllDecorations = function() {
      var decoration, id, sub, _ref, _ref1, _ref2, _ref3, _ref4;
      _ref = this.decorationMarkerChangedSubscriptions;
      for (id in _ref) {
        sub = _ref[id];
        sub.dispose();
      }
      _ref1 = this.decorationMarkerDestroyedSubscriptions;
      for (id in _ref1) {
        sub = _ref1[id];
        sub.dispose();
      }
      _ref2 = this.decorationUpdatedSubscriptions;
      for (id in _ref2) {
        sub = _ref2[id];
        sub.dispose();
      }
      _ref3 = this.decorationDestroyedSubscriptions;
      for (id in _ref3) {
        sub = _ref3[id];
        sub.dispose();
      }
      _ref4 = this.decorationsById;
      for (id in _ref4) {
        decoration = _ref4[id];
        decoration.destroy();
      }
      this.decorationsById = {};
      this.decorationsByMarkerId = {};
      this.decorationMarkerChangedSubscriptions = {};
      this.decorationMarkerDestroyedSubscriptions = {};
      this.decorationUpdatedSubscriptions = {};
      return this.decorationDestroyedSubscriptions = {};
    };

    DecorationManagement.prototype.decorationDidChangeType = function(decoration) {};

    DecorationManagement.prototype.decorationUpdated = function(decoration) {
      return this.emitter.emit('did-update-decoration', decoration);
    };

    return DecorationManagement;

  })(Mixin);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL2xpYi9taXhpbnMvZGVjb3JhdGlvbi1tYW5hZ2VtZW50LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxzREFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxPQUFSLENBQVIsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQURQLENBQUE7O0FBQUEsRUFFQyxVQUFXLE9BQUEsQ0FBUSxXQUFSLEVBQVgsT0FGRCxDQUFBOztBQUFBLEVBR0EsVUFBQSxHQUFhLElBSGIsQ0FBQTs7QUFBQSxFQVVBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSiwyQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUE7QUFBQSxnQkFBQTs7QUFBQSxtQ0FHQSxxQkFBQSxHQUF1QixTQUFBLEdBQUE7O1FBQ3JCLElBQUMsQ0FBQSxVQUFXLEdBQUEsQ0FBQTtPQUFaO0FBQUEsTUFDQSxJQUFDLENBQUEsZUFBRCxHQUFtQixFQURuQixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEscUJBQUQsR0FBeUIsRUFGekIsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLG9DQUFELEdBQXdDLEVBSHhDLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxzQ0FBRCxHQUEwQyxFQUoxQyxDQUFBO0FBQUEsTUFLQSxJQUFDLENBQUEsOEJBQUQsR0FBa0MsRUFMbEMsQ0FBQTtBQUFBLE1BTUEsSUFBQyxDQUFBLGdDQUFELEdBQW9DLEVBTnBDLENBQUE7a0NBUUEsYUFBQSxhQUFjLE9BQUEsQ0FBUSxlQUFSLEVBVE87SUFBQSxDQUh2QixDQUFBOztBQUFBLG1DQWNBLGNBQUEsR0FBZ0IsU0FBQSxHQUFBO0FBQUcsVUFBQSw4QkFBQTtBQUFBO0FBQUE7V0FBQSxVQUFBOzhCQUFBO0FBQUEsc0JBQUEsV0FBQSxDQUFBO0FBQUE7c0JBQUg7SUFBQSxDQWRoQixDQUFBOztBQUFBLG1DQXVCQSxrQkFBQSxHQUFvQixTQUFDLFFBQUQsR0FBQTthQUNsQixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxvQkFBWixFQUFrQyxRQUFsQyxFQURrQjtJQUFBLENBdkJwQixDQUFBOztBQUFBLG1DQWtDQSxxQkFBQSxHQUF1QixTQUFDLFFBQUQsR0FBQTthQUNyQixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSx1QkFBWixFQUFxQyxRQUFyQyxFQURxQjtJQUFBLENBbEN2QixDQUFBOztBQUFBLG1DQWdEQSxxQkFBQSxHQUF1QixTQUFDLFFBQUQsR0FBQTthQUNyQixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSx1QkFBWixFQUFxQyxRQUFyQyxFQURxQjtJQUFBLENBaER2QixDQUFBOztBQUFBLG1DQTBEQSxxQkFBQSxHQUF1QixTQUFDLFFBQUQsR0FBQTthQUNyQixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSx1QkFBWixFQUFxQyxRQUFyQyxFQURxQjtJQUFBLENBMUR2QixDQUFBOztBQUFBLG1DQWtFQSxlQUFBLEdBQWlCLFNBQUMsRUFBRCxHQUFBO2FBQ2YsSUFBQyxDQUFBLGVBQWdCLENBQUEsRUFBQSxFQURGO0lBQUEsQ0FsRWpCLENBQUE7O0FBQUEsbUNBMkVBLDRCQUFBLEdBQThCLFNBQUMsY0FBRCxFQUFpQixZQUFqQixHQUFBO0FBQzVCLFVBQUEsMERBQUE7QUFBQSxNQUFBLHFCQUFBLEdBQXdCLEVBQXhCLENBQUE7QUFFQTs7O0FBQUEsV0FBQSwyQ0FBQTswQkFBQTtBQUNFLFFBQUEsSUFBRyxXQUFBLEdBQWMsSUFBQyxDQUFBLHFCQUFzQixDQUFBLE1BQU0sQ0FBQyxFQUFQLENBQXhDO0FBQ0UsVUFBQSxxQkFBc0IsQ0FBQSxNQUFNLENBQUMsRUFBUCxDQUF0QixHQUFtQyxXQUFuQyxDQURGO1NBREY7QUFBQSxPQUZBO2FBTUEsc0JBUDRCO0lBQUEsQ0EzRTlCLENBQUE7O0FBQUEsbUNBNkdBLHlCQUFBLEdBQTJCLFNBQUMsY0FBRCxFQUFpQixZQUFqQixHQUFBO0FBQ3pCLFVBQUEsZ0dBQUE7QUFBQSxNQUFBLElBQTBDLDJDQUExQztBQUFBLGVBQU8sSUFBQyxDQUFBLDhCQUFSLENBQUE7T0FBQTtBQUFBLE1BRUEsS0FBQSxHQUFRLEVBRlIsQ0FBQTtBQUlBO0FBQUEsV0FBQSxVQUFBOzhCQUFBO0FBQ0UsUUFBQSxLQUFBLEdBQVEsVUFBVSxDQUFDLE1BQU0sQ0FBQyxjQUFsQixDQUFBLENBQVIsQ0FBQTtBQUFBLFFBQ0EsSUFBQSxHQUFPOzs7O3NCQURQLENBQUE7QUFBQSxRQUdDLE9BQVEsVUFBVSxDQUFDLGFBQVgsQ0FBQSxFQUFSLElBSEQsQ0FBQTs7VUFJQSxLQUFNLENBQUEsSUFBQSxJQUFTO1NBSmY7QUFNQSxhQUFBLDJDQUFBO3lCQUFBOztpQkFDYyxDQUFBLEdBQUEsSUFBUTtXQUFwQjtBQUFBLFVBQ0EsS0FBTSxDQUFBLElBQUEsQ0FBTSxDQUFBLEdBQUEsQ0FBSSxDQUFDLElBQWpCLENBQXNCLFVBQXRCLENBREEsQ0FERjtBQUFBLFNBUEY7QUFBQSxPQUpBO2FBZUEsSUFBQyxDQUFBLDhCQUFELEdBQWtDLE1BaEJUO0lBQUEsQ0E3RzNCLENBQUE7O0FBQUEsbUNBZ0lBLHNDQUFBLEdBQXdDLFNBQUEsR0FBQTthQUN0QyxJQUFDLENBQUEsOEJBQUQsR0FBa0MsS0FESTtJQUFBLENBaEl4QyxDQUFBOztBQUFBLG1DQXFLQSxjQUFBLEdBQWdCLFNBQUMsTUFBRCxFQUFTLGdCQUFULEdBQUE7QUFDZCxVQUFBLDZGQUFBO0FBQUEsTUFBQSxJQUFVLElBQUMsQ0FBQSxTQUFYO0FBQUEsY0FBQSxDQUFBO09BQUE7QUFDQSxNQUFBLElBQWMsY0FBZDtBQUFBLGNBQUEsQ0FBQTtPQURBO0FBQUEsTUFFQSxNQUFBLEdBQVMsSUFBQyxDQUFBLFNBQUQsQ0FBVyxNQUFNLENBQUMsRUFBbEIsQ0FGVCxDQUFBO0FBR0EsTUFBQSxJQUFjLGNBQWQ7QUFBQSxjQUFBLENBQUE7T0FIQTtBQUtBLE1BQUEsSUFBRyxnQkFBZ0IsQ0FBQyxJQUFqQixLQUF5QixXQUE1QjtBQUNFLFFBQUEsZ0JBQWdCLENBQUMsSUFBakIsR0FBd0IsZ0JBQXhCLENBREY7T0FMQTtBQVFBLE1BQUEsSUFBSSxnQ0FBRCxJQUE2QixtQ0FBaEM7QUFDRSxRQUFBLEdBQUEsR0FBTSxnQkFBZ0IsQ0FBQyxPQUFELENBQU0sQ0FBQyxLQUF2QixDQUE2QixHQUE3QixDQUFpQyxDQUFDLElBQWxDLENBQXVDLEdBQXZDLENBQU4sQ0FBQTtBQUFBLFFBQ0EsZ0JBQWdCLENBQUMsS0FBakIsR0FBMEIsWUFBQSxHQUFZLEdBRHRDLENBREY7T0FSQTs7dUJBWXNELE1BQU0sQ0FBQyxZQUFQLENBQW9CLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO21CQUN4RSxLQUFDLENBQUEsNkJBQUQsQ0FBK0IsTUFBL0IsRUFEd0U7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwQjtPQVp0RDs7eUJBZW9ELE1BQU0sQ0FBQyxXQUFQLENBQW1CLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQyxLQUFELEdBQUE7QUFDckUsZ0JBQUEsdUlBQUE7QUFBQSxZQUFBLFdBQUEsR0FBYyxLQUFDLENBQUEscUJBQXNCLENBQUEsTUFBTSxDQUFDLEVBQVAsQ0FBckMsQ0FBQTtBQUFBLFlBQ0EsS0FBQyxDQUFBLHNDQUFELENBQUEsQ0FEQSxDQUFBO0FBS0EsWUFBQSxJQUFHLG1CQUFIO0FBQ0UsbUJBQUEsa0RBQUE7NkNBQUE7QUFDRSxnQkFBQSxLQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyx1QkFBZCxFQUF1QztBQUFBLGtCQUFDLFFBQUEsTUFBRDtBQUFBLGtCQUFTLFlBQUEsVUFBVDtBQUFBLGtCQUFxQixPQUFBLEtBQXJCO2lCQUF2QyxDQUFBLENBREY7QUFBQSxlQURGO2FBTEE7QUFBQSxZQVNBLFFBQUEsR0FBVyxLQUFLLENBQUMscUJBVGpCLENBQUE7QUFBQSxZQVVBLE1BQUEsR0FBUyxLQUFLLENBQUMscUJBVmYsQ0FBQTtBQUFBLFlBWUEsUUFBQSxHQUFXLEtBQUssQ0FBQyxxQkFaakIsQ0FBQTtBQUFBLFlBYUEsTUFBQSxHQUFTLEtBQUssQ0FBQyxxQkFiZixDQUFBO0FBZUEsWUFBQSxJQUEyQyxRQUFRLENBQUMsR0FBVCxHQUFlLE1BQU0sQ0FBQyxHQUFqRTtBQUFBLGNBQUEsT0FBcUIsQ0FBQyxNQUFELEVBQVMsUUFBVCxDQUFyQixFQUFDLGtCQUFELEVBQVcsZ0JBQVgsQ0FBQTthQWZBO0FBZ0JBLFlBQUEsSUFBMkMsUUFBUSxDQUFDLEdBQVQsR0FBZSxNQUFNLENBQUMsR0FBakU7QUFBQSxjQUFBLFFBQXFCLENBQUMsTUFBRCxFQUFTLFFBQVQsQ0FBckIsRUFBQyxtQkFBRCxFQUFXLGlCQUFYLENBQUE7YUFoQkE7QUFBQSxZQWtCQSxXQUFBLEdBQWMsS0FBQyxDQUFBLGtCQUFELENBQW9CLFFBQXBCLEVBQThCLE1BQTlCLEVBQXNDLFFBQXRDLEVBQWdELE1BQWhELENBbEJkLENBQUE7QUFtQkE7aUJBQUEsb0RBQUEsR0FBQTtBQUFBLHVDQUF3QyxrQkFBTyxjQUEvQyxDQUFBO0FBQUEsNEJBQUEsS0FBQyxDQUFBLGdCQUFELENBQWtCO0FBQUEsZ0JBQUMsT0FBQSxLQUFEO0FBQUEsZ0JBQVEsS0FBQSxHQUFSO2VBQWxCLEVBQWdDLENBQWhDLEVBQUEsQ0FBQTtBQUFBOzRCQXBCcUU7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuQjtPQWZwRDtBQUFBLE1BcUNBLFVBQUEsR0FBaUIsSUFBQSxVQUFBLENBQVcsTUFBWCxFQUFtQixJQUFuQixFQUF5QixnQkFBekIsQ0FyQ2pCLENBQUE7O3lCQXNDcUM7T0F0Q3JDO0FBQUEsTUF1Q0EsSUFBQyxDQUFBLHFCQUFzQixDQUFBLE1BQU0sQ0FBQyxFQUFQLENBQVUsQ0FBQyxJQUFsQyxDQUF1QyxVQUF2QyxDQXZDQSxDQUFBO0FBQUEsTUF3Q0EsSUFBQyxDQUFBLGVBQWdCLENBQUEsVUFBVSxDQUFDLEVBQVgsQ0FBakIsR0FBa0MsVUF4Q2xDLENBQUE7O3lCQTBDa0QsVUFBVSxDQUFDLHFCQUFYLENBQWlDLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQyxLQUFELEdBQUE7bUJBQ2pGLEtBQUMsQ0FBQSxxQkFBRCxDQUF1QixVQUF2QixFQURpRjtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpDO09BMUNsRDs7eUJBNkNvRCxVQUFVLENBQUMsWUFBWCxDQUF3QixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUMsS0FBRCxHQUFBO21CQUMxRSxLQUFDLENBQUEsZ0JBQUQsQ0FBa0IsVUFBbEIsRUFEMEU7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4QjtPQTdDcEQ7QUFBQSxNQWdEQSxJQUFDLENBQUEscUJBQUQsQ0FBdUIsVUFBdkIsQ0FoREEsQ0FBQTtBQUFBLE1BaURBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLG9CQUFkLEVBQW9DO0FBQUEsUUFBQyxRQUFBLE1BQUQ7QUFBQSxRQUFTLFlBQUEsVUFBVDtPQUFwQyxDQWpEQSxDQUFBO2FBa0RBLFdBbkRjO0lBQUEsQ0FyS2hCLENBQUE7O0FBQUEsbUNBbU9BLGtCQUFBLEdBQW9CLFNBQUMsUUFBRCxFQUFXLE1BQVgsRUFBbUIsUUFBbkIsRUFBNkIsTUFBN0IsR0FBQTtBQUNsQixVQUFBLEtBQUE7QUFBQSxNQUFBLEtBQUEsR0FBUSxFQUFSLENBQUE7QUFFQSxNQUFBLElBQUcsUUFBUSxDQUFDLFVBQVQsQ0FBb0IsUUFBcEIsQ0FBSDtBQUNFLFFBQUEsS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFDLFFBQUQsRUFBVyxRQUFYLENBQVgsQ0FBQSxDQURGO09BQUEsTUFFSyxJQUFHLFFBQVEsQ0FBQyxVQUFULENBQW9CLFFBQXBCLENBQUg7QUFDSCxRQUFBLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBQyxRQUFELEVBQVcsUUFBWCxDQUFYLENBQUEsQ0FERztPQUpMO0FBT0EsTUFBQSxJQUFHLE1BQU0sQ0FBQyxVQUFQLENBQWtCLE1BQWxCLENBQUg7QUFDRSxRQUFBLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBQyxNQUFELEVBQVMsTUFBVCxDQUFYLENBQUEsQ0FERjtPQUFBLE1BRUssSUFBRyxNQUFNLENBQUMsVUFBUCxDQUFrQixNQUFsQixDQUFIO0FBQ0gsUUFBQSxLQUFLLENBQUMsSUFBTixDQUFXLENBQUMsTUFBRCxFQUFTLE1BQVQsQ0FBWCxDQUFBLENBREc7T0FUTDthQVlBLE1BYmtCO0lBQUEsQ0FuT3BCLENBQUE7O0FBQUEsbUNBc1BBLHFCQUFBLEdBQXVCLFNBQUMsVUFBRCxHQUFBO0FBQ3JCLFVBQUEsS0FBQTtBQUFBLE1BQUEsSUFBVSxVQUFVLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxXQUFoQyxDQUFBLENBQVY7QUFBQSxjQUFBLENBQUE7T0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLHNDQUFELENBQUEsQ0FEQSxDQUFBO0FBQUEsTUFFQSxLQUFBLEdBQVEsVUFBVSxDQUFDLE1BQU0sQ0FBQyxjQUFsQixDQUFBLENBRlIsQ0FBQTtBQUdBLE1BQUEsSUFBYyxhQUFkO0FBQUEsY0FBQSxDQUFBO09BSEE7YUFLQSxJQUFDLENBQUEsZ0JBQUQsQ0FBa0IsS0FBbEIsRUFBeUIsQ0FBekIsRUFOcUI7SUFBQSxDQXRQdkIsQ0FBQTs7QUFBQSxtQ0FpUUEsZ0JBQUEsR0FBa0IsU0FBQyxLQUFELEVBQVEsV0FBUixHQUFBO0FBQ2hCLFVBQUEsd0ZBQUE7QUFBQSxNQUFBLGNBQUEsR0FBaUIsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUE3QixDQUFBO0FBQUEsTUFDQSxZQUFBLEdBQWUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUR6QixDQUFBO0FBQUEsTUFFQSxxQkFBQSxHQUF5QixJQUFDLENBQUEsdUJBQUQsQ0FBQSxDQUZ6QixDQUFBO0FBQUEsTUFHQSxzQkFBQSxHQUF5QixJQUFDLENBQUEsd0JBQUQsQ0FBQSxDQUh6QixDQUFBOztRQUlBLGNBQWUsQ0FBQyxxQkFBQSxHQUF3QixzQkFBekIsQ0FBQSxHQUFtRCxDQUFDLFlBQUEsR0FBZSxjQUFoQjtPQUpsRTtBQUFBLE1BTUEsV0FBQSxHQUNFO0FBQUEsUUFBQSxLQUFBLEVBQU8sY0FBUDtBQUFBLFFBQ0EsR0FBQSxFQUFLLFlBREw7QUFBQSxRQUVBLFdBQUEsRUFBYSxXQUZiO09BUEYsQ0FBQTthQVdBLElBQUMsQ0FBQSxXQUFELENBQWEsV0FBYixFQVpnQjtJQUFBLENBalFsQixDQUFBOztBQUFBLG1DQWtSQSxnQkFBQSxHQUFrQixTQUFDLFVBQUQsR0FBQTtBQUNoQixVQUFBLHVDQUFBO0FBQUEsTUFBQSxJQUFjLGtCQUFkO0FBQUEsY0FBQSxDQUFBO09BQUE7QUFBQSxNQUNDLFNBQVUsV0FBVixNQURELENBQUE7QUFBQSxNQUVBLE1BQUEsQ0FBQSxJQUFRLENBQUEsZUFBZ0IsQ0FBQSxVQUFVLENBQUMsRUFBWCxDQUZ4QixDQUFBOztZQUk4QyxDQUFFLE9BQWhELENBQUE7T0FKQTs7YUFLZ0QsQ0FBRSxPQUFsRCxDQUFBO09BTEE7QUFBQSxNQU9BLE1BQUEsQ0FBQSxJQUFRLENBQUEsOEJBQStCLENBQUEsVUFBVSxDQUFDLEVBQVgsQ0FQdkMsQ0FBQTtBQUFBLE1BUUEsTUFBQSxDQUFBLElBQVEsQ0FBQSxnQ0FBaUMsQ0FBQSxVQUFVLENBQUMsRUFBWCxDQVJ6QyxDQUFBO0FBVUEsTUFBQSxJQUFBLENBQUEsQ0FBYyxXQUFBLEdBQWMsSUFBQyxDQUFBLHFCQUFzQixDQUFBLE1BQU0sQ0FBQyxFQUFQLENBQXJDLENBQWQ7QUFBQSxjQUFBLENBQUE7T0FWQTtBQUFBLE1BWUEsSUFBQyxDQUFBLHFCQUFELENBQXVCLFVBQXZCLENBWkEsQ0FBQTtBQUFBLE1BYUEsS0FBQSxHQUFRLFdBQVcsQ0FBQyxPQUFaLENBQW9CLFVBQXBCLENBYlIsQ0FBQTtBQWVBLE1BQUEsSUFBRyxLQUFBLEdBQVEsQ0FBQSxDQUFYO0FBQ0UsUUFBQSxXQUFXLENBQUMsTUFBWixDQUFtQixLQUFuQixFQUEwQixDQUExQixDQUFBLENBQUE7QUFBQSxRQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLHVCQUFkLEVBQXVDO0FBQUEsVUFBQyxRQUFBLE1BQUQ7QUFBQSxVQUFTLFlBQUEsVUFBVDtTQUF2QyxDQURBLENBQUE7QUFFQSxRQUFBLElBQXdDLFdBQVcsQ0FBQyxNQUFaLEtBQXNCLENBQTlEO2lCQUFBLElBQUMsQ0FBQSwyQkFBRCxDQUE2QixNQUE3QixFQUFBO1NBSEY7T0FoQmdCO0lBQUEsQ0FsUmxCLENBQUE7O0FBQUEsbUNBMFNBLDZCQUFBLEdBQStCLFNBQUMsTUFBRCxHQUFBO0FBQzdCLFVBQUEsdUNBQUE7QUFBQSxNQUFBLElBQWMsY0FBZDtBQUFBLGNBQUEsQ0FBQTtPQUFBO0FBQUEsTUFDQSxXQUFBLGdFQUErQyxDQUFFLEtBQW5DLENBQUEsVUFEZCxDQUFBO0FBRUEsTUFBQSxJQUFBLENBQUEsV0FBQTtBQUFBLGNBQUEsQ0FBQTtPQUZBO0FBR0EsV0FBQSxrREFBQTtxQ0FBQTtBQUNFLFFBQUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsdUJBQWQsRUFBdUM7QUFBQSxVQUFDLFFBQUEsTUFBRDtBQUFBLFVBQVMsWUFBQSxVQUFUO1NBQXZDLENBQUEsQ0FBQTtBQUFBLFFBQ0EsSUFBQyxDQUFBLHFCQUFELENBQXVCLFVBQXZCLENBREEsQ0FERjtBQUFBLE9BSEE7YUFPQSxJQUFDLENBQUEsMkJBQUQsQ0FBNkIsTUFBN0IsRUFSNkI7SUFBQSxDQTFTL0IsQ0FBQTs7QUFBQSxtQ0F1VEEsMkJBQUEsR0FBNkIsU0FBQyxNQUFELEdBQUE7QUFDM0IsTUFBQSxJQUFjLGNBQWQ7QUFBQSxjQUFBLENBQUE7T0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLG9DQUFxQyxDQUFBLE1BQU0sQ0FBQyxFQUFQLENBQVUsQ0FBQyxPQUFqRCxDQUFBLENBREEsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLHNDQUF1QyxDQUFBLE1BQU0sQ0FBQyxFQUFQLENBQVUsQ0FBQyxPQUFuRCxDQUFBLENBRkEsQ0FBQTtBQUFBLE1BSUEsTUFBQSxDQUFBLElBQVEsQ0FBQSxxQkFBc0IsQ0FBQSxNQUFNLENBQUMsRUFBUCxDQUo5QixDQUFBO0FBQUEsTUFLQSxNQUFBLENBQUEsSUFBUSxDQUFBLG9DQUFxQyxDQUFBLE1BQU0sQ0FBQyxFQUFQLENBTDdDLENBQUE7YUFNQSxNQUFBLENBQUEsSUFBUSxDQUFBLHNDQUF1QyxDQUFBLE1BQU0sQ0FBQyxFQUFQLEVBUHBCO0lBQUEsQ0F2VDdCLENBQUE7O0FBQUEsbUNBaVVBLG9CQUFBLEdBQXNCLFNBQUEsR0FBQTtBQUNwQixVQUFBLHFEQUFBO0FBQUE7QUFBQSxXQUFBLFVBQUE7dUJBQUE7QUFBQSxRQUFBLEdBQUcsQ0FBQyxPQUFKLENBQUEsQ0FBQSxDQUFBO0FBQUEsT0FBQTtBQUNBO0FBQUEsV0FBQSxXQUFBO3dCQUFBO0FBQUEsUUFBQSxHQUFHLENBQUMsT0FBSixDQUFBLENBQUEsQ0FBQTtBQUFBLE9BREE7QUFFQTtBQUFBLFdBQUEsV0FBQTt3QkFBQTtBQUFBLFFBQUEsR0FBRyxDQUFDLE9BQUosQ0FBQSxDQUFBLENBQUE7QUFBQSxPQUZBO0FBR0E7QUFBQSxXQUFBLFdBQUE7d0JBQUE7QUFBQSxRQUFBLEdBQUcsQ0FBQyxPQUFKLENBQUEsQ0FBQSxDQUFBO0FBQUEsT0FIQTtBQUlBO0FBQUEsV0FBQSxXQUFBOytCQUFBO0FBQUEsUUFBQSxVQUFVLENBQUMsT0FBWCxDQUFBLENBQUEsQ0FBQTtBQUFBLE9BSkE7QUFBQSxNQU1BLElBQUMsQ0FBQSxlQUFELEdBQW1CLEVBTm5CLENBQUE7QUFBQSxNQU9BLElBQUMsQ0FBQSxxQkFBRCxHQUF5QixFQVB6QixDQUFBO0FBQUEsTUFRQSxJQUFDLENBQUEsb0NBQUQsR0FBd0MsRUFSeEMsQ0FBQTtBQUFBLE1BU0EsSUFBQyxDQUFBLHNDQUFELEdBQTBDLEVBVDFDLENBQUE7QUFBQSxNQVVBLElBQUMsQ0FBQSw4QkFBRCxHQUFrQyxFQVZsQyxDQUFBO2FBV0EsSUFBQyxDQUFBLGdDQUFELEdBQW9DLEdBWmhCO0lBQUEsQ0FqVXRCLENBQUE7O0FBQUEsbUNBa1ZBLHVCQUFBLEdBQXlCLFNBQUMsVUFBRCxHQUFBLENBbFZ6QixDQUFBOztBQUFBLG1DQXdWQSxpQkFBQSxHQUFtQixTQUFDLFVBQUQsR0FBQTthQUNqQixJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyx1QkFBZCxFQUF1QyxVQUF2QyxFQURpQjtJQUFBLENBeFZuQixDQUFBOztnQ0FBQTs7S0FEaUMsTUFYbkMsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/gsmyrnaios/.atom/packages/minimap/lib/mixins/decoration-management.coffee
