(function() {
  var Emitter, TodosModel;

  Emitter = require('atom').Emitter;

  module.exports = TodosModel = (function() {
    function TodosModel() {
      this.emitter = new Emitter;
      this.maxLength = 120;
      this.scope = 'full';
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
      var sortAsc, sortBy;
      sortBy = _arg.sortBy, sortAsc = _arg.sortAsc;
      if (!sortBy) {
        return;
      }
      this.todos = this.todos.sort(function(a, b) {
        var aItem, bItem;
        if (!(aItem = a[sortBy.toLowerCase()])) {
          return -1;
        }
        if (!(bItem = b[sortBy.toLowerCase()])) {
          return 1;
        }
        if (aItem === bItem) {
          aItem = a.text;
          bItem = b.text;
        }
        if (sortAsc) {
          return aItem.localeCompare(bItem);
        } else {
          return bItem.localeCompare(aItem);
        }
      });
      return this.emitter.emit('did-sort-todos', this.todos);
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
        regexStr = "";
      }
      pattern = (_ref = regexStr.match(/\/(.+)\//)) != null ? _ref[1] : void 0;
      flags = (_ref1 = regexStr.match(/\/(\w+$)/)) != null ? _ref1[1] : void 0;
      if (!pattern) {
        this.emitter.emit('did-fail-search', "Invalid regex: " + (regexStr || 'empty'));
        return false;
      }
      return new RegExp(pattern, flags);
    };

    TodosModel.prototype.handleScanMatch = function(match) {
      var matchText, _matchText, _ref;
      matchText = match.text || match.all;
      while ((_matchText = (_ref = match.regexp) != null ? _ref.exec(matchText) : void 0)) {
        matchText = _matchText.pop();
      }
      matchText = matchText.replace(/(\*\/|\?>|-->|#>|-}|\]\])\s*$/, '').trim();
      if (matchText.length >= this.maxLength) {
        matchText = "" + (matchText.substring(0, this.maxLength - 3)) + "...";
      }
      if (!(match.position && match.position.length > 0)) {
        match.position = [[0, 0]];
      }
      if (match.position.serialize) {
        match.range = match.position.serialize().toString();
      } else {
        match.range = match.position.toString();
      }
      match.text = matchText || "No details";
      match.file = atom.project.relativize(match.path);
      match.line = parseInt(match.range.split(',')[0]) + 1;
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
            _results.push(_this.addTodo(_this.handleScanMatch({
              all: match.lineText,
              text: match.matchText,
              path: result.filePath,
              position: match.range,
              type: regexLookup.title,
              regex: regexLookup.regex,
              regexp: regex
            })));
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
          return function(match, error) {
            var range;
            if (error) {
              console.debug(error.message);
            }
            if (!match) {
              return;
            }
            range = [[match.computedRange.start.row, match.computedRange.start.column], [match.computedRange.end.row, match.computedRange.end.column]];
            return _this.addTodo(_this.handleScanMatch({
              all: match.lineText,
              text: match.matchText,
              path: editor.getPath(),
              position: range,
              type: regexLookup.title,
              regex: regexLookup.regex,
              regexp: regex
            }));
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
      var item, key, out, todo;
      return ((function() {
        var _i, _j, _len, _len1, _ref, _ref1, _results;
        _ref = this.getTodos();
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          todo = _ref[_i];
          out = '-';
          _ref1 = atom.config.get('todo-show.showInTable');
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            key = _ref1[_j];
            if (item = todo[key.toLowerCase()]) {
              out += (function() {
                switch (key) {
                  case 'All':
                    return " " + item;
                  case 'Text':
                    return " " + item;
                  case 'Type':
                    return " __" + item + "__";
                  case 'Range':
                    return " _:" + item + "_";
                  case 'Line':
                    return " _:" + item + "_";
                  case 'Regex':
                    return " _'" + item + "'_";
                  case 'File':
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy90b2RvLXNob3cvbGliL3RvZG9zLW1vZGVsLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxtQkFBQTs7QUFBQSxFQUFDLFVBQVcsT0FBQSxDQUFRLE1BQVIsRUFBWCxPQUFELENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ1MsSUFBQSxvQkFBQSxHQUFBO0FBQ1gsTUFBQSxJQUFDLENBQUEsT0FBRCxHQUFXLEdBQUEsQ0FBQSxPQUFYLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxTQUFELEdBQWEsR0FEYixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsS0FBRCxHQUFTLE1BRlQsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLEtBQUQsR0FBUyxFQUhULENBRFc7SUFBQSxDQUFiOztBQUFBLHlCQU1BLFlBQUEsR0FBYyxTQUFDLEVBQUQsR0FBQTthQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLGNBQVosRUFBNEIsRUFBNUIsRUFBUjtJQUFBLENBTmQsQ0FBQTs7QUFBQSx5QkFPQSxlQUFBLEdBQWlCLFNBQUMsRUFBRCxHQUFBO2FBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksaUJBQVosRUFBK0IsRUFBL0IsRUFBUjtJQUFBLENBUGpCLENBQUE7O0FBQUEseUJBUUEsVUFBQSxHQUFZLFNBQUMsRUFBRCxHQUFBO2FBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksaUJBQVosRUFBK0IsRUFBL0IsRUFBUjtJQUFBLENBUlosQ0FBQTs7QUFBQSx5QkFTQSxnQkFBQSxHQUFrQixTQUFDLEVBQUQsR0FBQTthQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLGtCQUFaLEVBQWdDLEVBQWhDLEVBQVI7SUFBQSxDQVRsQixDQUFBOztBQUFBLHlCQVVBLGdCQUFBLEdBQWtCLFNBQUMsRUFBRCxHQUFBO2FBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksa0JBQVosRUFBZ0MsRUFBaEMsRUFBUjtJQUFBLENBVmxCLENBQUE7O0FBQUEseUJBV0EsaUJBQUEsR0FBbUIsU0FBQyxFQUFELEdBQUE7YUFBUSxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxtQkFBWixFQUFpQyxFQUFqQyxFQUFSO0lBQUEsQ0FYbkIsQ0FBQTs7QUFBQSx5QkFZQSxlQUFBLEdBQWlCLFNBQUMsRUFBRCxHQUFBO2FBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksaUJBQVosRUFBK0IsRUFBL0IsRUFBUjtJQUFBLENBWmpCLENBQUE7O0FBQUEseUJBYUEsY0FBQSxHQUFnQixTQUFDLEVBQUQsR0FBQTthQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLGdCQUFaLEVBQThCLEVBQTlCLEVBQVI7SUFBQSxDQWJoQixDQUFBOztBQUFBLHlCQWNBLHNCQUFBLEdBQXdCLFNBQUMsRUFBRCxHQUFBO2FBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksa0JBQVosRUFBZ0MsRUFBaEMsRUFBUjtJQUFBLENBZHhCLENBQUE7O0FBQUEseUJBZ0JBLEtBQUEsR0FBTyxTQUFBLEdBQUE7QUFDTCxNQUFBLElBQUMsQ0FBQSxZQUFELENBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsS0FBRCxHQUFTLEVBRFQsQ0FBQTthQUVBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLGlCQUFkLEVBSEs7SUFBQSxDQWhCUCxDQUFBOztBQUFBLHlCQXFCQSxPQUFBLEdBQVMsU0FBQyxJQUFELEdBQUE7QUFFUCxNQUFBLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFZLElBQVosQ0FBQSxDQUFBO2FBQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsY0FBZCxFQUE4QixJQUE5QixFQUhPO0lBQUEsQ0FyQlQsQ0FBQTs7QUFBQSx5QkEwQkEsUUFBQSxHQUFVLFNBQUEsR0FBQTthQUFHLElBQUMsQ0FBQSxNQUFKO0lBQUEsQ0ExQlYsQ0FBQTs7QUFBQSx5QkE0QkEsU0FBQSxHQUFXLFNBQUMsSUFBRCxHQUFBO0FBQ1QsVUFBQSxlQUFBO0FBQUEsTUFEVyxjQUFBLFFBQVEsZUFBQSxPQUNuQixDQUFBO0FBQUEsTUFBQSxJQUFBLENBQUEsTUFBQTtBQUFBLGNBQUEsQ0FBQTtPQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFZLFNBQUMsQ0FBRCxFQUFHLENBQUgsR0FBQTtBQUNuQixZQUFBLFlBQUE7QUFBQSxRQUFBLElBQUEsQ0FBQSxDQUFpQixLQUFBLEdBQVEsQ0FBRSxDQUFBLE1BQU0sQ0FBQyxXQUFQLENBQUEsQ0FBQSxDQUFWLENBQWpCO0FBQUEsaUJBQU8sQ0FBQSxDQUFQLENBQUE7U0FBQTtBQUNBLFFBQUEsSUFBQSxDQUFBLENBQWdCLEtBQUEsR0FBUSxDQUFFLENBQUEsTUFBTSxDQUFDLFdBQVAsQ0FBQSxDQUFBLENBQVYsQ0FBaEI7QUFBQSxpQkFBTyxDQUFQLENBQUE7U0FEQTtBQUlBLFFBQUEsSUFBRyxLQUFBLEtBQVMsS0FBWjtBQUNFLFVBQUEsS0FBQSxHQUFRLENBQUMsQ0FBQyxJQUFWLENBQUE7QUFBQSxVQUNBLEtBQUEsR0FBUSxDQUFDLENBQUMsSUFEVixDQURGO1NBSkE7QUFRQSxRQUFBLElBQUcsT0FBSDtpQkFDRSxLQUFLLENBQUMsYUFBTixDQUFvQixLQUFwQixFQURGO1NBQUEsTUFBQTtpQkFHRSxLQUFLLENBQUMsYUFBTixDQUFvQixLQUFwQixFQUhGO1NBVG1CO01BQUEsQ0FBWixDQUZULENBQUE7YUFnQkEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsZ0JBQWQsRUFBZ0MsSUFBQyxDQUFBLEtBQWpDLEVBakJTO0lBQUEsQ0E1QlgsQ0FBQTs7QUFBQSx5QkErQ0Esc0JBQUEsR0FBd0IsU0FBQSxHQUFBO2FBQUcsSUFBQyxDQUFBLGVBQUo7SUFBQSxDQS9DeEIsQ0FBQTs7QUFBQSx5QkFnREEsc0JBQUEsR0FBd0IsU0FBRSxjQUFGLEdBQUE7QUFBbUIsTUFBbEIsSUFBQyxDQUFBLGlCQUFBLGNBQWlCLENBQW5CO0lBQUEsQ0FoRHhCLENBQUE7O0FBQUEseUJBa0RBLFdBQUEsR0FBYSxTQUFBLEdBQUE7YUFBRyxJQUFDLENBQUEsVUFBSjtJQUFBLENBbERiLENBQUE7O0FBQUEseUJBb0RBLGNBQUEsR0FBZ0IsU0FBQSxHQUFBO2FBQUcsSUFBQyxDQUFBLE1BQUo7SUFBQSxDQXBEaEIsQ0FBQTs7QUFBQSx5QkFxREEsY0FBQSxHQUFnQixTQUFDLEtBQUQsR0FBQTthQUNkLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLGtCQUFkLEVBQWtDLElBQUMsQ0FBQSxLQUFELEdBQVMsS0FBM0MsRUFEYztJQUFBLENBckRoQixDQUFBOztBQUFBLHlCQXdEQSxpQkFBQSxHQUFtQixTQUFBLEdBQUE7QUFDakIsVUFBQSxLQUFBO0FBQUEsTUFBQSxLQUFBO0FBQVEsZ0JBQU8sSUFBQyxDQUFBLEtBQVI7QUFBQSxlQUNELE1BREM7bUJBQ1csT0FEWDtBQUFBLGVBRUQsTUFGQzttQkFFVyxTQUZYO0FBQUE7bUJBR0QsT0FIQztBQUFBO21CQUFSLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxjQUFELENBQWdCLEtBQWhCLENBSkEsQ0FBQTthQUtBLE1BTmlCO0lBQUEsQ0F4RG5CLENBQUE7O0FBQUEseUJBaUVBLGlCQUFBLEdBQW1CLFNBQUMsT0FBRCxHQUFBO0FBQ2pCLFVBQUEsNEJBQUE7QUFBQSxNQUFBLElBQUcsT0FBTyxDQUFDLE1BQVIsR0FBaUIsQ0FBcEI7QUFDRSxRQUFBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLGlCQUFkLEVBQWtDLDZCQUFBLEdBQTZCLE9BQU8sQ0FBQyxNQUF2RSxDQUFBLENBQUE7QUFDQSxlQUFPLEVBQVAsQ0FGRjtPQUFBO0FBSUE7V0FBQSx5REFBQTsyQkFBQTtBQUNFLHNCQUFBO0FBQUEsVUFBQSxPQUFBLEVBQVMsS0FBVDtBQUFBLFVBQ0EsT0FBQSxFQUFTLE9BQVEsQ0FBQSxDQUFBLEdBQUUsQ0FBRixDQURqQjtVQUFBLENBREY7QUFBQTtzQkFMaUI7SUFBQSxDQWpFbkIsQ0FBQTs7QUFBQSx5QkEyRUEsWUFBQSxHQUFjLFNBQUMsUUFBRCxHQUFBO0FBRVosVUFBQSwyQkFBQTs7UUFGYSxXQUFXO09BRXhCO0FBQUEsTUFBQSxPQUFBLHFEQUFzQyxDQUFBLENBQUEsVUFBdEMsQ0FBQTtBQUFBLE1BRUEsS0FBQSx1REFBb0MsQ0FBQSxDQUFBLFVBRnBDLENBQUE7QUFJQSxNQUFBLElBQUEsQ0FBQSxPQUFBO0FBQ0UsUUFBQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxpQkFBZCxFQUFrQyxpQkFBQSxHQUFnQixDQUFDLFFBQUEsSUFBWSxPQUFiLENBQWxELENBQUEsQ0FBQTtBQUNBLGVBQU8sS0FBUCxDQUZGO09BSkE7YUFPSSxJQUFBLE1BQUEsQ0FBTyxPQUFQLEVBQWdCLEtBQWhCLEVBVFE7SUFBQSxDQTNFZCxDQUFBOztBQUFBLHlCQXNGQSxlQUFBLEdBQWlCLFNBQUMsS0FBRCxHQUFBO0FBQ2YsVUFBQSwyQkFBQTtBQUFBLE1BQUEsU0FBQSxHQUFZLEtBQUssQ0FBQyxJQUFOLElBQWMsS0FBSyxDQUFDLEdBQWhDLENBQUE7QUFJQSxhQUFNLENBQUMsVUFBQSx1Q0FBeUIsQ0FBRSxJQUFkLENBQW1CLFNBQW5CLFVBQWQsQ0FBTixHQUFBO0FBQ0UsUUFBQSxTQUFBLEdBQVksVUFBVSxDQUFDLEdBQVgsQ0FBQSxDQUFaLENBREY7TUFBQSxDQUpBO0FBQUEsTUFRQSxTQUFBLEdBQVksU0FBUyxDQUFDLE9BQVYsQ0FBa0IsK0JBQWxCLEVBQW1ELEVBQW5ELENBQXNELENBQUMsSUFBdkQsQ0FBQSxDQVJaLENBQUE7QUFXQSxNQUFBLElBQUcsU0FBUyxDQUFDLE1BQVYsSUFBb0IsSUFBQyxDQUFBLFNBQXhCO0FBQ0UsUUFBQSxTQUFBLEdBQVksRUFBQSxHQUFFLENBQUMsU0FBUyxDQUFDLFNBQVYsQ0FBb0IsQ0FBcEIsRUFBdUIsSUFBQyxDQUFBLFNBQUQsR0FBYSxDQUFwQyxDQUFELENBQUYsR0FBMEMsS0FBdEQsQ0FERjtPQVhBO0FBZ0JBLE1BQUEsSUFBQSxDQUFBLENBQWdDLEtBQUssQ0FBQyxRQUFOLElBQW1CLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBZixHQUF3QixDQUEzRSxDQUFBO0FBQUEsUUFBQSxLQUFLLENBQUMsUUFBTixHQUFpQixDQUFDLENBQUMsQ0FBRCxFQUFHLENBQUgsQ0FBRCxDQUFqQixDQUFBO09BaEJBO0FBaUJBLE1BQUEsSUFBRyxLQUFLLENBQUMsUUFBUSxDQUFDLFNBQWxCO0FBQ0UsUUFBQSxLQUFLLENBQUMsS0FBTixHQUFjLEtBQUssQ0FBQyxRQUFRLENBQUMsU0FBZixDQUFBLENBQTBCLENBQUMsUUFBM0IsQ0FBQSxDQUFkLENBREY7T0FBQSxNQUFBO0FBR0UsUUFBQSxLQUFLLENBQUMsS0FBTixHQUFjLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBZixDQUFBLENBQWQsQ0FIRjtPQWpCQTtBQUFBLE1Bc0JBLEtBQUssQ0FBQyxJQUFOLEdBQWEsU0FBQSxJQUFhLFlBdEIxQixDQUFBO0FBQUEsTUF1QkEsS0FBSyxDQUFDLElBQU4sR0FBYSxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQWIsQ0FBd0IsS0FBSyxDQUFDLElBQTlCLENBdkJiLENBQUE7QUFBQSxNQXdCQSxLQUFLLENBQUMsSUFBTixHQUFhLFFBQUEsQ0FBUyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQVosQ0FBa0IsR0FBbEIsQ0FBdUIsQ0FBQSxDQUFBLENBQWhDLENBQUEsR0FBc0MsQ0F4Qm5ELENBQUE7QUF5QkEsYUFBTyxLQUFQLENBMUJlO0lBQUEsQ0F0RmpCLENBQUE7O0FBQUEseUJBb0hBLGNBQUEsR0FBZ0IsU0FBQyxXQUFELEdBQUE7QUFDZCxVQUFBLGNBQUE7QUFBQSxNQUFBLEtBQUEsR0FBUSxJQUFDLENBQUEsWUFBRCxDQUFjLFdBQVcsQ0FBQyxLQUExQixDQUFSLENBQUE7QUFDQSxNQUFBLElBQUEsQ0FBQSxLQUFBO0FBQUEsZUFBTyxLQUFQLENBQUE7T0FEQTtBQUFBLE1BR0EsT0FBQSxHQUFVO0FBQUEsUUFBQyxLQUFBLEVBQU8sSUFBQyxDQUFBLGNBQUQsQ0FBQSxDQUFSO09BSFYsQ0FBQTtBQU1BLE1BQUEsSUFBRyxDQUFBLElBQUUsQ0FBQSxVQUFMO0FBQ0UsUUFBQSxJQUFDLENBQUEsVUFBRCxHQUFjLElBQWQsQ0FBQTtBQUFBLFFBQ0EsT0FBTyxDQUFDLGVBQVIsR0FBMEIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFDLE1BQUQsR0FBQTtBQUN4QixZQUFBLElBQTRDLEtBQUMsQ0FBQSxTQUE3QztxQkFBQSxLQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxrQkFBZCxFQUFrQyxNQUFsQyxFQUFBO2FBRHdCO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FEMUIsQ0FERjtPQU5BO2FBV0EsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLEtBQXBCLEVBQTJCLE9BQTNCLEVBQW9DLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLE1BQUQsRUFBUyxLQUFULEdBQUE7QUFDbEMsY0FBQSwrQkFBQTtBQUFBLFVBQUEsSUFBK0IsS0FBL0I7QUFBQSxZQUFBLE9BQU8sQ0FBQyxLQUFSLENBQWMsS0FBSyxDQUFDLE9BQXBCLENBQUEsQ0FBQTtXQUFBO0FBQ0EsVUFBQSxJQUFBLENBQUEsTUFBQTtBQUFBLGtCQUFBLENBQUE7V0FEQTtBQUdBO0FBQUE7ZUFBQSwyQ0FBQTs2QkFBQTtBQUNFLDBCQUFBLEtBQUMsQ0FBQSxPQUFELENBQVMsS0FBQyxDQUFBLGVBQUQsQ0FDUDtBQUFBLGNBQUEsR0FBQSxFQUFLLEtBQUssQ0FBQyxRQUFYO0FBQUEsY0FDQSxJQUFBLEVBQU0sS0FBSyxDQUFDLFNBRFo7QUFBQSxjQUVBLElBQUEsRUFBTSxNQUFNLENBQUMsUUFGYjtBQUFBLGNBR0EsUUFBQSxFQUFVLEtBQUssQ0FBQyxLQUhoQjtBQUFBLGNBSUEsSUFBQSxFQUFNLFdBQVcsQ0FBQyxLQUpsQjtBQUFBLGNBS0EsS0FBQSxFQUFPLFdBQVcsQ0FBQyxLQUxuQjtBQUFBLGNBTUEsTUFBQSxFQUFRLEtBTlI7YUFETyxDQUFULEVBQUEsQ0FERjtBQUFBOzBCQUprQztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBDLEVBWmM7SUFBQSxDQXBIaEIsQ0FBQTs7QUFBQSx5QkFnSkEsa0JBQUEsR0FBb0IsU0FBQyxXQUFELEVBQWMsZ0JBQWQsR0FBQTtBQUNsQixVQUFBLHNDQUFBO0FBQUEsTUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLFlBQUQsQ0FBYyxXQUFXLENBQUMsS0FBMUIsQ0FBUixDQUFBO0FBQ0EsTUFBQSxJQUFBLENBQUEsS0FBQTtBQUFBLGVBQU8sS0FBUCxDQUFBO09BREE7QUFBQSxNQUdBLE9BQUEsR0FBVSxFQUhWLENBQUE7QUFJQSxNQUFBLElBQUcsZ0JBQUg7QUFDRSxRQUFBLElBQUcsTUFBQSx1REFBcUMsQ0FBRSxlQUE5QixDQUFBLFVBQVo7QUFDRSxVQUFBLE9BQUEsR0FBVSxDQUFDLE1BQUQsQ0FBVixDQURGO1NBREY7T0FBQSxNQUFBO0FBSUUsUUFBQSxPQUFBLEdBQVUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFmLENBQUEsQ0FBVixDQUpGO09BSkE7QUFVQSxXQUFBLDhDQUFBOzZCQUFBO0FBQ0UsUUFBQSxNQUFNLENBQUMsSUFBUCxDQUFZLEtBQVosRUFBbUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFDLEtBQUQsRUFBUSxLQUFSLEdBQUE7QUFDakIsZ0JBQUEsS0FBQTtBQUFBLFlBQUEsSUFBK0IsS0FBL0I7QUFBQSxjQUFBLE9BQU8sQ0FBQyxLQUFSLENBQWMsS0FBSyxDQUFDLE9BQXBCLENBQUEsQ0FBQTthQUFBO0FBQ0EsWUFBQSxJQUFBLENBQUEsS0FBQTtBQUFBLG9CQUFBLENBQUE7YUFEQTtBQUFBLFlBR0EsS0FBQSxHQUFRLENBQ04sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxHQUEzQixFQUFnQyxLQUFLLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxNQUExRCxDQURNLEVBRU4sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxHQUF6QixFQUE4QixLQUFLLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxNQUF0RCxDQUZNLENBSFIsQ0FBQTttQkFRQSxLQUFDLENBQUEsT0FBRCxDQUFTLEtBQUMsQ0FBQSxlQUFELENBQ1A7QUFBQSxjQUFBLEdBQUEsRUFBSyxLQUFLLENBQUMsUUFBWDtBQUFBLGNBQ0EsSUFBQSxFQUFNLEtBQUssQ0FBQyxTQURaO0FBQUEsY0FFQSxJQUFBLEVBQU0sTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUZOO0FBQUEsY0FHQSxRQUFBLEVBQVUsS0FIVjtBQUFBLGNBSUEsSUFBQSxFQUFNLFdBQVcsQ0FBQyxLQUpsQjtBQUFBLGNBS0EsS0FBQSxFQUFPLFdBQVcsQ0FBQyxLQUxuQjtBQUFBLGNBTUEsTUFBQSxFQUFRLEtBTlI7YUFETyxDQUFULEVBVGlCO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkIsQ0FBQSxDQURGO0FBQUEsT0FWQTthQStCQSxPQUFPLENBQUMsT0FBUixDQUFBLEVBaENrQjtJQUFBLENBaEpwQixDQUFBOztBQUFBLHlCQWtMQSxNQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ04sVUFBQSxzREFBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLEtBQUQsQ0FBQSxDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFEYixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxrQkFBZCxDQUZBLENBQUE7QUFJQSxNQUFBLElBQUEsQ0FBQSxDQUFjLGdCQUFBLEdBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw0QkFBaEIsQ0FBbkIsQ0FBZDtBQUFBLGNBQUEsQ0FBQTtPQUpBO0FBQUEsTUFNQSxPQUFBLEdBQVUsSUFBQyxDQUFBLGlCQUFELENBQW1CLGdCQUFuQixDQU5WLENBQUE7QUFTQSxXQUFBLDhDQUFBOytCQUFBO0FBQ0UsUUFBQSxPQUFBO0FBQVUsa0JBQU8sSUFBQyxDQUFBLEtBQVI7QUFBQSxpQkFDSCxNQURHO3FCQUNTLElBQUMsQ0FBQSxrQkFBRCxDQUFvQixRQUFwQixFQUE4QixLQUE5QixFQURUO0FBQUEsaUJBRUgsUUFGRztxQkFFVyxJQUFDLENBQUEsa0JBQUQsQ0FBb0IsUUFBcEIsRUFBOEIsSUFBOUIsRUFGWDtBQUFBO3FCQUdILElBQUMsQ0FBQSxjQUFELENBQWdCLFFBQWhCLEVBSEc7QUFBQTtxQkFBVixDQUFBO0FBQUEsUUFJQSxJQUFDLENBQUEsY0FBYyxDQUFDLElBQWhCLENBQXFCLE9BQXJCLENBSkEsQ0FERjtBQUFBLE9BVEE7YUFnQkEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxJQUFDLENBQUEsY0FBYixDQUE0QixDQUFDLElBQTdCLENBQWtDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDaEMsVUFBQSxLQUFDLENBQUEsU0FBRCxHQUFhLEtBQWIsQ0FBQTtpQkFDQSxLQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxtQkFBZCxFQUZnQztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxDLENBR0EsQ0FBQyxPQUFELENBSEEsQ0FHTyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxHQUFELEdBQUE7QUFDTCxVQUFBLEtBQUMsQ0FBQSxTQUFELEdBQWEsS0FBYixDQUFBO2lCQUNBLEtBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLGlCQUFkLEVBQWlDLEdBQWpDLEVBRks7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUhQLEVBakJNO0lBQUEsQ0FsTFIsQ0FBQTs7QUFBQSx5QkEwTUEsY0FBQSxHQUFnQixTQUFBLEdBQUE7QUFDZCxVQUFBLG1DQUFBO0FBQUEsTUFBQSxPQUFBLEdBQVUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDRCQUFoQixDQUFWLENBQUE7QUFDQSxNQUFBLElBQW9CLGVBQXBCO0FBQUEsZUFBTyxDQUFDLEdBQUQsQ0FBUCxDQUFBO09BREE7QUFFQSxNQUFBLElBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBMUIsQ0FBK0IsT0FBL0IsQ0FBQSxLQUE2QyxnQkFBaEQ7QUFDRSxRQUFBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLGlCQUFkLEVBQWlDLG1DQUFqQyxDQUFBLENBQUE7QUFDQSxlQUFPLENBQUMsR0FBRCxDQUFQLENBRkY7T0FGQTtBQUtBO1dBQUEsOENBQUE7NkJBQUE7QUFBQSxzQkFBQyxHQUFBLEdBQUcsT0FBSixDQUFBO0FBQUE7c0JBTmM7SUFBQSxDQTFNaEIsQ0FBQTs7QUFBQSx5QkFrTkEsV0FBQSxHQUFhLFNBQUEsR0FBQTtBQUNYLFVBQUEsb0JBQUE7YUFBQTs7QUFBQztBQUFBO2FBQUEsMkNBQUE7MEJBQUE7QUFDQyxVQUFBLEdBQUEsR0FBTSxHQUFOLENBQUE7QUFDQTtBQUFBLGVBQUEsOENBQUE7NEJBQUE7QUFDRSxZQUFBLElBQUcsSUFBQSxHQUFPLElBQUssQ0FBQSxHQUFHLENBQUMsV0FBSixDQUFBLENBQUEsQ0FBZjtBQUNFLGNBQUEsR0FBQTtBQUFPLHdCQUFPLEdBQVA7QUFBQSx1QkFDQSxLQURBOzJCQUNZLEdBQUEsR0FBRyxLQURmO0FBQUEsdUJBRUEsTUFGQTsyQkFFYSxHQUFBLEdBQUcsS0FGaEI7QUFBQSx1QkFHQSxNQUhBOzJCQUdhLEtBQUEsR0FBSyxJQUFMLEdBQVUsS0FIdkI7QUFBQSx1QkFJQSxPQUpBOzJCQUljLEtBQUEsR0FBSyxJQUFMLEdBQVUsSUFKeEI7QUFBQSx1QkFLQSxNQUxBOzJCQUthLEtBQUEsR0FBSyxJQUFMLEdBQVUsSUFMdkI7QUFBQSx1QkFNQSxPQU5BOzJCQU1jLEtBQUEsR0FBSyxJQUFMLEdBQVUsS0FOeEI7QUFBQSx1QkFPQSxNQVBBOzJCQU9hLElBQUEsR0FBSSxJQUFKLEdBQVMsSUFQdEI7QUFBQTtrQkFBUCxDQURGO2FBREY7QUFBQSxXQURBO0FBV0EsVUFBQSxJQUF3QixHQUFBLEtBQU8sR0FBL0I7QUFBQSxZQUFBLEdBQUEsR0FBTSxjQUFOLENBQUE7V0FYQTtBQUFBLHdCQVlBLEVBQUEsR0FBRyxHQUFILEdBQU8sS0FaUCxDQUREO0FBQUE7O21CQUFELENBY0MsQ0FBQyxJQWRGLENBY08sRUFkUCxFQURXO0lBQUEsQ0FsTmIsQ0FBQTs7QUFBQSx5QkFtT0EsWUFBQSxHQUFjLFNBQUEsR0FBQTtBQUNaLFVBQUEsaUNBQUE7O1FBQUEsSUFBQyxDQUFBLGlCQUFrQjtPQUFuQjtBQUNBO0FBQUE7V0FBQSwyQ0FBQTsyQkFBQTtBQUNFLFFBQUEsSUFBcUIsT0FBckI7K0RBQUEsT0FBTyxDQUFDLG1CQUFSO1NBQUEsTUFBQTtnQ0FBQTtTQURGO0FBQUE7c0JBRlk7SUFBQSxDQW5PZCxDQUFBOztzQkFBQTs7TUFKRixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/gsmyrnaios/.atom/packages/todo-show/lib/todos-model.coffee
