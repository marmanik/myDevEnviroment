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
      var match;
      match = [].match;
      beforeEach(function() {
        return match = {
          path: "" + (atom.project.getPaths()[0]) + "/sample.c",
          all: ' TODO: Comment in C ',
          regexp: /\b@?TODO:?\d*($|\s.*$)/g,
          position: [[0, 1], [0, 20]]
        };
      });
      it('should handle results from workspace scan (also tested in fetchRegexItem)', function() {
        var output;
        delete match.regexp;
        output = model.handleScanMatch(match);
        return expect(output.text).toEqual('TODO: Comment in C');
      });
      it('should remove regex part', function() {
        var output;
        output = model.handleScanMatch(match);
        return expect(output.text).toEqual('Comment in C');
      });
      it('should serialize range and relativize path', function() {
        var output;
        output = model.handleScanMatch(match);
        expect(output.file).toEqual('sample.c');
        return expect(output.range).toEqual('0,1,0,20');
      });
      return it('should handle invalid match position', function() {
        var output;
        delete match.position;
        output = model.handleScanMatch(match);
        expect(output.range).toEqual('0,0');
        expect(output.position).toEqual([[0, 0]]);
        match.position = [];
        output = model.handleScanMatch(match);
        expect(output.range).toEqual('0,0');
        expect(output.position).toEqual([[0, 0]]);
        match.position = [[0, 1]];
        output = model.handleScanMatch(match);
        expect(output.range).toEqual('0,1');
        expect(output.position).toEqual([[0, 1]]);
        match.position = [[0, 1], [2, 3]];
        output = model.handleScanMatch(match);
        expect(output.range).toEqual('0,1,2,3');
        return expect(output.position).toEqual([[0, 1], [2, 3]]);
      });
    });
    describe('fetchRegexItem(lookupObj)', function() {
      it('should scan the workspace for the regex that is passed and fill lookup results', function() {
        waitsForPromise(function() {
          return model.fetchRegexItem(defaultLookup);
        });
        return runs(function() {
          expect(model.todos).toHaveLength(3);
          expect(model.todos[0].text).toBe('Comment in C');
          expect(model.todos[1].text).toBe('This is the first todo');
          return expect(model.todos[2].text).toBe('This is the second todo');
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
          return expect(model.todos[0].text).toBe('<stdio.h>');
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
          expect(model.todos[0].text).toBe('This is the first todo');
          return expect(model.todos[1].text).toBe('This is the second todo');
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
          return expect(model.todos[0].text).toBe('Sample quicksort code');
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
          return expect(model.todos[0].text).toBe('return sort(Array.apply(this, arguments));');
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
          return expect(model.todos[0].text).toBe('return sort(Array.apply(this, arguments));');
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
          var text, text2;
          text = 'Lorem ipsum dolor sit amet, dapibus rhoncus. Scelerisque quam,';
          text += ' id ante molestias, ipsum lorem magnis et. A eleifend i...';
          text2 = '_SpgLE84Ms1K4DSumtJDoNn8ZECZLL+VR0DoGydy54vUoSpgLE84Ms1K4DSum';
          text2 += 'tJDoNn8ZECZLLVR0DoGydy54vUonRClXwLbFhX2gMwZgjx250ay+V0lF...';
          expect(model.todos[0].text).toHaveLength(120);
          expect(model.todos[0].text).toBe(text);
          expect(model.todos[1].text).toHaveLength(120);
          return expect(model.todos[1].text).toBe(text2);
        });
      });
      return it('should strip common block comment endings', function() {
        atom.project.setPaths([path.join(__dirname, 'fixtures/sample2')]);
        waitsForPromise(function() {
          return model.fetchRegexItem(defaultLookup);
        });
        return runs(function() {
          expect(model.todos).toHaveLength(6);
          expect(model.todos[0].text).toBe('C block comment');
          expect(model.todos[1].text).toBe('HTML comment');
          expect(model.todos[2].text).toBe('PowerShell comment');
          expect(model.todos[3].text).toBe('Haskell comment');
          expect(model.todos[4].text).toBe('Lua comment');
          return expect(model.todos[5].text).toBe('PHP comment');
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
          return expect(model.todos[0].text).toBe('Comment in C');
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
          return expect(model.todos[0].text).toBe('C block comment');
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
          return expect(model.todos[0].text).toBe('Comment in C');
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
          return expect(model.todos[0].text).toBe('C block comment');
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
          return expect(model.todos[0].text).toBe('Comment in C');
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
            expect(model.todos[0].text).toBe('Comment in C');
            expect(model.todos[1].text).toBe('C block comment');
            return expect(model.todos[6].text).toBe('PHP comment');
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
          expect(model.todos[0].type).toBe('TODOs');
          return expect(model.todos[0].text).toBe('New todo');
        });
      });
      it('respects imdone syntax (https://github.com/imdone/imdone-atom)', function() {
        editor.setText('TODO:10 todo1\nTODO:0 todo2');
        waitsForPromise(function() {
          return model.fetchOpenRegexItem(defaultLookup);
        });
        return runs(function() {
          expect(model.todos).toHaveLength(2);
          expect(model.todos[0].type).toBe('TODOs');
          expect(model.todos[0].text).toBe('todo1');
          return expect(model.todos[1].text).toBe('todo2');
        });
      });
      it('handles number in todo (as long as its not without space)', function() {
        editor.setText("Line 1 //TODO: 1 2 3\nLine 1 // TODO:1 2 3");
        waitsForPromise(function() {
          return model.fetchOpenRegexItem(defaultLookup);
        });
        return runs(function() {
          expect(model.todos).toHaveLength(2);
          expect(model.todos[0].text).toBe('1 2 3');
          return expect(model.todos[1].text).toBe('2 3');
        });
      });
      it('handles empty todos', function() {
        editor.setText("Line 1 // TODO\nLine 2 //TODO");
        waitsForPromise(function() {
          return model.fetchOpenRegexItem(defaultLookup);
        });
        return runs(function() {
          expect(model.todos).toHaveLength(2);
          expect(model.todos[0].text).toBe('No details');
          return expect(model.todos[1].text).toBe('No details');
        });
      });
      it('handles empty block todos', function() {
        editor.setText("/* TODO */\nLine 2 /* TODO */");
        waitsForPromise(function() {
          return model.fetchOpenRegexItem(defaultLookup);
        });
        return runs(function() {
          expect(model.todos).toHaveLength(2);
          expect(model.todos[0].text).toBe('No details');
          return expect(model.todos[1].text).toBe('No details');
        });
      });
      it('handles todos with @ in front', function() {
        editor.setText("Line 1 //@TODO: text\nLine 2 //@TODO: text\nLine 3 @TODO: text");
        waitsForPromise(function() {
          return model.fetchOpenRegexItem(defaultLookup);
        });
        return runs(function() {
          expect(model.todos).toHaveLength(3);
          expect(model.todos[0].text).toBe('text');
          expect(model.todos[1].text).toBe('text');
          return expect(model.todos[2].text).toBe('text');
        });
      });
      it('handles tabs in todos', function() {
        editor.setText('Line //TODO:\ttext');
        waitsForPromise(function() {
          return model.fetchOpenRegexItem(defaultLookup);
        });
        return runs(function() {
          return expect(model.todos[0].text).toBe('text');
        });
      });
      it('handles todo without semicolon', function() {
        editor.setText('A line // TODO text');
        waitsForPromise(function() {
          return model.fetchOpenRegexItem(defaultLookup);
        });
        return runs(function() {
          return expect(model.todos[0].text).toBe('text');
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
            text: 'fixme #1',
            file: 'file1.txt',
            type: 'FIXMEs',
            range: '3,6,3,10',
            position: [[3, 6], [3, 10]]
          }, {
            text: 'todo #1',
            file: 'file1.txt',
            type: 'TODOs',
            range: '4,5,4,9',
            position: [[4, 5], [4, 9]]
          }, {
            text: 'fixme #2',
            file: 'file2.txt',
            type: 'FIXMEs',
            range: '5,7,5,11',
            position: [[5, 7], [5, 11]]
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
            text: 'fixme #1',
            type: 'FIXMEs'
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
            text: 'fixme #1',
            file: 'file1.txt'
          }
        ];
        expect(model.getMarkdown()).toEqual("- fixme #1 `file1.txt`\n");
        atom.config.set('todo-show.showInTable', ['Title']);
        return expect(model.getMarkdown()).toEqual("- No details\n");
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy90b2RvLXNob3cvc3BlYy90b2Rvcy1tb2RlbC1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxnQkFBQTs7QUFBQSxFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUFQLENBQUE7O0FBQUEsRUFDQSxVQUFBLEdBQWEsT0FBQSxDQUFRLG9CQUFSLENBRGIsQ0FBQTs7QUFBQSxFQUdBLFFBQUEsQ0FBUyxhQUFULEVBQXdCLFNBQUEsR0FBQTtBQUN0QixRQUFBLDhEQUFBO0FBQUEsSUFBQSxPQUE2RCxFQUE3RCxFQUFDLGVBQUQsRUFBUSx3QkFBUixFQUF3Qix1QkFBeEIsRUFBdUMsNEJBQXZDLENBQUE7QUFBQSxJQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLGNBQUEsR0FBaUIsQ0FDZixRQURlLEVBRWYsNkJBRmUsRUFHZixPQUhlLEVBSWYsNEJBSmUsQ0FBakIsQ0FBQTtBQUFBLE1BTUEsYUFBQSxHQUNFO0FBQUEsUUFBQSxLQUFBLEVBQU8sY0FBZSxDQUFBLENBQUEsQ0FBdEI7QUFBQSxRQUNBLEtBQUEsRUFBTyxjQUFlLENBQUEsQ0FBQSxDQUR0QjtPQVBGLENBQUE7QUFBQSxNQVNBLGtCQUFBLEdBQXFCLENBQUMsTUFBRCxFQUFTLE1BQVQsRUFBaUIsTUFBakIsQ0FUckIsQ0FBQTtBQUFBLE1BV0EsS0FBQSxHQUFRLEdBQUEsQ0FBQSxVQVhSLENBQUE7YUFZQSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQWIsQ0FBc0IsQ0FBQyxJQUFJLENBQUMsSUFBTCxDQUFVLFNBQVYsRUFBcUIsa0JBQXJCLENBQUQsQ0FBdEIsRUFiUztJQUFBLENBQVgsQ0FGQSxDQUFBO0FBQUEsSUFpQkEsUUFBQSxDQUFTLDRCQUFULEVBQXVDLFNBQUEs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

//# sourceURL=/home/gsmyrnaios/.atom/packages/todo-show/spec/todos-model-spec.coffee
