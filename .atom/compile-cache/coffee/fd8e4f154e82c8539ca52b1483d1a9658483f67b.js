(function() {
  var BaseView, TodoEmptyView, TodoFileView, TodoNoneView, TodoRegexView, View,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom-space-pen-views').View;

  BaseView = (function(_super) {
    __extends(BaseView, _super);

    function BaseView() {
      return BaseView.__super__.constructor.apply(this, arguments);
    }

    BaseView.prototype.initialize = function() {
      return this.handleEvents();
    };

    BaseView.prototype.destroy = function() {
      return this.detach();
    };

    BaseView.prototype.moveCursorTo = function(cursorCoords) {
      var charNumber, lineNumber, position, textEditor;
      lineNumber = parseInt(cursorCoords[0]);
      charNumber = parseInt(cursorCoords[1]);
      if (textEditor = atom.workspace.getActiveTextEditor()) {
        position = [lineNumber, charNumber];
        textEditor.setCursorBufferPosition(position, {
          autoscroll: false
        });
        return textEditor.scrollToCursorPosition({
          center: true
        });
      }
    };

    BaseView.prototype.openPath = function(filePath, cursorCoords) {
      if (!filePath) {
        return;
      }
      return atom.workspace.open(filePath, {
        split: 'left'
      }).done((function(_this) {
        return function() {
          return _this.moveCursorTo(cursorCoords);
        };
      })(this));
    };

    BaseView.prototype.handleEvents = function() {
      return this.on('click', '.todo-url', (function(_this) {
        return function(e) {
          var link;
          link = e.target;
          return _this.openPath(link.dataset.uri, link.dataset.coords.split(','));
        };
      })(this));
    };

    return BaseView;

  })(View);

  TodoRegexView = (function(_super) {
    __extends(TodoRegexView, _super);

    function TodoRegexView() {
      return TodoRegexView.__super__.constructor.apply(this, arguments);
    }

    TodoRegexView.content = function(matches) {
      return this.section((function(_this) {
        return function() {
          _this.h1(function() {
            _this.span("" + matches[0].title + " ");
            return _this.span({
              "class": 'regex'
            }, matches[0].regex);
          });
          return _this.table(function() {
            var match, _i, _len, _results;
            _results = [];
            for (_i = 0, _len = matches.length; _i < _len; _i++) {
              match = matches[_i];
              _results.push(_this.tr(function() {
                _this.td(match.matchText);
                return _this.td(function() {
                  return _this.a({
                    "class": 'todo-url',
                    'data-uri': match.path,
                    'data-coords': match.rangeString
                  }, match.relativePath);
                });
              }));
            }
            return _results;
          });
        };
      })(this));
    };

    return TodoRegexView;

  })(BaseView);

  TodoFileView = (function(_super) {
    __extends(TodoFileView, _super);

    function TodoFileView() {
      return TodoFileView.__super__.constructor.apply(this, arguments);
    }

    TodoFileView.content = function(matches) {
      return this.section((function(_this) {
        return function() {
          _this.h1(function() {
            return _this.span("" + matches[0].relativePath);
          });
          return _this.table(function() {
            var match, _i, _len, _results;
            _results = [];
            for (_i = 0, _len = matches.length; _i < _len; _i++) {
              match = matches[_i];
              _results.push(_this.tr(function() {
                _this.td(match.matchText);
                return _this.td(function() {
                  return _this.a({
                    "class": 'todo-url',
                    'data-uri': match.path,
                    'data-coords': match.rangeString
                  }, match.title);
                });
              }));
            }
            return _results;
          });
        };
      })(this));
    };

    return TodoFileView;

  })(BaseView);

  TodoNoneView = (function(_super) {
    __extends(TodoNoneView, _super);

    function TodoNoneView() {
      return TodoNoneView.__super__.constructor.apply(this, arguments);
    }

    TodoNoneView.content = function(matches) {
      return this.section((function(_this) {
        return function() {
          _this.h1("All Matches");
          return _this.table(function() {
            var match, _i, _len, _results;
            _results = [];
            for (_i = 0, _len = matches.length; _i < _len; _i++) {
              match = matches[_i];
              _results.push(_this.tr(function() {
                _this.td(function() {
                  _this.span("" + match.matchText + " ");
                  return _this.i("(" + match.title + ")");
                });
                return _this.td(function() {
                  return _this.a({
                    "class": 'todo-url',
                    'data-uri': match.path,
                    'data-coords': match.rangeString
                  }, match.relativePath);
                });
              }));
            }
            return _results;
          });
        };
      })(this));
    };

    return TodoNoneView;

  })(BaseView);

  TodoEmptyView = (function(_super) {
    __extends(TodoEmptyView, _super);

    function TodoEmptyView() {
      return TodoEmptyView.__super__.constructor.apply(this, arguments);
    }

    TodoEmptyView.content = function() {
      return this.section((function(_this) {
        return function() {
          _this.h1("No results");
          return _this.table(function() {
            return _this.tr(function() {
              return _this.td(function() {
                _this.h5("Did not find any todos. Searched for:");
                _this.ul(function() {
                  var regex, _i, _len, _ref, _results;
                  _ref = atom.config.get('todo-show.findTheseRegexes');
                  _results = [];
                  for (_i = 0, _len = _ref.length; _i < _len; _i += 2) {
                    regex = _ref[_i];
                    _results.push(_this.li(regex));
                  }
                  return _results;
                });
                return _this.h5("Use your configuration to add more patterns.");
              });
            });
          });
        };
      })(this));
    };

    return TodoEmptyView;

  })(View);

  module.exports = {
    TodoRegexView: TodoRegexView,
    TodoFileView: TodoFileView,
    TodoNoneView: TodoNoneView,
    TodoEmptyView: TodoEmptyView
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy90b2RvLXNob3cvbGliL3RvZG8taXRlbS12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx3RUFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUMsT0FBUSxPQUFBLENBQVEsc0JBQVIsRUFBUixJQUFELENBQUE7O0FBQUEsRUFFTTtBQUNKLCtCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSx1QkFBQSxVQUFBLEdBQVksU0FBQSxHQUFBO2FBQ1YsSUFBQyxDQUFBLFlBQUQsQ0FBQSxFQURVO0lBQUEsQ0FBWixDQUFBOztBQUFBLHVCQUdBLE9BQUEsR0FBUyxTQUFBLEdBQUE7YUFDUCxJQUFDLENBQUEsTUFBRCxDQUFBLEVBRE87SUFBQSxDQUhULENBQUE7O0FBQUEsdUJBT0EsWUFBQSxHQUFjLFNBQUMsWUFBRCxHQUFBO0FBQ1osVUFBQSw0Q0FBQTtBQUFBLE1BQUEsVUFBQSxHQUFhLFFBQUEsQ0FBUyxZQUFhLENBQUEsQ0FBQSxDQUF0QixDQUFiLENBQUE7QUFBQSxNQUNBLFVBQUEsR0FBYSxRQUFBLENBQVMsWUFBYSxDQUFBLENBQUEsQ0FBdEIsQ0FEYixDQUFBO0FBR0EsTUFBQSxJQUFHLFVBQUEsR0FBYSxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsQ0FBaEI7QUFDRSxRQUFBLFFBQUEsR0FBVyxDQUFDLFVBQUQsRUFBYSxVQUFiLENBQVgsQ0FBQTtBQUFBLFFBQ0EsVUFBVSxDQUFDLHVCQUFYLENBQW1DLFFBQW5DLEVBQTZDO0FBQUEsVUFBQSxVQUFBLEVBQVksS0FBWjtTQUE3QyxDQURBLENBQUE7ZUFFQSxVQUFVLENBQUMsc0JBQVgsQ0FBa0M7QUFBQSxVQUFBLE1BQUEsRUFBUSxJQUFSO1NBQWxDLEVBSEY7T0FKWTtJQUFBLENBUGQsQ0FBQTs7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

//# sourceURL=/home/gsmyrnaios/.atom/packages/todo-show/lib/todo-item-view.coffee
