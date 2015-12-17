(function() {
  var Minimap, MinimapElement, fs, isVisible, mousedown, mousemove, mouseup, mousewheel, path, realOffsetLeft, realOffsetTop, sleep, stylesheet, touchmove, touchstart, _ref;

  fs = require('fs-plus');

  path = require('path');

  Minimap = require('../lib/minimap');

  MinimapElement = require('../lib/minimap-element');

  stylesheet = require('./helpers/workspace').stylesheet;

  _ref = require('./helpers/events'), mousemove = _ref.mousemove, mousedown = _ref.mousedown, mouseup = _ref.mouseup, mousewheel = _ref.mousewheel, touchstart = _ref.touchstart, touchmove = _ref.touchmove;

  realOffsetTop = function(o) {
    return o.offsetTop;
  };

  realOffsetLeft = function(o) {
    return o.offsetLeft;
  };

  isVisible = function(node) {
    return node.offsetWidth > 0 || node.offsetHeight > 0;
  };

  sleep = function(duration) {
    var t;
    t = new Date;
    return waitsFor(function() {
      return new Date - t > duration;
    });
  };

  describe('MinimapElement', function() {
    var dir, editor, editorElement, jasmineContent, largeSample, mediumSample, minimap, minimapElement, smallSample, _ref1;
    _ref1 = [], editor = _ref1[0], minimap = _ref1[1], largeSample = _ref1[2], mediumSample = _ref1[3], smallSample = _ref1[4], jasmineContent = _ref1[5], editorElement = _ref1[6], minimapElement = _ref1[7], dir = _ref1[8];
    beforeEach(function() {
      jasmineContent = document.body.querySelector('#jasmine-content');
      atom.config.set('minimap.charHeight', 4);
      atom.config.set('minimap.charWidth', 2);
      atom.config.set('minimap.interline', 1);
      atom.config.set('minimap.textOpacity', 1);
      MinimapElement.registerViewProvider();
      editor = atom.workspace.buildTextEditor({});
      editorElement = atom.views.getView(editor);
      jasmineContent.insertBefore(editorElement, jasmineContent.firstChild);
      editorElement.setHeight(50);
      minimap = new Minimap({
        textEditor: editor
      });
      dir = atom.project.getDirectories()[0];
      largeSample = fs.readFileSync(dir.resolve('large-file.coffee')).toString();
      mediumSample = fs.readFileSync(dir.resolve('two-hundred.txt')).toString();
      smallSample = fs.readFileSync(dir.resolve('sample.coffee')).toString();
      editor.setText(largeSample);
      return minimapElement = atom.views.getView(minimap);
    });
    it('has been registered in the view registry', function() {
      return expect(minimapElement).toExist();
    });
    it('has stored the minimap as its model', function() {
      return expect(minimapElement.getModel()).toBe(minimap);
    });
    it('has a canvas in a shadow DOM', function() {
      return expect(minimapElement.shadowRoot.querySelector('canvas')).toExist();
    });
    it('has a div representing the visible area', function() {
      return expect(minimapElement.shadowRoot.querySelector('.minimap-visible-area')).toExist();
    });
    return describe('when attached to the text editor element', function() {
      var canvas, lastFn, nextAnimationFrame, noAnimationFrame, visibleArea, _ref2;
      _ref2 = [], noAnimationFrame = _ref2[0], nextAnimationFrame = _ref2[1], lastFn = _ref2[2], canvas = _ref2[3], visibleArea = _ref2[4];
      beforeEach(function() {
        var requestAnimationFrameSafe;
        noAnimationFrame = function() {
          throw new Error('No animation frame requested');
        };
        nextAnimationFrame = noAnimationFrame;
        requestAnimationFrameSafe = window.requestAnimationFrame;
        return spyOn(window, 'requestAnimationFrame').andCallFake(function(fn) {
          lastFn = fn;
          return nextAnimationFrame = function() {
            nextAnimationFrame = noAnimationFrame;
            return fn();
          };
        });
      });
      beforeEach(function() {
        canvas = minimapElement.shadowRoot.querySelector('canvas');
        editorElement.setWidth(200);
        editorElement.setHeight(50);
        editorElement.setScrollTop(1000);
        editorElement.setScrollLeft(200);
        return minimapElement.attach();
      });
      afterEach(function() {
        return minimap.destroy();
      });
      it('takes the height of the editor', function() {
        expect(minimapElement.offsetHeight).toEqual(editorElement.clientHeight);
        return expect(minimapElement.offsetWidth).toBeCloseTo(editorElement.clientWidth / 10, 0);
      });
      it('knows when attached to a text editor', function() {
        return expect(minimapElement.attachedToTextEditor).toBeTruthy();
      });
      it('resizes the canvas to fit the minimap', function() {
        expect(canvas.offsetHeight / devicePixelRatio).toBeCloseTo(minimapElement.offsetHeight + minimap.getLineHeight(), 0);
        return expect(canvas.offsetWidth / devicePixelRatio).toBeCloseTo(minimapElement.offsetWidth, 0);
      });
      it('requests an update', function() {
        return expect(minimapElement.frameRequested).toBeTruthy();
      });
      describe('with css filters', function() {
        describe('when a hue-rotate filter is applied to a rgb color', function() {
          var additionnalStyleNode;
          additionnalStyleNode = [][0];
          beforeEach(function() {
            minimapElement.invalidateCache();
            additionnalStyleNode = document.createElement('style');
            additionnalStyleNode.textContent = "" + stylesheet + "\n\n.editor {\n  color: red;\n  -webkit-filter: hue-rotate(180deg);\n}";
            return jasmineContent.appendChild(additionnalStyleNode);
          });
          return it('computes the new color by applying the hue rotation', function() {
            waitsFor(function() {
              return nextAnimationFrame !== noAnimationFrame;
            });
            return runs(function() {
              nextAnimationFrame();
              return expect(minimapElement.retrieveStyleFromDom(['.editor'], 'color')).toEqual("rgb(0, " + 0x6d + ", " + 0x6d + ")");
            });
          });
        });
        return describe('when a hue-rotate filter is applied to a rgba color', function() {
          var additionnalStyleNode;
          additionnalStyleNode = [][0];
          beforeEach(function() {
            minimapElement.invalidateCache();
            additionnalStyleNode = document.createElement('style');
            additionnalStyleNode.textContent = "" + stylesheet + "\n\n.editor {\n  color: rgba(255,0,0,0);\n  -webkit-filter: hue-rotate(180deg);\n}";
            return jasmineContent.appendChild(additionnalStyleNode);
          });
          return it('computes the new color by applying the hue rotation', function() {
            waitsFor(function() {
              return nextAnimationFrame !== noAnimationFrame;
            });
            return runs(function() {
              nextAnimationFrame();
              return expect(minimapElement.retrieveStyleFromDom(['.editor'], 'color')).toEqual("rgba(0, " + 0x6d + ", " + 0x6d + ", 0)");
            });
          });
        });
      });
      describe('when the update is performed', function() {
        beforeEach(function() {
          waitsFor(function() {
            return nextAnimationFrame !== noAnimationFrame;
          });
          return runs(function() {
            nextAnimationFrame();
            return visibleArea = minimapElement.shadowRoot.querySelector('.minimap-visible-area');
          });
        });
        it('sets the visible area width and height', function() {
          expect(visibleArea.offsetWidth).toEqual(minimapElement.clientWidth);
          return expect(visibleArea.offsetHeight).toBeCloseTo(minimap.getTextEditorScaledHeight(), 0);
        });
        it('sets the visible visible area offset', function() {
          expect(realOffsetTop(visibleArea)).toBeCloseTo(minimap.getTextEditorScaledScrollTop() - minimap.getScrollTop(), 0);
          return expect(realOffsetLeft(visibleArea)).toBeCloseTo(minimap.getTextEditorScaledScrollLeft(), 0);
        });
        it('offsets the canvas when the scroll does not match line height', function() {
          editorElement.setScrollTop(1004);
          waitsFor(function() {
            return nextAnimationFrame !== noAnimationFrame;
          });
          return runs(function() {
            nextAnimationFrame();
            return expect(realOffsetTop(canvas)).toBeCloseTo(-2, -1);
          });
        });
        it('does not fail to update render the invisible char when modified', function() {
          atom.config.set('editor.showInvisibles', true);
          atom.config.set('editor.invisibles', {
            cr: '*'
          });
          return expect(function() {
            return nextAnimationFrame();
          }).not.toThrow();
        });
        it('renders the visible line decorations', function() {
          spyOn(minimapElement, 'drawLineDecorations').andCallThrough();
          minimap.decorateMarker(editor.markBufferRange([[1, 0], [1, 10]]), {
            type: 'line',
            color: '#0000FF'
          });
          minimap.decorateMarker(editor.markBufferRange([[10, 0], [10, 10]]), {
            type: 'line',
            color: '#0000FF'
          });
          minimap.decorateMarker(editor.markBufferRange([[100, 0], [100, 10]]), {
            type: 'line',
            color: '#0000FF'
          });
          editorElement.setScrollTop(0);
          waitsFor(function() {
            return nextAnimationFrame !== noAnimationFrame;
          });
          return runs(function() {
            nextAnimationFrame();
            expect(minimapElement.drawLineDecorations).toHaveBeenCalled();
            return expect(minimapElement.drawLineDecorations.calls.length).toEqual(2);
          });
        });
        it('renders the visible highlight decorations', function() {
          spyOn(minimapElement, 'drawHighlightDecoration').andCallThrough();
          minimap.decorateMarker(editor.markBufferRange([[1, 0], [1, 4]]), {
            type: 'highlight-under',
            color: '#0000FF'
          });
          minimap.decorateMarker(editor.markBufferRange([[2, 20], [2, 30]]), {
            type: 'highlight-over',
            color: '#0000FF'
          });
          minimap.decorateMarker(editor.markBufferRange([[100, 3], [100, 5]]), {
            type: 'highlight-under',
            color: '#0000FF'
          });
          editorElement.setScrollTop(0);
          waitsFor(function() {
            return nextAnimationFrame !== noAnimationFrame;
          });
          return runs(function() {
            nextAnimationFrame();
            expect(minimapElement.drawHighlightDecoration).toHaveBeenCalled();
            return expect(minimapElement.drawHighlightDecoration.calls.length).toEqual(2);
          });
        });
        it('renders the visible outline decorations', function() {
          spyOn(minimapElement, 'drawHighlightOutlineDecoration').andCallThrough();
          minimap.decorateMarker(editor.markBufferRange([[1, 4], [3, 6]]), {
            type: 'highlight-outline',
            color: '#0000ff'
          });
          minimap.decorateMarker(editor.markBufferRange([[6, 0], [6, 7]]), {
            type: 'highlight-outline',
            color: '#0000ff'
          });
          minimap.decorateMarker(editor.markBufferRange([[100, 3], [100, 5]]), {
            type: 'highlight-outline',
            color: '#0000ff'
          });
          editorElement.setScrollTop(0);
          waitsFor(function() {
            return nextAnimationFrame !== noAnimationFrame;
          });
          return runs(function() {
            nextAnimationFrame();
            expect(minimapElement.drawHighlightOutlineDecoration).toHaveBeenCalled();
            return expect(minimapElement.drawHighlightOutlineDecoration.calls.length).toEqual(4);
          });
        });
        describe('when the editor is scrolled', function() {
          beforeEach(function() {
            editorElement.setScrollTop(2000);
            editorElement.setScrollLeft(50);
            waitsFor(function() {
              return nextAnimationFrame !== noAnimationFrame;
            });
            return runs(function() {
              return nextAnimationFrame();
            });
          });
          return it('updates the visible area', function() {
            expect(realOffsetTop(visibleArea)).toBeCloseTo(minimap.getTextEditorScaledScrollTop() - minimap.getScrollTop(), 0);
            return expect(realOffsetLeft(visibleArea)).toBeCloseTo(minimap.getTextEditorScaledScrollLeft(), 0);
          });
        });
        describe('when the editor is resized to a greater size', function() {
          beforeEach(function() {
            var height;
            height = editorElement.getHeight();
            editorElement.style.width = '800px';
            editorElement.style.height = '500px';
            minimapElement.measureHeightAndWidth();
            waitsFor(function() {
              return nextAnimationFrame !== noAnimationFrame;
            });
            return runs(function() {
              return nextAnimationFrame();
            });
          });
          return it('detects the resize and adjust itself', function() {
            expect(minimapElement.offsetWidth).toBeCloseTo(editorElement.offsetWidth / 10, 0);
            expect(minimapElement.offsetHeight).toEqual(editorElement.offsetHeight);
            expect(canvas.offsetWidth / devicePixelRatio).toBeCloseTo(minimapElement.offsetWidth, 0);
            return expect(canvas.offsetHeight / devicePixelRatio).toBeCloseTo(minimapElement.offsetHeight + minimap.getLineHeight(), 0);
          });
        });
        describe('when the editor visible content is changed', function() {
          beforeEach(function() {
            editorElement.setScrollLeft(0);
            editorElement.setScrollTop(1400);
            editor.setSelectedBufferRange([[101, 0], [102, 20]]);
            waitsFor(function() {
              return nextAnimationFrame !== noAnimationFrame;
            });
            return runs(function() {
              nextAnimationFrame();
              spyOn(minimapElement, 'drawLines').andCallThrough();
              return editor.insertText('foo');
            });
          });
          return it('rerenders the part that have changed', function() {
            waitsFor(function() {
              return nextAnimationFrame !== noAnimationFrame;
            });
            return runs(function() {
              nextAnimationFrame();
              expect(minimapElement.drawLines).toHaveBeenCalled();
              expect(minimapElement.drawLines.argsForCall[0][1]).toEqual(100);
              return expect(minimapElement.drawLines.argsForCall[0][2]).toEqual(101);
            });
          });
        });
        return describe('when the editor visibility change', function() {
          it('does not modify the size of the canvas', function() {
            var canvasHeight, canvasWidth;
            canvasWidth = minimapElement.canvas.width;
            canvasHeight = minimapElement.canvas.height;
            editorElement.style.display = 'none';
            minimapElement.measureHeightAndWidth();
            waitsFor(function() {
              return nextAnimationFrame !== noAnimationFrame;
            });
            return runs(function() {
              nextAnimationFrame();
              expect(minimapElement.canvas.width).toEqual(canvasWidth);
              return expect(minimapElement.canvas.height).toEqual(canvasHeight);
            });
          });
          return describe('from hidden to visible', function() {
            beforeEach(function() {
              editorElement.style.display = 'none';
              minimapElement.checkForVisibilityChange();
              spyOn(minimapElement, 'requestForcedUpdate');
              editorElement.style.display = '';
              return minimapElement.pollDOM();
            });
            return it('requests an update of the whole minimap', function() {
              return expect(minimapElement.requestForcedUpdate).toHaveBeenCalled();
            });
          });
        });
      });
      describe('mouse scroll controls', function() {
        beforeEach(function() {
          editorElement.setWidth(400);
          editorElement.setHeight(400);
          editorElement.setScrollTop(0);
          editorElement.setScrollLeft(0);
          nextAnimationFrame();
          minimapElement.measureHeightAndWidth();
          waitsFor(function() {
            return nextAnimationFrame !== noAnimationFrame;
          });
          return runs(function() {
            return nextAnimationFrame();
          });
        });
        describe('using the mouse scrollwheel over the minimap', function() {
          beforeEach(function() {
            spyOn(editorElement.component.presenter, 'setScrollTop').andCallFake(function() {});
            return mousewheel(minimapElement, 0, 15);
          });
          return it('relays the events to the editor view', function() {
            return expect(editorElement.component.presenter.setScrollTop).toHaveBeenCalled();
          });
        });
        describe('middle clicking the minimap', function() {
          var maxScroll, originalLeft, _ref3;
          _ref3 = [], canvas = _ref3[0], visibleArea = _ref3[1], originalLeft = _ref3[2], maxScroll = _ref3[3];
          beforeEach(function() {
            canvas = minimapElement.canvas, visibleArea = minimapElement.visibleArea;
            originalLeft = visibleArea.getBoundingClientRect().left;
            return maxScroll = minimap.getTextEditorMaxScrollTop();
          });
          it('scrolls to the top using the middle mouse button', function() {
            mousedown(canvas, {
              x: originalLeft + 1,
              y: 0,
              btn: 1
            });
            return expect(editorElement.getScrollTop()).toEqual(0);
          });
          describe('scrolling to the middle using the middle mouse button', function() {
            var canvasMidY;
            canvasMidY = void 0;
            beforeEach(function() {
              var actualMidY, editorMidY, height, top, _ref4;
              editorMidY = editorElement.getHeight() / 2.0;
              _ref4 = canvas.getBoundingClientRect(), top = _ref4.top, height = _ref4.height;
              canvasMidY = top + (height / 2.0);
              actualMidY = Math.min(canvasMidY, editorMidY);
              return mousedown(canvas, {
                x: originalLeft + 1,
                y: actualMidY,
                btn: 1
              });
            });
            it('scrolls the editor to the middle', function() {
              var middleScrollTop;
              middleScrollTop = Math.round(maxScroll / 2.0);
              return expect(editorElement.getScrollTop()).toEqual(middleScrollTop);
            });
            return it('updates the visible area to be centered', function() {
              waitsFor(function() {
                return nextAnimationFrame !== noAnimationFrame;
              });
              return runs(function() {
                var height, top, visibleCenterY, _ref4;
                nextAnimationFrame();
                _ref4 = visibleArea.getBoundingClientRect(), top = _ref4.top, height = _ref4.height;
                visibleCenterY = top + (height / 2);
                return expect(visibleCenterY).toBeCloseTo(200, 0);
              });
            });
          });
          return describe('scrolling the editor to an arbitrary location', function() {
            var scrollRatio, scrollTo, _ref4;
            _ref4 = [], scrollTo = _ref4[0], scrollRatio = _ref4[1];
            beforeEach(function() {
              scrollTo = 101;
              scrollRatio = (scrollTo - minimap.getTextEditorScaledHeight() / 2) / (minimap.getVisibleHeight() - minimap.getTextEditorScaledHeight());
              scrollRatio = Math.max(0, scrollRatio);
              scrollRatio = Math.min(1, scrollRatio);
              mousedown(canvas, {
                x: originalLeft + 1,
                y: scrollTo,
                btn: 1
              });
              waitsFor(function() {
                return nextAnimationFrame !== noAnimationFrame;
              });
              return runs(function() {
                return nextAnimationFrame();
              });
            });
            it('scrolls the editor to an arbitrary location', function() {
              var expectedScroll;
              expectedScroll = maxScroll * scrollRatio;
              return expect(editorElement.getScrollTop()).toBeCloseTo(expectedScroll, 0);
            });
            return describe('dragging the visible area with middle mouse button ' + 'after scrolling to the arbitrary location', function() {
              var originalTop;
              originalTop = [][0];
              beforeEach(function() {
                originalTop = visibleArea.getBoundingClientRect().top;
                mousemove(visibleArea, {
                  x: originalLeft + 1,
                  y: scrollTo + 40
                });
                waitsFor(function() {
                  return nextAnimationFrame !== noAnimationFrame;
                });
                return runs(function() {
                  return nextAnimationFrame();
                });
              });
              afterEach(function() {
                return minimapElement.endDrag();
              });
              return it('scrolls the editor so that the visible area was moved down ' + 'by 40 pixels from the arbitrary location', function() {
                var top;
                top = visibleArea.getBoundingClientRect().top;
                return expect(top).toBeCloseTo(originalTop + 40, -1);
              });
            });
          });
        });
        describe('pressing the mouse on the minimap canvas (without scroll animation)', function() {
          beforeEach(function() {
            var t;
            t = 0;
            spyOn(minimapElement, 'getTime').andCallFake(function() {
              var n;
              n = t;
              t += 100;
              return n;
            });
            spyOn(minimapElement, 'requestUpdate').andCallFake(function() {});
            atom.config.set('minimap.scrollAnimation', false);
            canvas = minimapElement.canvas;
            return mousedown(canvas);
          });
          return it('scrolls the editor to the line below the mouse', function() {
            var height, left, middle, scrollTop, top, width, _ref3;
            _ref3 = minimapElement.canvas.getBoundingClientRect(), top = _ref3.top, left = _ref3.left, width = _ref3.width, height = _ref3.height;
            middle = top + height / 2;
            return scrollTop = expect(editorElement.getScrollTop()).toBeGreaterThan(380);
          });
        });
        describe('pressing the mouse on the minimap canvas (with scroll animation)', function() {
          beforeEach(function() {
            var t;
            t = 0;
            spyOn(minimapElement, 'getTime').andCallFake(function() {
              var n;
              n = t;
              t += 100;
              return n;
            });
            spyOn(minimapElement, 'requestUpdate').andCallFake(function() {});
            atom.config.set('minimap.scrollAnimation', true);
            atom.config.set('minimap.scrollAnimationDuration', 300);
            canvas = minimapElement.canvas;
            mousedown(canvas);
            return waitsFor(function() {
              return nextAnimationFrame !== noAnimationFrame;
            });
          });
          return it('scrolls the editor gradually to the line below the mouse', function() {
            return waitsFor(function() {
              nextAnimationFrame !== noAnimationFrame && nextAnimationFrame();
              return editorElement.getScrollTop() >= 380;
            });
          });
        });
        describe('dragging the visible area', function() {
          var originalTop, _ref3;
          _ref3 = [], visibleArea = _ref3[0], originalTop = _ref3[1];
          beforeEach(function() {
            var left, _ref4;
            visibleArea = minimapElement.visibleArea;
            _ref4 = visibleArea.getBoundingClientRect(), originalTop = _ref4.top, left = _ref4.left;
            mousedown(visibleArea, {
              x: left + 10,
              y: originalTop + 10
            });
            mousemove(visibleArea, {
              x: left + 10,
              y: originalTop + 50
            });
            waitsFor(function() {
              return nextAnimationFrame !== noAnimationFrame;
            });
            return runs(function() {
              return nextAnimationFrame();
            });
          });
          afterEach(function() {
            return minimapElement.endDrag();
          });
          it('scrolls the editor so that the visible area was moved down by 40 pixels', function() {
            var top;
            top = visibleArea.getBoundingClientRect().top;
            return expect(top).toBeCloseTo(originalTop + 40, -1);
          });
          return it('stops the drag gesture when the mouse is released outside the minimap', function() {
            var left, top, _ref4;
            _ref4 = visibleArea.getBoundingClientRect(), top = _ref4.top, left = _ref4.left;
            mouseup(jasmineContent, {
              x: left - 10,
              y: top + 80
            });
            spyOn(minimapElement, 'drag');
            mousemove(visibleArea, {
              x: left + 10,
              y: top + 50
            });
            return expect(minimapElement.drag).not.toHaveBeenCalled();
          });
        });
        describe('dragging the visible area using touch events', function() {
          var originalTop, _ref3;
          _ref3 = [], visibleArea = _ref3[0], originalTop = _ref3[1];
          beforeEach(function() {
            var left, _ref4;
            visibleArea = minimapElement.visibleArea;
            _ref4 = visibleArea.getBoundingClientRect(), originalTop = _ref4.top, left = _ref4.left;
            touchstart(visibleArea, {
              x: left + 10,
              y: originalTop + 10
            });
            touchmove(visibleArea, {
              x: left + 10,
              y: originalTop + 50
            });
            waitsFor(function() {
              return nextAnimationFrame !== noAnimationFrame;
            });
            return runs(function() {
              return nextAnimationFrame();
            });
          });
          afterEach(function() {
            return minimapElement.endDrag();
          });
          it('scrolls the editor so that the visible area was moved down by 40 pixels', function() {
            var top;
            top = visibleArea.getBoundingClientRect().top;
            return expect(top).toBeCloseTo(originalTop + 40, -1);
          });
          return it('stops the drag gesture when the mouse is released outside the minimap', function() {
            var left, top, _ref4;
            _ref4 = visibleArea.getBoundingClientRect(), top = _ref4.top, left = _ref4.left;
            mouseup(jasmineContent, {
              x: left - 10,
              y: top + 80
            });
            spyOn(minimapElement, 'drag');
            touchmove(visibleArea, {
              x: left + 10,
              y: top + 50
            });
            return expect(minimapElement.drag).not.toHaveBeenCalled();
          });
        });
        describe('when the minimap cannot scroll', function() {
          var originalTop, _ref3;
          _ref3 = [], visibleArea = _ref3[0], originalTop = _ref3[1];
          beforeEach(function() {
            var sample;
            sample = fs.readFileSync(dir.resolve('seventy.txt')).toString();
            editor.setText(sample);
            return editorElement.setScrollTop(0);
          });
          return describe('dragging the visible area', function() {
            beforeEach(function() {
              waitsFor(function() {
                return nextAnimationFrame !== noAnimationFrame;
              });
              runs(function() {
                var left, top, _ref4;
                nextAnimationFrame();
                visibleArea = minimapElement.visibleArea;
                _ref4 = visibleArea.getBoundingClientRect(), top = _ref4.top, left = _ref4.left;
                originalTop = top;
                mousedown(visibleArea, {
                  x: left + 10,
                  y: top + 10
                });
                return mousemove(visibleArea, {
                  x: left + 10,
                  y: top + 50
                });
              });
              waitsFor(function() {
                return nextAnimationFrame !== noAnimationFrame;
              });
              return runs(function() {
                return nextAnimationFrame();
              });
            });
            afterEach(function() {
              return minimapElement.endDrag();
            });
            return it('scrolls based on a ratio adjusted to the minimap height', function() {
              var top;
              top = visibleArea.getBoundingClientRect().top;
              return expect(top).toBeCloseTo(originalTop + 40, -1);
            });
          });
        });
        return describe('when scroll past end is enabled', function() {
          beforeEach(function() {
            atom.config.set('editor.scrollPastEnd', true);
            waitsFor(function() {
              return nextAnimationFrame !== noAnimationFrame;
            });
            return runs(function() {
              return nextAnimationFrame();
            });
          });
          return describe('dragging the visible area', function() {
            var originalTop, _ref3;
            _ref3 = [], visibleArea = _ref3[0], originalTop = _ref3[1];
            beforeEach(function() {
              var left, top, _ref4;
              visibleArea = minimapElement.visibleArea;
              _ref4 = visibleArea.getBoundingClientRect(), top = _ref4.top, left = _ref4.left;
              originalTop = top;
              mousedown(visibleArea, {
                x: left + 10,
                y: top + 10
              });
              mousemove(visibleArea, {
                x: left + 10,
                y: top + 50
              });
              waitsFor(function() {
                return nextAnimationFrame !== noAnimationFrame;
              });
              return runs(function() {
                return nextAnimationFrame();
              });
            });
            afterEach(function() {
              return minimapElement.endDrag();
            });
            return it('scrolls the editor so that the visible area was moved down by 40 pixels', function() {
              var top;
              top = visibleArea.getBoundingClientRect().top;
              return expect(top).toBeCloseTo(originalTop + 40, -1);
            });
          });
        });
      });
      describe('when the model is a stand-alone minimap', function() {
        beforeEach(function() {
          return minimap.setStandAlone(true);
        });
        it('has a stand-alone attribute', function() {
          return expect(minimapElement.hasAttribute('stand-alone')).toBeTruthy();
        });
        it('sets the minimap size when measured', function() {
          minimapElement.measureHeightAndWidth();
          expect(minimap.width).toEqual(minimapElement.clientWidth);
          return expect(minimap.height).toEqual(minimapElement.clientHeight);
        });
        it('removes the controls div', function() {
          return expect(minimapElement.shadowRoot.querySelector('.minimap-controls')).toBeNull();
        });
        it('removes the visible area', function() {
          return expect(minimapElement.visibleArea).toBeUndefined();
        });
        it('removes the quick settings button', function() {
          atom.config.set('minimap.displayPluginsControls', true);
          waitsFor(function() {
            return nextAnimationFrame !== noAnimationFrame;
          });
          return runs(function() {
            nextAnimationFrame();
            return expect(minimapElement.openQuickSettings).toBeUndefined();
          });
        });
        it('removes the scroll indicator', function() {
          editor.setText(mediumSample);
          editorElement.setScrollTop(50);
          waitsFor(function() {
            return minimapElement.frameRequested;
          });
          runs(function() {
            nextAnimationFrame();
            return atom.config.set('minimap.minimapScrollIndicator', true);
          });
          waitsFor(function() {
            return minimapElement.frameRequested;
          });
          return runs(function() {
            nextAnimationFrame();
            return expect(minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator')).toBeNull();
          });
        });
        describe('pressing the mouse on the minimap canvas', function() {
          beforeEach(function() {
            var t;
            jasmineContent.appendChild(minimapElement);
            t = 0;
            spyOn(minimapElement, 'getTime').andCallFake(function() {
              var n;
              n = t;
              t += 100;
              return n;
            });
            spyOn(minimapElement, 'requestUpdate').andCallFake(function() {});
            atom.config.set('minimap.scrollAnimation', false);
            canvas = minimapElement.canvas;
            return mousedown(canvas);
          });
          return it('does not scroll the editor to the line below the mouse', function() {
            return expect(editorElement.getScrollTop()).toEqual(1000);
          });
        });
        return describe('and is changed to be a classical minimap again', function() {
          beforeEach(function() {
            atom.config.set('minimap.displayPluginsControls', true);
            atom.config.set('minimap.minimapScrollIndicator', true);
            return minimap.setStandAlone(false);
          });
          return it('recreates the destroyed elements', function() {
            expect(minimapElement.shadowRoot.querySelector('.minimap-controls')).toExist();
            expect(minimapElement.shadowRoot.querySelector('.minimap-visible-area')).toExist();
            expect(minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator')).toExist();
            return expect(minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings')).toExist();
          });
        });
      });
      describe('when the model is destroyed', function() {
        beforeEach(function() {
          return minimap.destroy();
        });
        it('detaches itself from its parent', function() {
          return expect(minimapElement.parentNode).toBeNull();
        });
        return it('stops the DOM polling interval', function() {
          spyOn(minimapElement, 'pollDOM');
          sleep(200);
          return runs(function() {
            return expect(minimapElement.pollDOM).not.toHaveBeenCalled();
          });
        });
      });
      describe('when the atom styles are changed', function() {
        beforeEach(function() {
          waitsFor(function() {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function() {
            var styleNode;
            nextAnimationFrame();
            spyOn(minimapElement, 'requestForcedUpdate').andCallThrough();
            spyOn(minimapElement, 'invalidateCache').andCallThrough();
            styleNode = document.createElement('style');
            styleNode.textContent = 'body{ color: #233; }';
            return atom.styles.emitter.emit('did-add-style-element', styleNode);
          });
          return waitsFor(function() {
            return minimapElement.frameRequested;
          });
        });
        return it('forces a refresh with cache invalidation', function() {
          expect(minimapElement.requestForcedUpdate).toHaveBeenCalled();
          return expect(minimapElement.invalidateCache).toHaveBeenCalled();
        });
      });
      describe('when minimap.textOpacity is changed', function() {
        beforeEach(function() {
          spyOn(minimapElement, 'requestForcedUpdate').andCallThrough();
          atom.config.set('minimap.textOpacity', 0.3);
          waitsFor(function() {
            return minimapElement.frameRequested;
          });
          return runs(function() {
            return nextAnimationFrame();
          });
        });
        return it('requests a complete update', function() {
          return expect(minimapElement.requestForcedUpdate).toHaveBeenCalled();
        });
      });
      describe('when minimap.displayCodeHighlights is changed', function() {
        beforeEach(function() {
          spyOn(minimapElement, 'requestForcedUpdate').andCallThrough();
          atom.config.set('minimap.displayCodeHighlights', true);
          waitsFor(function() {
            return minimapElement.frameRequested;
          });
          return runs(function() {
            return nextAnimationFrame();
          });
        });
        return it('requests a complete update', function() {
          return expect(minimapElement.requestForcedUpdate).toHaveBeenCalled();
        });
      });
      describe('when minimap.charWidth is changed', function() {
        beforeEach(function() {
          spyOn(minimapElement, 'requestForcedUpdate').andCallThrough();
          atom.config.set('minimap.charWidth', 1);
          waitsFor(function() {
            return minimapElement.frameRequested;
          });
          return runs(function() {
            return nextAnimationFrame();
          });
        });
        return it('requests a complete update', function() {
          return expect(minimapElement.requestForcedUpdate).toHaveBeenCalled();
        });
      });
      describe('when minimap.charHeight is changed', function() {
        beforeEach(function() {
          spyOn(minimapElement, 'requestForcedUpdate').andCallThrough();
          atom.config.set('minimap.charHeight', 1);
          waitsFor(function() {
            return minimapElement.frameRequested;
          });
          return runs(function() {
            return nextAnimationFrame();
          });
        });
        return it('requests a complete update', function() {
          return expect(minimapElement.requestForcedUpdate).toHaveBeenCalled();
        });
      });
      describe('when minimap.interline is changed', function() {
        beforeEach(function() {
          spyOn(minimapElement, 'requestForcedUpdate').andCallThrough();
          atom.config.set('minimap.interline', 2);
          waitsFor(function() {
            return minimapElement.frameRequested;
          });
          return runs(function() {
            return nextAnimationFrame();
          });
        });
        return it('requests a complete update', function() {
          return expect(minimapElement.requestForcedUpdate).toHaveBeenCalled();
        });
      });
      describe('when minimap.displayMinimapOnLeft setting is true', function() {
        it('moves the attached minimap to the left', function() {
          atom.config.set('minimap.displayMinimapOnLeft', true);
          return expect(minimapElement.classList.contains('left')).toBeTruthy();
        });
        return describe('when the minimap is not attached yet', function() {
          beforeEach(function() {
            editor = atom.workspace.buildTextEditor({});
            editorElement = atom.views.getView(editor);
            editorElement.setHeight(50);
            editor.setLineHeightInPixels(10);
            minimap = new Minimap({
              textEditor: editor
            });
            minimapElement = atom.views.getView(minimap);
            jasmineContent.insertBefore(editorElement, jasmineContent.firstChild);
            atom.config.set('minimap.displayMinimapOnLeft', true);
            return minimapElement.attach();
          });
          return it('moves the attached minimap to the left', function() {
            return expect(minimapElement.classList.contains('left')).toBeTruthy();
          });
        });
      });
      describe('when minimap.adjustMinimapWidthToSoftWrap is true', function() {
        var minimapWidth;
        minimapWidth = [][0];
        beforeEach(function() {
          minimapWidth = minimapElement.offsetWidth;
          atom.config.set('editor.softWrap', true);
          atom.config.set('editor.softWrapAtPreferredLineLength', true);
          atom.config.set('editor.preferredLineLength', 2);
          atom.config.set('minimap.adjustMinimapWidthToSoftWrap', true);
          waitsFor(function() {
            return minimapElement.frameRequested;
          });
          return runs(function() {
            return nextAnimationFrame();
          });
        });
        it('adjusts the width of the minimap canvas', function() {
          return expect(minimapElement.canvas.width / devicePixelRatio).toEqual(4);
        });
        it('offsets the minimap by the difference', function() {
          expect(realOffsetLeft(minimapElement)).toBeCloseTo(editorElement.clientWidth - 4, -1);
          return expect(minimapElement.clientWidth).toEqual(4);
        });
        describe('the dom polling routine', function() {
          return it('does not change the value', function() {
            atom.views.performDocumentPoll();
            waitsFor(function() {
              return nextAnimationFrame !== noAnimationFrame;
            });
            return runs(function() {
              nextAnimationFrame();
              return expect(minimapElement.canvas.width / devicePixelRatio).toEqual(4);
            });
          });
        });
        describe('when the editor is resized', function() {
          beforeEach(function() {
            atom.config.set('editor.preferredLineLength', 6);
            editorElement.style.width = '100px';
            editorElement.style.height = '100px';
            atom.views.performDocumentPoll();
            waitsFor(function() {
              return nextAnimationFrame !== noAnimationFrame;
            });
            return runs(function() {
              return nextAnimationFrame();
            });
          });
          return it('makes the minimap smaller than soft wrap', function() {
            expect(minimapElement.offsetWidth).toBeCloseTo(12, -1);
            return expect(minimapElement.style.marginRight).toEqual('');
          });
        });
        describe('and when minimap.minimapScrollIndicator setting is true', function() {
          beforeEach(function() {
            editor.setText(mediumSample);
            editorElement.setScrollTop(50);
            waitsFor(function() {
              return minimapElement.frameRequested;
            });
            runs(function() {
              nextAnimationFrame();
              return atom.config.set('minimap.minimapScrollIndicator', true);
            });
            waitsFor(function() {
              return minimapElement.frameRequested;
            });
            return runs(function() {
              return nextAnimationFrame();
            });
          });
          return it('offsets the scroll indicator by the difference', function() {
            var indicator;
            indicator = minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator');
            return expect(realOffsetLeft(indicator)).toBeCloseTo(2, -1);
          });
        });
        describe('and when minimap.displayPluginsControls setting is true', function() {
          beforeEach(function() {
            return atom.config.set('minimap.displayPluginsControls', true);
          });
          return it('offsets the scroll indicator by the difference', function() {
            var openQuickSettings;
            openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings');
            return expect(realOffsetLeft(openQuickSettings)).not.toBeCloseTo(2, -1);
          });
        });
        describe('and then disabled', function() {
          beforeEach(function() {
            atom.config.set('minimap.adjustMinimapWidthToSoftWrap', false);
            waitsFor(function() {
              return minimapElement.frameRequested;
            });
            return runs(function() {
              return nextAnimationFrame();
            });
          });
          return it('adjusts the width of the minimap', function() {
            expect(minimapElement.offsetWidth).toBeCloseTo(editorElement.offsetWidth / 10, -1);
            return expect(minimapElement.style.width).toEqual('');
          });
        });
        return describe('and when preferredLineLength >= 16384', function() {
          beforeEach(function() {
            atom.config.set('editor.preferredLineLength', 16384);
            waitsFor(function() {
              return minimapElement.frameRequested;
            });
            return runs(function() {
              return nextAnimationFrame();
            });
          });
          return it('adjusts the width of the minimap', function() {
            expect(minimapElement.offsetWidth).toBeCloseTo(editorElement.offsetWidth / 10, -1);
            return expect(minimapElement.style.width).toEqual('');
          });
        });
      });
      describe('when minimap.minimapScrollIndicator setting is true', function() {
        beforeEach(function() {
          editor.setText(mediumSample);
          editorElement.setScrollTop(50);
          waitsFor(function() {
            return minimapElement.frameRequested;
          });
          runs(function() {
            return nextAnimationFrame();
          });
          return atom.config.set('minimap.minimapScrollIndicator', true);
        });
        it('adds a scroll indicator in the element', function() {
          return expect(minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator')).toExist();
        });
        describe('and then deactivated', function() {
          return it('removes the scroll indicator from the element', function() {
            atom.config.set('minimap.minimapScrollIndicator', false);
            return expect(minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator')).not.toExist();
          });
        });
        describe('on update', function() {
          beforeEach(function() {
            var height;
            height = editorElement.getHeight();
            editorElement.style.height = '500px';
            atom.views.performDocumentPoll();
            waitsFor(function() {
              return nextAnimationFrame !== noAnimationFrame;
            });
            return runs(function() {
              return nextAnimationFrame();
            });
          });
          return it('adjusts the size and position of the indicator', function() {
            var height, indicator, scroll;
            indicator = minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator');
            height = editorElement.getHeight() * (editorElement.getHeight() / minimap.getHeight());
            scroll = (editorElement.getHeight() - height) * minimap.getTextEditorScrollRatio();
            expect(indicator.offsetHeight).toBeCloseTo(height, 0);
            return expect(realOffsetTop(indicator)).toBeCloseTo(scroll, 0);
          });
        });
        return describe('when the minimap cannot scroll', function() {
          beforeEach(function() {
            editor.setText(smallSample);
            waitsFor(function() {
              return minimapElement.frameRequested;
            });
            return runs(function() {
              return nextAnimationFrame();
            });
          });
          it('removes the scroll indicator', function() {
            return expect(minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator')).not.toExist();
          });
          return describe('and then can scroll again', function() {
            beforeEach(function() {
              editor.setText(largeSample);
              waitsFor(function() {
                return minimapElement.frameRequested;
              });
              return runs(function() {
                return nextAnimationFrame();
              });
            });
            return it('attaches the scroll indicator', function() {
              return waitsFor(function() {
                return minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator');
              });
            });
          });
        });
      });
      describe('when minimap.absoluteMode setting is true', function() {
        beforeEach(function() {
          return atom.config.set('minimap.absoluteMode', true);
        });
        it('adds a absolute class to the minimap element', function() {
          return expect(minimapElement.classList.contains('absolute')).toBeTruthy();
        });
        return describe('when minimap.displayMinimapOnLeft setting is true', function() {
          return it('also adds a left class to the minimap element', function() {
            atom.config.set('minimap.displayMinimapOnLeft', true);
            expect(minimapElement.classList.contains('absolute')).toBeTruthy();
            return expect(minimapElement.classList.contains('left')).toBeTruthy();
          });
        });
      });
      return describe('when minimap.displayPluginsControls setting is true', function() {
        var openQuickSettings, quickSettingsElement, workspaceElement, _ref3;
        _ref3 = [], openQuickSettings = _ref3[0], quickSettingsElement = _ref3[1], workspaceElement = _ref3[2];
        beforeEach(function() {
          return atom.config.set('minimap.displayPluginsControls', true);
        });
        it('has a div to open the quick settings', function() {
          return expect(minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings')).toExist();
        });
        describe('clicking on the div', function() {
          beforeEach(function() {
            workspaceElement = atom.views.getView(atom.workspace);
            jasmineContent.appendChild(workspaceElement);
            openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings');
            mousedown(openQuickSettings);
            return quickSettingsElement = workspaceElement.querySelector('minimap-quick-settings');
          });
          afterEach(function() {
            return minimapElement.quickSettingsElement.destroy();
          });
          it('opens the quick settings view', function() {
            return expect(quickSettingsElement).toExist();
          });
          return it('positions the quick settings view next to the minimap', function() {
            var minimapBounds, settingsBounds;
            minimapBounds = minimapElement.canvas.getBoundingClientRect();
            settingsBounds = quickSettingsElement.getBoundingClientRect();
            expect(realOffsetTop(quickSettingsElement)).toBeCloseTo(minimapBounds.top, 0);
            return expect(realOffsetLeft(quickSettingsElement)).toBeCloseTo(minimapBounds.left - settingsBounds.width, 0);
          });
        });
        describe('when the displayMinimapOnLeft setting is enabled', function() {
          return describe('clicking on the div', function() {
            beforeEach(function() {
              atom.config.set('minimap.displayMinimapOnLeft', true);
              workspaceElement = atom.views.getView(atom.workspace);
              jasmineContent.appendChild(workspaceElement);
              openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings');
              mousedown(openQuickSettings);
              return quickSettingsElement = workspaceElement.querySelector('minimap-quick-settings');
            });
            afterEach(function() {
              return minimapElement.quickSettingsElement.destroy();
            });
            return it('positions the quick settings view next to the minimap', function() {
              var minimapBounds, settingsBounds;
              minimapBounds = minimapElement.canvas.getBoundingClientRect();
              settingsBounds = quickSettingsElement.getBoundingClientRect();
              expect(realOffsetTop(quickSettingsElement)).toBeCloseTo(minimapBounds.top, 0);
              return expect(realOffsetLeft(quickSettingsElement)).toBeCloseTo(minimapBounds.right, 0);
            });
          });
        });
        describe('when the adjustMinimapWidthToSoftWrap setting is enabled', function() {
          var controls;
          controls = [][0];
          beforeEach(function() {
            atom.config.set('editor.softWrap', true);
            atom.config.set('editor.softWrapAtPreferredLineLength', true);
            atom.config.set('editor.preferredLineLength', 2);
            atom.config.set('minimap.adjustMinimapWidthToSoftWrap', true);
            nextAnimationFrame();
            controls = minimapElement.shadowRoot.querySelector('.minimap-controls');
            openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings');
            editorElement.style.width = '1024px';
            atom.views.performDocumentPoll();
            waitsFor(function() {
              return minimapElement.frameRequested;
            });
            return runs(function() {
              return nextAnimationFrame();
            });
          });
          it('adjusts the size of the control div to fit in the minimap', function() {
            return expect(controls.clientWidth).toEqual(minimapElement.canvas.clientWidth / devicePixelRatio);
          });
          it('positions the controls div over the canvas', function() {
            var canvasRect, controlsRect;
            controlsRect = controls.getBoundingClientRect();
            canvasRect = minimapElement.canvas.getBoundingClientRect();
            expect(controlsRect.left).toEqual(canvasRect.left);
            return expect(controlsRect.right).toEqual(canvasRect.right);
          });
          return describe('when the displayMinimapOnLeft setting is enabled', function() {
            beforeEach(function() {
              return atom.config.set('minimap.displayMinimapOnLeft', true);
            });
            it('adjusts the size of the control div to fit in the minimap', function() {
              return expect(controls.clientWidth).toEqual(minimapElement.canvas.clientWidth / devicePixelRatio);
            });
            it('positions the controls div over the canvas', function() {
              var canvasRect, controlsRect;
              controlsRect = controls.getBoundingClientRect();
              canvasRect = minimapElement.canvas.getBoundingClientRect();
              expect(controlsRect.left).toEqual(canvasRect.left);
              return expect(controlsRect.right).toEqual(canvasRect.right);
            });
            return describe('clicking on the div', function() {
              beforeEach(function() {
                workspaceElement = atom.views.getView(atom.workspace);
                jasmineContent.appendChild(workspaceElement);
                openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings');
                mousedown(openQuickSettings);
                return quickSettingsElement = workspaceElement.querySelector('minimap-quick-settings');
              });
              afterEach(function() {
                return minimapElement.quickSettingsElement.destroy();
              });
              return it('positions the quick settings view next to the minimap', function() {
                var minimapBounds, settingsBounds;
                minimapBounds = minimapElement.canvas.getBoundingClientRect();
                settingsBounds = quickSettingsElement.getBoundingClientRect();
                expect(realOffsetTop(quickSettingsElement)).toBeCloseTo(minimapBounds.top, 0);
                return expect(realOffsetLeft(quickSettingsElement)).toBeCloseTo(minimapBounds.right, 0);
              });
            });
          });
        });
        describe('when the quick settings view is open', function() {
          beforeEach(function() {
            workspaceElement = atom.views.getView(atom.workspace);
            jasmineContent.appendChild(workspaceElement);
            openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings');
            mousedown(openQuickSettings);
            return quickSettingsElement = workspaceElement.querySelector('minimap-quick-settings');
          });
          it('sets the on right button active', function() {
            return expect(quickSettingsElement.querySelector('.btn.selected:last-child')).toExist();
          });
          describe('clicking on the code highlight item', function() {
            beforeEach(function() {
              var item;
              item = quickSettingsElement.querySelector('li.code-highlights');
              return mousedown(item);
            });
            it('toggles the code highlights on the minimap element', function() {
              return expect(minimapElement.displayCodeHighlights).toBeTruthy();
            });
            return it('requests an update', function() {
              return expect(minimapElement.frameRequested).toBeTruthy();
            });
          });
          describe('clicking on the absolute mode item', function() {
            beforeEach(function() {
              var item;
              item = quickSettingsElement.querySelector('li.absolute-mode');
              return mousedown(item);
            });
            return it('toggles the absolute-mode setting', function() {
              expect(atom.config.get('minimap.absoluteMode')).toBeTruthy();
              return expect(minimapElement.absoluteMode).toBeTruthy();
            });
          });
          describe('clicking on the on left button', function() {
            beforeEach(function() {
              var item;
              item = quickSettingsElement.querySelector('.btn:first-child');
              return mousedown(item);
            });
            it('toggles the displayMinimapOnLeft setting', function() {
              return expect(atom.config.get('minimap.displayMinimapOnLeft')).toBeTruthy();
            });
            return it('changes the buttons activation state', function() {
              expect(quickSettingsElement.querySelector('.btn.selected:last-child')).not.toExist();
              return expect(quickSettingsElement.querySelector('.btn.selected:first-child')).toExist();
            });
          });
          describe('core:move-left', function() {
            beforeEach(function() {
              return atom.commands.dispatch(quickSettingsElement, 'core:move-left');
            });
            it('toggles the displayMinimapOnLeft setting', function() {
              return expect(atom.config.get('minimap.displayMinimapOnLeft')).toBeTruthy();
            });
            return it('changes the buttons activation state', function() {
              expect(quickSettingsElement.querySelector('.btn.selected:last-child')).not.toExist();
              return expect(quickSettingsElement.querySelector('.btn.selected:first-child')).toExist();
            });
          });
          describe('core:move-right when the minimap is on the right', function() {
            beforeEach(function() {
              atom.config.set('minimap.displayMinimapOnLeft', true);
              return atom.commands.dispatch(quickSettingsElement, 'core:move-right');
            });
            it('toggles the displayMinimapOnLeft setting', function() {
              return expect(atom.config.get('minimap.displayMinimapOnLeft')).toBeFalsy();
            });
            return it('changes the buttons activation state', function() {
              expect(quickSettingsElement.querySelector('.btn.selected:first-child')).not.toExist();
              return expect(quickSettingsElement.querySelector('.btn.selected:last-child')).toExist();
            });
          });
          describe('clicking on the open settings button again', function() {
            beforeEach(function() {
              return mousedown(openQuickSettings);
            });
            it('closes the quick settings view', function() {
              return expect(workspaceElement.querySelector('minimap-quick-settings')).not.toExist();
            });
            return it('removes the view from the element', function() {
              return expect(minimapElement.quickSettingsElement).toBeNull();
            });
          });
          return describe('when an external event destroys the view', function() {
            beforeEach(function() {
              return minimapElement.quickSettingsElement.destroy();
            });
            return it('removes the view reference from the element', function() {
              return expect(minimapElement.quickSettingsElement).toBeNull();
            });
          });
        });
        describe('then disabling it', function() {
          beforeEach(function() {
            return atom.config.set('minimap.displayPluginsControls', false);
          });
          return it('removes the div', function() {
            return expect(minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings')).not.toExist();
          });
        });
        return describe('with plugins registered in the package', function() {
          var minimapPackage, pluginA, pluginB, _ref4;
          _ref4 = [], minimapPackage = _ref4[0], pluginA = _ref4[1], pluginB = _ref4[2];
          beforeEach(function() {
            waitsForPromise(function() {
              return atom.packages.activatePackage('minimap').then(function(pkg) {
                return minimapPackage = pkg.mainModule;
              });
            });
            return runs(function() {
              var Plugin;
              Plugin = (function() {
                function Plugin() {}

                Plugin.prototype.active = false;

                Plugin.prototype.activatePlugin = function() {
                  return this.active = true;
                };

                Plugin.prototype.deactivatePlugin = function() {
                  return this.active = false;
                };

                Plugin.prototype.isActive = function() {
                  return this.active;
                };

                return Plugin;

              })();
              pluginA = new Plugin;
              pluginB = new Plugin;
              minimapPackage.registerPlugin('dummyA', pluginA);
              minimapPackage.registerPlugin('dummyB', pluginB);
              workspaceElement = atom.views.getView(atom.workspace);
              jasmineContent.appendChild(workspaceElement);
              openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings');
              mousedown(openQuickSettings);
              return quickSettingsElement = workspaceElement.querySelector('minimap-quick-settings');
            });
          });
          it('creates one list item for each registered plugin', function() {
            return expect(quickSettingsElement.querySelectorAll('li').length).toEqual(5);
          });
          it('selects the first item of the list', function() {
            return expect(quickSettingsElement.querySelector('li.selected:first-child')).toExist();
          });
          describe('core:confirm', function() {
            beforeEach(function() {
              return atom.commands.dispatch(quickSettingsElement, 'core:confirm');
            });
            it('disable the plugin of the selected item', function() {
              return expect(pluginA.isActive()).toBeFalsy();
            });
            describe('triggered a second time', function() {
              beforeEach(function() {
                return atom.commands.dispatch(quickSettingsElement, 'core:confirm');
              });
              return it('enable the plugin of the selected item', function() {
                return expect(pluginA.isActive()).toBeTruthy();
              });
            });
            describe('on the code highlight item', function() {
              var initial;
              initial = [][0];
              beforeEach(function() {
                initial = minimapElement.displayCodeHighlights;
                atom.commands.dispatch(quickSettingsElement, 'core:move-down');
                atom.commands.dispatch(quickSettingsElement, 'core:move-down');
                return atom.commands.dispatch(quickSettingsElement, 'core:confirm');
              });
              return it('toggles the code highlights on the minimap element', function() {
                return expect(minimapElement.displayCodeHighlights).toEqual(!initial);
              });
            });
            return describe('on the absolute mode item', function() {
              var initial;
              initial = [][0];
              beforeEach(function() {
                initial = atom.config.get('minimap.absoluteMode');
                atom.commands.dispatch(quickSettingsElement, 'core:move-down');
                atom.commands.dispatch(quickSettingsElement, 'core:move-down');
                atom.commands.dispatch(quickSettingsElement, 'core:move-down');
                return atom.commands.dispatch(quickSettingsElement, 'core:confirm');
              });
              return it('toggles the code highlights on the minimap element', function() {
                return expect(atom.config.get('minimap.absoluteMode')).toEqual(!initial);
              });
            });
          });
          describe('core:move-down', function() {
            beforeEach(function() {
              return atom.commands.dispatch(quickSettingsElement, 'core:move-down');
            });
            it('selects the second item', function() {
              return expect(quickSettingsElement.querySelector('li.selected:nth-child(2)')).toExist();
            });
            describe('reaching a separator', function() {
              beforeEach(function() {
                return atom.commands.dispatch(quickSettingsElement, 'core:move-down');
              });
              return it('moves past the separator', function() {
                return expect(quickSettingsElement.querySelector('li.code-highlights.selected')).toExist();
              });
            });
            return describe('then core:move-up', function() {
              beforeEach(function() {
                return atom.commands.dispatch(quickSettingsElement, 'core:move-up');
              });
              return it('selects again the first item of the list', function() {
                return expect(quickSettingsElement.querySelector('li.selected:first-child')).toExist();
              });
            });
          });
          return describe('core:move-up', function() {
            beforeEach(function() {
              return atom.commands.dispatch(quickSettingsElement, 'core:move-up');
            });
            it('selects the last item', function() {
              return expect(quickSettingsElement.querySelector('li.selected:last-child')).toExist();
            });
            describe('reaching a separator', function() {
              beforeEach(function() {
                atom.commands.dispatch(quickSettingsElement, 'core:move-up');
                return atom.commands.dispatch(quickSettingsElement, 'core:move-up');
              });
              return it('moves past the separator', function() {
                return expect(quickSettingsElement.querySelector('li.selected:nth-child(2)')).toExist();
              });
            });
            return describe('then core:move-down', function() {
              beforeEach(function() {
                return atom.commands.dispatch(quickSettingsElement, 'core:move-down');
              });
              return it('selects again the first item of the list', function() {
                return expect(quickSettingsElement.querySelector('li.selected:first-child')).toExist();
              });
            });
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL3NwZWMvbWluaW1hcC1lbGVtZW50LXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHNLQUFBOztBQUFBLEVBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSLENBQUwsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQURQLENBQUE7O0FBQUEsRUFFQSxPQUFBLEdBQVUsT0FBQSxDQUFRLGdCQUFSLENBRlYsQ0FBQTs7QUFBQSxFQUdBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLHdCQUFSLENBSGpCLENBQUE7O0FBQUEsRUFJQyxhQUFjLE9BQUEsQ0FBUSxxQkFBUixFQUFkLFVBSkQsQ0FBQTs7QUFBQSxFQUtBLE9BQXFFLE9BQUEsQ0FBUSxrQkFBUixDQUFyRSxFQUFDLGlCQUFBLFNBQUQsRUFBWSxpQkFBQSxTQUFaLEVBQXVCLGVBQUEsT0FBdkIsRUFBZ0Msa0JBQUEsVUFBaEMsRUFBNEMsa0JBQUEsVUFBNUMsRUFBd0QsaUJBQUEsU0FMeEQsQ0FBQTs7QUFBQSxFQU9BLGFBQUEsR0FBZ0IsU0FBQyxDQUFELEdBQUE7V0FHZCxDQUFDLENBQUMsVUFIWTtFQUFBLENBUGhCLENBQUE7O0FBQUEsRUFZQSxjQUFBLEdBQWlCLFNBQUMsQ0FBRCxHQUFBO1dBR2YsQ0FBQyxDQUFDLFdBSGE7RUFBQSxDQVpqQixDQUFBOztBQUFBLEVBaUJBLFNBQUEsR0FBWSxTQUFDLElBQUQsR0FBQTtXQUFVLElBQUksQ0FBQyxXQUFMLEdBQW1CLENBQW5CLElBQXdCLElBQUksQ0FBQyxZQUFMLEdBQW9CLEVBQXREO0VBQUEsQ0FqQlosQ0FBQTs7QUFBQSxFQXNCQSxLQUFBLEdBQVEsU0FBQyxRQUFELEdBQUE7QUFDTixRQUFBLENBQUE7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

//# sourceURL=/home/gsmyrnaios/.atom/packages/minimap/spec/minimap-element-spec.coffee
