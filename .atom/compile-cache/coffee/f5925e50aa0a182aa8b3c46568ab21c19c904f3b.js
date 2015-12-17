(function() {
  var Emitter, TodosModel;

  Emitter = require('atom').Emitter;

  module.exports = TodosModel = (function() {
    TodosModel.prototype.maxLength = 120;

    function TodosModel() {
      this.emitter = new Emitter;
      this.todos = [];
    }

    TodosModel.prototype.onDidAddTodo = function(cb) {
      return this.emitter.on('did-add-todo', cb);
    };

    TodosModel.prototype.onDidRemoveTodo = function(cb) {
      return this.emitter.on('did-remove-todo', cb);
    };

    TodosModel.prototype.onDidClear = function(cb) {
      return this.emitter.on('did-clear-todos', cb);
    };

    TodosModel.prototype.onDidStartSearch = function(cb) {
      return this.emitter.on('did-start-search', cb);
    };

    TodosModel.prototype.onDidSearchPaths = function(cb) {
      return this.emitter.on('did-search-paths', cb);
    };

    TodosModel.prototype.onDidFinishSearch = function(cb) {
      return this.emitter.on('did-finish-search', cb);
    };

    TodosModel.prototype.onDidFailSearch = function(cb) {
      return this.emitter.on('did-fail-search', cb);
    };

    TodosModel.prototype.onDidSortTodos = function(cb) {
      return this.emitter.on('did-sort-todos', cb);
    };

    TodosModel.prototype.onDidChangeSearchScope = function(cb) {
      return this.emitter.on('did-change-scope', cb);
    };

    TodosModel.prototype.clear = function() {
      this.cancelSearch();
      this.todos = [];
      return this.emitter.emit('did-clear-todos');
    };

    TodosModel.prototype.addTodo = function(todo) {
      this.todos.push(todo);
      return this.emitter.emit('did-add-todo', todo);
    };

    TodosModel.prototype.getTodos = function() {
      return this.todos;
    };

    TodosModel.prototype.sortTodos = function(_arg) {
      var key, sortAsc, sortBy;
      sortBy = _arg.sortBy, sortAsc = _arg.sortAsc;
      if (!(key = this.getKeyForItem(sortBy))) {
        return;
      }
      this.todos = this.todos.sort(function(a, b) {
        var aItem, bItem;
        if (!(aItem = a[key])) {
          return -1;
        }
        if (!(bItem = b[key])) {
          return 1;
        }
        if (aItem === bItem) {
          aItem = a.matchText;
          bItem = b.matchText;
        }
        if (sortAsc) {
          return aItem.localeCompare(bItem);
        } else {
          return bItem.localeCompare(aItem);
        }
      });
      return this.emitter.emit('did-sort-todos', this.todos);
    };

    TodosModel.prototype.getKeyForItem = function(item) {
      switch (item) {
        case 'All':
          return 'lineText';
        case 'Text':
          return 'matchText';
        case 'Type':
          return 'title';
        case 'Range':
          return 'rangeString';
        case 'Line':
          return 'line';
        case 'Regex':
          return 'regex';
        case 'File':
          return 'relativePath';
      }
    };

    TodosModel.prototype.getAvailableTableItems = function() {
      return this.availableItems;
    };

    TodosModel.prototype.setAvailableTableItems = function(availableItems) {
      this.availableItems = availableItems;
    };

    TodosModel.prototype.isSearching = function() {
      return this.searching;
    };

    TodosModel.prototype.getSearchScope = function() {
      return this.scope;
    };

    TodosModel.prototype.setSearchScope = function(scope) {
      return this.emitter.emit('did-change-scope', this.scope = scope);
    };

    TodosModel.prototype.toggleSearchScope = function() {
      var scope;
      scope = (function() {
        switch (this.scope) {
          case 'full':
            return 'open';
          case 'open':
            return 'active';
          default:
            return 'full';
        }
      }).call(this);
      this.setSearchScope(scope);
      return scope;
    };

    TodosModel.prototype.buildRegexLookups = function(regexes) {
      var i, regex, _i, _len, _results;
      if (regexes.length % 2) {
        this.emitter.emit('did-fail-search', "Invalid number of regexes: " + regexes.length);
        return [];
      }
      _results = [];
      for (i = _i = 0, _len = regexes.length; _i < _len; i = _i += 2) {
        regex = regexes[i];
        _results.push({
          'title': regex,
          'regex': regexes[i + 1]
        });
      }
      return _results;
    };

    TodosModel.prototype.makeRegexObj = function(regexStr) {
      var flags, pattern, _ref, _ref1;
      if (regexStr == null) {
        regexStr = '';
      }
      pattern = (_ref = regexStr.match(/\/(.+)\//)) != null ? _ref[1] : void 0;
      flags = (_ref1 = regexStr.match(/\/(\w+$)/)) != null ? _ref1[1] : void 0;
      if (pattern) {
        return new RegExp(pattern, flags);
      } else {
        this.emitter.emit('did-fail-search', "Invalid regex: " + (regexStr || 'empty'));
        return false;
      }
    };

    TodosModel.prototype.handleScanMatch = function(match, regex) {
      var matchText, _match;
      matchText = match.matchText;
      while ((_match = regex != null ? regex.exec(matchText) : void 0)) {
        matchText = _match.pop();
      }
      matchText = matchText.replace(/(\*\/|\?>|-->|#>|-}|\]\])\s*$/, '').trim();
      if (matchText.length >= this.maxLength) {
        matchText = "" + (matchText.substring(0, this.maxLength - 3)) + "...";
      }
      match.matchText = matchText || 'No details';
      if (match.range.serialize) {
        match.rangeString = match.range.serialize().toString();
      } else {
        match.rangeString = match.range.toString();
      }
      match.relativePath = atom.project.relativize(match.path);
      match.line = (match.range[0][0] + 1).toString();
      return match;
    };

    TodosModel.prototype.fetchRegexItem = function(regexLookup) {
      var options, regex;
      regex = this.makeRegexObj(regexLookup.regex);
      if (!regex) {
        return false;
      }
      options = {
        paths: this.getIgnorePaths()
      };
      if (!this.firstRegex) {
        this.firstRegex = true;
        options.onPathsSearched = (function(_this) {
          return function(nPaths) {
            if (_this.searching) {
              return _this.emitter.emit('did-search-paths', nPaths);
            }
          };
        })(this);
      }
      return atom.workspace.scan(regex, options, (function(_this) {
        return function(result, error) {
          var match, _i, _len, _ref, _results;
          if (error) {
            console.debug(error.message);
          }
          if (!result) {
            return;
          }
          _ref = result.matches;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            match = _ref[_i];
            match.title = regexLookup.title;
            match.regex = regexLookup.regex;
            match.path = result.filePath;
            _results.push(_this.addTodo(_this.handleScanMatch(match, regex)));
          }
          return _results;
        };
      })(this));
    };

    TodosModel.prototype.fetchOpenRegexItem = function(regexLookup, activeEditorOnly) {
      var editor, editors, regex, _i, _len, _ref;
      regex = this.makeRegexObj(regexLookup.regex);
      if (!regex) {
        return false;
      }
      editors = [];
      if (activeEditorOnly) {
        if (editor = (_ref = atom.workspace.getPanes()[0]) != null ? _ref.getActiveEditor() : void 0) {
          editors = [editor];
        }
      } else {
        editors = atom.workspace.getTextEditors();
      }
      for (_i = 0, _len = editors.length; _i < _len; _i++) {
        editor = editors[_i];
        editor.scan(regex, (function(_this) {
          return function(result, error) {
            var match;
            if (error) {
              console.debug(error.message);
            }
            if (!result) {
              return;
            }
            match = {
              title: regexLookup.title,
              regex: regexLookup.regex,
              path: editor.getPath(),
              matchText: result.matchText,
              lineText: result.matchText,
              range: [[result.computedRange.start.row, result.computedRange.start.column], [result.computedRange.end.row, result.computedRange.end.column]]
            };
            return _this.addTodo(_this.handleScanMatch(match, regex));
          };
        })(this));
      }
      return Promise.resolve();
    };

    TodosModel.prototype.search = function() {
      var findTheseRegexes, promise, regexObj, regexes, _i, _len;
      this.clear();
      this.searching = true;
      this.emitter.emit('did-start-search');
      if (!(findTheseRegexes = atom.config.get('todo-show.findTheseRegexes'))) {
        return;
      }
      regexes = this.buildRegexLookups(findTheseRegexes);
      for (_i = 0, _len = regexes.length; _i < _len; _i++) {
        regexObj = regexes[_i];
        promise = (function() {
          switch (this.scope) {
            case 'open':
              return this.fetchOpenRegexItem(regexObj, false);
            case 'active':
              return this.fetchOpenRegexItem(regexObj, true);
            default:
              return this.fetchRegexItem(regexObj);
          }
        }).call(this);
        this.searchPromises.push(promise);
      }
      return Promise.all(this.searchPromises).then((function(_this) {
        return function() {
          _this.searching = false;
          return _this.emitter.emit('did-finish-search');
        };
      })(this))["catch"]((function(_this) {
        return function(err) {
          _this.searching = false;
          return _this.emitter.emit('did-fail-search', err);
        };
      })(this));
    };

    TodosModel.prototype.getIgnorePaths = function() {
      var ignore, ignores, _i, _len, _results;
      ignores = atom.config.get('todo-show.ignoreThesePaths');
      if (ignores == null) {
        return ['*'];
      }
      if (Object.prototype.toString.call(ignores) !== '[object Array]') {
        this.emitter.emit('did-fail-search', "ignoreThesePaths must be an array");
        return ['*'];
      }
      _results = [];
      for (_i = 0, _len = ignores.length; _i < _len; _i++) {
        ignore = ignores[_i];
        _results.push("!" + ignore);
      }
      return _results;
    };

    TodosModel.prototype.getMarkdown = function() {
      var item, key, out, showInTableKeys, todo;
      showInTableKeys = (function() {
        var _i, _len, _ref, _results;
        _ref = atom.config.get('todo-show.showInTable');
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          _results.push(this.getKeyForItem(item));
        }
        return _results;
      }).call(this);
      return ((function() {
        var _i, _j, _len, _len1, _ref, _results;
        _ref = this.getTodos();
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          todo = _ref[_i];
          out = '-';
          for (_j = 0, _len1 = showInTableKeys.length; _j < _len1; _j++) {
            key = showInTableKeys[_j];
            if (item = todo[key]) {
              out += (function() {
                switch (key) {
                  case 'matchText':
                    return " " + item;
                  case 'lineText':
                    return " " + item;
                  case 'title':
                    return " __" + item + "__";
                  case 'rangeString':
                    return " _:" + item + "_";
                  case 'line':
                    return " _:" + item + "_";
                  case 'regex':
                    return " _" + item + "_";
                  case 'relativePath':
                    return " `" + item + "`";
                }
              })();
            }
          }
          if (out === '-') {
            out = "- No details";
          }
          _results.push("" + out + "\n");
        }
        return _results;
      }).call(this)).join('');
    };

    TodosModel.prototype.cancelSearch = function() {
      var promise, _i, _len, _ref, _results;
      if (this.searchPromises == null) {
        this.searchPromises = [];
      }
      _ref = this.searchPromises;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        promise = _ref[_i];
        if (promise) {
          _results.push(typeof promise.cancel === "function" ? promise.cancel() : void 0);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    return TodosModel;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy90b2RvLXNob3cvbGliL3RvZG9zLW1vZGVsLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxtQkFBQTs7QUFBQSxFQUFDLFVBQVcsT0FBQSxDQUFRLE1BQVIsRUFBWCxPQUFELENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0oseUJBQUEsU0FBQSxHQUFXLEdBQVgsQ0FBQTs7QUFFYSxJQUFBLG9CQUFBLEdBQUE7QUFDWCxNQUFBLElBQUMsQ0FBQSxPQUFELEdBQVcsR0FBQSxDQUFBLE9BQVgsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLEtBQUQsR0FBUyxFQURULENBRFc7SUFBQSxDQUZiOztBQUFBLHlCQU1BLFlBQUEsR0FBYyxTQUFDLEVBQUQsR0FBQTthQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLGNBQVosRUFBNEIsRUFBNUIsRUFBUjtJQUFBLENBTmQsQ0FBQTs7QUFBQSx5QkFPQSxlQUFBLEdBQWlCLFNBQUMsRUFBRCxHQUFBO2FBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksaUJBQVosRUFBK0IsRUFBL0IsRUFBUjtJQUFBLENBUGpCLENBQUE7O0FBQUEseUJBUUEsVUFBQSxHQUFZLFNBQUMsRUFBRCxHQUFBO2FBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksaUJBQVosRUFBK0IsRUFBL0IsRUFBUjtJQUFBLENBUlosQ0FBQTs7QUFBQSx5QkFTQSxnQkFBQSxHQUFrQixTQUFDLEVBQUQsR0FBQTthQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLGtCQUFaLEVBQWdDLEVBQWhDLEVBQVI7SUFBQSxDQVRsQixDQUFBOztBQUFBLHlCQVVBLGdCQUFBLEdBQWtCLFNBQUMsRUFB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

//# sourceURL=/home/gsmyrnaios/.atom/packages/todo-show/lib/todos-model.coffee
