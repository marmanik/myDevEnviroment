(function() {
  var CompositeDisposable, ScrollView, ShowTodoView, TodoOptions, TodoTable, fs, path,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  CompositeDisposable = require('atom').CompositeDisposable;

  ScrollView = require('atom-space-pen-views').ScrollView;

  path = require('path');

  fs = require('fs-plus');

  TodoTable = require('./show-todo-table-view');

  TodoOptions = require('./show-todo-options-view');

  module.exports = ShowTodoView = (function(_super) {
    __extends(ShowTodoView, _super);

    function ShowTodoView() {
      this.toggleOptions = __bind(this.toggleOptions, this);
      this.setScopeButtonState = __bind(this.setScopeButtonState, this);
      this.toggleSearchScope = __bind(this.toggleSearchScope, this);
      this.saveAs = __bind(this.saveAs, this);
      this.stopLoading = __bind(this.stopLoading, this);
      this.startLoading = __bind(this.startLoading, this);
      return ShowTodoView.__super__.constructor.apply(this, arguments);
    }

    ShowTodoView.content = function(model) {
      this.model = model;
      return this.div({
        "class": 'show-todo-preview native-key-bindings',
        tabindex: -1
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'text-right'
          }, function() {
            return _this.div({
              "class": 'btn-group'
            }, function() {
              _this.button({
                outlet: 'scopeButton',
                "class": 'btn'
              });
              _this.button({
                outlet: 'optionsButton',
                "class": 'btn icon-gear'
              });
              _this.button({
                outlet: 'saveAsButton',
                "class": 'btn icon-cloud-download'
              });
              return _this.button({
                outlet: 'refreshButton',
                "class": 'btn icon-sync'
              });
            });
          });
          _this.div({
            outlet: 'optionsView'
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
          return _this.subview('todoTable', new TodoTable(_this.model));
        };
      })(this));
    };

    ShowTodoView.prototype.initialize = function(model, uri) {
      this.model = model;
      this.uri = uri;
      this.disposables = new CompositeDisposable;
      this.handleEvents();
      this.model.search();
      this.setScopeButtonState(this.model.getSearchScope());
      this.disposables.add(atom.tooltips.add(this.scopeButton, {
        title: "What to Search"
      }));
      this.disposables.add(atom.tooltips.add(this.optionsButton, {
        title: "Show Todo Options"
      }));
      this.disposables.add(atom.tooltips.add(this.saveAsButton, {
        title: "Save Todos to File"
      }));
      return this.disposables.add(atom.tooltips.add(this.refreshButton, {
        title: "Refresh Todos"
      }));
    };

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
            return _this.model.search();
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
      this.disposables.add(this.model.onDidChangeSearchScope(this.setScopeButtonState));
      this.disposables.add(this.model.onDidStartSearch(this.startLoading));
      this.disposables.add(this.model.onDidFinishSearch(this.stopLoading));
      this.disposables.add(this.model.onDidFailSearch((function(_this) {
        return function(err) {
          _this.searchCount.text("Search Failed");
          if (err) {
            console.error(err);
          }
          if (err) {
            return _this.showError(err);
          }
        };
      })(this)));
      this.disposables.add(this.model.onDidSearchPaths((function(_this) {
        return function(nPaths) {
          return _this.searchCount.text("" + nPaths + " paths searched...");
        };
      })(this)));
      this.disposables.add(atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function(item) {
          if ((item != null ? item.constructor.name : void 0) === 'TextEditor' && _this.model.scope === 'active') {
            return _this.model.search();
          }
        };
      })(this)));
      this.disposables.add(atom.workspace.onDidAddTextEditor((function(_this) {
        return function(_arg) {
          var textEditor;
          textEditor = _arg.textEditor;
          if (_this.model.scope === 'open') {
            return _this.model.search();
          }
        };
      })(this)));
      this.disposables.add(atom.workspace.onDidDestroyPaneItem((function(_this) {
        return function(_arg) {
          var item;
          item = _arg.item;
          if (_this.model.scope === 'open') {
            return _this.model.search();
          }
        };
      })(this)));
      this.disposables.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          return _this.disposables.add(editor.onDidSave(function() {
            return _this.model.search();
          }));
        };
      })(this)));
      this.scopeButton.on('click', this.toggleSearchScope);
      this.optionsButton.on('click', this.toggleOptions);
      this.saveAsButton.on('click', this.saveAs);
      return this.refreshButton.on('click', (function(_this) {
        return function() {
          return _this.model.search();
        };
      })(this));
    };

    ShowTodoView.prototype.destroy = function() {
      this.model.cancelSearch();
      this.disposables.dispose();
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
      return "Todo-Show Results";
    };

    ShowTodoView.prototype.getIconName = function() {
      return "checklist";
    };

    ShowTodoView.prototype.getURI = function() {
      return this.uri;
    };

    ShowTodoView.prototype.getProjectPath = function() {
      return atom.project.getPaths()[0];
    };

    ShowTodoView.prototype.getProjectName = function() {
      var _ref;
      return (_ref = atom.project.getDirectories()[0]) != null ? _ref.getBaseName() : void 0;
    };

    ShowTodoView.prototype.startLoading = function() {
      this.loading = true;
      return this.todoLoading.show();
    };

    ShowTodoView.prototype.stopLoading = function() {
      this.loading = false;
      return this.todoLoading.hide();
    };

    ShowTodoView.prototype.getTodos = function() {
      return this.model.getTodos();
    };

    ShowTodoView.prototype.showError = function(message) {
      return atom.notifications.addError('todo-show', {
        detail: message,
        dismissable: true
      });
    };

    ShowTodoView.prototype.saveAs = function() {
      var filePath, outputFilePath, projectPath;
      if (this.model.isSearching()) {
        return;
      }
      filePath = "" + (this.getProjectName() || 'todos') + ".md";
      if (projectPath = this.getProjectPath()) {
        filePath = path.join(projectPath, filePath);
      }
      if (outputFilePath = atom.showSaveDialogSync(filePath.toLowerCase())) {
        fs.writeFileSync(outputFilePath, this.model.getMarkdown());
        return atom.workspace.open(outputFilePath);
      }
    };

    ShowTodoView.prototype.toggleSearchScope = function() {
      var scope;
      scope = this.model.toggleSearchScope();
      return this.setScopeButtonState(scope);
    };

    ShowTodoView.prototype.setScopeButtonState = function(state) {
      switch (state) {
        case 'full':
          return this.scopeButton.text('Workspace');
        case 'open':
          return this.scopeButton.text('Open Files');
        case 'active':
          return this.scopeButton.text('Active File');
      }
    };

    ShowTodoView.prototype.toggleOptions = function() {
      if (!this.todoOptions) {
        this.optionsView.hide();
        this.todoOptions = new TodoOptions(this.model);
        this.optionsView.html(this.todoOptions);
      }
      return this.optionsView.slideToggle();
    };

    return ShowTodoView;

  })(ScrollView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy90b2RvLXNob3cvbGliL3Nob3ctdG9kby12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwrRUFBQTtJQUFBOzttU0FBQTs7QUFBQSxFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFBRCxDQUFBOztBQUFBLEVBQ0MsYUFBYyxPQUFBLENBQVEsc0JBQVIsRUFBZCxVQURELENBQUE7O0FBQUEsRUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FGUCxDQUFBOztBQUFBLEVBR0EsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSLENBSEwsQ0FBQTs7QUFBQSxFQUtBLFNBQUEsR0FBWSxPQUFBLENBQVEsd0JBQVIsQ0FMWixDQUFBOztBQUFBLEVBTUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSwwQkFBUixDQU5kLENBQUE7O0FBQUEsRUFRQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osbUNBQUEsQ0FBQTs7Ozs7Ozs7OztLQUFBOztBQUFBLElBQUEsWUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFFLEtBQUYsR0FBQTtBQUNSLE1BRFMsSUFBQyxDQUFBLFFBQUEsS0FDVixDQUFBO2FBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFPLHVDQUFQO0FBQUEsUUFBZ0QsUUFBQSxFQUFVLENBQUEsQ0FBMUQ7T0FBTCxFQUFtRSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ2pFLFVBQUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLFlBQVA7V0FBTCxFQUEwQixTQUFBLEdBQUE7bUJBQ3hCLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxjQUFBLE9BQUEsRUFBTyxXQUFQO2FBQUwsRUFB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

//# sourceURL=/home/gsmyrnaios/.atom/packages/todo-show/lib/show-todo-view.coffee
