(function() {
  var CanvasDrawer, Mixin, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore-plus');

  Mixin = require('mixto');

  module.exports = CanvasDrawer = (function(_super) {
    __extends(CanvasDrawer, _super);

    function CanvasDrawer() {
      return CanvasDrawer.__super__.constructor.apply(this, arguments);
    }


    /* Public */

    CanvasDrawer.prototype.initializeCanvas = function() {
      this.canvas = document.createElement('canvas');
      this.context = this.canvas.getContext('2d');
      this.canvas.webkitImageSmoothingEnabled = false;
      if (this.pendingChanges == null) {
        this.pendingChanges = [];
      }
      this.offscreenCanvas = document.createElement('canvas');
      return this.offscreenContext = this.offscreenCanvas.getContext('2d');
    };

    CanvasDrawer.prototype.updateCanvas = function() {
      var firstRow, intact, intactRanges, lastRow, _i, _len;
      firstRow = this.minimap.getFirstVisibleScreenRow();
      lastRow = this.minimap.getLastVisibleScreenRow();
      intactRanges = this.computeIntactRanges(firstRow, lastRow);
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      if (intactRanges.length === 0) {
        this.drawLines(this.context, firstRow, lastRow, 0);
      } else {
        for (_i = 0, _len = intactRanges.length; _i < _len; _i++) {
          intact = intactRanges[_i];
          this.copyBitmapPart(this.context, this.offscreenCanvas, intact.domStart, intact.start - firstRow, intact.end - intact.start);
        }
        this.fillGapsBetweenIntactRanges(this.context, intactRanges, firstRow, lastRow);
      }
      this.offscreenCanvas.width = this.canvas.width;
      this.offscreenCanvas.height = this.canvas.height;
      this.offscreenContext.drawImage(this.canvas, 0, 0);
      this.offscreenFirstRow = firstRow;
      return this.offscreenLastRow = lastRow;
    };

    CanvasDrawer.prototype.getTextOpacity = function() {
      return this.textOpacity;
    };

    CanvasDrawer.prototype.getDefaultColor = function() {
      var color;
      color = this.retrieveStyleFromDom(['.editor'], 'color', false, true);
      return this.transparentize(color, this.getTextOpacity());
    };

    CanvasDrawer.prototype.getTokenColor = function(token) {
      return this.retrieveTokenColorFromDom(token);
    };

    CanvasDrawer.prototype.getDecorationColor = function(decoration) {
      var properties;
      properties = decoration.getProperties();
      if (properties.color != null) {
        return properties.color;
      }
      return this.retrieveDecorationColorFromDom(decoration);
    };

    CanvasDrawer.prototype.retrieveTokenColorFromDom = function(token) {
      var color, scopes;
      scopes = token.scopeDescriptor || token.scopes;
      color = this.retrieveStyleFromDom(scopes, 'color');
      return this.transparentize(color, this.getTextOpacity());
    };

    CanvasDrawer.prototype.retrieveDecorationColorFromDom = function(decoration) {
      return this.retrieveStyleFromDom(decoration.getProperties().scope.split(/\s+/), 'background-color', false);
    };

    CanvasDrawer.prototype.transparentize = function(color, opacity) {
      if (opacity == null) {
        opacity = 1;
      }
      return color.replace('rgb(', 'rgba(').replace(')', ", " + opacity + ")");
    };

    CanvasDrawer.prototype.drawLines = function(context, firstRow, lastRow, offsetRow) {
      var canvasWidth, charHeight, charWidth, color, decoration, decorations, displayCodeHighlights, highlightDecorations, invisibleRegExp, line, lineDecorations, lineHeight, lines, row, screenRow, token, value, w, x, y, y0, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2, _ref3, _ref4;
      if (firstRow > lastRow) {
        return;
      }
      lines = this.getTextEditor().tokenizedLinesForScreenRows(firstRow, lastRow);
      lineHeight = this.minimap.getLineHeight() * devicePixelRatio;
      charHeight = this.minimap.getCharHeight() * devicePixelRatio;
      charWidth = this.minimap.getCharWidth() * devicePixelRatio;
      canvasWidth = this.canvas.width;
      displayCodeHighlights = this.displayCodeHighlights;
      decorations = this.minimap.decorationsByTypeThenRows(firstRow, lastRow);
      line = lines[0];
      invisibleRegExp = this.getInvisibleRegExp(line);
      for (row = _i = 0, _len = lines.length; _i < _len; row = ++_i) {
        line = lines[row];
        x = 0;
        y = offsetRow + row;
        screenRow = firstRow + row;
        y0 = y * lineHeight;
        lineDecorations = (_ref = decorations['line']) != null ? _ref[screenRow] : void 0;
        if (lineDecorations != null ? lineDecorations.length : void 0) {
          this.drawLineDecorations(context, lineDecorations, y0, canvasWidth, lineHeight);
        }
        highlightDecorations = (_ref1 = decorations['highlight-under']) != null ? _ref1[firstRow + row] : void 0;
        if (highlightDecorations != null ? highlightDecorations.length : void 0) {
          for (_j = 0, _len1 = highlightDecorations.length; _j < _len1; _j++) {
            decoration = highlightDecorations[_j];
            this.drawHighlightDecoration(context, decoration, y, screenRow, lineHeight, charWidth, canvasWidth);
          }
        }
        if ((line != null ? line.tokens : void 0) != null) {
          _ref2 = line.tokens;
          for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
            token = _ref2[_k];
            w = token.screenDelta;
            if (!token.isOnlyWhitespace()) {
              color = displayCodeHighlights ? this.getTokenColor(token) : this.getDefaultColor();
              value = token.value;
              if (invisibleRegExp != null) {
                value = value.replace(invisibleRegExp, ' ');
              }
              x = this.drawToken(context, value, color, x, y0, charWidth, charHeight);
            } else {
              x += w * charWidth;
            }
            if (x > canvasWidth) {
              break;
            }
          }
        }
        highlightDecorations = (_ref3 = decorations['highlight-over']) != null ? _ref3[firstRow + row] : void 0;
        if (highlightDecorations != null ? highlightDecorations.length : void 0) {
          for (_l = 0, _len3 = highlightDecorations.length; _l < _len3; _l++) {
            decoration = highlightDecorations[_l];
            this.drawHighlightDecoration(context, decoration, y, screenRow, lineHeight, charWidth, canvasWidth);
          }
        }
        highlightDecorations = (_ref4 = decorations['highlight-outline']) != null ? _ref4[firstRow + row] : void 0;
        if (highlightDecorations != null ? highlightDecorations.length : void 0) {
          for (_m = 0, _len4 = highlightDecorations.length; _m < _len4; _m++) {
            decoration = highlightDecorations[_m];
            this.drawHighlightOutlineDecoration(context, decoration, y, screenRow, lineHeight, charWidth, canvasWidth);
          }
        }
      }
      return context.fill();
    };

    CanvasDrawer.prototype.getInvisibleRegExp = function(line) {
      var invisibles;
      if ((line != null) && (line.invisibles != null)) {
        invisibles = [];
        if (line.invisibles.cr != null) {
          invisibles.push(line.invisibles.cr);
        }
        if (line.invisibles.eol != null) {
          invisibles.push(line.invisibles.eol);
        }
        if (line.invisibles.space != null) {
          invisibles.push(line.invisibles.space);
        }
        if (line.invisibles.tab != null) {
          invisibles.push(line.invisibles.tab);
        }
        return RegExp("" + (invisibles.filter(function(s) {
          return typeof s === 'string';
        }).map(_.escapeRegExp).join('|')), "g");
      }
    };

    CanvasDrawer.prototype.drawToken = function(context, text, color, x, y, charWidth, charHeight) {
      var char, chars, _i, _len;
      context.fillStyle = color;
      chars = 0;
      for (_i = 0, _len = text.length; _i < _len; _i++) {
        char = text[_i];
        if (/\s/.test(char)) {
          if (chars > 0) {
            context.fillRect(x - (chars * charWidth), y, chars * charWidth, charHeight);
          }
          chars = 0;
        } else {
          chars++;
        }
        x += charWidth;
      }
      if (chars > 0) {
        context.fillRect(x - (chars * charWidth), y, chars * charWidth, charHeight);
      }
      return x;
    };

    CanvasDrawer.prototype.drawLineDecorations = function(context, decorations, y, canvasWidth, lineHeight) {
      var decoration, _i, _len;
      for (_i = 0, _len = decorations.length; _i < _len; _i++) {
        decoration = decorations[_i];
        context.fillStyle = this.getDecorationColor(decoration);
        context.fillRect(0, y, canvasWidth, lineHeight);
      }
    };

    CanvasDrawer.prototype.drawHighlightDecoration = function(context, decoration, y, screenRow, lineHeight, charWidth, canvasWidth) {
      var colSpan, range, rowSpan, x;
      context.fillStyle = this.getDecorationColor(decoration);
      range = decoration.getMarker().getScreenRange();
      rowSpan = range.end.row - range.start.row;
      if (rowSpan === 0) {
        colSpan = range.end.column - range.start.column;
        return context.fillRect(range.start.column * charWidth, y * lineHeight, colSpan * charWidth, lineHeight);
      } else {
        if (screenRow === range.start.row) {
          x = range.start.column * charWidth;
          return context.fillRect(x, y * lineHeight, canvasWidth - x, lineHeight);
        } else if (screenRow === range.end.row) {
          return context.fillRect(0, y * lineHeight, range.end.column * charWidth, lineHeight);
        } else {
          return context.fillRect(0, y * lineHeight, canvasWidth, lineHeight);
        }
      }
    };

    CanvasDrawer.prototype.drawHighlightOutlineDecoration = function(context, decoration, y, screenRow, lineHeight, charWidth, canvasWidth) {
      var bottomWidth, colSpan, range, rowSpan, width, xBottomStart, xEnd, xStart, yEnd, yStart;
      context.fillStyle = this.getDecorationColor(decoration);
      range = decoration.getMarker().getScreenRange();
      rowSpan = range.end.row - range.start.row;
      if (rowSpan === 0) {
        colSpan = range.end.column - range.start.column;
        width = colSpan * charWidth;
        xStart = range.start.column * charWidth;
        xEnd = xStart + width;
        yStart = y * lineHeight;
        yEnd = yStart + lineHeight;
        context.fillRect(xStart, yStart, width, 1);
        context.fillRect(xStart, yEnd, width, 1);
        context.fillRect(xStart, yStart, 1, lineHeight);
        return context.fillRect(xEnd, yStart, 1, lineHeight);
      } else if (rowSpan === 1) {
        xStart = range.start.column * charWidth;
        xEnd = range.end.column * charWidth;
        if (screenRow === range.start.row) {
          width = canvasWidth - xStart;
          yStart = y * lineHeight;
          yEnd = yStart + lineHeight;
          xBottomStart = Math.max(xStart, xEnd);
          bottomWidth = canvasWidth - xBottomStart;
          context.fillRect(xStart, yStart, width, 1);
          context.fillRect(xBottomStart, yEnd, bottomWidth, 1);
          context.fillRect(xStart, yStart, 1, lineHeight);
          return context.fillRect(canvasWidth - 1, yStart, 1, lineHeight);
        } else {
          width = canvasWidth - xStart;
          yStart = y * lineHeight;
          yEnd = yStart + lineHeight;
          bottomWidth = canvasWidth - xEnd;
          context.fillRect(0, yStart, xStart, 1);
          context.fillRect(0, yEnd, xEnd, 1);
          context.fillRect(0, yStart, 1, lineHeight);
          return context.fillRect(xEnd, yStart, 1, lineHeight);
        }
      } else {
        xStart = range.start.column * charWidth;
        xEnd = range.end.column * charWidth;
        if (screenRow === range.start.row) {
          width = canvasWidth - xStart;
          yStart = y * lineHeight;
          yEnd = yStart + lineHeight;
          context.fillRect(xStart, yStart, width, 1);
          context.fillRect(xStart, yStart, 1, lineHeight);
          return context.fillRect(canvasWidth - 1, yStart, 1, lineHeight);
        } else if (screenRow === range.end.row) {
          width = canvasWidth - xStart;
          yStart = y * lineHeight;
          yEnd = yStart + lineHeight;
          context.fillRect(0, yEnd, xEnd, 1);
          context.fillRect(0, yStart, 1, lineHeight);
          return context.fillRect(xEnd, yStart, 1, lineHeight);
        } else {
          yStart = y * lineHeight;
          yEnd = yStart + lineHeight;
          context.fillRect(0, yStart, 1, lineHeight);
          context.fillRect(canvasWidth - 1, yStart, 1, lineHeight);
          if (screenRow === range.start.row + 1) {
            context.fillRect(0, yStart, xStart, 1);
          }
          if (screenRow === range.end.row - 1) {
            return context.fillRect(xEnd, yEnd, canvasWidth - xEnd, 1);
          }
        }
      }
    };

    CanvasDrawer.prototype.copyBitmapPart = function(context, bitmapCanvas, srcRow, destRow, rowCount) {
      var lineHeight;
      lineHeight = this.minimap.getLineHeight() * devicePixelRatio;
      return context.drawImage(bitmapCanvas, 0, srcRow * lineHeight, bitmapCanvas.width, rowCount * lineHeight, 0, destRow * lineHeight, bitmapCanvas.width, rowCount * lineHeight);
    };


    /* Internal */

    CanvasDrawer.prototype.fillGapsBetweenIntactRanges = function(context, intactRanges, firstRow, lastRow) {
      var currentRow, intact, _i, _len;
      currentRow = firstRow;
      for (_i = 0, _len = intactRanges.length; _i < _len; _i++) {
        intact = intactRanges[_i];
        this.drawLines(context, currentRow, intact.start - 1, currentRow - firstRow);
        currentRow = intact.end;
      }
      if (currentRow <= lastRow) {
        return this.drawLines(context, currentRow, lastRow, currentRow - firstRow);
      }
    };

    CanvasDrawer.prototype.computeIntactRanges = function(firstRow, lastRow) {
      var change, intactRange, intactRanges, newIntactRanges, range, _i, _j, _len, _len1, _ref;
      if ((this.offscreenFirstRow == null) && (this.offscreenLastRow == null)) {
        return [];
      }
      intactRanges = [
        {
          start: this.offscreenFirstRow,
          end: this.offscreenLastRow,
          domStart: 0
        }
      ];
      _ref = this.pendingChanges;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        change = _ref[_i];
        newIntactRanges = [];
        for (_j = 0, _len1 = intactRanges.length; _j < _len1; _j++) {
          range = intactRanges[_j];
          if (change.end < range.start && change.screenDelta !== 0) {
            newIntactRanges.push({
              start: range.start + change.screenDelta,
              end: range.end + change.screenDelta,
              domStart: range.domStart
            });
          } else if (change.end < range.start || change.start > range.end) {
            newIntactRanges.push(range);
          } else {
            if (change.start > range.start) {
              newIntactRanges.push({
                start: range.start,
                end: change.start - 1,
                domStart: range.domStart
              });
            }
            if (change.end < range.end) {
              if (change.bufferDelta !== 0) {
                newIntactRanges.push({
                  start: change.end + change.screenDelta + 1,
                  end: range.end + change.screenDelta,
                  domStart: range.domStart + change.end + 1 - range.start
                });
              }
            }
          }
          intactRange = newIntactRanges[newIntactRanges.length - 1];
        }
        intactRanges = newIntactRanges;
      }
      this.truncateIntactRanges(intactRanges, firstRow, lastRow);
      this.pendingChanges = [];
      return intactRanges;
    };

    CanvasDrawer.prototype.truncateIntactRanges = function(intactRanges, firstRow, lastRow) {
      var i, range;
      i = 0;
      while (i < intactRanges.length) {
        range = intactRanges[i];
        if (range.start < firstRow) {
          range.domStart += firstRow - range.start;
          range.start = firstRow;
        }
        if (range.end > lastRow) {
          range.end = lastRow;
        }
        if (range.start >= range.end) {
          intactRanges.splice(i--, 1);
        }
        i++;
      }
      return intactRanges.sort(function(a, b) {
        return a.domStart - b.domStart;
      });
    };

    return CanvasDrawer;

  })(Mixin);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL2xpYi9taXhpbnMvY2FudmFzLWRyYXdlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsc0JBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FBSixDQUFBOztBQUFBLEVBQ0EsS0FBQSxHQUFRLE9BQUEsQ0FBUSxPQUFSLENBRFIsQ0FBQTs7QUFBQSxFQVFBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixtQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUE7QUFBQSxnQkFBQTs7QUFBQSwyQkFHQSxnQkFBQSxHQUFrQixTQUFBLEdBQUE7QUFDaEIsTUFBQSxJQUFDLENBQUEsTUFBRCxHQUFVLFFBQVEsQ0FBQyxhQUFULENBQXVCLFFBQXZCLENBQVYsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsQ0FBbUIsSUFBbkIsQ0FEWCxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsTUFBTSxDQUFDLDJCQUFSLEdBQXNDLEtBRnRDLENBQUE7O1FBR0EsSUFBQyxDQUFBLGlCQUFrQjtPQUhuQjtBQUFBLE1BS0EsSUFBQyxDQUFBLGVBQUQsR0FBbUIsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsUUFBdkIsQ0FMbkIsQ0FBQTthQU1BLElBQUMsQ0FBQSxnQkFBRCxHQUFvQixJQUFDLENBQUEsZUFBZSxDQUFDLFVBQWpCLENBQTRCLElBQTVCLEVBUEo7SUFBQSxDQUhsQixDQUFBOztBQUFBLDJCQWNBLFlBQUEsR0FBYyxTQUFBLEdBQUE7QUFDWixVQUFBLGlEQUFBO0FBQUEsTUFBQSxRQUFBLEdBQVcsSUFBQyxDQUFBLE9BQU8sQ0FBQyx3QkFBVCxDQUFBLENBQVgsQ0FB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

//# sourceURL=/home/gsmyrnaios/.atom/packages/minimap/lib/mixins/canvas-drawer.coffee
