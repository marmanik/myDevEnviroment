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
        return expect(git.getConfig).toHaveBeenCalledWith('core.commentchar', Path.dirname(commitFilePath));
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
        return expect(git.getConfig).toHaveBeenCalledWith('commit.template', Path.dirname(commitFilePath));
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