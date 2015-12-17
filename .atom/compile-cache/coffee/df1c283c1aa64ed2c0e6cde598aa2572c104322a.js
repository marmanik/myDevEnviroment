(function() {
  var DB, OpenRecent, minimatch;

  minimatch = null;

  DB = (function() {
    function DB(key) {
      this.key = key;
    }

    DB.prototype.getData = function() {
      var data;
      data = localStorage[this.key];
      data = data != null ? JSON.parse(data) : {};
      return data;
    };

    DB.prototype.setData = function(data) {
      return localStorage[this.key] = JSON.stringify(data);
    };

    DB.prototype.removeData = function() {
      return localStorage.removeItem(this.key);
    };

    DB.prototype.get = function(name) {
      var data;
      data = this.getData();
      return data[name];
    };

    DB.prototype.set = function(name, value) {
      var data;
      data = this.getData();
      data[name] = value;
      return this.setData(data);
    };

    DB.prototype.remove = function(name) {
      var data;
      data = this.getData();
      delete data[name];
      return this.setData(data);
    };

    return DB;

  })();

  OpenRecent = (function() {
    function OpenRecent() {
      this.eventListenerDisposables = [];
      this.commandListenerDisposables = [];
      this.localStorageEventListener = this.onLocalStorageEvent.bind(this);
      this.db = new DB('openRecent');
    }

    OpenRecent.prototype.onUriOpened = function() {
      var editor, filePath, _ref, _ref1;
      editor = atom.workspace.getActiveTextEditor();
      filePath = editor != null ? (_ref = editor.buffer) != null ? (_ref1 = _ref.file) != null ? _ref1.path : void 0 : void 0 : void 0;
      if (!filePath) {
        return;
      }
      if (!filePath.indexOf('://' === -1)) {
        return;
      }
      if (filePath) {
        return this.insertFilePath(filePath);
      }
    };

    OpenRecent.prototype.onProjectPathChange = function(projectPaths) {
      return this.insertCurrentPaths();
    };

    OpenRecent.prototype.onLocalStorageEvent = function(e) {
      if (e.key === this.db.key) {
        return this.update();
      }
    };

    OpenRecent.prototype.addCommandListeners = function() {
      var disposable, index, path, _fn, _fn1, _ref, _ref1;
      _ref = this.db.get('files');
      _fn = (function(_this) {
        return function(path) {
          var disposable;
          disposable = atom.commands.add("atom-workspace", "open-recent:open-recent-file-" + index, function() {
            return _this.openFile(path);
          });
          return _this.commandListenerDisposables.push(disposable);
        };
      })(this);
      for (index in _ref) {
        path = _ref[index];
        _fn(path);
      }
      _ref1 = this.db.get('paths');
      _fn1 = (function(_this) {
        return function(path) {
          var disposable;
          disposable = atom.commands.add("atom-workspace", "open-recent:open-recent-path-" + index, function() {
            return _this.openPath(path);
          });
          return _this.commandListenerDisposables.push(disposable);
        };
      })(this);
      for (index in _ref1) {
        path = _ref1[index];
        _fn1(path);
      }
      disposable = atom.commands.add("atom-workspace", "open-recent:clear", (function(_this) {
        return function() {
          _this.db.set('files', []);
          _this.db.set('paths', []);
          return _this.update();
        };
      })(this));
      return this.commandListenerDisposables.push(disposable);
    };

    OpenRecent.prototype.getProjectPath = function(path) {
      var _ref;
      return (_ref = atom.project.getPaths()) != null ? _ref[0] : void 0;
    };

    OpenRecent.prototype.openFile = function(path) {
      return atom.workspace.open(path);
    };

    OpenRecent.prototype.openPath = function(path) {
      var options, replaceCurrentProject, workspaceElement;
      replaceCurrentProject = false;
      options = {};
      if (!this.getProjectPath() && atom.config.get('open-recent.replaceNewWindowOnOpenDirectory')) {
        replaceCurrentProject = true;
      } else if (this.getProjectPath() && atom.config.get('open-recent.replaceProjectOnOpenDirectory')) {
        replaceCurrentProject = true;
      }
      if (replaceCurrentProject) {
        atom.project.setPaths([path]);
        if (workspaceElement = atom.views.getView(atom.workspace)) {
          return atom.commands.dispatch(workspaceElement, 'tree-view:toggle-focus');
        }
      } else {
        return atom.open({
          pathsToOpen: [path],
          newWindow: !atom.config.get('open-recent.replaceNewWindowOnOpenDirectory')
        });
      }
    };

    OpenRecent.prototype.addListeners = function() {
      var disposable;
      this.addCommandListeners();
      disposable = atom.workspace.onDidOpen(this.onUriOpened.bind(this));
      this.eventListenerDisposables.push(disposable);
      disposable = atom.project.onDidChangePaths(this.onProjectPathChange.bind(this));
      this.eventListenerDisposables.push(disposable);
      return window.addEventListener("storage", this.localStorageEventListener);
    };

    OpenRecent.prototype.removeCommandListeners = function() {
      var disposable, _i, _len, _ref;
      _ref = this.commandListenerDisposables;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        disposable = _ref[_i];
        disposable.dispose();
      }
      return this.commandListenerDisposables = [];
    };

    OpenRecent.prototype.removeListeners = function() {
      var disposable, _i, _len, _ref;
      this.removeCommandListeners();
      _ref = this.eventListenerDisposables;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        disposable = _ref[_i];
        disposable.dispose();
      }
      this.eventListenerDisposables = [];
      return window.removeEventListener('storage', this.localStorageEventListener);
    };

    OpenRecent.prototype.init = function() {
      if (atom.config.get('open-recent.recentDirectories') || atom.config.get('open-recent.recentFiles')) {
        this.db.set('paths', atom.config.get('open-recent.recentDirectories'));
        this.db.set('files', atom.config.get('open-recent.recentFiles'));
        atom.config.unset('open-recent.recentDirectories');
        atom.config.unset('open-recent.recentFiles');
      }
      if (!this.db.get('paths')) {
        this.db.set('paths', []);
      }
      if (!this.db.get('files')) {
        this.db.set('files', []);
      }
      this.addListeners();
      this.insertCurrentPaths();
      return this.update();
    };

    OpenRecent.prototype.filterPath = function(path) {
      var ignoredNames, match, name, _i, _len;
      ignoredNames = atom.config.get('core.ignoredNames');
      if (ignoredNames) {
        if (minimatch == null) {
          minimatch = require('minimatch');
        }
        for (_i = 0, _len = ignoredNames.length; _i < _len; _i++) {
          name = ignoredNames[_i];
          match = [name, "**/" + name + "/**"].some(function(comparison) {
            return minimatch(path, comparison, {
              matchBase: true,
              dot: true
            });
          });
          if (match) {
            return true;
          }
        }
      }
      return false;
    };

    OpenRecent.prototype.insertCurrentPaths = function() {
      var index, maxRecentDirectories, path, projectDirectory, recentPaths, _i, _len, _ref;
      if (!(atom.project.getDirectories().length > 0)) {
        return;
      }
      recentPaths = this.db.get('paths');
      _ref = atom.project.getDirectories();
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        projectDirectory = _ref[index];
        if (index > 0 && !atom.config.get('open-recent.listDirectoriesAddedToProject')) {
          continue;
        }
        path = projectDirectory.path;
        if (this.filterPath(path)) {
          continue;
        }
        index = recentPaths.indexOf(path);
        if (index !== -1) {
          recentPaths.splice(index, 1);
        }
        recentPaths.splice(0, 0, path);
        maxRecentDirectories = atom.config.get('open-recent.maxRecentDirectories');
        if (recentPaths.length > maxRecentDirectories) {
          recentPaths.splice(maxRecentDirectories, recentPaths.length - maxRecentDirectories);
        }
      }
      this.db.set('paths', recentPaths);
      return this.update();
    };

    OpenRecent.prototype.insertFilePath = function(path) {
      var index, maxRecentFiles, recentFiles;
      if (this.filterPath(path)) {
        return;
      }
      recentFiles = this.db.get('files');
      index = recentFiles.indexOf(path);
      if (index !== -1) {
        recentFiles.splice(index, 1);
      }
      recentFiles.splice(0, 0, path);
      maxRecentFiles = atom.config.get('open-recent.maxRecentFiles');
      if (recentFiles.length > maxRecentFiles) {
        recentFiles.splice(maxRecentFiles, recentFiles.length - maxRecentFiles);
      }
      this.db.set('files', recentFiles);
      return this.update();
    };

    OpenRecent.prototype.createSubmenu = function() {
      var index, menuItem, path, recentFiles, recentPaths, submenu;
      submenu = [];
      submenu.push({
        command: "pane:reopen-closed-item",
        label: "Reopen Closed File"
      });
      submenu.push({
        type: "separator"
      });
      recentFiles = this.db.get('files');
      if (recentFiles.length) {
        for (index in recentFiles) {
          path = recentFiles[index];
          menuItem = {
            label: path,
            command: "open-recent:open-recent-file-" + index
          };
          if (path.length > 100) {
            menuItem.label = path.substr(-60);
            menuItem.sublabel = path;
          }
          submenu.push(menuItem);
        }
        submenu.push({
          type: "separator"
        });
      }
      recentPaths = this.db.get('paths');
      if (recentPaths.length) {
        for (index in recentPaths) {
          path = recentPaths[index];
          menuItem = {
            label: path,
            command: "open-recent:open-recent-path-" + index
          };
          if (path.length > 100) {
            menuItem.label = path.substr(-60);
            menuItem.sublabel = path;
          }
          submenu.push(menuItem);
        }
        submenu.push({
          type: "separator"
        });
      }
      submenu.push({
        command: "open-recent:clear",
        label: "Clear List"
      });
      return submenu;
    };

    OpenRecent.prototype.updateMenu = function() {
      var dropdown, item, _i, _j, _len, _len1, _ref, _ref1, _results;
      _ref = atom.menu.template;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        dropdown = _ref[_i];
        if (dropdown.label === "File" || dropdown.label === "&File") {
          _ref1 = dropdown.submenu;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            item = _ref1[_j];
            if (item.command === "pane:reopen-closed-item" || item.label === "Open Recent") {
              delete item.accelerator;
              delete item.command;
              delete item.click;
              item.label = "Open Recent";
              item.enabled = true;
              if (item.metadata == null) {
                item.metadata = {};
              }
              item.metadata.windowSpecific = false;
              item.submenu = this.createSubmenu();
              atom.menu.update();
              break;
            }
          }
          break;
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    OpenRecent.prototype.update = function() {
      this.removeCommandListeners();
      this.updateMenu();
      return this.addCommandListeners();
    };

    OpenRecent.prototype.destroy = function() {
      return this.removeListeners();
    };

    return OpenRecent;

  })();

  module.exports = {
    config: {
      maxRecentFiles: {
        type: 'number',
        "default": 8
      },
      maxRecentDirectories: {
        type: 'number',
        "default": 8
      },
      replaceNewWindowOnOpenDirectory: {
        type: 'boolean',
        "default": true,
        description: 'When checked, opening a recent directory will "open" in the current window, but only if the window does not have a project path set. Eg: The window that appears when doing File > New Window.'
      },
      replaceProjectOnOpenDirectory: {
        type: 'boolean',
        "default": false,
        description: 'When checked, opening a recent directory will "open" in the current window, replacing the current project.'
      },
      listDirectoriesAddedToProject: {
        type: 'boolean',
        "default": false,
        description: 'When checked, the all root directories in a project will be added to the history and not just the 1st root directory.'
      },
      ignoredNames: {
        type: 'boolean',
        "default": true,
        description: 'When checked, skips files and directories specified in Atom\'s "Ignored Names" setting.'
      }
    },
    instance: null,
    activate: function() {
      this.instance = new OpenRecent();
      return this.instance.init();
    },
    deactivate: function() {
      this.instance.destroy();
      return this.instance = null;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy9vcGVuLXJlY2VudC9saWIvbWFpbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEseUJBQUE7O0FBQUEsRUFBQSxTQUFBLEdBQVksSUFBWixDQUFBOztBQUFBLEVBR007QUFDUyxJQUFBLFlBQUUsR0FBRixHQUFBO0FBQVEsTUFBUCxJQUFDLENBQUEsTUFBQSxHQUFNLENBQVI7SUFBQSxDQUFiOztBQUFBLGlCQUVBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxVQUFBLElBQUE7QUFBQSxNQUFBLElBQUEsR0FBTyxZQUFhLENBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBcEIsQ0FBQTtBQUFBLE1BQ0EsSUFBQSxHQUFVLFlBQUgsR0FBYyxJQUFJLENBQUMsS0FBTCxDQUFXLElBQVgsQ0FBZCxHQUFvQyxFQUQzQyxDQUFBO0FBRUEsYUFBTyxJQUFQLENBSE87SUFBQSxDQUZULENBQUE7O0FBQUEsaUJBT0EsT0FBQSxHQUFTLFNBQUMsSUFBRCxHQUFBO2FBQ1AsWUFBYSxDQUFBLElBQUMsQ0FBQSxHQUFELENBQWIsR0FBcUIsSUFBSSxDQUFDLFNBQUwsQ0FBZSxJQUFmLEVBRGQ7SUFBQSxDQVBULENBQUE7O0FBQUEsaUJBVUEsVUFBQSxHQUFZLFNBQUEsR0FBQTthQUNWLFlBQVksQ0FBQyxVQUFiLENBQXdCLElBQUMsQ0FBQSxHQUF6QixFQURVO0lBQUEsQ0FWWixDQUFBOztBQUFBLGlCQWFBLEdBQUEsR0FBSyxTQUFDLElBQUQsR0FBQTtBQUNILFVBQUEsSUFBQTtBQUFBLE1BQUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBUCxDQUFBO0FBQ0EsYUFBTyxJQUFLLENBQUEsSUFBQSxDQUFaLENBRkc7SUFBQSxDQWJMLENBQUE7O0FBQUEsaUJBaUJBLEdB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

//# sourceURL=/home/gsmyrnaios/.atom/packages/open-recent/lib/main.coffee
