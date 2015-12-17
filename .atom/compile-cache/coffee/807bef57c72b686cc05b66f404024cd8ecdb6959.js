(function() {
  var CompositeDisposable, ShowTodoView, TodosModel;

  CompositeDisposable = require('atom').CompositeDisposable;

  ShowTodoView = require('./show-todo-view');

  TodosModel = require('./todos-model');

  module.exports = {
    config: {
      findTheseRegexes: {
        type: 'array',
        "default": ['FIXMEs', '/\\bFIXME:?\\d*($|\\s.*$)/g', 'TODOs', '/\\bTODO:?\\d*($|\\s.*$)/g', 'CHANGEDs', '/\\bCHANGED:?\\d*($|\\s.*$)/g', 'XXXs', '/\\bXXX:?\\d*($|\\s.*$)/g', 'IDEAs', '/\\bIDEA:?\\d*($|\\s.*$)/g', 'HACKs', '/\\bHACK:?\\d*($|\\s.*$)/g', 'NOTEs', '/\\bNOTE:?\\d*($|\\s.*$)/g', 'REVIEWs', '/\\bREVIEW:?\\d*($|\\s.*$)/g'],
        items: {
          type: 'string'
        }
      },
      ignoreThesePaths: {
        type: 'array',
        "default": ['**/node_modules/', '**/vendor/', '**/bower_components/'],
        items: {
          type: 'string'
        }
      },
      showInTable: {
        type: 'array',
        "default": ['Text', 'Type', 'File']
      },
      sortBy: {
        type: 'string',
        "default": 'Text',
        "enum": ['All', 'Text', 'Type', 'Range', 'Line', 'Regex', 'File']
      },
      sortAscending: {
        type: 'boolean',
        "default": true
      },
      openListInDirection: {
        type: 'string',
        "default": 'right',
        "enum": ['up', 'right', 'down', 'left', 'ontop']
      },
      rememberViewSize: {
        type: 'boolean',
        "default": true
      }
    },
    URI: {
      full: 'atom://todo-show/todos',
      open: 'atom://todo-show/open-todos',
      active: 'atom://todo-show/active-todos'
    },
    activate: function() {
      var model;
      model = new TodosModel;
      model.setAvailableTableItems(this.config.sortBy["enum"]);
      this.disposables = new CompositeDisposable;
      this.disposables.add(atom.commands.add('atom-workspace', {
        'todo-show:find-in-project': (function(_this) {
          return function() {
            return _this.show(_this.URI.full);
          };
        })(this),
        'todo-show:find-in-open-files': (function(_this) {
          return function() {
            return _this.show(_this.URI.open);
          };
        })(this)
      }));
      return this.disposables.add(atom.workspace.addOpener((function(_this) {
        return function(uriToOpen) {
          var scope;
          scope = (function() {
            switch (uriToOpen) {
              case this.URI.full:
                return 'full';
              case this.URI.open:
                return 'open';
              case this.URI.active:
                return 'active';
            }
          }).call(_this);
          if (scope) {
            model.setSearchScope(scope);
            return new ShowTodoView(model, uriToOpen);
          }
        };
      })(this)));
    },
    deactivate: function() {
      var _ref;
      return (_ref = this.disposables) != null ? _ref.dispose() : void 0;
    },
    destroyPaneItem: function() {
      var pane;
      pane = atom.workspace.paneForItem(this.showTodoView);
      if (!pane) {
        return false;
      }
      pane.destroyItem(this.showTodoView);
      if (pane.getItems().length === 0) {
        pane.destroy();
      }
      return true;
    },
    show: function(uri) {
      var direction, prevPane;
      prevPane = atom.workspace.getActivePane();
      direction = atom.config.get('todo-show.openListInDirection');
      if (this.destroyPaneItem()) {
        return;
      }
      if (direction === 'down') {
        if (prevPane.parent.orientation !== 'vertical') {
          prevPane.splitDown();
        }
      } else if (direction === 'up') {
        if (prevPane.parent.orientation !== 'vertical') {
          prevPane.splitUp();
        }
      }
      return atom.workspace.open(uri, {
        split: direction
      }).then((function(_this) {
        return function(showTodoView) {
          _this.showTodoView = showTodoView;
          return prevPane.activate();
        };
      })(this));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy90b2RvLXNob3cvbGliL3Nob3ctdG9kby5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsNkNBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUVBLFlBQUEsR0FBZSxPQUFBLENBQVEsa0JBQVIsQ0FGZixDQUFBOztBQUFBLEVBR0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSLENBSGIsQ0FBQTs7QUFBQSxFQUtBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLE1BQUEsRUFDRTtBQUFBLE1BQUEsZ0JBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLE9BQU47QUFBQSxRQUdBLFNBQUEsRUFBUyxDQUNQLFFBRE8sRUFFUCw2QkFGTyxFQUdQLE9BSE8sRUFJUCw0QkFKTyxFQUtQLFVBTE8sRUFNUCwrQkFOTyxFQU9QLE1BUE8sRUFRUCwyQkFSTyxFQVNQLE9BVE8sRUFVUCw0QkFWTyxFQVdQLE9BWE8sRUFZUCw0QkFaTyxFQWFQLE9BYk8sRUFjUCw0QkFkTyxFQWVQLFNBZk8sRUFnQlAsOEJBaEJPLENBSFQ7QUFBQSxRQXFCQSxLQUFBLEVBQ0U7QUFBQSxVQUFBLElBQUEsRUFBTSxRQUFOO1NBdEJGO09BREY7QUFBQSxNQXdCQSxnQkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sT0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLENBQ1Asa0JBRE8sRUFFUCxZQUZPLEVBR1Asc0JBSE8sQ0FEVDtBQUFBLFFBTUEsS0FBQSxFQUNFO0FBQUEsVUFBQSxJQUFBLEVBQU0sUUFBTjtTQVBGO09BekJGO0FBQUEsTUFpQ0EsV0FBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sT0FBTjtBQUFBLFFBQ0Es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

//# sourceURL=/home/gsmyrnaios/.atom/packages/todo-show/lib/show-todo.coffee
