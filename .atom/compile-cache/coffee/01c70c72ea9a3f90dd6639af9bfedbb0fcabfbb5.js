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
                  return _this.span(todo.lineText);
                case 'Text':
                  return _this.span(todo.matchText);
                case 'Type':
                  return _this.i(todo.title);
                case 'Range':
                  return _this.i(todo.rangeString);
                case 'Line':
                  return _this.i(todo.line);
                case 'Regex':
                  return _this.code(todo.regex);
                case 'File':
                  return _this.a(todo.relativePath);
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
          position = [todo.range[0][0], todo.range[0][1]];
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy90b2RvLXNob3cvbGliL3RvZG8taXRlbS12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw4Q0FBQTtJQUFBOztzRkFBQTs7QUFBQSxFQUFDLE9BQVEsT0FBQSxDQUFRLHNCQUFSLEVBQVIsSUFBRCxDQUFBOztBQUFBLEVBRU07QUFDSixzQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxlQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsV0FBRCxFQUFjLElBQWQsR0FBQTtBQUNSLFVBQUEsZUFBQTtBQUFBLE1BRHVCLGNBQUEsUUFBUSxlQUFBLE9BQy9CLENBQUE7YUFBQSxJQUFDLENBQUEsRUFBRCxDQUFJLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDRixjQUFBLHdCQUFBO0FBQUE7ZUFBQSxrREFBQTttQ0FBQTtBQUNFLDBCQUFBLEtBQUMsQ0FBQSxFQUFELENBQUksSUFBSixFQUFVLFNBQUEsR0FBQTtBQUNSLGNBQUEsSUFBRyxJQUFBLEtBQVEsTUFBUixJQUFtQixPQUF0QjtBQUNFLGdCQUFBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxrQkFBQSxPQUFBLEVBQU8sb0NBQVA7aUJBQUwsQ0FBQSxDQURGO2VBQUEsTUFBQTtBQUdFLGdCQUFBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxrQkFBQSxPQUFBLEVBQU8sNkJBQVA7aUJBQUwsQ0FBQSxDQUhGO2VBQUE7QUFJQSxjQUFBLElBQUcsSUFBQSxLQUFRLE1BQVIsSUFBbUIsQ0FBQSxPQUF0Qjt1QkFDRSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsa0JBQUEsT0FBQSxFQUFPLG1DQUFQO2lCQUFMLEVBREY7ZUFBQSxNQUFBO3VCQUdFLEtBQUMsQ0FBQSxHQUFELENBQUs7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

//# sourceURL=/home/gsmyrnaios/.atom/packages/todo-show/lib/todo-item-view.coffee
