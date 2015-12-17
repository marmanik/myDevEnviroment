(function() {
  var ShowTodoView, TodosModel, path;

  path = require('path');

  ShowTodoView = require('../lib/show-todo-view');

  TodosModel = require('../lib/todos-model');

  describe("Show Todo View", function() {
    var model, showTodoView, _ref;
    _ref = [], showTodoView = _ref[0], model = _ref[1];
    beforeEach(function() {
      var uri;
      model = new TodosModel;
      uri = 'atom://todo-show/todos';
      showTodoView = new ShowTodoView(model, uri);
      return atom.project.setPaths([path.join(__dirname, 'fixtures/sample1')]);
    });
    return describe("Basic view properties", function() {
      return it("has a title, uri, etc.", function() {
        expect(showTodoView.getTitle()).toEqual('Todo-Show Results');
        expect(showTodoView.getIconName()).toEqual('checklist');
        expect(showTodoView.getURI()).toEqual('atom://todo-show/todos');
        return expect(showTodoView.find('.btn-group')).toExist();
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy90b2RvLXNob3cvc3BlYy9zaG93LXRvZG8tdmlldy1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw4QkFBQTs7QUFBQSxFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUFQLENBQUE7O0FBQUEsRUFFQSxZQUFBLEdBQWUsT0FBQSxDQUFRLHVCQUFSLENBRmYsQ0FBQTs7QUFBQSxFQUdBLFVBQUEsR0FBYSxPQUFBLENBQVEsb0JBQVIsQ0FIYixDQUFBOztBQUFBLEVBS0EsUUFBQSxDQUFTLGdCQUFULEVBQTJCLFNBQUEsR0FBQTtBQUN6QixRQUFBLHlCQUFBO0FBQUEsSUFBQSxPQUF3QixFQUF4QixFQUFDLHNCQUFELEVBQWUsZUFBZixDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsVUFBQSxHQUFBO0FBQUEsTUFBQSxLQUFBLEdBQVEsR0FBQSxDQUFBLFVBQVIsQ0FBQTtBQUFBLE1BQ0EsR0FBQSxHQUFNLHdCQUROLENBQUE7QUFBQSxNQUVBLFlBQUEsR0FBbUIsSUFBQSxZQUFBLENBQWEsS0FBYixFQUFvQixHQUFwQixDQUZuQixDQUFBO2FBR0EsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFiLENBQXNCLENBQUMsSUFBSSxDQUFDLElBQUwsQ0FBVSxTQUFWLEVBQXFCLGtCQUFyQixDQUFELENBQXRCLEVBSlM7SUFBQSxDQUFYLENBRkEsQ0FBQTtXQVFBLFFBQUEsQ0FBUyx1QkFBVCxFQUFrQyxTQUFBLEdBQUE7YUFDaEMsRUFBQSxDQUFHLHdCQUFILEVBQTZCLFNBQUEsR0FBQTtBQUMzQixRQUFBLE1BQUEsQ0FBTyxZQUFZLENBQUMsUUFBYixDQUFBLENBQVAsQ0FBK0IsQ0FBQyxPQUFoQyxDQUF3QyxtQkFBeEMsQ0FBQSxDQUFBO0FBQUEsUUFDQSxNQUFBLENBQU8sWUFBWSxDQUFDLFdBQWIsQ0FBQSxDQUFQLENBQWtDLENBQUMsT0FBbkMsQ0FBMkMsV0FBM0MsQ0FEQSxDQUFBO0FBQUEsUUFFQSxNQUFBLENBQU8sWUFBWSxDQUFDLE1BQWIsQ0FBQSxDQUFQLENBQTZCLENBQUMsT0FBOUIsQ0FBc0Msd0JBQXRDLENBRkEsQ0FBQTtlQUdBLE1BQUEsQ0FBTyxZQUFZLENBQUMsSUFBYixDQUFrQixZQUFsQixDQUFQLENBQXVDLENBQUMsT0FBeEMsQ0FBQSxFQUoyQjtNQUFBLENBQTdCLEVBRGdDO0lBQUEsQ0FBbEMsRUFUeUI7RUFBQSxDQUEzQixDQUxBLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/gsmyrnaios/.atom/packages/todo-show/spec/show-todo-view-spec.coffee
