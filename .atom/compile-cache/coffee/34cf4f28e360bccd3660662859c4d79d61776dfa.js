(function() {
  var CompositeDisposable, ShowTodoView;

  CompositeDisposable = require('atom').CompositeDisposable;

  ShowTodoView = require('./show-todo-view');

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
      openListInDirection: {
        type: 'string',
        "default": 'right',
        "enum": ['up', 'right', 'down', 'left', 'ontop']
      },
      groupMatchesBy: {
        type: 'string',
        "default": 'regex',
        "enum": ['regex', 'file', 'none']
      },
      rememberViewSize: {
        type: 'boolean',
        "default": true
      }
    },
    activate: function() {
      this.disposables = new CompositeDisposable;
      this.disposables.add(atom.commands.add('atom-workspace', {
        'todo-show:find-in-project': (function(_this) {
          return function() {
            return _this.show(ShowTodoView.URI);
          };
        })(this),
        'todo-show:find-in-open-files': (function(_this) {
          return function() {
            return _this.show(ShowTodoView.URIopen);
          };
        })(this)
      }));
      return this.disposables.add(atom.workspace.addOpener(function(uriToOpen) {
        switch (uriToOpen) {
          case ShowTodoView.URI:
            return new ShowTodoView(true).getTodos();
          case ShowTodoView.URIopen:
            return new ShowTodoView(false).getTodos();
        }
      }));
    },
    deactivate: function() {
      var _ref, _ref1;
      if ((_ref = this.paneDisposables) != null) {
        _ref.dispose();
      }
      return (_ref1 = this.disposables) != null ? _ref1.dispose() : void 0;
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
      }).done((function(_this) {
        return function(showTodoView) {
          _this.showTodoView = showTodoView;
          return prevPane.activate();
        };
      })(this));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy90b2RvLXNob3cvbGliL3Nob3ctdG9kby5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsaUNBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUVBLFlBQUEsR0FBZSxPQUFBLENBQVEsa0JBQVIsQ0FGZixDQUFBOztBQUFBLEVBSUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsTUFBQSxFQUVFO0FBQUEsTUFBQSxnQkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sT0FBTjtBQUFBLFFBRUEsU0FBQSxFQUFTLENBQ1AsUUFETyxFQUVQLDZCQUZPLEVBR1AsT0FITyxFQUlQLDRCQUpPLEVBS1AsVUFMTyxFQU1QLCtCQU5PLEVBT1AsTUFQTyxFQVFQLDJCQVJPLEVBU1AsT0FUTyxFQVVQLDRCQVZPLEVBV1AsT0FYTyxFQVlQLDRCQVpPLEVBYVAsT0FiTyxFQWNQLDRCQWRPLEVBZVAsU0FmTyxFQWdCUCw4QkFoQk8sQ0FGVDtBQUFBLFFBb0JBLEtBQUEsRUFDRTtBQUFBLFVBQUEsSUFBQSxFQUFNLFFBQU47U0FyQkY7T0FERjtBQUFBLE1Bd0JBLGdCQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxPQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsQ0FDUCxrQkFETyxFQUVQLFlBRk8sRUFHUCxzQkFITyxDQURUO0FBQUEsUUFNQSxLQUFBLEVBQ0U7QUFBQSxVQUFBLElBQUEsRUFBTSxRQUFOO1NBUEY7T0F6QkY7QUFBQSxNQWtDQSxtQkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLE9BRFQ7QUFBQSxRQUVBLE1BQUEsRUFBTSxDQUFDLElBQUQs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

//# sourceURL=/home/gsmyrnaios/.atom/packages/todo-show/lib/show-todo.coffee
