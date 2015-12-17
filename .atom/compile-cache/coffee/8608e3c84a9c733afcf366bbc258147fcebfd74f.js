(function() {
  var ColorContext, ColorScanner, registry;

  ColorScanner = require('../lib/color-scanner');

  ColorContext = require('../lib/color-context');

  registry = require('../lib/color-expressions');

  describe('ColorScanner', function() {
    var editor, lastIndex, result, scanner, text, withScannerForTextEditor, withTextEditor, _ref;
    _ref = [], scanner = _ref[0], editor = _ref[1], text = _ref[2], result = _ref[3], lastIndex = _ref[4];
    withTextEditor = function(fixture, block) {
      return describe("with " + fixture + " buffer", function() {
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.workspace.open(fixture);
          });
          return runs(function() {
            editor = atom.workspace.getActiveTextEditor();
            return text = editor.getText();
          });
        });
        afterEach(function() {
          return editor = null;
        });
        return block();
      });
    };
    withScannerForTextEditor = function(fixture, block) {
      return withTextEditor(fixture, function() {
        beforeEach(function() {
          var context;
          context = new ColorContext({
            registry: registry
          });
          return scanner = new ColorScanner({
            context: context
          });
        });
        afterEach(function() {
          return scanner = null;
        });
        return block();
      });
    };
    return describe('::search', function() {
      withScannerForTextEditor('html-entities.html', function() {
        beforeEach(function() {
          return result = scanner.search(text, 'html');
        });
        return it('returns nothing', function() {
          return expect(result).toBeUndefined();
        });
      });
      withScannerForTextEditor('css-color-with-prefix.less', function() {
        beforeEach(function() {
          return result = scanner.search(text, 'less');
        });
        return it('returns nothing', function() {
          return expect(result).toBeUndefined();
        });
      });
      return withScannerForTextEditor('four-variables.styl', function() {
        beforeEach(function() {
          return result = scanner.search(text, 'styl');
        });
        it('returns the first buffer color match', function() {
          return expect(result).toBeDefined();
        });
        describe('the resulting buffer color', function() {
          it('has a text range', function() {
            return expect(result.range).toEqual([13, 17]);
          });
          it('has a color', function() {
            return expect(result.color).toBeColor('#ffffff');
          });
          it('stores the matched text', function() {
            return expect(result.match).toEqual('#fff');
          });
          it('stores the last index', function() {
            return expect(result.lastIndex).toEqual(17);
          });
          return it('stores match line', function() {
            return expect(result.line).toEqual(0);
          });
        });
        return describe('successive searches', function() {
          it('returns a buffer color for each match and then undefined', function() {
            var doSearch;
            doSearch = function() {
              return result = scanner.search(text, 'styl', result.lastIndex);
            };
            expect(doSearch()).toBeDefined();
            expect(doSearch()).toBeDefined();
            expect(doSearch()).toBeDefined();
            return expect(doSearch()).toBeUndefined();
          });
          return it('stores the line of successive matches', function() {
            var doSearch;
            doSearch = function() {
              return result = scanner.search(text, 'styl', result.lastIndex);
            };
            expect(doSearch().line).toEqual(2);
            expect(doSearch().line).toEqual(4);
            return expect(doSearch().line).toEqual(6);
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9zcGVjL2NvbG9yLXNjYW5uZXItc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsb0NBQUE7O0FBQUEsRUFBQSxZQUFBLEdBQWUsT0FBQSxDQUFRLHNCQUFSLENBQWYsQ0FBQTs7QUFBQSxFQUNBLFlBQUEsR0FBZSxPQUFBLENBQVEsc0JBQVIsQ0FEZixDQUFBOztBQUFBLEVBRUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSwwQkFBUixDQUZYLENBQUE7O0FBQUEsRUFJQSxRQUFBLENBQVMsY0FBVCxFQUF5QixTQUFBLEdBQUE7QUFDdkIsUUFBQSx3RkFBQTtBQUFBLElBQUEsT0FBNkMsRUFBN0MsRUFBQyxpQkFBRCxFQUFVLGdCQUFWLEVBQWtCLGNBQWxCLEVBQXdCLGdCQUF4QixFQUFnQyxtQkFBaEMsQ0FBQTtBQUFBLElBRUEsY0FBQSxHQUFpQixTQUFDLE9BQUQsRUFBVSxLQUFWLEdBQUE7YUFDZixRQUFBLENBQVUsT0FBQSxHQUFPLE9BQVAsR0FBZSxTQUF6QixFQUFtQyxTQUFBLEdBQUE7QUFDakMsUUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsVUFBQSxlQUFBLENBQWdCLFNBQUEsR0FBQTttQkFBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsT0FBcEIsRUFBSDtVQUFBLENBQWhCLENBQUEsQ0FBQTtpQkFDQSxJQUFBLENBQUssU0FBQSxHQUFBO0FBQ0gsWUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBLENBQVQsQ0FBQTttQkFDQSxJQUFBLEdBQU8sTUFBTSxDQUFDLE9BQVAsQ0FBQSxFQUZKO1VBQUEsQ0FBTCxFQUZTO1FBQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxRQU1BLFNBQUEs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

//# sourceURL=/home/gsmyrnaios/.atom/packages/pigments/spec/color-scanner-spec.coffee
