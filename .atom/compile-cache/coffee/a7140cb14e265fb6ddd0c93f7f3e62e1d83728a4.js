(function() {
  var $, CompositeDisposable, ShowTodoView, TableHeaderView, TodoEmptyView, TodoView, View, _ref, _ref1,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  CompositeDisposable = require('atom').CompositeDisposable;

  _ref = require('atom-space-pen-views'), View = _ref.View, $ = _ref.$;

  _ref1 = require('./todo-item-view'), TableHeaderView = _ref1.TableHeaderView, TodoView = _ref1.TodoView, TodoEmptyView = _ref1.TodoEmptyView;

  module.exports = ShowTodoView = (function(_super) {
    __extends(ShowTodoView, _super);

    function ShowTodoView() {
      this.renderTable = __bind(this.renderTable, this);
      this.clearTodos = __bind(this.clearTodos, this);
      this.renderTodo = __bind(this.renderTodo, this);
      this.tableHeaderClicked = __bind(this.tableHeaderClicked, this);
      this.initTable = __bind(this.initTable, this);
      return ShowTodoView.__super__.constructor.apply(this, arguments);
    }

    ShowTodoView.content = function() {
      return this.div({
        "class": 'todo-table',
        tabindex: -1
      }, (function(_this) {
        return function() {
          return _this.table({
            outlet: 'table',
            "class": 'todo-table'
          });
        };
      })(this));
    };

    ShowTodoView.prototype.initialize = function(model) {
      this.model = model;
      this.disposables = new CompositeDisposable;
      this.disposables.add(atom.config.onDidChange('todo-show.showInTable', (function(_this) {
        return function(_arg) {
          var newValue, oldValue;
          newValue = _arg.newValue, oldValue = _arg.oldValue;
          _this.showInTable = newValue;
          return _this.renderTable();
        };
      })(this)));
      this.disposables.add(atom.config.onDidChange('todo-show.sortBy', (function(_this) {
        return function(_arg) {
          var newValue, oldValue;
          newValue = _arg.newValue, oldValue = _arg.oldValue;
          return _this.sort(_this.sortBy = newValue, _this.sortAsc);
        };
      })(this)));
      this.disposables.add(atom.config.onDidChange('todo-show.sortAscending', (function(_this) {
        return function(_arg) {
          var newValue, oldValue;
          newValue = _arg.newValue, oldValue = _arg.oldValue;
          return _this.sort(_this.sortBy, _this.sortAsc = newValue);
        };
      })(this)));
      return this.handleEvents();
    };

    ShowTodoView.prototype.handleEvents = function() {
      this.disposables.add(this.model.onDidFinishSearch(this.initTable));
      this.disposables.add(this.model.onDidRemoveTodo(this.removeTodo));
      this.disposables.add(this.model.onDidClear(this.clearTodos));
      this.disposables.add(this.model.onDidSortTodos(this.renderTable));
      this.disposables.add(this.model.onDidChangeSearchScope((function(_this) {
        return function() {
          return _this.model.search();
        };
      })(this)));
      return this.on('click', 'th', this.tableHeaderClicked);
    };

    ShowTodoView.prototype.detached = function() {
      this.disposables.dispose();
      return this.empty();
    };

    ShowTodoView.prototype.initTable = function() {
      this.showInTable = atom.config.get('todo-show.showInTable');
      this.sortBy = atom.config.get('todo-show.sortBy');
      this.sortAsc = atom.config.get('todo-show.sortAscending');
      return this.sort(this.sortBy, this.sortAsc);
    };

    ShowTodoView.prototype.renderTableHeader = function() {
      return this.table.append(new TableHeaderView(this.showInTable, {
        sortBy: this.sortBy,
        sortAsc: this.sortAsc
      }));
    };

    ShowTodoView.prototype.tableHeaderClicked = function(e) {
      var item, sortAsc;
      item = e.target.innerText;
      sortAsc = this.sortBy === item ? !this.sortAsc : true;
      atom.config.set('todo-show.sortBy', item);
      return atom.config.set('todo-show.sortAscending', sortAsc);
    };

    ShowTodoView.prototype.renderTodo = function(todo) {
      return this.table.append(new TodoView(this.showInTable, todo));
    };

    ShowTodoView.prototype.removeTodo = function(todo) {
      return console.log('removeTodo');
    };

    ShowTodoView.prototype.clearTodos = function() {
      return this.table.empty();
    };

    ShowTodoView.prototype.renderTable = function() {
      var todo, todos, _i, _len, _ref2;
      this.clearTodos();
      this.renderTableHeader();
      _ref2 = todos = this.model.getTodos();
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        todo = _ref2[_i];
        this.renderTodo(todo);
      }
      if (!todos.length) {
        return this.table.append(new TodoEmptyView(this.showInTable));
      }
    };

    ShowTodoView.prototype.sort = function(sortBy, sortAsc) {
      return this.model.sortTodos({
        sortBy: sortBy,
        sortAsc: sortAsc
      });
    };

    return ShowTodoView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy90b2RvLXNob3cvbGliL3Nob3ctdG9kby10YWJsZS12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxpR0FBQTtJQUFBOzttU0FBQTs7QUFBQSxFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFBRCxDQUFBOztBQUFBLEVBQ0EsT0FBWSxPQUFBLENBQVEsc0JBQVIsQ0FBWixFQUFDLFlBQUEsSUFBRCxFQUFPLFNBQUEsQ0FEUCxDQUFBOztBQUFBLEVBR0EsUUFBNkMsT0FBQSxDQUFRLGtCQUFSLENBQTdDLEVBQUMsd0JBQUEsZUFBRCxFQUFrQixpQkFBQSxRQUFsQixFQUE0QixzQkFBQSxhQUg1QixDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLG1DQUFBLENBQUE7Ozs7Ozs7OztLQUFBOztBQUFBLElBQUEsWUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8sWUFBUDtBQUFBLFFBQXFCLFFBQUEsRUFBVSxDQUFBLENBQS9CO09BQUwsRUFBd0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFDdEMsS0FBQyxDQUFBLEtBQUQsQ0FBTztBQUFBLFlBQUEsTUFBQSxFQUFRLE9BQVI7QUFBQSxZQUFpQixPQUFBLEVBQU8sWUFBeEI7V0FBUCxFQURzQztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXhDLEVBRFE7SUFBQSxDQUFWLENBQUE7O0FBQUEsMkJBSUEsVUFBQSxHQUFZLFNBQUUsS0FBRixHQUFBO0FBQ1YsTUFEVyxJQUFDLENBQUEsUUFBQSxLQUNaLENBQUE7QUFBQSxNQUFBLElBQUMs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

//# sourceURL=/home/gsmyrnaios/.atom/packages/todo-show/lib/show-todo-table-view.coffee
