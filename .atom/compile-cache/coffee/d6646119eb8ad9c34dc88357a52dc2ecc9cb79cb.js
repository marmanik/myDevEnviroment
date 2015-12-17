(function() {
  var TodosModel, path;

  path = require('path');

  TodosModel = require('../lib/todos-model');

  describe('Todos Model', function() {
    var defaultLookup, defaultRegexes, defaultShowInTable, model, _ref;
    _ref = [], model = _ref[0], defaultRegexes = _ref[1], defaultLookup = _ref[2], defaultShowInTable = _ref[3];
    beforeEach(function() {
      defaultRegexes = ['FIXMEs', '/\\bFIXME:?\\d*($|\\s.*$)/g', 'TODOs', '/\\bTODO:?\\d*($|\\s.*$)/g'];
      defaultLookup = {
        title: defaultRegexes[2],
        regex: defaultRegexes[3]
      };
      defaultShowInTable = ['Text', 'Type', 'File'];
      model = new TodosModel;
      return atom.project.setPaths([path.join(__dirname, 'fixtures/sample1')]);
    });
    describe('buildRegexLookups(regexes)', function() {
      it('returns an array of lookup objects when passed an array of regexes', function() {
        var lookups1, lookups2;
        lookups1 = model.buildRegexLookups(defaultRegexes);
        lookups2 = [
          {
            title: defaultRegexes[0],
            regex: defaultRegexes[1]
          }, {
            title: defaultRegexes[2],
            regex: defaultRegexes[3]
          }
        ];
        return expect(lookups1).toEqual(lookups2);
      });
      return it('handles invalid input', function() {
        var lookups, notification, notificationSpy, regexes;
        model.onDidFailSearch(notificationSpy = jasmine.createSpy());
        regexes = ['TODO'];
        lookups = model.buildRegexLookups(regexes);
        expect(lookups).toHaveLength(0);
        notification = notificationSpy.mostRecentCall.args[0];
        expect(notificationSpy).toHaveBeenCalled();
        return expect(notification.indexOf('Invalid')).not.toBe(-1);
      });
    });
    describe('makeRegexObj(regexStr)', function() {
      it('returns a RegExp obj when passed a regex literal (string)', function() {
        var regexObj, regexStr;
        regexStr = defaultLookup.regex;
        regexObj = model.makeRegexObj(regexStr);
        expect(typeof regexObj.test).toBe('function');
        return expect(typeof regexObj.exec).toBe('function');
      });
      it('returns false and notifies on invalid input', function() {
        var notification, notificationSpy, regexObj, regexStr;
        model.onDidFailSearch(notificationSpy = jasmine.createSpy());
        regexStr = 'arstastTODO:.+$)/g';
        regexObj = model.makeRegexObj(regexStr);
        expect(regexObj).toBe(false);
        notification = notificationSpy.mostRecentCall.args[0];
        expect(notificationSpy).toHaveBeenCalled();
        return expect(notification.indexOf('Invalid')).not.toBe(-1);
      });
      return it('handles empty input', function() {
        var regexObj;
        regexObj = model.makeRegexObj();
        return expect(regexObj).toBe(false);
      });
    });
    describe('handleScanMatch(match, regex)', function() {
      var match, regex, _ref1;
      _ref1 = [], match = _ref1.match, regex = _ref1.regex;
      beforeEach(function() {
        regex = /\b@?TODO:?\d*($|\s.*$)/g;
        return match = {
          path: "" + (atom.project.getPaths()[0]) + "/sample.c",
          matchText: ' TODO: Comment in C ',
          range: [[0, 1], [0, 20]]
        };
      });
      it('should handle results from workspace scan (also tested in fetchRegexItem)', function() {
        var output;
        output = model.handleScanMatch(match);
        return expect(output.matchText).toEqual('TODO: Comment in C');
      });
      it('should remove regex part', function() {
        var output;
        output = model.handleScanMatch(match, regex);
        return expect(output.matchText).toEqual('Comment in C');
      });
      return it('should serialize range and relativize path', function() {
        var output;
        output = model.handleScanMatch(match, regex);
        expect(output.relativePath).toEqual('sample.c');
        return expect(output.rangeString).toEqual('0,1,0,20');
      });
    });
    describe('fetchRegexItem(lookupObj)', function() {
      it('should scan the workspace for the regex that is passed and fill lookup results', function() {
        waitsForPromise(function() {
          return model.fetchRegexItem(defaultLookup);
        });
        return runs(function() {
          expect(model.todos).toHaveLength(3);
          expect(model.todos[0].matchText).toBe('Comment in C');
          expect(model.todos[1].matchText).toBe('This is the first todo');
          return expect(model.todos[2].matchText).toBe('This is the second todo');
        });
      });
      it('should handle other regexes', function() {
        var lookup;
        lookup = {
          title: 'Includes',
          regex: '/#include(.+)/g'
        };
        waitsForPromise(function() {
          return model.fetchRegexItem(lookup);
        });
        return runs(function() {
          expect(model.todos).toHaveLength(1);
          return expect(model.todos[0].matchText).toBe('<stdio.h>');
        });
      });
      it('should handle special character regexes', function() {
        var lookup;
        lookup = {
          title: 'Todos',
          regex: '/ This is the (?:first|second) todo/g'
        };
        waitsForPromise(function() {
          return model.fetchRegexItem(lookup);
        });
        return runs(function() {
          expect(model.todos).toHaveLength(2);
          expect(model.todos[0].matchText).toBe('This is the first todo');
          return expect(model.todos[1].matchText).toBe('This is the second todo');
        });
      });
      it('should handle regex without capture group', function() {
        var lookup;
        lookup = {
          title: 'This is Code',
          regex: '/[\\w\\s]+code[\\w\\s]*/g'
        };
        waitsForPromise(function() {
          return model.fetchRegexItem(lookup);
        });
        return runs(function() {
          expect(model.todos).toHaveLength(1);
          return expect(model.todos[0].matchText).toBe('Sample quicksort code');
        });
      });
      it('should handle post-annotations with special regex', function() {
        var lookup;
        lookup = {
          title: 'Pre-DEBUG',
          regex: '/(.+).{3}DEBUG\\s*$/g'
        };
        waitsForPromise(function() {
          return model.fetchRegexItem(lookup);
        });
        return runs(function() {
          expect(model.todos).toHaveLength(1);
          return expect(model.todos[0].matchText).toBe('return sort(Array.apply(this, arguments));');
        });
      });
      it('should handle post-annotations with non-capturing group', function() {
        var lookup;
        lookup = {
          title: 'Pre-DEBUG',
          regex: '/(.+?(?=.{3}DEBUG\\s*$))/'
        };
        waitsForPromise(function() {
          return model.fetchRegexItem(lookup);
        });
        return runs(function() {
          expect(model.todos).toHaveLength(1);
          return expect(model.todos[0].matchText).toBe('return sort(Array.apply(this, arguments));');
        });
      });
      it('should truncate todos longer than the defined max length of 120', function() {
        var lookup;
        lookup = {
          title: 'Long Annotation',
          regex: '/LOONG:?(.+$)/g'
        };
        waitsForPromise(function() {
          return model.fetchRegexItem(lookup);
        });
        return runs(function() {
          var matchText, matchText2;
          matchText = 'Lorem ipsum dolor sit amet, dapibus rhoncus. Scelerisque quam,';
          matchText += ' id ante molestias, ipsum lorem magnis et. A eleifend i...';
          matchText2 = '_SpgLE84Ms1K4DSumtJDoNn8ZECZLL+VR0DoGydy54vUoSpgLE84Ms1K4DSum';
          matchText2 += 'tJDoNn8ZECZLLVR0DoGydy54vUonRClXwLbFhX2gMwZgjx250ay+V0lF...';
          expect(model.todos[0].matchText).toHaveLength(120);
          expect(model.todos[0].matchText).toBe(matchText);
          expect(model.todos[1].matchText).toHaveLength(120);
          return expect(model.todos[1].matchText).toBe(matchText2);
        });
      });
      return it('should strip common block comment endings', function() {
        atom.project.setPaths([path.join(__dirname, 'fixtures/sample2')]);
        waitsForPromise(function() {
          return model.fetchRegexItem(defaultLookup);
        });
        return runs(function() {
          expect(model.todos).toHaveLength(6);
          expect(model.todos[0].matchText).toBe('C block comment');
          expect(model.todos[1].matchText).toBe('HTML comment');
          expect(model.todos[2].matchText).toBe('PowerShell comment');
          expect(model.todos[3].matchText).toBe('Haskell comment');
          expect(model.todos[4].matchText).toBe('Lua comment');
          return expect(model.todos[5].matchText).toBe('PHP comment');
        });
      });
    });
    describe('ignore path rules', function() {
      it('works with no paths added', function() {
        atom.config.set('todo-show.ignoreThesePaths', []);
        waitsForPromise(function() {
          return model.fetchRegexItem(defaultLookup);
        });
        return runs(function() {
          return expect(model.todos).toHaveLength(3);
        });
      });
      it('must be an array', function() {
        var notificationSpy;
        model.onDidFailSearch(notificationSpy = jasmine.createSpy());
        atom.config.set('todo-show.ignoreThesePaths', '123');
        waitsForPromise(function() {
          return model.fetchRegexItem(defaultLookup);
        });
        return runs(function() {
          var notification;
          expect(model.todos).toHaveLength(3);
          notification = notificationSpy.mostRecentCall.args[0];
          expect(notificationSpy).toHaveBeenCalled();
          return expect(notification.indexOf('ignoreThesePaths')).not.toBe(-1);
        });
      });
      it('respects ignored files', function() {
        atom.config.set('todo-show.ignoreThesePaths', ['sample.js']);
        waitsForPromise(function() {
          return model.fetchRegexItem(defaultLookup);
        });
        return runs(function() {
          expect(model.todos).toHaveLength(1);
          return expect(model.todos[0].matchText).toBe('Comment in C');
        });
      });
      it('respects ignored directories and filetypes', function() {
        atom.project.setPaths([path.join(__dirname, 'fixtures')]);
        atom.config.set('todo-show.ignoreThesePaths', ['sample1', '*.md']);
        waitsForPromise(function() {
          return model.fetchRegexItem(defaultLookup);
        });
        return runs(function() {
          expect(model.todos).toHaveLength(6);
          return expect(model.todos[0].matchText).toBe('C block comment');
        });
      });
      it('respects ignored wildcard directories', function() {
        atom.project.setPaths([path.join(__dirname, 'fixtures')]);
        atom.config.set('todo-show.ignoreThesePaths', ['**/sample.js', '**/sample.txt', '*.md']);
        waitsForPromise(function() {
          return model.fetchRegexItem(defaultLookup);
        });
        return runs(function() {
          expect(model.todos).toHaveLength(1);
          return expect(model.todos[0].matchText).toBe('Comment in C');
        });
      });
      return it('respects more advanced ignores', function() {
        atom.project.setPaths([path.join(__dirname, 'fixtures')]);
        atom.config.set('todo-show.ignoreThesePaths', ['output(-grouped)?\\.*', '*1/**']);
        waitsForPromise(function() {
          return model.fetchRegexItem(defaultLookup);
        });
        return runs(function() {
          expect(model.todos).toHaveLength(6);
          return expect(model.todos[0].matchText).toBe('C block comment');
        });
      });
    });
    describe('fetchOpenRegexItem(lookupObj)', function() {
      var editor;
      editor = null;
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.workspace.open('sample.c');
        });
        return runs(function() {
          return editor = atom.workspace.getActiveTextEditor();
        });
      });
      it('scans open files for the regex that is passed and fill lookup results', function() {
        waitsForPromise(function() {
          return model.fetchOpenRegexItem(defaultLookup);
        });
        return runs(function() {
          expect(model.todos).toHaveLength(1);
          expect(model.todos.length).toBe(1);
          return expect(model.todos[0].matchText).toBe('Comment in C');
        });
      });
      it('works with files outside of workspace', function() {
        waitsForPromise(function() {
          return atom.workspace.open('../sample2/sample.txt');
        });
        return runs(function() {
          waitsForPromise(function() {
            return model.fetchOpenRegexItem(defaultLookup);
          });
          return runs(function() {
            expect(model.todos).toHaveLength(7);
            expect(model.todos[0].matchText).toBe('Comment in C');
            expect(model.todos[1].matchText).toBe('C block comment');
            return expect(model.todos[6].matchText).toBe('PHP comment');
          });
        });
      });
      it('handles unsaved documents', function() {
        editor.setText('TODO: New todo');
        waitsForPromise(function() {
          return model.fetchOpenRegexItem(defaultLookup);
        });
        return runs(function() {
          expect(model.todos).toHaveLength(1);
          expect(model.todos[0].title).toBe('TODOs');
          return expect(model.todos[0].matchText).toBe('New todo');
        });
      });
      it('respects imdone syntax (https://github.com/imdone/imdone-atom)', function() {
        editor.setText('TODO:10 todo1\nTODO:0 todo2');
        waitsForPromise(function() {
          return model.fetchOpenRegexItem(defaultLookup);
        });
        return runs(function() {
          expect(model.todos).toHaveLength(2);
          expect(model.todos[0].title).toBe('TODOs');
          expect(model.todos[0].matchText).toBe('todo1');
          return expect(model.todos[1].matchText).toBe('todo2');
        });
      });
      it('handles number in todo (as long as its not without space)', function() {
        editor.setText("Line 1 //TODO: 1 2 3\nLine 1 // TODO:1 2 3");
        waitsForPromise(function() {
          return model.fetchOpenRegexItem(defaultLookup);
        });
        return runs(function() {
          expect(model.todos).toHaveLength(2);
          expect(model.todos[0].matchText).toBe('1 2 3');
          return expect(model.todos[1].matchText).toBe('2 3');
        });
      });
      it('handles empty todos', function() {
        editor.setText("Line 1 // TODO\nLine 2 //TODO");
        waitsForPromise(function() {
          return model.fetchOpenRegexItem(defaultLookup);
        });
        return runs(function() {
          expect(model.todos).toHaveLength(2);
          expect(model.todos[0].matchText).toBe('No details');
          return expect(model.todos[1].matchText).toBe('No details');
        });
      });
      it('handles empty block todos', function() {
        editor.setText("/* TODO */\nLine 2 /* TODO */");
        waitsForPromise(function() {
          return model.fetchOpenRegexItem(defaultLookup);
        });
        return runs(function() {
          expect(model.todos).toHaveLength(2);
          expect(model.todos[0].matchText).toBe('No details');
          return expect(model.todos[1].matchText).toBe('No details');
        });
      });
      it('handles todos with @ in front', function() {
        editor.setText("Line 1 //@TODO: text\nLine 2 //@TODO: text\nLine 3 @TODO: text");
        waitsForPromise(function() {
          return model.fetchOpenRegexItem(defaultLookup);
        });
        return runs(function() {
          expect(model.todos).toHaveLength(3);
          expect(model.todos[0].matchText).toBe('text');
          expect(model.todos[1].matchText).toBe('text');
          return expect(model.todos[2].matchText).toBe('text');
        });
      });
      it('handles tabs in todos', function() {
        editor.setText('Line //TODO:\ttext');
        waitsForPromise(function() {
          return model.fetchOpenRegexItem(defaultLookup);
        });
        return runs(function() {
          return expect(model.todos[0].matchText).toBe('text');
        });
      });
      it('handles todo without semicolon', function() {
        editor.setText('A line // TODO text');
        waitsForPromise(function() {
          return model.fetchOpenRegexItem(defaultLookup);
        });
        return runs(function() {
          return expect(model.todos[0].matchText).toBe('text');
        });
      });
      it('ignores todos without leading space', function() {
        editor.setText('A line // TODO:text');
        waitsForPromise(function() {
          return model.fetchOpenRegexItem(defaultLookup);
        });
        return runs(function() {
          return expect(model.todos).toHaveLength(0);
        });
      });
      it('ignores todo if unwanted chars are present', function() {
        editor.setText('define("_JS_TODO_ALERT_", "js:alert(&quot;TODO&quot;);");');
        waitsForPromise(function() {
          return model.fetchOpenRegexItem(defaultLookup);
        });
        return runs(function() {
          return expect(model.todos).toHaveLength(0);
        });
      });
      return it('ignores binary data', function() {
        editor.setText('// TODOe�d��RPPP0�');
        waitsForPromise(function() {
          return model.fetchOpenRegexItem(defaultLookup);
        });
        return runs(function() {
          return expect(model.todos).toHaveLength(0);
        });
      });
    });
    return describe('getMarkdown()', function() {
      beforeEach(function() {
        atom.config.set('todo-show.findTheseRegexes', defaultRegexes);
        atom.config.set('todo-show.showInTable', defaultShowInTable);
        return model.todos = [
          {
            matchText: 'fixme #1',
            relativePath: 'file1.txt',
            title: 'FIXMEs',
            range: [[3, 6], [3, 10]],
            rangeString: '3,6,3,10'
          }, {
            matchText: 'todo #1',
            relativePath: 'file1.txt',
            title: 'TODOs',
            range: [[4, 5], [4, 9]],
            rangeString: '4,5,4,9'
          }, {
            matchText: 'fixme #2',
            relativePath: 'file2.txt',
            title: 'FIXMEs',
            range: [[5, 7], [5, 11]],
            rangeString: '5,7,5,11'
          }
        ];
      });
      it('creates a markdown string from regexes', function() {
        return expect(model.getMarkdown()).toEqual("- fixme #1 __FIXMEs__ `file1.txt`\n- todo #1 __TODOs__ `file1.txt`\n- fixme #2 __FIXMEs__ `file2.txt`\n");
      });
      it('creates markdown with sorting', function() {
        model.sortTodos({
          sortBy: 'Text',
          sortAsc: true
        });
        return expect(model.getMarkdown()).toEqual("- fixme #1 __FIXMEs__ `file1.txt`\n- fixme #2 __FIXMEs__ `file2.txt`\n- todo #1 __TODOs__ `file1.txt`\n");
      });
      it('creates markdown with inverse sorting', function() {
        model.sortTodos({
          sortBy: 'Text',
          sortAsc: false
        });
        return expect(model.getMarkdown()).toEqual("- todo #1 __TODOs__ `file1.txt`\n- fixme #2 __FIXMEs__ `file2.txt`\n- fixme #1 __FIXMEs__ `file1.txt`\n");
      });
      it('creates markdown different items', function() {
        atom.config.set('todo-show.showInTable', ['Type', 'File', 'Range']);
        return expect(model.getMarkdown()).toEqual("- __FIXMEs__ `file1.txt` _:3,6,3,10_\n- __TODOs__ `file1.txt` _:4,5,4,9_\n- __FIXMEs__ `file2.txt` _:5,7,5,11_\n");
      });
      it('accepts missing ranges and paths in regexes', function() {
        var markdown;
        model.todos = [
          {
            matchText: 'fixme #1',
            title: 'FIXMEs'
          }
        ];
        expect(model.getMarkdown()).toEqual("- fixme #1 __FIXMEs__\n");
        atom.config.set('todo-show.showInTable', ['Type', 'File', 'Range', 'Text']);
        markdown = '\n## Unknown File\n\n- fixme #1 `FIXMEs`\n';
        return expect(model.getMarkdown()).toEqual("- __FIXMEs__ fixme #1\n");
      });
      return it('accepts missing title in regexes', function() {
        model.todos = [
          {
            matchText: 'fixme #1',
            relativePath: 'file1.txt'
          }
        ];
        expect(model.getMarkdown()).toEqual("- fixme #1 `file1.txt`\n");
        atom.config.set('todo-show.showInTable', ['Title']);
        return expect(model.getMarkdown()).toEqual("- No details\n");
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy90b2RvLXNob3cvc3BlYy90b2Rvcy1tb2RlbC1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxnQkFBQTs7QUFBQSxFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUFQLENBQUE7O0FBQUEsRUFDQSxVQUFBLEdBQWEsT0FBQSxDQUFRLG9CQUFSLENBRGIsQ0FBQTs7QUFBQSxFQUdBLFFBQUEsQ0FBUyxhQUFULEVBQXdCLFNBQUEsR0FBQTtBQUN0QixRQUFBLDhEQUFBO0FBQUEsSUFBQSxPQUE2RCxFQUE3RCxFQUFDLGVBQUQsRUFBUSx3QkFBUixFQUF3Qix1QkFBeEIsRUFBdUMsNEJBQXZDLENBQUE7QUFBQSxJQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLGNBQUEsR0FBaUIsQ0FDZixRQURlLEVBRWYsNkJBRmUsRUFHZixPQUhlLEVBSWYsNEJBSmUsQ0FBakIsQ0FBQTtBQUFBLE1BTUEsYUFBQSxHQUNFO0FBQUEsUUFBQSxLQUFBLEVBQU8sY0FBZSxDQUFBLENBQUEsQ0FBdEI7QUFBQSxRQUNBLEtBQUEsRUFBTyxjQUFlLENBQUEsQ0FBQSxDQUR0QjtPQVBGLENBQUE7QUFBQSxNQVNBLGtCQUFBLEdBQXFCLENBQUMsTUFBRCxFQUFTLE1BQVQsRUFBaUIsTUFBakIsQ0FUckIsQ0FBQTtBQUFBLE1BV0EsS0FBQSxHQUFRLEdBQUEsQ0FBQSxVQVhSLENBQUE7YUFhQSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQWIsQ0FBc0IsQ0FBQyxJQUFJLENBQUMsSUFBTCxDQUFVLFNBQVYsRUFBcUIsa0JBQXJCLENBQUQsQ0FBdEIsRUFkUztJQUFBLENBQVgsQ0FGQSxDQUFBO0FBQUEsSUFrQkEsUUFBQSxDQUFTLDRCQUFULEVBQXVDLFNBQUEsR0FBQTtBQUNyQyxNQUFBLEVBQUEsQ0FBRyxvRUFBSCxFQUF5RSxTQUFBLEdBQUE7QUFDdkUsWUFBQSxrQkFBQTtBQUFBLFFBQUEsUUFBQSxHQUFXLEtBQUssQ0FBQyxpQkFBTixDQUF3QixjQUF4QixDQUFYLENBQUE7QUFBQSxRQUNBLFFBQUEsR0FBVztVQUNUO0FBQUEsWUFDRSxLQUFBLEVBQU8sY0FBZSxDQUFBLENBQUEsQ0FEeEI7QUFBQSxZQUVFLEtBQUEsRUFBTyxjQUFlLENBQUEsQ0FBQSxDQUZ4QjtXQURTLEVBS1Q7QUFBQSxZQUNFLEtBQUEsRUFBTyxjQUFlLENBQUEsQ0FBQSxDQUR4QjtBQUFBLFlBRUUsS0FBQSxFQUFPLGNBQWUsQ0FBQSxDQUFBLENBRnhCO1dBTFM7U0FEWCxDQUFBO2VBV0EsTUFBQSxDQUFPLFFBQVAsQ0FBZ0IsQ0FBQyxPQUFqQixDQUF5QixRQUF6QixFQVp1RTtNQUFBLENBQXpFLENBQUEsQ0FBQTthQWNBLEVBQUEsQ0FBRyx1QkFBSCxFQUE0QixTQUFBLEdBQUE7QUFDMUIsWUFBQSwrQ0FBQTtBQUFBLFFBQUEsS0FBSyxDQUFDLGVBQU4sQ0FBc0IsZUFBQSxHQUFrQixPQUFPLENBQUMsU0FBUixDQUFBLENBQXhDLENBQUEsQ0FBQTtBQUFBLFFBRUEsT0FBQSxHQUFVLENBQUMsTUFBRCxDQUZWLENBQUE7QUFBQSxRQUdBLE9BQUEsR0FBVSxLQUFLLENBQUMsaUJBQU4sQ0FBd0IsT0FBeEIsQ0FIVixDQUFBO0FBQUEsUUFJQSxNQUFBLENBQU8sT0FBUCxDQUFlLENBQUMsWUFBaEIsQ0FBNkIsQ0FBN0IsQ0FKQSxDQUFBO0FBQUEsUUFNQSxZQUFBLEdBQWUsZUFBZSxDQUFDLGNBQWMsQ0FBQyxJQUFLLENBQUEsQ0FBQSxDQU5uRCxDQUFBO0FBQUEsUUFPQSxNQUFBLENBQU8sZUFBUCxDQUF1QixDQUFDLGdCQUF4QixDQUFBLENBUEEsQ0FBQTtlQVFBLE1BQUEsQ0FBTyxZQUFZLENBQUMsT0FBYixDQUFxQixTQUFyQixDQUFQLENBQXVDLENBQUMsR0FBRyxDQUFDLElBQTVDLENBQWlELENBQUEsQ0FBakQsRUFUMEI7TUFBQSxDQUE1QixFQWZxQztJQUFBLENBQXZDLENBbEJBLENBQUE7QUFBQSxJQTRDQSxRQUFBLENBQVMsd0JBQVQsRUFBbUMsU0FBQSxHQUFBO0FBQ2pDLE1BQUEsRUFBQSxDQUFHLDJEQUFILEVBQWdFLFNBQUEsR0FBQTtBQUM5RCxZQUFBLGtCQUFBO0FBQUEsUUFBQSxRQUFBLEdBQVcsYUFBYSxDQUFDLEtBQXpCLENBQUE7QUFBQSxRQUNBLFFBQUEsR0FBVyxLQUFLLENBQUMsWUFBTixDQUFtQixRQUFuQixDQURYLENBQUE7QUFBQSxRQUlBLE1BQUEsQ0FBTyxNQUFBLENBQUEsUUFBZSxDQUFDLElBQXZCLENBQTRCLENBQUMsSUFBN0IsQ0FBa0MsVUFBbEMsQ0FKQSxDQUFBO2VBS0EsTUFBQSxDQUFPLE1BQUEsQ0FBQSxRQUFlLENBQUMsSUFBdkIsQ0FBNEIsQ0FBQyxJQUE3QixDQUFrQyxVQUFsQyxFQU44RDtNQUFBLENBQWhFLENBQUEsQ0FBQTtBQUFBLE1BUUEsRUFBQSxDQUFHLDZDQUFILEVBQWtELFNBQUEsR0FBQTtBQUNoRCxZQUFBLGlEQUFBO0FBQUEsUUFBQSxLQUFLLENBQUMsZUFBTixDQUFzQixlQUFBLEdBQWtCLE9BQU8sQ0FBQyxTQUFSLENBQUEsQ0FBeEMsQ0FBQSxDQUFBO0FBQUEsUUFFQSxRQUFBLEdBQVcsb0JBRlgsQ0FBQTtBQUFBLFFBR0EsUUFBQSxHQUFXLEtBQUssQ0FBQyxZQUFOLENBQW1CLFFBQW5CLENBSFgsQ0FBQTtBQUFBLFFBSUEsTUFBQSxDQUFPLFFBQVAsQ0FBZ0IsQ0FBQyxJQUFqQixDQUFzQixLQUF0QixDQUpBLENBQUE7QUFBQSxRQU1BLFlBQUEsR0FBZSxlQUFlLENBQUMsY0FBYyxDQUFDLElBQUssQ0FBQSxDQUFBLENBTm5ELENBQUE7QUFBQSxRQU9BLE1BQUEsQ0FBTyxlQUFQLENBQXVCLENBQUMsZ0JBQXhCLENBQUEsQ0FQQSxDQUFBO2VBUUEsTUFBQSxDQUFPLFlBQVksQ0FBQyxPQUFiLENBQXFCLFNBQXJCLENBQVAsQ0FBdUMsQ0FBQyxHQUFHLENBQUMsSUFBNUMsQ0FBaUQsQ0FBQSxDQUFqRCxFQVRnRDtNQUFBLENBQWxELENBUkEsQ0FBQTthQW1CQSxFQUFBLENBQUcscUJBQUgsRUFBMEIsU0FBQSxHQUFBO0FBQ3hCLFlBQUEsUUFBQTtBQUFBLFFBQUEsUUFBQSxHQUFXLEtBQUssQ0FBQyxZQUFOLENBQUEsQ0FBWCxDQUFBO2VBQ0EsTUFBQSxDQUFPLFFBQVAsQ0FBZ0IsQ0FBQyxJQUFqQixDQUFzQixLQUF0QixFQUZ3QjtNQUFBLENBQTFCLEVBcEJpQztJQUFBLENBQW5DLENBNUNBLENBQUE7QUFBQSxJQW9FQSxRQUFBLENBQVMsK0JBQVQsRUFBMEMsU0FBQSxHQUFBO0FBQ3hDLFVBQUEsbUJBQUE7QUFBQSxNQUFBLFFBQWlCLEVBQWpCLEVBQUMsY0FBQSxLQUFELEVBQVEsY0FBQSxLQUFSLENBQUE7QUFBQSxNQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxRQUFBLEtBQUEsR0FBUSx5QkFBUixDQUFBO2VBQ0EsS0FBQSxHQUNFO0FBQUEsVUFBQSxJQUFBLEVBQU0sRUFBQSxHQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFiLENBQUEsQ0FBd0IsQ0FBQSxDQUFBLENBQXpCLENBQUYsR0FBOEIsV0FBcEM7QUFBQSxVQUNBLFNBQUEsRUFBVyxzQkFEWDtBQUFBLFVBRUEsS0FBQSxFQUFPLENBQ0wsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURLLEVBRUwsQ0FBQyxDQUFELEVBQUksRUFBSixDQUZLLENBRlA7VUFITztNQUFBLENBQVgsQ0FGQSxDQUFBO0FBQUEsTUFZQSxFQUFBLENBQUcsMkVBQUgsRUFBZ0YsU0FBQSxHQUFBO0FBQzlFLFlBQUEsTUFBQTtBQUFBLFFBQUEsTUFBQSxHQUFTLEtBQUssQ0FBQyxlQUFOLENBQXNCLEtBQXRCLENBQVQsQ0FBQTtlQUNBLE1BQUEsQ0FBTyxNQUFNLENBQUMsU0FBZCxDQUF3QixDQUFDLE9BQXpCLENBQWlDLG9CQUFqQyxFQUY4RTtNQUFBLENBQWhGLENBWkEsQ0FBQTtBQUFBLE1BZ0JBLEVBQUEsQ0FBRywwQkFBSCxFQUErQixTQUFBLEdBQUE7QUFDN0IsWUFBQSxNQUFBO0FBQUEsUUFBQSxNQUFBLEdBQVMsS0FBSyxDQUFDLGVBQU4sQ0FBc0IsS0FBdEIsRUFBNkIsS0FBN0IsQ0FBVCxDQUFBO2VBQ0EsTUFBQSxDQUFPLE1BQU0sQ0FBQyxTQUFkLENBQXdCLENBQUMsT0FBekIsQ0FBaUMsY0FBakMsRUFGNkI7TUFBQSxDQUEvQixDQWhCQSxDQUFBO2FBb0JBLEVBQUEsQ0FBRyw0Q0FBSCxFQUFpRCxTQUFBLEdBQUE7QUFDL0MsWUFBQSxNQUFBO0FBQUEsUUFBQSxNQUFBLEdBQVMsS0FBSyxDQUFDLGVBQU4sQ0FBc0IsS0FBdEIsRUFBNkIsS0FBN0IsQ0FBVCxDQUFBO0FBQUEsUUFDQSxNQUFBLENBQU8sTUFBTSxDQUFDLFlBQWQsQ0FBMkIsQ0FBQyxPQUE1QixDQUFvQyxVQUFwQyxDQURBLENBQUE7ZUFFQSxNQUFBLENBQU8sTUFBTSxDQUFDLFdBQWQsQ0FBMEIsQ0FBQyxPQUEzQixDQUFtQyxVQUFuQyxFQUgrQztNQUFBLENBQWpELEVBckJ3QztJQUFBLENBQTFDLENBcEVBLENBQUE7QUFBQSxJQThGQSxRQUFBLENBQVMsMkJBQVQsRUFBc0MsU0FBQSxHQUFBO0FBQ3BDLE1BQUEsRUFBQSxDQUFHLGdGQUFILEVBQXFGLFNBQUEsR0FBQTtBQUNuRixRQUFBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2lCQUNkLEtBQUssQ0FBQyxjQUFOLENBQXFCLGFBQXJCLEVBRGM7UUFBQSxDQUFoQixDQUFBLENBQUE7ZUFHQSxJQUFBLENBQUssU0FBQSxHQUFBO0FBQ0gsVUFBQSxNQUFBLENBQU8sS0FBSyxDQUFDLEtBQWIsQ0FBbUIsQ0FBQyxZQUFwQixDQUFpQyxDQUFqQyxDQUFBLENBQUE7QUFBQSxVQUNBLE1BQUEsQ0FBTyxLQUFLLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLFNBQXRCLENBQWdDLENBQUMsSUFBakMsQ0FBc0MsY0FBdEMsQ0FEQSxDQUFBO0FBQUEsVUFFQSxNQUFBLENBQU8sS0FBSyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxTQUF0QixDQUFnQyxDQUFDLElBQWpDLENBQXNDLHdCQUF0QyxDQUZBLENBQUE7aUJBR0EsTUFBQSxDQUFPLEtBQUssQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsU0FBdEIsQ0FBZ0MsQ0FBQyxJQUFqQyxDQUFzQyx5QkFBdEMsRUFKRztRQUFBLENBQUwsRUFKbUY7TUFBQSxDQUFyRixDQUFBLENBQUE7QUFBQSxNQVVBLEVBQUEsQ0FBRyw2QkFBSCxFQUFrQyxTQUFBLEdBQUE7QUFDaEMsWUFBQSxNQUFBO0FBQUEsUUFBQSxNQUFBLEdBQ0U7QUFBQSxVQUFBLEtBQUEsRUFBTyxVQUFQO0FBQUEsVUFDQSxLQUFBLEVBQU8saUJBRFA7U0FERixDQUFBO0FBQUEsUUFJQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtpQkFDZCxLQUFLLENBQUMsY0FBTixDQUFxQixNQUFyQixFQURjO1FBQUEsQ0FBaEIsQ0FKQSxDQUFBO2VBTUEsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILFVBQUEsTUFBQSxDQUFPLEtBQUssQ0FBQyxLQUFiLENBQW1CLENBQUMsWUFBcEIsQ0FBaUMsQ0FBakMsQ0FBQSxDQUFBO2lCQUNBLE1BQUEsQ0FBTyxLQUFLLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLFNBQXRCLENBQWdDLENBQUMsSUFBakMsQ0FBc0MsV0FBdEMsRUFGRztRQUFBLENBQUwsRUFQZ0M7TUFBQSxDQUFsQyxDQVZBLENBQUE7QUFBQSxNQXFCQSxFQUFBLENBQUcseUNBQUgsRUFBOEMsU0FBQSxHQUFBO0FBQzVDLFlBQUEsTUFBQTtBQUFBLFFBQUEsTUFBQSxHQUNFO0FBQUEsVUFBQSxLQUFBLEVBQU8sT0FBUDtBQUFBLFVBQ0EsS0FBQSxFQUFPLHVDQURQO1NBREYsQ0FBQTtBQUFBLFFBSUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7aUJBQ2QsS0FBSyxDQUFDLGNBQU4sQ0FBcUIsTUFBckIsRUFEYztRQUFBLENBQWhCLENBSkEsQ0FBQTtlQU1BLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFDSCxVQUFBLE1BQUEsQ0FBTyxLQUFLLENBQUMsS0FBYixDQUFtQixDQUFDLFlBQXBCLENBQWlDLENBQWpDLENBQUEsQ0FBQTtBQUFBLFVBQ0EsTUFBQSxDQUFPLEtBQUssQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsU0FBdEIsQ0FBZ0MsQ0FBQyxJQUFqQyxDQUFzQyx3QkFBdEMsQ0FEQSxDQUFBO2lCQUVBLE1BQUEsQ0FBTyxLQUFLLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLFNBQXRCLENBQWdDLENBQUMsSUFBakMsQ0FBc0MseUJBQXRDLEVBSEc7UUFBQSxDQUFMLEVBUDRDO01BQUEsQ0FBOUMsQ0FyQkEsQ0FBQTtBQUFBLE1BaUNBLEVBQUEsQ0FBRywyQ0FBSCxFQUFnRCxTQUFBLEdBQUE7QUFDOUMsWUFBQSxNQUFBO0FBQUEsUUFBQSxNQUFBLEdBQ0U7QUFBQSxVQUFBLEtBQUEsRUFBTyxjQUFQO0FBQUEsVUFDQSxLQUFBLEVBQU8sMkJBRFA7U0FERixDQUFBO0FBQUEsUUFJQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtpQkFDZCxLQUFLLENBQUMsY0FBTixDQUFxQixNQUFyQixFQURjO1FBQUEsQ0FBaEIsQ0FKQSxDQUFBO2VBTUEsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILFVBQUEsTUFBQSxDQUFPLEtBQUssQ0FBQyxLQUFiLENBQW1CLENBQUMsWUFBcEIsQ0FBaUMsQ0FBakMsQ0FBQSxDQUFBO2lCQUNBLE1BQUEsQ0FBTyxLQUFLLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLFNBQXRCLENBQWdDLENBQUMsSUFBakMsQ0FBc0MsdUJBQXRDLEVBRkc7UUFBQSxDQUFMLEVBUDhDO01BQUEsQ0FBaEQsQ0FqQ0EsQ0FBQTtBQUFBLE1BNENBLEVBQUEsQ0FBRyxtREFBSCxFQUF3RCxTQUFBLEdBQUE7QUFDdEQsWUFBQSxNQUFBO0FBQUEsUUFBQSxNQUFBLEdBQ0U7QUFBQSxVQUFBLEtBQUEsRUFBTyxXQUFQO0FBQUEsVUFDQSxLQUFBLEVBQU8sdUJBRFA7U0FERixDQUFBO0FBQUEsUUFJQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtpQkFDZCxLQUFLLENBQUMsY0FBTixDQUFxQixNQUFyQixFQURjO1FBQUEsQ0FBaEIsQ0FKQSxDQUFBO2VBTUEsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILFVBQUEsTUFBQSxDQUFPLEtBQUssQ0FBQyxLQUFiLENBQW1CLENBQUMsWUFBcEIsQ0FBaUMsQ0FBakMsQ0FBQSxDQUFBO2lCQUNBLE1BQUEsQ0FBTyxLQUFLLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLFNBQXRCLENBQWdDLENBQUMsSUFBakMsQ0FBc0MsNENBQXRDLEVBRkc7UUFBQSxDQUFMLEVBUHNEO01BQUEsQ0FBeEQsQ0E1Q0EsQ0FBQTtBQUFBLE1BdURBLEVBQUEsQ0FBRyx5REFBSCxFQUE4RCxTQUFBLEdBQUE7QUFDNUQsWUFBQSxNQUFBO0FBQUEsUUFBQSxNQUFBLEdBQ0U7QUFBQSxVQUFBLEtBQUEsRUFBTyxXQUFQO0FBQUEsVUFDQSxLQUFBLEVBQU8sMkJBRFA7U0FERixDQUFBO0FBQUEsUUFJQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtpQkFDZCxLQUFLLENBQUMsY0FBTixDQUFxQixNQUFyQixFQURjO1FBQUEsQ0FBaEIsQ0FKQSxDQUFBO2VBTUEsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILFVBQUEsTUFBQSxDQUFPLEtBQUssQ0FBQyxLQUFiLENBQW1CLENBQUMsWUFBcEIsQ0FBaUMsQ0FBakMsQ0FBQSxDQUFBO2lCQUNBLE1BQUEsQ0FBTyxLQUFLLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLFNBQXRCLENBQWdDLENBQUMsSUFBakMsQ0FBc0MsNENBQXRDLEVBRkc7UUFBQSxDQUFMLEVBUDREO01BQUEsQ0FBOUQsQ0F2REEsQ0FBQTtBQUFBLE1Ba0VBLEVBQUEsQ0FBRyxpRUFBSCxFQUFzRSxTQUFBLEdBQUE7QUFDcEUsWUFBQSxNQUFBO0FBQUEsUUFBQSxNQUFBLEdBQ0U7QUFBQSxVQUFBLEtBQUEsRUFBTyxpQkFBUDtBQUFBLFVBQ0EsS0FBQSxFQUFPLGlCQURQO1NBREYsQ0FBQTtBQUFBLFFBSUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7aUJBQ2QsS0FBSyxDQUFDLGNBQU4sQ0FBcUIsTUFBckIsRUFEYztRQUFBLENBQWhCLENBSkEsQ0FBQTtlQU1BLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFDSCxjQUFBLHFCQUFBO0FBQUEsVUFBQSxTQUFBLEdBQVksZ0VBQVosQ0FBQTtBQUFBLFVBQ0EsU0FBQSxJQUFhLDREQURiLENBQUE7QUFBQSxVQUdBLFVBQUEsR0FBYSwrREFIYixDQUFBO0FBQUEsVUFJQSxVQUFBLElBQWMsNkRBSmQsQ0FBQTtBQUFBLFVBTUEsTUFBQSxDQUFPLEtBQUssQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsU0FBdEIsQ0FBZ0MsQ0FBQyxZQUFqQyxDQUE4QyxHQUE5QyxDQU5BLENBQUE7QUFBQSxVQU9BLE1BQUEsQ0FBTyxLQUFLLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLFNBQXRCLENBQWdDLENBQUMsSUFBakMsQ0FBc0MsU0FBdEMsQ0FQQSxDQUFBO0FBQUEsVUFTQSxNQUFBLENBQU8sS0FBSyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxTQUF0QixDQUFnQyxDQUFDLFlBQWpDLENBQThDLEdBQTlDLENBVEEsQ0FBQTtpQkFVQSxNQUFBLENBQU8sS0FBSyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxTQUF0QixDQUFnQyxDQUFDLElBQWpDLENBQXNDLFVBQXRDLEVBWEc7UUFBQSxDQUFMLEVBUG9FO01BQUEsQ0FBdEUsQ0FsRUEsQ0FBQTthQXNGQSxFQUFBLENBQUcsMkNBQUgsRUFBZ0QsU0FBQSxHQUFBO0FBQzlDLFFBQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFiLENBQXNCLENBQUMsSUFBSSxDQUFDLElBQUwsQ0FBVSxTQUFWLEVBQXFCLGtCQUFyQixDQUFELENBQXRCLENBQUEsQ0FBQTtBQUFBLFFBRUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7aUJBQ2QsS0FBSyxDQUFDLGNBQU4sQ0FBcUIsYUFBckIsRUFEYztRQUFBLENBQWhCLENBRkEsQ0FBQTtlQUlBLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFDSCxVQUFBLE1BQUEsQ0FBTyxLQUFLLENBQUMsS0FBYixDQUFtQixDQUFDLFlBQXBCLENBQWlDLENBQWpDLENBQUEsQ0FBQTtBQUFBLFVBQ0EsTUFBQSxDQUFPLEtBQUssQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsU0FBdEIsQ0FBZ0MsQ0FBQyxJQUFqQyxDQUFzQyxpQkFBdEMsQ0FEQSxDQUFBO0FBQUEsVUFFQSxNQUFBLENBQU8sS0FBSyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxTQUF0QixDQUFnQyxDQUFDLElBQWpDLENBQXNDLGNBQXRDLENBRkEsQ0FBQTtBQUFBLFVBR0EsTUFBQSxDQUFPLEtBQUssQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsU0FBdEIsQ0FBZ0MsQ0FBQyxJQUFqQyxDQUFzQyxvQkFBdEMsQ0FIQSxDQUFBO0FBQUEsVUFJQSxNQUFBLENBQU8sS0FBSyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxTQUF0QixDQUFnQyxDQUFDLElBQWpDLENBQXNDLGlCQUF0QyxDQUpBLENBQUE7QUFBQSxVQUtBLE1BQUEsQ0FBTyxLQUFLLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLFNBQXRCLENBQWdDLENBQUMsSUFBakMsQ0FBc0MsYUFBdEMsQ0FMQSxDQUFBO2lCQU1BLE1BQUEsQ0FBTyxLQUFLLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLFNBQXRCLENBQWdDLENBQUMsSUFBakMsQ0FBc0MsYUFBdEMsRUFQRztRQUFBLENBQUwsRUFMOEM7TUFBQSxDQUFoRCxFQXZGb0M7SUFBQSxDQUF0QyxDQTlGQSxDQUFBO0FBQUEsSUFtTUEsUUFBQSxDQUFTLG1CQUFULEVBQThCLFNBQUEsR0FBQTtBQUM1QixNQUFBLEVBQUEsQ0FBRywyQkFBSCxFQUFnQyxTQUFBLEdBQUE7QUFDOUIsUUFBQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsNEJBQWhCLEVBQThDLEVBQTlDLENBQUEsQ0FBQTtBQUFBLFFBQ0EsZUFBQSxDQUFnQixTQUFBLEdBQUE7aUJBQ2QsS0FBSyxDQUFDLGNBQU4sQ0FBcUIsYUFBckIsRUFEYztRQUFBLENBQWhCLENBREEsQ0FBQTtlQUdBLElBQUEsQ0FBSyxTQUFBLEdBQUE7aUJBQ0gsTUFBQSxDQUFPLEtBQUssQ0FBQyxLQUFiLENBQW1CLENBQUMsWUFBcEIsQ0FBaUMsQ0FBakMsRUFERztRQUFBLENBQUwsRUFKOEI7TUFBQSxDQUFoQyxDQUFBLENBQUE7QUFBQSxNQU9BLEVBQUEsQ0FBRyxrQkFBSCxFQUF1QixTQUFBLEdBQUE7QUFDckIsWUFBQSxlQUFBO0FBQUEsUUFBQSxLQUFLLENBQUMsZUFBTixDQUFzQixlQUFBLEdBQWtCLE9BQU8sQ0FBQyxTQUFSLENBQUEsQ0FBeEMsQ0FBQSxDQUFBO0FBQUEsUUFFQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsNEJBQWhCLEVBQThDLEtBQTlDLENBRkEsQ0FBQTtBQUFBLFFBR0EsZUFBQSxDQUFnQixTQUFBLEdBQUE7aUJBQ2QsS0FBSyxDQUFDLGNBQU4sQ0FBcUIsYUFBckIsRUFEYztRQUFBLENBQWhCLENBSEEsQ0FBQTtlQUtBLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFDSCxjQUFBLFlBQUE7QUFBQSxVQUFBLE1BQUEsQ0FBTyxLQUFLLENBQUMsS0FBYixDQUFtQixDQUFDLFlBQXBCLENBQWlDLENBQWpDLENBQUEsQ0FBQTtBQUFBLFVBRUEsWUFBQSxHQUFlLGVBQWUsQ0FBQyxjQUFjLENBQUMsSUFBSyxDQUFBLENBQUEsQ0FGbkQsQ0FBQTtBQUFBLFVBR0EsTUFBQSxDQUFPLGVBQVAsQ0FBdUIsQ0FBQyxnQkFBeEIsQ0FBQSxDQUhBLENBQUE7aUJBSUEsTUFBQSxDQUFPLFlBQVksQ0FBQyxPQUFiLENBQXFCLGtCQUFyQixDQUFQLENBQWdELENBQUMsR0FBRyxDQUFDLElBQXJELENBQTBELENBQUEsQ0FBMUQsRUFMRztRQUFBLENBQUwsRUFOcUI7TUFBQSxDQUF2QixDQVBBLENBQUE7QUFBQSxNQW9CQSxFQUFBLENBQUcsd0JBQUgsRUFBNkIsU0FBQSxHQUFBO0FBQzNCLFFBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDRCQUFoQixFQUE4QyxDQUFDLFdBQUQsQ0FBOUMsQ0FBQSxDQUFBO0FBQUEsUUFDQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtpQkFDZCxLQUFLLENBQUMsY0FBTixDQUFxQixhQUFyQixFQURjO1FBQUEsQ0FBaEIsQ0FEQSxDQUFBO2VBR0EsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILFVBQUEsTUFBQSxDQUFPLEtBQUssQ0FBQyxLQUFiLENBQW1CLENBQUMsWUFBcEIsQ0FBaUMsQ0FBakMsQ0FBQSxDQUFBO2lCQUNBLE1BQUEsQ0FBTyxLQUFLLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLFNBQXRCLENBQWdDLENBQUMsSUFBakMsQ0FBc0MsY0FBdEMsRUFGRztRQUFBLENBQUwsRUFKMkI7TUFBQSxDQUE3QixDQXBCQSxDQUFBO0FBQUEsTUE0QkEsRUFBQSxDQUFHLDRDQUFILEVBQWlELFNBQUEsR0FBQTtBQUMvQyxRQUFBLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBYixDQUFzQixDQUFDLElBQUksQ0FBQyxJQUFMLENBQVUsU0FBVixFQUFxQixVQUFyQixDQUFELENBQXRCLENBQUEsQ0FBQTtBQUFBLFFBQ0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDRCQUFoQixFQUE4QyxDQUFDLFNBQUQsRUFBWSxNQUFaLENBQTlDLENBREEsQ0FBQTtBQUFBLFFBR0EsZUFBQSxDQUFnQixTQUFBLEdBQUE7aUJBQ2QsS0FBSyxDQUFDLGNBQU4sQ0FBcUIsYUFBckIsRUFEYztRQUFBLENBQWhCLENBSEEsQ0FBQTtlQUtBLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFDSCxVQUFBLE1BQUEsQ0FBTyxLQUFLLENBQUMsS0FBYixDQUFtQixDQUFDLFlBQXBCLENBQWlDLENBQWpDLENBQUEsQ0FBQTtpQkFDQSxNQUFBLENBQU8sS0FBSyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxTQUF0QixDQUFnQyxDQUFDLElBQWpDLENBQXNDLGlCQUF0QyxFQUZHO1FBQUEsQ0FBTCxFQU4rQztNQUFBLENBQWpELENBNUJBLENBQUE7QUFBQSxNQXNDQSxFQUFBLENBQUcsdUNBQUgsRUFBNEMsU0FBQSxHQUFBO0FBQzFDLFFBQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFiLENBQXNCLENBQUMsSUFBSSxDQUFDLElBQUwsQ0FBVSxTQUFWLEVBQXFCLFVBQXJCLENBQUQsQ0FBdEIsQ0FBQSxDQUFBO0FBQUEsUUFDQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsNEJBQWhCLEVBQThDLENBQUMsY0FBRCxFQUFpQixlQUFqQixFQUFrQyxNQUFsQyxDQUE5QyxDQURBLENBQUE7QUFBQSxRQUdBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2lCQUNkLEtBQUssQ0FBQyxjQUFOLENBQXFCLGFBQXJCLEVBRGM7UUFBQSxDQUFoQixDQUhBLENBQUE7ZUFLQSxJQUFBLENBQUssU0FBQSxHQUFBO0FBQ0gsVUFBQSxNQUFBLENBQU8sS0FBSyxDQUFDLEtBQWIsQ0FBbUIsQ0FBQyxZQUFwQixDQUFpQyxDQUFqQyxDQUFBLENBQUE7aUJBQ0EsTUFBQSxDQUFPLEtBQUssQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsU0FBdEIsQ0FBZ0MsQ0FBQyxJQUFqQyxDQUFzQyxjQUF0QyxFQUZHO1FBQUEsQ0FBTCxFQU4wQztNQUFBLENBQTVDLENBdENBLENBQUE7YUFnREEsRUFBQSxDQUFHLGdDQUFILEVBQXFDLFNBQUEsR0FBQTtBQUNuQyxRQUFBLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBYixDQUFzQixDQUFDLElBQUksQ0FBQyxJQUFMLENBQVUsU0FBVixFQUFxQixVQUFyQixDQUFELENBQXRCLENBQUEsQ0FBQTtBQUFBLFFBQ0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDRCQUFoQixFQUE4QyxDQUFDLHVCQUFELEVBQTBCLE9BQTFCLENBQTlDLENBREEsQ0FBQTtBQUFBLFFBR0EsZUFBQSxDQUFnQixTQUFBLEdBQUE7aUJBQ2QsS0FBSyxDQUFDLGNBQU4sQ0FBcUIsYUFBckIsRUFEYztRQUFBLENBQWhCLENBSEEsQ0FBQTtlQUtBLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFDSCxVQUFBLE1BQUEsQ0FBTyxLQUFLLENBQUMsS0FBYixDQUFtQixDQUFDLFlBQXBCLENBQWlDLENBQWpDLENBQUEsQ0FBQTtpQkFDQSxNQUFBLENBQU8sS0FBSyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxTQUF0QixDQUFnQyxDQUFDLElBQWpDLENBQXNDLGlCQUF0QyxFQUZHO1FBQUEsQ0FBTCxFQU5tQztNQUFBLENBQXJDLEVBakQ0QjtJQUFBLENBQTlCLENBbk1BLENBQUE7QUFBQSxJQThQQSxRQUFBLENBQVMsK0JBQVQsRUFBMEMsU0FBQSxHQUFBO0FBQ3hDLFVBQUEsTUFBQTtBQUFBLE1BQUEsTUFBQSxHQUFTLElBQVQsQ0FBQTtBQUFBLE1BRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFFBQUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7aUJBQ2QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLFVBQXBCLEVBRGM7UUFBQSxDQUFoQixDQUFBLENBQUE7ZUFFQSxJQUFBLENBQUssU0FBQSxHQUFBO2lCQUNILE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsRUFETjtRQUFBLENBQUwsRUFIUztNQUFBLENBQVgsQ0FGQSxDQUFBO0FBQUEsTUFRQSxFQUFBLENBQUcsdUVBQUgsRUFBNEUsU0FBQSxHQUFBO0FBQzFFLFFBQUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7aUJBQ2QsS0FBSyxDQUFDLGtCQUFOLENBQXlCLGFBQXpCLEVBRGM7UUFBQSxDQUFoQixDQUFBLENBQUE7ZUFHQSxJQUFBLENBQUssU0FBQSxHQUFBO0FBQ0gsVUFBQSxNQUFBLENBQU8sS0FBSyxDQUFDLEtBQWIsQ0FBbUIsQ0FBQyxZQUFwQixDQUFpQyxDQUFqQyxDQUFBLENBQUE7QUFBQSxVQUNBLE1BQUEsQ0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQW5CLENBQTBCLENBQUMsSUFBM0IsQ0FBZ0MsQ0FBaEMsQ0FEQSxDQUFBO2lCQUVBLE1BQUEsQ0FBTyxLQUFLLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLFNBQXRCLENBQWdDLENBQUMsSUFBakMsQ0FBc0MsY0FBdEMsRUFIRztRQUFBLENBQUwsRUFKMEU7TUFBQSxDQUE1RSxDQVJBLENBQUE7QUFBQSxNQWlCQSxFQUFBLENBQUcsdUNBQUgsRUFBNEMsU0FBQSxHQUFBO0FBQzFDLFFBQUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7aUJBQ2QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLHVCQUFwQixFQURjO1FBQUEsQ0FBaEIsQ0FBQSxDQUFBO2VBR0EsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILFVBQUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7bUJBQ2QsS0FBSyxDQUFDLGtCQUFOLENBQXlCLGFBQXpCLEVBRGM7VUFBQSxDQUFoQixDQUFBLENBQUE7aUJBR0EsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILFlBQUEsTUFBQSxDQUFPLEtBQUssQ0FBQyxLQUFiLENBQW1CLENBQUMsWUFBcEIsQ0FBaUMsQ0FBakMsQ0FBQSxDQUFBO0FBQUEsWUFDQSxNQUFBLENBQU8sS0FBSyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxTQUF0QixDQUFnQyxDQUFDLElBQWpDLENBQXNDLGNBQXRDLENBREEsQ0FBQTtBQUFBLFlBRUEsTUFBQSxDQUFPLEtBQUssQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsU0FBdEIsQ0FBZ0MsQ0FBQyxJQUFqQyxDQUFzQyxpQkFBdEMsQ0FGQSxDQUFBO21CQUdBLE1BQUEsQ0FBTyxLQUFLLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLFNBQXRCLENBQWdDLENBQUMsSUFBakMsQ0FBc0MsYUFBdEMsRUFKRztVQUFBLENBQUwsRUFKRztRQUFBLENBQUwsRUFKMEM7TUFBQSxDQUE1QyxDQWpCQSxDQUFBO0FBQUEsTUErQkEsRUFBQSxDQUFHLDJCQUFILEVBQWdDLFNBQUEsR0FBQTtBQUM5QixRQUFBLE1BQU0sQ0FBQyxPQUFQLENBQWUsZ0JBQWYsQ0FBQSxDQUFBO0FBQUEsUUFFQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtpQkFDZCxLQUFLLENBQUMsa0JBQU4sQ0FBeUIsYUFBekIsRUFEYztRQUFBLENBQWhCLENBRkEsQ0FBQTtlQUlBLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFDSCxVQUFBLE1BQUEsQ0FBTyxLQUFLLENBQUMsS0FBYixDQUFtQixDQUFDLFlBQXBCLENBQWlDLENBQWpDLENBQUEsQ0FBQTtBQUFBLFVBQ0EsTUFBQSxDQUFPLEtBQUssQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBdEIsQ0FBNEIsQ0FBQyxJQUE3QixDQUFrQyxPQUFsQyxDQURBLENBQUE7aUJBRUEsTUFBQSxDQUFPLEtBQUssQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsU0FBdEIsQ0FBZ0MsQ0FBQyxJQUFqQyxDQUFzQyxVQUF0QyxFQUhHO1FBQUEsQ0FBTCxFQUw4QjtNQUFBLENBQWhDLENBL0JBLENBQUE7QUFBQSxNQXlDQSxFQUFBLENBQUcsZ0VBQUgsRUFBcUUsU0FBQSxHQUFBO0FBQ25FLFFBQUEsTUFBTSxDQUFDLE9BQVAsQ0FBZSw2QkFBZixDQUFBLENBQUE7QUFBQSxRQUtBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2lCQUNkLEtBQUssQ0FBQyxrQkFBTixDQUF5QixhQUF6QixFQURjO1FBQUEsQ0FBaEIsQ0FMQSxDQUFBO2VBT0EsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILFVBQUEsTUFBQSxDQUFPLEtBQUssQ0FBQyxLQUFiLENBQW1CLENBQUMsWUFBcEIsQ0FBaUMsQ0FBakMsQ0FBQSxDQUFBO0FBQUEsVUFDQSxNQUFBLENBQU8sS0FBSyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUF0QixDQUE0QixDQUFDLElBQTdCLENBQWtDLE9BQWxDLENBREEsQ0FBQTtBQUFBLFVBRUEsTUFBQSxDQUFPLEtBQUssQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsU0FBdEIsQ0FBZ0MsQ0FBQyxJQUFqQyxDQUFzQyxPQUF0QyxDQUZBLENBQUE7aUJBR0EsTUFBQSxDQUFPLEtBQUssQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsU0FBdEIsQ0FBZ0MsQ0FBQyxJQUFqQyxDQUFzQyxPQUF0QyxFQUpHO1FBQUEsQ0FBTCxFQVJtRTtNQUFBLENBQXJFLENBekNBLENBQUE7QUFBQSxNQXVEQSxFQUFBLENBQUcsMkRBQUgsRUFBZ0UsU0FBQSxHQUFBO0FBQzlELFFBQUEsTUFBTSxDQUFDLE9BQVAsQ0FBZSw0Q0FBZixDQUFBLENBQUE7QUFBQSxRQUtBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2lCQUNkLEtBQUssQ0FBQyxrQkFBTixDQUF5QixhQUF6QixFQURjO1FBQUEsQ0FBaEIsQ0FMQSxDQUFBO2VBT0EsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILFVBQUEsTUFBQSxDQUFPLEtBQUssQ0FBQyxLQUFiLENBQW1CLENBQUMsWUFBcEIsQ0FBaUMsQ0FBakMsQ0FBQSxDQUFBO0FBQUEsVUFDQSxNQUFBLENBQU8sS0FBSyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxTQUF0QixDQUFnQyxDQUFDLElBQWpDLENBQXNDLE9BQXRDLENBREEsQ0FBQTtpQkFFQSxNQUFBLENBQU8sS0FBSyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxTQUF0QixDQUFnQyxDQUFDLElBQWpDLENBQXNDLEtBQXRDLEVBSEc7UUFBQSxDQUFMLEVBUjhEO01BQUEsQ0FBaEUsQ0F2REEsQ0FBQTtBQUFBLE1Bb0VBLEVBQUEsQ0FBRyxxQkFBSCxFQUEwQixTQUFBLEdBQUE7QUFDeEIsUUFBQSxNQUFNLENBQUMsT0FBUCxDQUFlLCtCQUFmLENBQUEsQ0FBQTtBQUFBLFFBS0EsZUFBQSxDQUFnQixTQUFBLEdBQUE7aUJBQ2QsS0FBSyxDQUFDLGtCQUFOLENBQXlCLGFBQXpCLEVBRGM7UUFBQSxDQUFoQixDQUxBLENBQUE7ZUFPQSxJQUFBLENBQUssU0FBQSxHQUFBO0FBQ0gsVUFBQSxNQUFBLENBQU8sS0FBSyxDQUFDLEtBQWIsQ0FBbUIsQ0FBQyxZQUFwQixDQUFpQyxDQUFqQyxDQUFBLENBQUE7QUFBQSxVQUNBLE1BQUEsQ0FBTyxLQUFLLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLFNBQXRCLENBQWdDLENBQUMsSUFBakMsQ0FBc0MsWUFBdEMsQ0FEQSxDQUFBO2lCQUVBLE1BQUEsQ0FBTyxLQUFLLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLFNBQXRCLENBQWdDLENBQUMsSUFBakMsQ0FBc0MsWUFBdEMsRUFIRztRQUFBLENBQUwsRUFSd0I7TUFBQSxDQUExQixDQXBFQSxDQUFBO0FBQUEsTUFpRkEsRUFBQSxDQUFHLDJCQUFILEVBQWdDLFNBQUEsR0FBQTtBQUM5QixRQUFBLE1BQU0sQ0FBQyxPQUFQLENBQWUsK0JBQWYsQ0FBQSxDQUFBO0FBQUEsUUFLQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtpQkFDZCxLQUFLLENBQUMsa0JBQU4sQ0FBeUIsYUFBekIsRUFEYztRQUFBLENBQWhCLENBTEEsQ0FBQTtlQU9BLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFDSCxVQUFBLE1BQUEsQ0FBTyxLQUFLLENBQUMsS0FBYixDQUFtQixDQUFDLFlBQXBCLENBQWlDLENBQWpDLENBQUEsQ0FBQTtBQUFBLFVBQ0EsTUFBQSxDQUFPLEtBQUssQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsU0FBdEIsQ0FBZ0MsQ0FBQyxJQUFqQyxDQUFzQyxZQUF0QyxDQURBLENBQUE7aUJBRUEsTUFBQSxDQUFPLEtBQUssQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsU0FBdEIsQ0FBZ0MsQ0FBQyxJQUFqQyxDQUFzQyxZQUF0QyxFQUhHO1FBQUEsQ0FBTCxFQVI4QjtNQUFBLENBQWhDLENBakZBLENBQUE7QUFBQSxNQThGQSxFQUFBLENBQUcsK0JBQUgsRUFBb0MsU0FBQSxHQUFBO0FBQ2xDLFFBQUEsTUFBTSxDQUFDLE9BQVAsQ0FBZSxnRUFBZixDQUFBLENBQUE7QUFBQSxRQU1BLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2lCQUNkLEtBQUssQ0FBQyxrQkFBTixDQUF5QixhQUF6QixFQURjO1FBQUEsQ0FBaEIsQ0FOQSxDQUFBO2VBUUEsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILFVBQUEsTUFBQSxDQUFPLEtBQUssQ0FBQyxLQUFiLENBQW1CLENBQUMsWUFBcEIsQ0FBaUMsQ0FBakMsQ0FBQSxDQUFBO0FBQUEsVUFDQSxNQUFBLENBQU8sS0FBSyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxTQUF0QixDQUFnQyxDQUFDLElBQWpDLENBQXNDLE1BQXRDLENBREEsQ0FBQTtBQUFBLFVBRUEsTUFBQSxDQUFPLEtBQUssQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsU0FBdEIsQ0FBZ0MsQ0FBQyxJQUFqQyxDQUFzQyxNQUF0QyxDQUZBLENBQUE7aUJBR0EsTUFBQSxDQUFPLEtBQUssQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsU0FBdEIsQ0FBZ0MsQ0FBQyxJQUFqQyxDQUFzQyxNQUF0QyxFQUpHO1FBQUEsQ0FBTCxFQVRrQztNQUFBLENBQXBDLENBOUZBLENBQUE7QUFBQSxNQTZHQSxFQUFBLENBQUcsdUJBQUgsRUFBNEIsU0FBQSxHQUFBO0FBQzFCLFFBQUEsTUFBTSxDQUFDLE9BQVAsQ0FBZSxvQkFBZixDQUFBLENBQUE7QUFBQSxRQUVBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2lCQUNkLEtBQUssQ0FBQyxrQkFBTixDQUF5QixhQUF6QixFQURjO1FBQUEsQ0FBaEIsQ0FGQSxDQUFBO2VBSUEsSUFBQSxDQUFLLFNBQUEsR0FBQTtpQkFDSCxNQUFBLENBQU8sS0FBSyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxTQUF0QixDQUFnQyxDQUFDLElBQWpDLENBQXNDLE1BQXRDLEVBREc7UUFBQSxDQUFMLEVBTDBCO01BQUEsQ0FBNUIsQ0E3R0EsQ0FBQTtBQUFBLE1BcUhBLEVBQUEsQ0FBRyxnQ0FBSCxFQUFxQyxTQUFBLEdBQUE7QUFDbkMsUUFBQSxNQUFNLENBQUMsT0FBUCxDQUFlLHFCQUFmLENBQUEsQ0FBQTtBQUFBLFFBRUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7aUJBQ2QsS0FBSyxDQUFDLGtCQUFOLENBQXlCLGFBQXpCLEVBRGM7UUFBQSxDQUFoQixDQUZBLENBQUE7ZUFJQSxJQUFBLENBQUssU0FBQSxHQUFBO2lCQUNILE1BQUEsQ0FBTyxLQUFLLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLFNBQXRCLENBQWdDLENBQUMsSUFBakMsQ0FBc0MsTUFBdEMsRUFERztRQUFBLENBQUwsRUFMbUM7TUFBQSxDQUFyQyxDQXJIQSxDQUFBO0FBQUEsTUE2SEEsRUFBQSxDQUFHLHFDQUFILEVBQTBDLFNBQUEsR0FBQTtBQUN4QyxRQUFBLE1BQU0sQ0FBQyxPQUFQLENBQWUscUJBQWYsQ0FBQSxDQUFBO0FBQUEsUUFFQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtpQkFDZCxLQUFLLENBQUMsa0JBQU4sQ0FBeUIsYUFBekIsRUFEYztRQUFBLENBQWhCLENBRkEsQ0FBQTtlQUlBLElBQUEsQ0FBSyxTQUFBLEdBQUE7aUJBQ0gsTUFBQSxDQUFPLEtBQUssQ0FBQyxLQUFiLENBQW1CLENBQUMsWUFBcEIsQ0FBaUMsQ0FBakMsRUFERztRQUFBLENBQUwsRUFMd0M7TUFBQSxDQUExQyxDQTdIQSxDQUFBO0FBQUEsTUFxSUEsRUFBQSxDQUFHLDRDQUFILEVBQWlELFNBQUEsR0FBQTtBQUMvQyxRQUFBLE1BQU0sQ0FBQyxPQUFQLENBQWUsMkRBQWYsQ0FBQSxDQUFBO0FBQUEsUUFFQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtpQkFDZCxLQUFLLENBQUMsa0JBQU4sQ0FBeUIsYUFBekIsRUFEYztRQUFBLENBQWhCLENBRkEsQ0FBQTtlQUlBLElBQUEsQ0FBSyxTQUFBLEdBQUE7aUJBQ0gsTUFBQSxDQUFPLEtBQUssQ0FBQyxLQUFiLENBQW1CLENBQUMsWUFBcEIsQ0FBaUMsQ0FBakMsRUFERztRQUFBLENBQUwsRUFMK0M7TUFBQSxDQUFqRCxDQXJJQSxDQUFBO2FBNklBLEVBQUEsQ0FBRyxxQkFBSCxFQUEwQixTQUFBLEdBQUE7QUFDeEIsUUFBQSxNQUFNLENBQUMsT0FBUCxDQUFlLHNCQUFmLENBQUEsQ0FBQTtBQUFBLFFBRUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7aUJBQ2QsS0FBSyxDQUFDLGtCQUFOLENBQXlCLGFBQXpCLEVBRGM7UUFBQSxDQUFoQixDQUZBLENBQUE7ZUFJQSxJQUFBLENBQUssU0FBQSxHQUFBO2lCQUNILE1BQUEsQ0FBTyxLQUFLLENBQUMsS0FBYixDQUFtQixDQUFDLFlBQXBCLENBQWlDLENBQWpDLEVBREc7UUFBQSxDQUFMLEVBTHdCO01BQUEsQ0FBMUIsRUE5SXdDO0lBQUEsQ0FBMUMsQ0E5UEEsQ0FBQTtXQW9aQSxRQUFBLENBQVMsZUFBVCxFQUEwQixTQUFBLEdBQUE7QUFDeEIsTUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsUUFBQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsNEJBQWhCLEVBQThDLGNBQTlDLENBQUEsQ0FBQTtBQUFBLFFBQ0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHVCQUFoQixFQUF5QyxrQkFBekMsQ0FEQSxDQUFBO2VBR0EsS0FBSyxDQUFDLEtBQU4sR0FBYztVQUNaO0FBQUEsWUFDRSxTQUFBLEVBQVcsVUFEYjtBQUFBLFlBRUUsWUFBQSxFQUFjLFdBRmhCO0FBQUEsWUFHRSxLQUFBLEVBQU8sUUFIVDtBQUFBLFlBSUUsS0FBQSxFQUFPLENBQUMsQ0FBQyxDQUFELEVBQUcsQ0FBSCxDQUFELEVBQVEsQ0FBQyxDQUFELEVBQUcsRUFBSCxDQUFSLENBSlQ7QUFBQSxZQUtFLFdBQUEsRUFBYSxVQUxmO1dBRFksRUFRWjtBQUFBLFlBQ0UsU0FBQSxFQUFXLFNBRGI7QUFBQSxZQUVFLFlBQUEsRUFBYyxXQUZoQjtBQUFBLFlBR0UsS0FBQSxFQUFPLE9BSFQ7QUFBQSxZQUlFLEtBQUEsRUFBTyxDQUFDLENBQUMsQ0FBRCxFQUFHLENBQUgsQ0FBRCxFQUFRLENBQUMsQ0FBRCxFQUFHLENBQUgsQ0FBUixDQUpUO0FBQUEsWUFLRSxXQUFBLEVBQWEsU0FMZjtXQVJZLEVBZVo7QUFBQSxZQUNFLFNBQUEsRUFBVyxVQURiO0FBQUEsWUFFRSxZQUFBLEVBQWMsV0FGaEI7QUFBQSxZQUdFLEtBQUEsRUFBTyxRQUhUO0FBQUEsWUFJRSxLQUFBLEVBQU8sQ0FBQyxDQUFDLENBQUQsRUFBRyxDQUFILENBQUQsRUFBUSxDQUFDLENBQUQsRUFBRyxFQUFILENBQVIsQ0FKVDtBQUFBLFlBS0UsV0FBQSxFQUFhLFVBTGY7V0FmWTtVQUpMO01BQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxNQTRCQSxFQUFBLENBQUcsd0NBQUgsRUFBNkMsU0FBQSxHQUFBO2VBQzNDLE1BQUEsQ0FBTyxLQUFLLENBQUMsV0FBTixDQUFBLENBQVAsQ0FBMkIsQ0FBQyxPQUE1QixDQUFvQyx5R0FBcEMsRUFEMkM7TUFBQSxDQUE3QyxDQTVCQSxDQUFBO0FBQUEsTUFtQ0EsRUFBQSxDQUFHLCtCQUFILEVBQW9DLFNBQUEsR0FBQTtBQUNsQyxRQUFBLEtBQUssQ0FBQyxTQUFOLENBQWdCO0FBQUEsVUFBQSxNQUFBLEVBQVEsTUFBUjtBQUFBLFVBQWdCLE9BQUEsRUFBUyxJQUF6QjtTQUFoQixDQUFBLENBQUE7ZUFDQSxNQUFBLENBQU8sS0FBSyxDQUFDLFdBQU4sQ0FBQSxDQUFQLENBQTJCLENBQUMsT0FBNUIsQ0FBb0MseUdBQXBDLEVBRmtDO01BQUEsQ0FBcEMsQ0FuQ0EsQ0FBQTtBQUFBLE1BMkNBLEVBQUEsQ0FBRyx1Q0FBSCxFQUE0QyxTQUFBLEdBQUE7QUFDMUMsUUFBQSxLQUFLLENBQUMsU0FBTixDQUFnQjtBQUFBLFVBQUEsTUFBQSxFQUFRLE1BQVI7QUFBQSxVQUFnQixPQUFBLEVBQVMsS0FBekI7U0FBaEIsQ0FBQSxDQUFBO2VBQ0EsTUFBQSxDQUFPLEtBQUssQ0FBQyxXQUFOLENBQUEsQ0FBUCxDQUEyQixDQUFDLE9BQTVCLENBQW9DLHlHQUFwQyxFQUYwQztNQUFBLENBQTVDLENBM0NBLENBQUE7QUFBQSxNQW1EQSxFQUFBLENBQUcsa0NBQUgsRUFBdUMsU0FBQSxHQUFBO0FBQ3JDLFFBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHVCQUFoQixFQUF5QyxDQUFDLE1BQUQsRUFBUyxNQUFULEVBQWlCLE9BQWpCLENBQXpDLENBQUEsQ0FBQTtlQUNBLE1BQUEsQ0FBTyxLQUFLLENBQUMsV0FBTixDQUFBLENBQVAsQ0FBMkIsQ0FBQyxPQUE1QixDQUFvQyxrSEFBcEMsRUFGcUM7TUFBQSxDQUF2QyxDQW5EQSxDQUFBO0FBQUEsTUEyREEsRUFBQSxDQUFHLDZDQUFILEVBQWtELFNBQUEsR0FBQTtBQUNoRCxZQUFBLFFBQUE7QUFBQSxRQUFBLEtBQUssQ0FBQyxLQUFOLEdBQWM7VUFDWjtBQUFBLFlBQ0UsU0FBQSxFQUFXLFVBRGI7QUFBQSxZQUVFLEtBQUEsRUFBTyxRQUZUO1dBRFk7U0FBZCxDQUFBO0FBQUEsUUFNQSxNQUFBLENBQU8sS0FBSyxDQUFDLFdBQU4sQ0FBQSxDQUFQLENBQTJCLENBQUMsT0FBNUIsQ0FBb0MseUJBQXBDLENBTkEsQ0FBQTtBQUFBLFFBVUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHVCQUFoQixFQUF5QyxDQUFDLE1BQUQsRUFBUyxNQUFULEVBQWlCLE9BQWpCLEVBQTBCLE1BQTFCLENBQXpDLENBVkEsQ0FBQTtBQUFBLFFBV0EsUUFBQSxHQUFXLDRDQVhYLENBQUE7ZUFZQSxNQUFBLENBQU8sS0FBSyxDQUFDLFdBQU4sQ0FBQSxDQUFQLENBQTJCLENBQUMsT0FBNUIsQ0FBb0MseUJBQXBDLEVBYmdEO01BQUEsQ0FBbEQsQ0EzREEsQ0FBQTthQTRFQSxFQUFBLENBQUcsa0NBQUgsRUFBdUMsU0FBQSxHQUFBO0FBQ3JDLFFBQUEsS0FBSyxDQUFDLEtBQU4sR0FBYztVQUNaO0FBQUEsWUFDRSxTQUFBLEVBQVcsVUFEYjtBQUFBLFlBRUUsWUFBQSxFQUFjLFdBRmhCO1dBRFk7U0FBZCxDQUFBO0FBQUEsUUFNQSxNQUFBLENBQU8sS0FBSyxDQUFDLFdBQU4sQ0FBQSxDQUFQLENBQTJCLENBQUMsT0FBNUIsQ0FBb0MsMEJBQXBDLENBTkEsQ0FBQTtBQUFBLFFBVUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHVCQUFoQixFQUF5QyxDQUFDLE9BQUQsQ0FBekMsQ0FWQSxDQUFBO2VBV0EsTUFBQSxDQUFPLEtBQUssQ0FBQyxXQUFOLENBQUEsQ0FBUCxDQUEyQixDQUFDLE9BQTVCLENBQW9DLGdCQUFwQyxFQVpxQztNQUFBLENBQXZDLEVBN0V3QjtJQUFBLENBQTFCLEVBclpzQjtFQUFBLENBQXhCLENBSEEsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/gsmyrnaios/.atom/packages/todo-show/spec/todos-model-spec.coffee
