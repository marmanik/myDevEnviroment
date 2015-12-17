(function() {
  var BufferedProcess, CompositeDisposable, MinimapPluginGeneratorElement, TextEditor, fs, path, registerOrUpdateElement, _, _ref;

  _ = require('underscore-plus');

  fs = require('fs-plus');

  path = require('path');

  _ref = require('atom'), TextEditor = _ref.TextEditor, BufferedProcess = _ref.BufferedProcess;

  CompositeDisposable = require('event-kit').CompositeDisposable;

  registerOrUpdateElement = require('atom-utils').registerOrUpdateElement;

  module.exports = MinimapPluginGeneratorElement = (function() {
    function MinimapPluginGeneratorElement() {}

    MinimapPluginGeneratorElement.prototype.previouslyFocusedElement = null;

    MinimapPluginGeneratorElement.prototype.mode = null;

    MinimapPluginGeneratorElement.prototype.createdCallback = function() {
      this.classList.add('minimap-plugin-generator');
      this.classList.add('overlay');
      this.classList.add('from-top');
      this.editor = new TextEditor({
        mini: true
      });
      this.editorElement = atom.views.getView(this.editor);
      this.error = document.createElement('div');
      this.error.classList.add('error');
      this.message = document.createElement('div');
      this.message.classList.add('message');
      this.appendChild(this.editorElement);
      this.appendChild(this.error);
      return this.appendChild(this.message);
    };

    MinimapPluginGeneratorElement.prototype.attachedCallback = function() {
      this.previouslyFocusedElement = document.activeElement;
      this.message.textContent = "Enter plugin path";
      this.setPathText("my-minimap-plugin");
      return this.editorElement.focus();
    };

    MinimapPluginGeneratorElement.prototype.attach = function() {
      return atom.views.getView(atom.workspace).appendChild(this);
    };

    MinimapPluginGeneratorElement.prototype.setPathText = function(placeholderName, rangeToSelect) {
      var endOfDirectoryIndex, packagesDirectory, pathLength;
      if (rangeToSelect == null) {
        rangeToSelect = [0, placeholderName.length];
      }
      packagesDirectory = this.getPackagesDirectory();
      this.editor.setText(path.join(packagesDirectory, placeholderName));
      pathLength = this.editor.getText().length;
      endOfDirectoryIndex = pathLength - placeholderName.length;
      return this.editor.setSelectedBufferRange([[0, endOfDirectoryIndex + rangeToSelect[0]], [0, endOfDirectoryIndex + rangeToSelect[1]]]);
    };

    MinimapPluginGeneratorElement.prototype.detach = function() {
      var _ref1;
      if (this.parentNode == null) {
        return;
      }
      if ((_ref1 = this.previouslyFocusedElement) != null) {
        _ref1.focus();
      }
      return this.parentNode.removeChild(this);
    };

    MinimapPluginGeneratorElement.prototype.confirm = function() {
      if (this.validPackagePath()) {
        this.removeChild(this.editorElement);
        this.message.innerHTML = "<span class='loading loading-spinner-tiny inline-block'></span>\nGenerate plugin at <span class=\"text-primary\">" + (this.getPackagePath()) + "</span>";
        return this.createPackageFiles((function(_this) {
          return function() {
            var packagePath;
            packagePath = _this.getPackagePath();
            atom.open({
              pathsToOpen: [packagePath],
              devMode: atom.config.get('minimap.createPluginInDevMode')
            });
            _this.message.innerHTML = "<span class=\"text-success\">Plugin successfully generated, opening it now...</span>";
            return setTimeout(function() {
              return _this.detach();
            }, 2000);
          };
        })(this));
      }
    };

    MinimapPluginGeneratorElement.prototype.getPackagePath = function() {
      var packageName, packagePath;
      packagePath = this.editor.getText();
      packageName = _.dasherize(path.basename(packagePath));
      return path.join(path.dirname(packagePath), packageName);
    };

    MinimapPluginGeneratorElement.prototype.getPackagesDirectory = function() {
      return atom.config.get('core.projectHome') || process.env.ATOM_REPOS_HOME || path.join(fs.getHomeDirectory(), 'github');
    };

    MinimapPluginGeneratorElement.prototype.validPackagePath = function() {
      if (fs.existsSync(this.getPackagePath())) {
        this.error.textContent = "Path already exists at '" + (this.getPackagePath()) + "'";
        this.error.style.display = 'block';
        return false;
      } else {
        return true;
      }
    };

    MinimapPluginGeneratorElement.prototype.initPackage = function(packagePath, callback) {
      var templatePath;
      templatePath = path.resolve(__dirname, path.join('..', 'templates', "plugin-" + this.template));
      return this.runCommand(atom.packages.getApmPath(), ['init', "-p", "" + packagePath, "--template", templatePath], callback);
    };

    MinimapPluginGeneratorElement.prototype.linkPackage = function(packagePath, callback) {
      var args;
      args = ['link'];
      if (atom.config.get('minimap.createPluginInDevMode')) {
        args.push('--dev');
      }
      args.push(packagePath.toString());
      return this.runCommand(atom.packages.getApmPath(), args, callback);
    };

    MinimapPluginGeneratorElement.prototype.installPackage = function(packagePath, callback) {
      var args;
      args = ['install'];
      return this.runCommand(atom.packages.getApmPath(), args, callback, {
        cwd: packagePath
      });
    };

    MinimapPluginGeneratorElement.prototype.isStoredInDotAtom = function(packagePath) {
      var devPackagesPath, packagesPath;
      packagesPath = path.join(atom.getConfigDirPath(), 'packages', path.sep);
      if (packagePath.indexOf(packagesPath) === 0) {
        return true;
      }
      devPackagesPath = path.join(atom.getConfigDirPath(), 'dev', 'packages', path.sep);
      return packagePath.indexOf(devPackagesPath) === 0;
    };

    MinimapPluginGeneratorElement.prototype.createPackageFiles = function(callback) {
      var packagePath, packagesDirectory;
      packagePath = this.getPackagePath();
      packagesDirectory = this.getPackagesDirectory();
      if (this.isStoredInDotAtom(packagePath)) {
        return this.initPackage(packagePath, (function(_this) {
          return function() {
            return _this.installPackage(packagePath, callback);
          };
        })(this));
      } else {
        return this.initPackage(packagePath, (function(_this) {
          return function() {
            return _this.linkPackage(packagePath, function() {
              return _this.installPackage(packagePath, callback);
            });
          };
        })(this));
      }
    };

    MinimapPluginGeneratorElement.prototype.runCommand = function(command, args, exit, options) {
      if (options == null) {
        options = {};
      }
      return new BufferedProcess({
        command: command,
        args: args,
        exit: exit,
        options: options
      });
    };

    return MinimapPluginGeneratorElement;

  })();

  module.exports = MinimapPluginGeneratorElement = registerOrUpdateElement('minimap-plugin-generator', MinimapPluginGeneratorElement.prototype);

  atom.commands.add('minimap-plugin-generator', {
    'core:confirm': function() {
      return this.confirm();
    },
    'core:cancel': function() {
      return this.detach();
    }
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL2xpYi9taW5pbWFwLXBsdWdpbi1nZW5lcmF0b3ItZWxlbWVudC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsMkhBQUE7O0FBQUEsRUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNBLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUixDQURMLENBQUE7O0FBQUEsRUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FGUCxDQUFBOztBQUFBLEVBR0EsT0FBZ0MsT0FBQSxDQUFRLE1BQVIsQ0FBaEMsRUFBQyxrQkFBQSxVQUFELEVBQWEsdUJBQUEsZUFIYixDQUFBOztBQUFBLEVBSUMsc0JBQXVCLE9BQUEsQ0FBUSxXQUFSLEVBQXZCLG1CQUpELENBQUE7O0FBQUEsRUFLQywwQkFBMkIsT0FBQSxDQUFRLFlBQVIsRUFBM0IsdUJBTEQsQ0FBQTs7QUFBQSxFQVNBLE1BQU0sQ0FBQyxPQUFQLEdBQ007K0NBQ0o7O0FBQUEsNENBQUEsd0JBQUEsR0FBMEIsSUFBMUIsQ0FBQTs7QUFBQSw0Q0FDQSxJQUFBLEdBQU0sSUFETixDQUFBOztBQUFBLDRDQUdBLGVBQUEsR0FBaUIsU0FBQSxHQUFBO0FBQ2YsTUFBQSxJQUFDLENBQUEsU0FBUyxDQUFDLEdBQVgsQ0FBZSwwQkFBZixDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxTQUFTLENBQUMsR0FBWCxDQUFlLFNBQWYsQ0FEQSxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsU0FBUyxDQUFDLEdBQVgsQ0FBZSxVQUFmLENBRkEsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLE1BQUQsR0FBYyxJQUFBLFVBQUEsQ0FBVztBQUFBLFFBQUEsSUFBQSxFQUFNLElBQU47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

//# sourceURL=/home/gsmyrnaios/.atom/packages/minimap/lib/minimap-plugin-generator-element.coffee
