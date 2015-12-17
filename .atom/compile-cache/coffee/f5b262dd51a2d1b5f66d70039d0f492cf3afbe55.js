(function() {
  var Minimap, fs;

  require('./helpers/workspace');

  fs = require('fs-plus');

  Minimap = require('../lib/minimap');

  describe('Minimap', function() {
    var editor, editorElement, largeSample, minimap, minimapHorizontalScaleFactor, minimapVerticalScaleFactor, smallSample, _ref;
    _ref = [], editor = _ref[0], editorElement = _ref[1], minimap = _ref[2], largeSample = _ref[3], smallSample = _ref[4], minimapVerticalScaleFactor = _ref[5], minimapHorizontalScaleFactor = _ref[6];
    beforeEach(function() {
      var dir;
      atom.config.set('minimap.charHeight', 4);
      atom.config.set('minimap.charWidth', 2);
      atom.config.set('minimap.interline', 1);
      editor = atom.workspace.buildTextEditor({});
      editorElement = atom.views.getView(editor);
      jasmine.attachToDOM(editorElement);
      editorElement.setHeight(50);
      editorElement.setWidth(200);
      minimapVerticalScaleFactor = 5 / editor.getLineHeightInPixels();
      minimapHorizontalScaleFactor = 2 / editor.getDefaultCharWidth();
      dir = atom.project.getDirectories()[0];
      minimap = new Minimap({
        textEditor: editor
      });
      largeSample = fs.readFileSync(dir.resolve('large-file.coffee')).toString();
      return smallSample = fs.readFileSync(dir.resolve('sample.coffee')).toString();
    });
    it('has an associated editor', function() {
      return expect(minimap.getTextEditor()).toEqual(editor);
    });
    it('returns false when asked if destroyed', function() {
      return expect(minimap.isDestroyed()).toBeFalsy();
    });
    it('raise an exception if created without a text editor', function() {
      return expect(function() {
        return new Minimap;
      }).toThrow();
    });
    it('measures the minimap size based on the current editor content', function() {
      editor.setText(smallSample);
      expect(minimap.getHeight()).toEqual(editor.getScreenLineCount() * 5);
      editor.setText(largeSample);
      return expect(minimap.getHeight()).toEqual(editor.getScreenLineCount() * 5);
    });
    it('measures the scaling factor between the editor and the minimap', function() {
      expect(minimap.getVerticalScaleFactor()).toEqual(minimapVerticalScaleFactor);
      return expect(minimap.getHorizontalScaleFactor()).toEqual(minimapHorizontalScaleFactor);
    });
    it('measures the editor visible area size at minimap scale', function() {
      editor.setText(largeSample);
      return expect(minimap.getTextEditorScaledHeight()).toEqual(50 * minimapVerticalScaleFactor);
    });
    it('measures the available minimap scroll', function() {
      var largeLineCount;
      editor.setText(largeSample);
      largeLineCount = editor.getScreenLineCount();
      expect(minimap.getMaxScrollTop()).toEqual(largeLineCount * 5 - 50);
      return expect(minimap.canScroll()).toBeTruthy();
    });
    it('computes the first visible row in the minimap', function() {
      return expect(minimap.getFirstVisibleScreenRow()).toEqual(0);
    });
    it('computes the last visible row in the minimap', function() {
      return expect(minimap.getLastVisibleScreenRow()).toEqual(10);
    });
    it('relays change events from the text editor', function() {
      var changeSpy;
      changeSpy = jasmine.createSpy('didChange');
      minimap.onDidChange(changeSpy);
      editor.setText('foo');
      return expect(changeSpy).toHaveBeenCalled();
    });
    it('relays scroll top events from the editor', function() {
      var scrollSpy;
      editor.setText(largeSample);
      scrollSpy = jasmine.createSpy('didScroll');
      minimap.onDidChangeScrollTop(scrollSpy);
      editorElement.setScrollTop(100);
      return expect(scrollSpy).toHaveBeenCalled();
    });
    it('relays scroll left events from the editor', function() {
      var scrollSpy;
      editor.setText(largeSample);
      scrollSpy = jasmine.createSpy('didScroll');
      minimap.onDidChangeScrollLeft(scrollSpy);
      spyOn(editorElement, 'getScrollWidth').andReturn(10000);
      editorElement.setScrollLeft(100);
      return expect(scrollSpy).toHaveBeenCalled();
    });
    describe('when scrols past end is enabled', function() {
      beforeEach(function() {
        editor.setText(largeSample);
        return atom.config.set('editor.scrollPastEnd', true);
      });
      it('adjust the scrolling ratio', function() {
        var maxScrollTop;
        editorElement.setScrollTop(editorElement.getScrollHeight());
        maxScrollTop = editorElement.getScrollHeight() - editorElement.getHeight() - (editorElement.getHeight() - 3 * editor.displayBuffer.getLineHeightInPixels());
        return expect(minimap.getTextEditorScrollRatio()).toEqual(editorElement.getScrollTop() / maxScrollTop);
      });
      it('lock the minimap scroll top to 1', function() {
        editorElement.setScrollTop(editorElement.getScrollHeight());
        return expect(minimap.getScrollTop()).toEqual(minimap.getMaxScrollTop());
      });
      return describe('getTextEditorScrollRatio(), when getScrollTop() and maxScrollTop both equal 0', function() {
        beforeEach(function() {
          editor.setText(smallSample);
          editorElement.setHeight(40);
          return atom.config.set('editor.scrollPastEnd', true);
        });
        return it('returns 0', function() {
          editorElement.setScrollTop(0);
          return expect(minimap.getTextEditorScrollRatio()).toEqual(0);
        });
      });
    });
    describe('when soft wrap is enabled', function() {
      beforeEach(function() {
        atom.config.set('editor.softWrap', true);
        atom.config.set('editor.softWrapAtPreferredLineLength', true);
        return atom.config.set('editor.preferredLineLength', 2);
      });
      return it('measures the minimap using screen lines', function() {
        editor.setText(smallSample);
        expect(minimap.getHeight()).toEqual(editor.getScreenLineCount() * 5);
        editor.setText(largeSample);
        return expect(minimap.getHeight()).toEqual(editor.getScreenLineCount() * 5);
      });
    });
    describe('when there is no scrolling needed to display the whole minimap', function() {
      it('returns 0 when computing the minimap scroll', function() {
        return expect(minimap.getScrollTop()).toEqual(0);
      });
      return it('returns 0 when measuring the available minimap scroll', function() {
        editor.setText(smallSample);
        expect(minimap.getMaxScrollTop()).toEqual(0);
        return expect(minimap.canScroll()).toBeFalsy();
      });
    });
    describe('when the editor is scrolled', function() {
      var editorHeight, editorScrollRatio, largeLineCount, _ref1;
      _ref1 = [], largeLineCount = _ref1[0], editorHeight = _ref1[1], editorScrollRatio = _ref1[2];
      beforeEach(function() {
        spyOn(editorElement, 'getScrollWidth').andReturn(10000);
        editor.setText(largeSample);
        editorElement.setScrollTop(1000);
        editorElement.setScrollLeft(200);
        largeLineCount = editor.getScreenLineCount();
        editorHeight = largeLineCount * editor.getLineHeightInPixels();
        return editorScrollRatio = editorElement.getScrollTop() / (editorElement.getScrollHeight() - editorElement.getHeight());
      });
      it('scales the editor scroll based on the minimap scale factor', function() {
        expect(minimap.getTextEditorScaledScrollTop()).toEqual(1000 * minimapVerticalScaleFactor);
        return expect(minimap.getTextEditorScaledScrollLeft()).toEqual(200 * minimapHorizontalScaleFactor);
      });
      it('computes the offset to apply based on the editor scroll top', function() {
        return expect(minimap.getScrollTop()).toEqual(editorScrollRatio * minimap.getMaxScrollTop());
      });
      it('computes the first visible row in the minimap', function() {
        return expect(minimap.getFirstVisibleScreenRow()).toEqual(58);
      });
      it('computes the last visible row in the minimap', function() {
        return expect(minimap.getLastVisibleScreenRow()).toEqual(69);
      });
      return describe('down to the bottom', function() {
        beforeEach(function() {
          editorElement.setScrollTop(editorElement.getScrollHeight());
          return editorScrollRatio = editorElement.getScrollTop() / editorElement.getScrollHeight();
        });
        it('computes an offset that scrolls the minimap to the bottom edge', function() {
          return expect(minimap.getScrollTop()).toEqual(minimap.getMaxScrollTop());
        });
        it('computes the first visible row in the minimap', function() {
          return expect(minimap.getFirstVisibleScreenRow()).toEqual(largeLineCount - 10);
        });
        return it('computes the last visible row in the minimap', function() {
          return expect(minimap.getLastVisibleScreenRow()).toEqual(largeLineCount);
        });
      });
    });
    describe('destroying the model', function() {
      it('emits a did-destroy event', function() {
        var spy;
        spy = jasmine.createSpy('destroy');
        minimap.onDidDestroy(spy);
        minimap.destroy();
        return expect(spy).toHaveBeenCalled();
      });
      return it('returns true when asked if destroyed', function() {
        minimap.destroy();
        return expect(minimap.isDestroyed()).toBeTruthy();
      });
    });
    describe('destroying the text editor', function() {
      return it('destroys the model', function() {
        spyOn(minimap, 'destroy');
        editor.destroy();
        return expect(minimap.destroy).toHaveBeenCalled();
      });
    });
    describe('::decorateMarker', function() {
      var changeSpy, decoration, marker, _ref1;
      _ref1 = [], marker = _ref1[0], decoration = _ref1[1], changeSpy = _ref1[2];
      beforeEach(function() {
        editor.setText(largeSample);
        changeSpy = jasmine.createSpy('didChange');
        minimap.onDidChange(changeSpy);
        marker = minimap.markBufferRange([[0, 6], [1, 11]]);
        return decoration = minimap.decorateMarker(marker, {
          type: 'highlight',
          "class": 'dummy'
        });
      });
      it('creates a decoration for the given marker', function() {
        return expect(minimap.decorationsByMarkerId[marker.id]).toBeDefined();
      });
      it('creates a change corresponding to the marker range', function() {
        expect(changeSpy).toHaveBeenCalled();
        expect(changeSpy.calls[0].args[0].start).toEqual(0);
        return expect(changeSpy.calls[0].args[0].end).toEqual(1);
      });
      describe('when the marker range changes', function() {
        beforeEach(function() {
          var markerChangeSpy;
          markerChangeSpy = jasmine.createSpy('marker-did-change');
          marker.onDidChange(markerChangeSpy);
          marker.setBufferRange([[0, 6], [3, 11]]);
          return waitsFor(function() {
            return markerChangeSpy.calls.length > 0;
          });
        });
        return it('creates a change only for the dif between the two ranges', function() {
          expect(changeSpy).toHaveBeenCalled();
          expect(changeSpy.calls[1].args[0].start).toEqual(1);
          return expect(changeSpy.calls[1].args[0].end).toEqual(3);
        });
      });
      describe('destroying the marker', function() {
        beforeEach(function() {
          return marker.destroy();
        });
        it('removes the decoration from the render view', function() {
          return expect(minimap.decorationsByMarkerId[marker.id]).toBeUndefined();
        });
        return it('creates a change corresponding to the marker range', function() {
          expect(changeSpy.calls[1].args[0].start).toEqual(0);
          return expect(changeSpy.calls[1].args[0].end).toEqual(1);
        });
      });
      describe('destroying the decoration', function() {
        beforeEach(function() {
          return decoration.destroy();
        });
        it('removes the decoration from the render view', function() {
          return expect(minimap.decorationsByMarkerId[marker.id]).toBeUndefined();
        });
        return it('creates a change corresponding to the marker range', function() {
          expect(changeSpy.calls[1].args[0].start).toEqual(0);
          return expect(changeSpy.calls[1].args[0].end).toEqual(1);
        });
      });
      describe('destroying all the decorations for the marker', function() {
        beforeEach(function() {
          return minimap.removeAllDecorationsForMarker(marker);
        });
        it('removes the decoration from the render view', function() {
          return expect(minimap.decorationsByMarkerId[marker.id]).toBeUndefined();
        });
        return it('creates a change corresponding to the marker range', function() {
          expect(changeSpy.calls[1].args[0].start).toEqual(0);
          return expect(changeSpy.calls[1].args[0].end).toEqual(1);
        });
      });
      return describe('destroying the minimap', function() {
        beforeEach(function() {
          return minimap.destroy();
        });
        it('removes all the previously added decorations', function() {
          expect(minimap.decorationsById).toEqual({});
          return expect(minimap.decorationsByMarkerId).toEqual({});
        });
        return it('prevents the creation of new decorations', function() {
          marker = editor.markBufferRange([[0, 6], [0, 11]]);
          decoration = minimap.decorateMarker(marker, {
            type: 'highlight',
            "class": 'dummy'
          });
          return expect(decoration).toBeUndefined();
        });
      });
    });
    return describe('::decorationsByTypeThenRows', function() {
      var decorations;
      decorations = [][0];
      beforeEach(function() {
        var createDecoration;
        editor.setText(largeSample);
        createDecoration = function(type, range) {
          var decoration, marker;
          marker = minimap.markBufferRange(range);
          return decoration = minimap.decorateMarker(marker, {
            type: type
          });
        };
        createDecoration('highlight', [[6, 0], [11, 0]]);
        createDecoration('highlight', [[7, 0], [8, 0]]);
        createDecoration('highlight-over', [[1, 0], [2, 0]]);
        createDecoration('line', [[3, 0], [4, 0]]);
        createDecoration('line', [[12, 0], [12, 0]]);
        createDecoration('highlight-under', [[0, 0], [10, 1]]);
        return decorations = minimap.decorationsByTypeThenRows(0, 12);
      });
      it('returns an object whose keys are the decorations types', function() {
        return expect(Object.keys(decorations).sort()).toEqual(['highlight-over', 'highlight-under', 'line']);
      });
      it('stores decorations by rows within each type objects', function() {
        expect(Object.keys(decorations['highlight-over']).sort()).toEqual('1 2 6 7 8 9 10 11'.split(' ').sort());
        expect(Object.keys(decorations['line']).sort()).toEqual('3 4 12'.split(' ').sort());
        return expect(Object.keys(decorations['highlight-under']).sort()).toEqual('0 1 2 3 4 5 6 7 8 9 10'.split(' ').sort());
      });
      return it('stores the decorations spanning a row in the corresponding row array', function() {
        expect(decorations['highlight-over']['7'].length).toEqual(2);
        expect(decorations['line']['3'].length).toEqual(1);
        return expect(decorations['highlight-under']['5'].length).toEqual(1);
      });
    });
  });

  describe('Stand alone minimap', function() {
    var editor, editorElement, largeSample, minimap, smallSample, _ref;
    _ref = [], editor = _ref[0], editorElement = _ref[1], minimap = _ref[2], largeSample = _ref[3], smallSample = _ref[4];
    beforeEach(function() {
      var dir;
      atom.config.set('minimap.charHeight', 4);
      atom.config.set('minimap.charWidth', 2);
      atom.config.set('minimap.interline', 1);
      editor = atom.workspace.buildTextEditor({});
      editorElement = atom.views.getView(editor);
      jasmine.attachToDOM(editorElement);
      editorElement.setHeight(50);
      editorElement.setWidth(200);
      editor.setLineHeightInPixels(10);
      dir = atom.project.getDirectories()[0];
      minimap = new Minimap({
        textEditor: editor,
        standAlone: true
      });
      largeSample = fs.readFileSync(dir.resolve('large-file.coffee')).toString();
      return smallSample = fs.readFileSync(dir.resolve('sample.coffee')).toString();
    });
    it('has an associated editor', function() {
      return expect(minimap.getTextEditor()).toEqual(editor);
    });
    it('measures the minimap size based on the current editor content', function() {
      editor.setText(smallSample);
      expect(minimap.getHeight()).toEqual(editor.getScreenLineCount() * 5);
      editor.setText(largeSample);
      return expect(minimap.getHeight()).toEqual(editor.getScreenLineCount() * 5);
    });
    it('measures the scaling factor between the editor and the minimap', function() {
      expect(minimap.getVerticalScaleFactor()).toEqual(0.5);
      return expect(minimap.getHorizontalScaleFactor()).toEqual(2 / editor.getDefaultCharWidth());
    });
    it('measures the editor visible area size at minimap scale', function() {
      editor.setText(largeSample);
      return expect(minimap.getTextEditorScaledHeight()).toEqual(25);
    });
    it('has a visible height based on the passed-in options', function() {
      expect(minimap.getVisibleHeight()).toEqual(5);
      editor.setText(smallSample);
      expect(minimap.getVisibleHeight()).toEqual(20);
      editor.setText(largeSample);
      expect(minimap.getVisibleHeight()).toEqual(editor.getScreenLineCount() * 5);
      minimap.height = 100;
      return expect(minimap.getVisibleHeight()).toEqual(100);
    });
    it('has a visible width based on the passed-in options', function() {
      expect(minimap.getVisibleWidth()).toEqual(0);
      editor.setText(smallSample);
      expect(minimap.getVisibleWidth()).toEqual(36);
      editor.setText(largeSample);
      expect(minimap.getVisibleWidth()).toEqual(editor.getMaxScreenLineLength() * 2);
      minimap.width = 50;
      return expect(minimap.getVisibleWidth()).toEqual(50);
    });
    it('measures the available minimap scroll', function() {
      var largeLineCount;
      editor.setText(largeSample);
      largeLineCount = editor.getScreenLineCount();
      expect(minimap.getMaxScrollTop()).toEqual(0);
      expect(minimap.canScroll()).toBeFalsy();
      minimap.height = 100;
      expect(minimap.getMaxScrollTop()).toEqual(largeLineCount * 5 - 100);
      return expect(minimap.canScroll()).toBeTruthy();
    });
    it('computes the first visible row in the minimap', function() {
      return expect(minimap.getFirstVisibleScreenRow()).toEqual(0);
    });
    it('computes the last visible row in the minimap', function() {
      editor.setText(largeSample);
      expect(minimap.getLastVisibleScreenRow()).toEqual(editor.getScreenLineCount());
      minimap.height = 100;
      return expect(minimap.getLastVisibleScreenRow()).toEqual(20);
    });
    it('does not relay scroll top events from the editor', function() {
      var scrollSpy;
      editor.setText(largeSample);
      scrollSpy = jasmine.createSpy('didScroll');
      minimap.onDidChangeScrollTop(scrollSpy);
      editorElement.setScrollTop(100);
      return expect(scrollSpy).not.toHaveBeenCalled();
    });
    it('does not relay scroll left events from the editor', function() {
      var scrollSpy;
      editor.setText(largeSample);
      scrollSpy = jasmine.createSpy('didScroll');
      minimap.onDidChangeScrollLeft(scrollSpy);
      spyOn(editorElement, 'getScrollWidth').andReturn(10000);
      editorElement.setScrollLeft(100);
      return expect(scrollSpy).not.toHaveBeenCalled();
    });
    it('has a scroll top that is not bound to the text editor', function() {
      var scrollSpy;
      scrollSpy = jasmine.createSpy('didScroll');
      minimap.onDidChangeScrollTop(scrollSpy);
      editor.setText(largeSample);
      editorElement.setScrollTop(1000);
      expect(minimap.getScrollTop()).toEqual(0);
      expect(scrollSpy).not.toHaveBeenCalled();
      minimap.setScrollTop(10);
      expect(minimap.getScrollTop()).toEqual(10);
      return expect(scrollSpy).toHaveBeenCalled();
    });
    it('has rendering properties that can overrides the config values', function() {
      minimap.setCharWidth(8.5);
      minimap.setCharHeight(10.2);
      minimap.setInterline(10.6);
      expect(minimap.getCharWidth()).toEqual(8);
      expect(minimap.getCharHeight()).toEqual(10);
      expect(minimap.getInterline()).toEqual(10);
      return expect(minimap.getLineHeight()).toEqual(20);
    });
    return it('emits a config change event when a value is changed', function() {
      var changeSpy;
      changeSpy = jasmine.createSpy('did-change');
      minimap.onDidChangeConfig(changeSpy);
      minimap.setCharWidth(8.5);
      minimap.setCharHeight(10.2);
      minimap.setInterline(10.6);
      return expect(changeSpy.callCount).toEqual(3);
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL3NwZWMvbWluaW1hcC1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxXQUFBOztBQUFBLEVBQUEsT0FBQSxDQUFRLHFCQUFSLENBQUEsQ0FBQTs7QUFBQSxFQUVBLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUixDQUZMLENBQUE7O0FBQUEsRUFHQSxPQUFBLEdBQVUsT0FBQSxDQUFRLGdCQUFSLENBSFYsQ0FBQTs7QUFBQSxFQUtBLFFBQUEsQ0FBUyxTQUFULEVBQW9CLFNBQUEsR0FBQTtBQUNsQixRQUFBLHdIQUFBO0FBQUEsSUFBQSxPQUF1SCxFQUF2SCxFQUFDLGdCQUFELEVBQVMsdUJBQVQsRUFBd0IsaUJBQXhCLEVBQWlDLHFCQUFqQyxFQUE4QyxxQkFBOUMsRUFBMkQsb0NBQTNELEVBQXVGLHNDQUF2RixDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsVUFBQSxHQUFBO0FBQUEsTUFBQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isb0JBQWhCLEVBQXNDLENBQXRDLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG1CQUFoQixFQUFxQyxDQUFyQyxDQURBLENBQUE7QUFBQSxNQUVBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixtQkFBaEIsRUFBcUMsQ0FBckMsQ0FGQSxDQUFBO0FBQUEsTUFJQSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFmLENBQStCLEVBQS9CLENBSlQsQ0FBQTtBQUFBLE1BTUEsYUFBQSxHQUFnQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsTUFBbkIsQ0FOaEIsQ0FBQTtBQUFBLE1BT0EsT0FB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

//# sourceURL=/home/gsmyrnaios/.atom/packages/minimap/spec/minimap-spec.coffee
