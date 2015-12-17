(function() {
  var CompositeDisposable, Q, ScrollView, ShowTodoView, TodoEmptyView, TodoFileView, TodoNoneView, TodoRegexView, fs, path, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  CompositeDisposable = require('atom').CompositeDisposable;

  ScrollView = require('atom-space-pen-views').ScrollView;

  path = require('path');

  fs = require('fs-plus');

  _ = require('underscore-plus');

  Q = require('q');

  _ref = require('./todo-item-view'), TodoRegexView = _ref.TodoRegexView, TodoFileView = _ref.TodoFileView, TodoNoneView = _ref.TodoNoneView, TodoEmptyView = _ref.TodoEmptyView;

  module.exports = ShowTodoView = (function(_super) {
    __extends(ShowTodoView, _super);

    ShowTodoView.URI = 'atom://todo-show/todos';

    ShowTodoView.URIopen = 'atom://todo-show/open-todos';

    ShowTodoView.prototype.maxLength = 120;

    ShowTodoView.content = function() {
      return this.div({
        "class": 'show-todo-preview native-key-bindings',
        tabindex: -1
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'todo-action-items pull-right'
          }, function() {
            _this.a({
              outlet: 'saveAsButton',
              "class": 'icon icon-cloud-download'
            });
            return _this.a({
              outlet: 'refreshButton',
              "class": 'icon icon-sync'
            });
          });
          _this.div({
            outlet: 'todoLoading'
          }, function() {
            _this.div({
              "class": 'markdown-spinner'
            });
            return _this.h5({
              outlet: 'searchCount',
              "class": 'text-center'
            }, "Loading Todos...");
          });
          return _this.div({
            outlet: 'todoList'
          });
        };
      })(this));
    };

    function ShowTodoView(searchWorkspace) {
      this.searchWorkspace = searchWorkspace != null ? searchWorkspace : true;
      ShowTodoView.__super__.constructor.apply(this, arguments);
      this.disposables = new CompositeDisposable;
      this.matches = [];
      this.handleEvents();
    }

    ShowTodoView.prototype.handleEvents = function() {
      var pane;
      this.disposables.add(atom.commands.add(this.element, {
        'core:save-as': (function(_this) {
          return function(event) {
            event.stopPropagation();
            return _this.saveAs();
          };
        })(this),
        'core:refresh': (function(_this) {
          return function(event) {
            event.stopPropagation();
            return _this.getTodos();
          };
        })(this)
      }));
      pane = atom.workspace.getActivePane();
      if (atom.config.get('todo-show.rememberViewSize')) {
        this.restorePaneFlex(pane);
      }
      this.disposables.add(pane.observeFlexScale((function(_this) {
        return function(flexScale) {
          return _this.savePaneFlex(flexScale);
        };
      })(this)));
      this.saveAsButton.on('click', (function(_this) {
        return function() {
          return _this.saveAs();
        };
      })(this));
      return this.refreshButton.on('click', (function(_this) {
        return function() {
          return _this.getTodos();
        };
      })(this));
    };

    ShowTodoView.prototype.destroy = function() {
      var _ref1;
      this.cancelScan();
      if ((_ref1 = this.disposables) != null) {
        _ref1.dispose();
      }
      return this.detach();
    };

    ShowTodoView.prototype.savePaneFlex = function(flex) {
      return localStorage.setItem('todo-show.flex', flex);
    };

    ShowTodoView.prototype.restorePaneFlex = function(pane) {
      var flex;
      flex = localStorage.getItem('todo-show.flex');
      if (flex) {
        return pane.setFlexScale(parseFloat(flex));
      }
    };

    ShowTodoView.prototype.getTitle = function() {
      if (this.searchWorkspace) {
        return "Todo-Show Results";
      } else {
        return "Todo-Show Open Files";
      }
    };

    ShowTodoView.prototype.getIconName = function() {
      return "checklist";
    };

    ShowTodoView.prototype.getURI = function() {
      if (this.searchWorkspace) {
        return this.constructor.URI;
      } else {
        return this.constructor.URIopen;
      }
    };

    ShowTodoView.prototype.getProjectPath = function() {
      return atom.project.getPaths()[0];
    };

    ShowTodoView.prototype.getProjectName = function() {
      var _ref1;
      return (_ref1 = atom.project.getDirectories()[0]) != null ? _ref1.getBaseName() : void 0;
    };

    ShowTodoView.prototype.startLoading = function() {
      this.loading = true;
      this.matches = [];
      this.todoList.empty();
      return this.todoLoading.show();
    };

    ShowTodoView.prototype.stopLoading = function() {
      this.loading = false;
      return this.todoLoading.hide();
    };

    ShowTodoView.prototype.showError = function(message) {
      return atom.notifications.addError('todo-show', {
        detail: message,
        dismissable: true
      });
    };

    ShowTodoView.prototype.buildRegexLookups = function(regexes) {
      var i, regex, _i, _len, _results;
      if (regexes.length % 2) {
        this.showError("Invalid number of regexes: " + regexes.length);
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

    ShowTodoView.prototype.makeRegexObj = function(regexStr) {
      var flags, pattern, _ref1, _ref2;
      if (regexStr == null) {
        regexStr = '';
      }
      pattern = (_ref1 = regexStr.match(/\/(.+)\//)) != null ? _ref1[1] : void 0;
      flags = (_ref2 = regexStr.match(/\/(\w+$)/)) != null ? _ref2[1] : void 0;
      if (pattern) {
        return new RegExp(pattern, flags);
      } else {
        this.showError("Invalid regex: " + (regexStr || 'empty'));
        return false;
      }
    };

    ShowTodoView.prototype.handleScanMatch = function(match, regex) {
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
      return match;
    };

    ShowTodoView.prototype.fetchRegexItem = function(regexLookup) {
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
            if (_this.loading) {
              return _this.searchCount.text("" + nPaths + " paths searched...");
            }
          };
        })(this);
      }
      return atom.workspace.scan(regex, options, (function(_this) {
        return function(result, error) {
          var match, _i, _len, _ref1, _results;
          if (error) {
            console.debug(error.message);
          }
          if (!result) {
            return;
          }
          _ref1 = result.matches;
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            match = _ref1[_i];
            match.title = regexLookup.title;
            match.regex = regexLookup.regex;
            match.path = result.filePath;
            _results.push(_this.matches.push(_this.handleScanMatch(match, regex)));
          }
          return _results;
        };
      })(this));
    };

    ShowTodoView.prototype.fetchOpenRegexItem = function(regexLookup) {
      var deferred, editor, regex, _i, _len, _ref1;
      regex = this.makeRegexObj(regexLookup.regex);
      if (!regex) {
        return false;
      }
      deferred = Q.defer();
      _ref1 = atom.workspace.getTextEditors();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        editor = _ref1[_i];
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
            return _this.matches.push(_this.handleScanMatch(match, regex));
          };
        })(this));
      }
      deferred.resolve();
      return deferred.promise;
    };

    ShowTodoView.prototype.getTodos = function() {
      var promise, regexObj, regexes, _i, _len;
      this.startLoading();
      regexes = this.buildRegexLookups(atom.config.get('todo-show.findTheseRegexes'));
      this.searchPromises = [];
      for (_i = 0, _len = regexes.length; _i < _len; _i++) {
        regexObj = regexes[_i];
        if (this.searchWorkspace) {
          promise = this.fetchRegexItem(regexObj);
        } else {
          promise = this.fetchOpenRegexItem(regexObj);
        }
        this.searchPromises.push(promise);
      }
      Q.all(this.searchPromises).then((function(_this) {
        return function() {
          _this.stopLoading();
          return _this.renderTodos(_this.matches);
        };
      })(this));
      return this;
    };

    ShowTodoView.prototype.getIgnorePaths = function() {
      var ignore, ignores, _i, _len, _results;
      ignores = atom.config.get('todo-show.ignoreThesePaths');
      if (ignores == null) {
        return ['*'];
      }
      if (Object.prototype.toString.call(ignores) !== '[object Array]') {
        this.showError('ignoreThesePaths must be an array');
        return ['*'];
      }
      _results = [];
      for (_i = 0, _len = ignores.length; _i < _len; _i++) {
        ignore = ignores[_i];
        _results.push("!" + ignore);
      }
      return _results;
    };

    ShowTodoView.prototype.groupMatches = function(matches, cb) {
      var group, groupBy, iteratee, key, regexes, sortedMatches, _ref1, _results;
      regexes = atom.config.get('todo-show.findTheseRegexes');
      groupBy = atom.config.get('todo-show.groupMatchesBy');
      switch (groupBy) {
        case 'file':
          iteratee = 'relativePath';
          sortedMatches = _.sortBy(matches, iteratee);
          break;
        case 'none':
          sortedMatches = _.sortBy(matches, 'matchText');
          return cb(sortedMatches, groupBy);
        default:
          iteratee = 'title';
          sortedMatches = _.sortBy(matches, function(match) {
            return regexes.indexOf(match[iteratee]);
          });
      }
      _ref1 = _.groupBy(sortedMatches, iteratee);
      _results = [];
      for (key in _ref1) {
        if (!__hasProp.call(_ref1, key)) continue;
        group = _ref1[key];
        _results.push(cb(group, groupBy));
      }
      return _results;
    };

    ShowTodoView.prototype.renderTodos = function(matches) {
      if (!matches.length) {
        return this.todoList.append(new TodoEmptyView);
      }
      return this.groupMatches(matches, (function(_this) {
        return function(group, groupBy) {
          switch (groupBy) {
            case 'file':
              return _this.todoList.append(new TodoFileView(group));
            case 'none':
              return _this.todoList.append(new TodoNoneView(group));
            default:
              return _this.todoList.append(new TodoRegexView(group));
          }
        };
      })(this));
    };

    ShowTodoView.prototype.cancelScan = function() {
      var promise, _i, _len, _ref1, _results;
      _ref1 = this.searchPromises;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        promise = _ref1[_i];
        if (promise) {
          _results.push(promise.cancel());
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    ShowTodoView.prototype.getMarkdown = function(matches) {
      var markdown;
      markdown = [];
      this.groupMatches(matches, function(group, groupBy) {
        var match, out, _i, _j, _k, _len, _len1, _len2;
        switch (groupBy) {
          case 'file':
            out = "\n## " + (group[0].relativePath || 'Unknown File') + "\n\n";
            for (_i = 0, _len = group.length; _i < _len; _i++) {
              match = group[_i];
              out += "- " + (match.matchText || 'empty');
              if (match.title) {
                out += " `" + match.title + "`";
              }
              out += "\n";
            }
            break;
          case 'none':
            out = "\n## All Matches\n\n";
            for (_j = 0, _len1 = group.length; _j < _len1; _j++) {
              match = group[_j];
              out += "- " + (match.matchText || 'empty');
              if (match.title) {
                out += " _(" + match.title + ")_";
              }
              if (match.relativePath) {
                out += " `" + match.relativePath + "`";
              }
              if (match.range && match.range[0]) {
                out += " `:" + (match.range[0][0] + 1) + "`";
              }
              out += "\n";
            }
            break;
          default:
            out = "\n## " + (group[0].title || 'No Title') + "\n\n";
            for (_k = 0, _len2 = group.length; _k < _len2; _k++) {
              match = group[_k];
              out += "- " + (match.matchText || 'empty');
              if (match.relativePath) {
                out += " `" + match.relativePath + "`";
              }
              if (match.range && match.range[0]) {
                out += " `:" + (match.range[0][0] + 1) + "`";
              }
              out += "\n";
            }
        }
        return markdown.push(out);
      });
      return markdown.join('');
    };

    ShowTodoView.prototype.saveAs = function() {
      var filePath, outputFilePath, projectPath;
      if (this.loading) {
        return;
      }
      filePath = "" + (this.getProjectName() || 'todos') + ".md";
      if (projectPath = this.getProjectPath()) {
        filePath = path.join(projectPath, filePath);
      }
      if (outputFilePath = atom.showSaveDialogSync(filePath.toLowerCase())) {
        fs.writeFileSync(outputFilePath, this.getMarkdown(this.matches));
        return atom.workspace.open(outputFilePath);
      }
    };

    return ShowTodoView;

  })(ScrollView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy90b2RvLXNob3cvbGliL3Nob3ctdG9kby12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw2SEFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUFELENBQUE7O0FBQUEsRUFDQyxhQUFjLE9BQUEsQ0FBUSxzQkFBUixFQUFkLFVBREQsQ0FBQTs7QUFBQSxFQUVBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUZQLENBQUE7O0FBQUEsRUFHQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVIsQ0FITCxDQUFBOztBQUFBLEVBSUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUpKLENBQUE7O0FBQUEsRUFLQSxDQUFBLEdBQUksT0FBQSxDQUFRLEdBQVIsQ0FMSixDQUFBOztBQUFBLEVBT0EsT0FBNkQsT0FBQSxDQUFRLGtCQUFSLENBQTdELEVBQUMscUJBQUEsYUFBRCxFQUFnQixvQkFBQSxZQUFoQixFQUE4QixvQkFBQSxZQUE5QixFQUE0QyxxQkFBQSxhQVA1QyxDQUFBOztBQUFBLEVBU0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLG1DQUFBLENBQUE7O0FBQUEsSUFBQSxZQUFDLENBQUEsR0FBRCxHQUFNLHdCQUFOLENBQUE7O0FBQUEsSUFDQSxZQUFDLENBQUEsT0FBRCxHQUFVLDZCQURWLENBQUE7O0FBQUEsMkJBRUEsU0FBQSxHQUFXLEdBRlgsQ0FBQTs7QUFBQSxJQUlBLFlBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFPLHVDQUFQO0FBQUEsUUFBZ0QsUUFBQSxFQUFVLENBQUEsQ0FBMUQ7T0FBTCxFQUFt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

//# sourceURL=/home/gsmyrnaios/.atom/packages/todo-show/lib/show-todo-view.coffee
