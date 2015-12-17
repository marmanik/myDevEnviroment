(function() {
  var TableHeaderView, TodoEmptyView, TodoView, View,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  View = require('atom-space-pen-views').View;

  TableHeaderView = (function(_super) {
    __extends(TableHeaderView, _super);

    function TableHeaderView() {
      return TableHeaderView.__super__.constructor.apply(this, arguments);
    }

    TableHeaderView.content = function(showInTable, _arg) {
      var sortAsc, sortBy;
      if (showInTable == null) {
        showInTable = [];
      }
      sortBy = _arg.sortBy, sortAsc = _arg.sortAsc;
      return this.tr((function(_this) {
        return function() {
          var item, _i, _len, _results;
          _results = [];
          for (_i = 0, _len = showInTable.length; _i < _len; _i++) {
            item = showInTable[_i];
            _results.push(_this.th(item, function() {
              if (item === sortBy && sortAsc) {
                _this.div({
                  "class": 'sort-asc icon-triangle-down active'
                });
              } else {
                _this.div({
                  "class": 'sort-asc icon-triangle-down'
                });
              }
              if (item === sortBy && !sortAsc) {
                return _this.div({
                  "class": 'sort-desc icon-triangle-up active'
                });
              } else {
                return _this.div({
                  "class": 'sort-desc icon-triangle-up'
                });
              }
            }));
          }
          return _results;
        };
      })(this));
    };

    return TableHeaderView;

  })(View);

  TodoView = (function(_super) {
    __extends(TodoView, _super);

    function TodoView() {
      this.openPath = __bind(this.openPath, this);
      return TodoView.__super__.constructor.apply(this, arguments);
    }

    TodoView.content = function(showInTable, todo) {
      return this.tr((function(_this) {
        return function() {
          var item, _i, _len, _results;
          _results = [];
          for (_i = 0, _len = showInTable.length; _i < _len; _i++) {
            item = showInTable[_i];
            _results.push(_this.td(function() {
              switch (item) {
                case 'All':
                  return _this.span(todo.all);
                case 'Text':
                  return _this.span(todo.text);
                case 'Type':
                  return _this.i(todo.type);
                case 'Range':
                  return _this.i(todo.range);
                case 'Line':
                  return _this.i(todo.line);
                case 'Regex':
                  return _this.code(todo.regex);
                case 'File':
                  return _this.a(todo.file);
              }
            }));
          }
          return _results;
        };
      })(this));
    };

    TodoView.prototype.initialize = function(showInTable, todo) {
      this.todo = todo;
      return this.handleEvents();
    };

    TodoView.prototype.destroy = function() {
      return this.detach();
    };

    TodoView.prototype.handleEvents = function() {
      return this.on('click', 'td', this.openPath);
    };

    TodoView.prototype.openPath = function() {
      var todo;
      if (!(todo = this.todo)) {
        return;
      }
      return atom.workspace.open(todo.path, {
        split: 'left'
      }).then(function() {
        var position, textEditor;
        if (textEditor = atom.workspace.getActiveTextEditor()) {
          position = [todo.position[0][0], todo.position[0][1]];
          textEditor.setCursorBufferPosition(position, {
            autoscroll: false
          });
          return textEditor.scrollToCursorPosition({
            center: true
          });
        }
      });
    };

    return TodoView;

  })(View);

  TodoEmptyView = (function(_super) {
    __extends(TodoEmptyView, _super);

    function TodoEmptyView() {
      return TodoEmptyView.__super__.constructor.apply(this, arguments);
    }

    TodoEmptyView.content = function(showInTable) {
      if (showInTable == null) {
        showInTable = [];
      }
      return this.tr((function(_this) {
        return function() {
          return _this.td({
            colspan: showInTable.length
          }, function() {
            return _this.p("No results...");
          });
        };
      })(this));
    };

    return TodoEmptyView;

  })(View);

  module.exports = {
    TableHeaderView: TableHeaderView,
    TodoView: TodoView,
    TodoEmptyView: TodoEmptyView
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy90b2RvLXNob3cvbGliL3RvZG8taXRlbS12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw4Q0FBQTtJQUFBOztzRkFBQTs7QUFBQSxFQUFDLE9BQVEsT0FBQSxDQUFRLHNCQUFSLEVBQVIsSUFBRCxDQUFBOztBQUFBLEVBRU07QUFDSixzQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxlQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsV0FBRCxFQUFtQixJQUFuQixHQUFBO0FBQ1IsVUFBQSxlQUFBOztRQURTLGNBQWM7T0FDdkI7QUFBQSxNQUQ0QixjQUFBLFFBQVEsZUFBQSxPQUNwQyxDQUFBO2FBQUEsSUFBQyxDQUFBLEVBQUQsQ0FBSSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ0YsY0FBQSx3QkFBQTtBQUFBO2VBQUEsa0RBQUE7bUNBQUE7QUFDRSwwQkFBQSxLQUFDLENBQUEsRUFBRCxDQUFJLElBQUosRUFBVSxTQUFBLEdBQUE7QUFDUixjQUFBLElBQUcsSUFBQSxLQUFRLE1BQVIsSUFBbUIsT0FBdEI7QUFDRSxnQkFBQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsa0JBQUEsT0FBQSxFQUFPLG9DQUFQO2lCQUFMLENBQUEsQ0FERjtlQUFBLE1BQUE7QUFHRSxnQkFBQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsa0JBQUEsT0FBQSxFQUFPLDZCQUFQO2lCQUFMLENBQUEsQ0FIRjtlQUFBO0FBSUEsY0FBQSxJQUFHLElBQUEsS0FBUSxNQUFSLElBQW1CLENBQUEsT0FBdEI7dUJBQ0UsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLGtCQUFBLE9BQUEsRUFBTyxtQ0FBUDtpQkFBTCxFQURGO2VBQUEsTUFBQTt1QkFHRSxL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

//# sourceURL=/home/gsmyrnaios/.atom/packages/todo-show/lib/todo-item-view.coffee
