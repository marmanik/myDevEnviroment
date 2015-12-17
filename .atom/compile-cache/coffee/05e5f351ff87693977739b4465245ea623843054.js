(function() {
  var GitCommit, Path, commentchar_config, commitFilePath, commitPane, commitTemplate, currentPane, fs, git, pathToRepoFile, repo, setupMocks, status, templateFile, textEditor, workspace, _ref;

  fs = require('fs-plus');

  Path = require('flavored-path');

  _ref = require('../fixtures'), repo = _ref.repo, workspace = _ref.workspace, pathToRepoFile = _ref.pathToRepoFile, currentPane = _ref.currentPane, textEditor = _ref.textEditor, commitPane = _ref.commitPane;

  git = require('../../lib/git');

  GitCommit = require('../../lib/models/git-commit');

  commitFilePath = Path.join(repo.getPath(), 'COMMIT_EDITMSG');

  status = {
    replace: function() {
      return status;
    },
    trim: function() {
      return status;
    }
  };

  commentchar_config = '';

  templateFile = '';

  commitTemplate = 'foobar';

  setupMocks = function() {
    atom.config.set('git-plus.openInPane', false);
    spyOn(currentPane, 'activate');
    spyOn(commitPane, 'destroy').andCallThrough();
    spyOn(commitPane, 'splitRight');
    spyOn(atom.workspace, 'getActivePane').andReturn(currentPane);
    spyOn(atom.workspace, 'open').andReturn(Promise.resolve(textEditor));
    spyOn(atom.workspace, 'getPanes').andReturn([currentPane, commitPane]);
    spyOn(atom.workspace, 'paneForURI').andReturn(commitPane);
    spyOn(status, 'replace').andCallFake(function() {
      return status;
    });
    spyOn(status, 'trim').andCallThrough();
    spyOn(fs, 'readFileSync').andCallFake(function() {
      if (fs.readFileSync.mostRecentCall.args[0] === 'template') {
        return commitTemplate;
      } else {
        return '';
      }
    });
    spyOn(fs, 'writeFileSync');
    spyOn(fs, 'writeFile');
    spyOn(fs, 'unlinkSync');
    spyOn(git, 'refresh');
    spyOn(git, 'getConfig').andCallFake(function() {
      var arg;
      arg = git.getConfig.mostRecentCall.args[0];
      if (arg === 'commit.template') {
        return Promise.resolve(templateFile);
      } else if (arg === 'core.commentchar') {
        return Promise.resolve(commentchar_config);
      }
    });
    spyOn(git, 'cmd').andCallFake(function() {
      var args;
      args = git.cmd.mostRecentCall.args[0];
      if (args[0] === 'status') {
        return Promise.resolve(status);
      } else if (args[0] === 'commit') {
        return Promise.resolve('commit success');
      }
    });
    spyOn(git, 'stagedFiles').andCallFake(function() {
      var args;
      args = git.stagedFiles.mostRecentCall.args;
      if (args[0].getWorkingDirectory() === repo.getWorkingDirectory()) {
        return Promise.resolve([pathToRepoFile]);
      }
    });
    return spyOn(git, 'add').andCallFake(function() {
      var args;
      args = git.add.mostRecentCall.args;
      if (args[0].getWorkingDirectory() === repo.getWorkingDirectory() && args[1].update) {
        return Promise.resolve(true);
      }
    });
  };

  describe("GitCommit", function() {
    describe("a regular commit", function() {
      beforeEach(function() {
        atom.config.set("git-plus.openInPane", false);
        setupMocks();
        return waitsForPromise(function() {
          return GitCommit(repo);
        });
      });
      it("gets the current pane", function() {
        return expect(atom.workspace.getActivePane).toHaveBeenCalled();
      });
      it("gets the commentchar from configs", function() {
        return expect(git.getConfig).toHaveBeenCalledWith('core.commentchar');
      });
      it("gets staged files", function() {
        return expect(git.cmd).toHaveBeenCalledWith(['status'], {
          cwd: repo.getWorkingDirectory()
        });
      });
      it("removes lines with '(...)' from status", function() {
        return expect(status.replace).toHaveBeenCalled();
      });
      it("gets the commit template from git configs", function() {
        return expect(git.getConfig).toHaveBeenCalledWith('commit.template');
      });
      it("writes to a file", function() {
        var argsTo_fsWriteFile;
        argsTo_fsWriteFile = fs.writeFileSync.mostRecentCall.args;
        return expect(argsTo_fsWriteFile[0]).toEqual(commitFilePath);
      });
      it("shows the file", function() {
        return expect(atom.workspace.open).toHaveBeenCalled();
      });
      it("calls git.cmd with ['commit'...] on textEditor save", function() {
        textEditor.save();
        return expect(git.cmd).toHaveBeenCalledWith(['commit', '--cleanup=strip', "--file=" + commitFilePath], {
          cwd: repo.getWorkingDirectory()
        });
      });
      it("closes the commit pane when commit is successful", function() {
        textEditor.save();
        waitsFor(function() {
          return commitPane.destroy.callCount > 0;
        });
        return runs(function() {
          return expect(commitPane.destroy).toHaveBeenCalled();
        });
      });
      return it("cancels the commit on textEditor destroy", function() {
        textEditor.destroy();
        expect(currentPane.activate).toHaveBeenCalled();
        return expect(fs.unlinkSync).toHaveBeenCalledWith(commitFilePath);
      });
    });
    describe("when core.commentchar config is not set", function() {
      return it("uses '#' in commit file", function() {
        setupMocks();
        return GitCommit(repo).then(function() {
          var argsTo_fsWriteFile;
          argsTo_fsWriteFile = fs.writeFileSync.mostRecentCall.args;
          return expect(argsTo_fsWriteFile[1].trim().charAt(0)).toBe('#');
        });
      });
    });
    describe("when core.commentchar config is set to '$'", function() {
      return it("uses '$' as the commentchar", function() {
        commentchar_config = '$';
        setupMocks();
        return GitCommit(repo).then(function() {
          var argsTo_fsWriteFile;
          argsTo_fsWriteFile = fs.writeFileSync.mostRecentCall.args;
          return expect(argsTo_fsWriteFile[1].trim().charAt(0)).toBe(commentchar_config);
        });
      });
    });
    describe("when commit.template config is not set", function() {
      return it("commit file starts with a blank line", function() {
        setupMocks();
        return waitsForPromise(function() {
          return GitCommit(repo).then(function() {
            var argsTo_fsWriteFile;
            argsTo_fsWriteFile = fs.writeFileSync.mostRecentCall.args;
            return expect(argsTo_fsWriteFile[1].charAt(0)).toEqual("\n");
          });
        });
      });
    });
    describe("when commit.template config is set", function() {
      return it("commit file starts with content of that file", function() {
        templateFile = 'template';
        setupMocks();
        GitCommit(repo);
        waitsFor(function() {
          return fs.writeFileSync.callCount > 0;
        });
        return runs(function() {
          var argsTo_fsWriteFile;
          argsTo_fsWriteFile = fs.writeFileSync.mostRecentCall.args;
          return expect(argsTo_fsWriteFile[1].indexOf(commitTemplate)).toBe(0);
        });
      });
    });
    return describe("when 'stageChanges' option is true", function() {
      return it("calls git.add with update option set to true", function() {
        setupMocks();
        return GitCommit(repo, {
          stageChanges: true
        }).then(function() {
          return expect(git.add).toHaveBeenCalledWith(repo, {
            update: true
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9zcGVjL21vZGVscy9naXQtY29tbWl0LXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDBMQUFBOztBQUFBLEVBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSLENBQUwsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsZUFBUixDQURQLENBQUE7O0FBQUEsRUFHQSxPQU9JLE9BQUEsQ0FBUSxhQUFSLENBUEosRUFDRSxZQUFBLElBREYsRUFFRSxpQkFBQSxTQUZGLEVBR0Usc0JBQUEsY0FIRixFQUlFLG1CQUFBLFdBSkYsRUFLRSxrQkFBQSxVQUxGLEVBTUUsa0JBQUEsVUFURixDQUFBOztBQUFBLEVBV0EsR0FBQSxHQUFNLE9BQUEsQ0FBUSxlQUFSLENBWE4sQ0FBQTs7QUFBQSxFQVlBLFNBQUEsR0FBWSxPQUFBLENBQVEsNkJBQVIsQ0FaWixDQUFBOztBQUFBLEVBY0EsY0FBQSxHQUFpQixJQUFJLENBQUMsSUFBTCxDQUFVLElBQUksQ0FBQyxPQUFMLENBQUEsQ0FBVixFQUEwQixnQkFBMUIsQ0FkakIsQ0FBQTs7QUFBQSxFQWVBLE1BQUEsR0FDRTtBQUFBLElBQUEsT0FBQSxFQUFTLFNBQUEsR0FBQTthQUFHLE9BQUg7SUFBQSxDQUFUO0FBQUEsSUFDQSxJQUFBLEVBQU0sU0FBQSxHQUFBO2FBQUcsT0FBSDtJQUFBLENBRE47R0FoQkYsQ0FBQTs7QUFBQSxFQWtCQSxrQkFBQSxHQUFxQixFQWxCckIsQ0FBQTs7QUFBQSxFQW1CQSxZQUFBLEdBQWUsRUFuQmYsQ0FBQTs7QUFBQSxFQW9CQSxjQUFBLEdBQWlCLFFBcEJqQixDQUFBOztBQUFBLEVBc0JBLFVBQUEsR0FBYSxTQUFBLEdBQUE7QUFDWCxJQUFBLElBQUks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

//# sourceURL=/home/gsmyrnaios/.atom/packages/git-plus/spec/models/git-commit-spec.coffee
