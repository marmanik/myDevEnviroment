(function() {
  var CompositeDisposable, Os, Path, diffFilePath, disposables, fs, git, gitDiff, notifier, prepFile, showFile, splitPane;

  CompositeDisposable = require('atom').CompositeDisposable;

  Os = require('os');

  Path = require('path');

  fs = require('fs-plus');

  git = require('../git');

  notifier = require('../notifier');

  disposables = new CompositeDisposable;

  diffFilePath = null;

  gitDiff = function(repo, _arg) {
    var args, diffStat, file, _ref, _ref1;
    _ref = _arg != null ? _arg : {}, diffStat = _ref.diffStat, file = _ref.file;
    diffFilePath = Path.join(repo.getPath(), "atom_git_plus.diff");
    if (file == null) {
      file = repo.relativize((_ref1 = atom.workspace.getActiveTextEditor()) != null ? _ref1.getPath() : void 0);
    }
    if (!file) {
      return notifier.addError("No open file. Select 'Diff All'.");
    }
    if (diffStat == null) {
      diffStat = '';
    }
    args = ['diff', '--color=never'];
    if (atom.config.get('git-plus.includeStagedDiff')) {
      args.push('HEAD');
    }
    if (atom.config.get('git-plus.wordDiff')) {
      args.push('--word-diff');
    }
    if (diffStat === '') {
      args.push(file);
    }
    return git.cmd({
      args: args,
      cwd: repo.getWorkingDirectory(),
      stdout: function(data) {
        return diffStat += data;
      },
      exit: function(code) {
        if (code === 0) {
          return prepFile(diffStat);
        }
      }
    });
  };

  prepFile = function(text) {
    if ((text != null ? text.length : void 0) > 0) {
      fs.writeFileSync(diffFilePath, text, {
        flag: 'w+'
      });
      return showFile();
    } else {
      return notifier.addInfo('Nothing to show.');
    }
  };

  showFile = function() {
    return atom.workspace.open(diffFilePath, {
      searchAllPanes: true
    }).done(function(textEditor) {
      if (atom.config.get('git-plus.openInPane')) {
        return splitPane(atom.config.get('git-plus.splitPane'), textEditor);
      } else {
        return disposables.add(textEditor.onDidDestroy((function(_this) {
          return function() {
            return fs.unlink(diffFilePath);
          };
        })(this)));
      }
    });
  };

  splitPane = function(splitDir, oldEditor) {
    var directions, hookEvents, options, pane;
    pane = atom.workspace.paneForURI(diffFilePath);
    options = {
      copyActiveItem: true
    };
    hookEvents = function(textEditor) {
      oldEditor.destroy();
      return disposables.add(textEditor.onDidDestroy((function(_this) {
        return function() {
          return fs.unlink(diffFilePath);
        };
      })(this)));
    };
    directions = {
      left: (function(_this) {
        return function() {
          pane = pane.splitLeft(options);
          return hookEvents(pane.getActiveEditor());
        };
      })(this),
      right: (function(_this) {
        return function() {
          pane = pane.splitRight(options);
          return hookEvents(pane.getActiveEditor());
        };
      })(this),
      up: (function(_this) {
        return function() {
          pane = pane.splitUp(options);
          return hookEvents(pane.getActiveEditor());
        };
      })(this),
      down: (function(_this) {
        return function() {
          pane = pane.splitDown(options);
          return hookEvents(pane.getActiveEditor());
        };
      })(this)
    };
    directions[splitDir]();
    return oldEditor.destroy();
  };

  module.exports = gitDiff;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL2dpdC1kaWZmLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxtSEFBQTs7QUFBQSxFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFBRCxDQUFBOztBQUFBLEVBQ0EsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBREwsQ0FBQTs7QUFBQSxFQUVBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUZQLENBQUE7O0FBQUEsRUFHQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVIsQ0FITCxDQUFBOztBQUFBLEVBS0EsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSLENBTE4sQ0FBQTs7QUFBQSxFQU1BLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUixDQU5YLENBQUE7O0FBQUEsRUFRQSxXQUFBLEdBQWMsR0FBQSxDQUFBLG1CQVJkLENBQUE7O0FBQUEsRUFTQSxZQUFBLEdBQWUsSUFUZixDQUFBOztBQUFBLEVBV0EsT0FBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLElBQVAsR0FBQTtBQUNSLFFBQUEsaUNBQUE7QUFBQSwwQkFEZSxPQUFpQixJQUFoQixnQkFBQSxVQUFVLFlBQUEsSUFDMUIsQ0FBQTtBQUFBLElBQUEsWUFBQSxHQUFlLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBSSxDQUFDLE9BQUwsQ0FBQSxDQUFWLEVBQTBCLG9CQUExQixDQUFmLENBQUE7O01BQ0EsT0FBUSxJQUFJLENBQUMsVUFBTCwrREFBb0QsQ0FBRSxPQUF0QyxDQUFBLFVBQWhCO0tBRFI7QUFFQSxJQUFBLElBQUcsQ0FBQSxJQUFIO0FBQ0UsYUFBTyxRQUFRLENBQUMsUUFBVCxDQUFrQixrQ0FBbEIsQ0FBUCxDQURGO0tBRkE7O01BSUEsV0FBWTtL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

//# sourceURL=/home/gsmyrnaios/.atom/packages/git-plus/lib/models/git-diff.coffee
