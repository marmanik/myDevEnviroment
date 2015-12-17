(function() {
  var fs, path, temp;

  path = require('path');

  fs = require('fs-plus');

  temp = require('temp');

  describe('ShowTodo opening panes and executing commands', function() {
    var activationPromise, executeCommand, showTodoModule, showTodoPane, workspaceElement, _ref;
    _ref = [], workspaceElement = _ref[0], activationPromise = _ref[1], showTodoModule = _ref[2], showTodoPane = _ref[3];
    executeCommand = function(callback) {
      var wasVisible;
      wasVisible = showTodoModule != null ? showTodoModule.showTodoView.isVisible() : void 0;
      atom.commands.dispatch(workspaceElement, 'todo-show:find-in-project');
      waitsForPromise(function() {
        return activationPromise;
      });
      return runs(function() {
        waitsFor(function() {
          if (wasVisible) {
            return !showTodoModule.showTodoView.isVisible();
          }
          return !showTodoModule.showTodoView.loading && showTodoModule.showTodoView.isVisible();
        });
        return runs(function() {
          showTodoPane = atom.workspace.paneForItem(showTodoModule.showTodoView);
          return callback();
        });
      });
    };
    beforeEach(function() {
      atom.project.setPaths([path.join(__dirname, 'fixtures/sample1')]);
      workspaceElement = atom.views.getView(atom.workspace);
      jasmine.attachToDOM(workspaceElement);
      return activationPromise = atom.packages.activatePackage('todo-show').then(function(opts) {
        return showTodoModule = opts.mainModule;
      });
    });
    describe('when the show-todo:find-in-project event is triggered', function() {
      it('attaches and then detaches the pane view', function() {
        expect(atom.packages.loadedPackages['todo-show']).toBeDefined();
        expect(workspaceElement.querySelector('.show-todo-preview')).not.toExist();
        return executeCommand(function() {
          expect(workspaceElement.querySelector('.show-todo-preview')).toExist();
          expect(showTodoPane.parent.orientation).toBe('horizontal');
          return executeCommand(function() {
            return expect(workspaceElement.querySelector('.show-todo-preview')).not.toExist();
          });
        });
      });
      it('can open in vertical split', function() {
        atom.config.set('todo-show.openListInDirection', 'down');
        return executeCommand(function() {
          expect(workspaceElement.querySelector('.show-todo-preview')).toExist();
          return expect(showTodoPane.parent.orientation).toBe('vertical');
        });
      });
      it('can open ontop of current view', function() {
        atom.config.set('todo-show.openListInDirection', 'ontop');
        return executeCommand(function() {
          expect(workspaceElement.querySelector('.show-todo-preview')).toExist();
          return expect(showTodoPane.parent.orientation).not.toExist();
        });
      });
      it('has visible elements in view', function() {
        return executeCommand(function() {
          var element;
          element = showTodoModule.showTodoView.find('td').last();
          expect(element.text()).toEqual('sample.js');
          return expect(element.isVisible()).toBe(true);
        });
      });
      it('persists pane width', function() {
        return executeCommand(function() {
          var newFlex, originalFlex;
          originalFlex = showTodoPane.getFlexScale();
          newFlex = originalFlex * 1.1;
          expect(typeof originalFlex).toEqual("number");
          expect(showTodoModule.showTodoView).toBeVisible();
          showTodoPane.setFlexScale(newFlex);
          return executeCommand(function() {
            expect(showTodoPane).not.toExist();
            expect(showTodoModule.showTodoView).not.toBeVisible();
            return executeCommand(function() {
              expect(showTodoPane.getFlexScale()).toEqual(newFlex);
              return showTodoPane.setFlexScale(originalFlex);
            });
          });
        });
      });
      it('does not persist pane width if asked not to', function() {
        atom.config.set('todo-show.rememberViewSize', false);
        return executeCommand(function() {
          var newFlex, originalFlex;
          originalFlex = showTodoPane.getFlexScale();
          newFlex = originalFlex * 1.1;
          expect(typeof originalFlex).toEqual("number");
          showTodoPane.setFlexScale(newFlex);
          return executeCommand(function() {
            return executeCommand(function() {
              expect(showTodoPane.getFlexScale()).not.toEqual(newFlex);
              return expect(showTodoPane.getFlexScale()).toEqual(originalFlex);
            });
          });
        });
      });
      return it('persists horizontal pane height', function() {
        atom.config.set('todo-show.openListInDirection', 'down');
        return executeCommand(function() {
          var newFlex, originalFlex;
          originalFlex = showTodoPane.getFlexScale();
          newFlex = originalFlex * 1.1;
          expect(typeof originalFlex).toEqual("number");
          showTodoPane.setFlexScale(newFlex);
          return executeCommand(function() {
            expect(showTodoPane).not.toExist();
            return executeCommand(function() {
              expect(showTodoPane.getFlexScale()).toEqual(newFlex);
              return showTodoPane.setFlexScale(originalFlex);
            });
          });
        });
      });
    });
    describe('when save-as button is clicked', function() {
      it('saves the list in markdown and opens it', function() {
        var expectedFilePath, expectedOutput, outputPath;
        outputPath = temp.path({
          suffix: '.md'
        });
        expectedFilePath = atom.project.getDirectories()[0].resolve('../saved-output.md');
        expectedOutput = fs.readFileSync(expectedFilePath).toString();
        atom.config.set('todo-show.sortBy', 'Type');
        expect(fs.isFileSync(outputPath)).toBe(false);
        executeCommand(function() {
          spyOn(atom, 'showSaveDialogSync').andReturn(outputPath);
          return showTodoModule.showTodoView.saveAs();
        });
        waitsFor(function() {
          var _ref1;
          return fs.existsSync(outputPath) && ((_ref1 = atom.workspace.getActiveTextEditor()) != null ? _ref1.getPath() : void 0) === fs.realpathSync(outputPath);
        });
        return runs(function() {
          expect(fs.isFileSync(outputPath)).toBe(true);
          return expect(atom.workspace.getActiveTextEditor().getText()).toBe(expectedOutput);
        });
      });
      return it('saves the list in markdown grouped by filename', function() {
        var expectedFilePath, expectedOutput, outputPath;
        outputPath = temp.path({
          suffix: '.md'
        });
        expectedFilePath = atom.project.getDirectories()[0].resolve('../saved-output-grouped.md');
        expectedOutput = fs.readFileSync(expectedFilePath).toString();
        atom.config.set('todo-show.findTheseRegexes', ['TODOs', '/\\b@?TODO:?\\s(.+$)/g']);
        atom.config.set('todo-show.showInTable', ['Text', 'Type', 'File', 'Line']);
        atom.config.set('todo-show.sortBy', 'File');
        expect(fs.isFileSync(outputPath)).toBe(false);
        executeCommand(function() {
          spyOn(atom, 'showSaveDialogSync').andReturn(outputPath);
          return showTodoModule.showTodoView.saveAs();
        });
        waitsFor(function() {
          var _ref1;
          return fs.existsSync(outputPath) && ((_ref1 = atom.workspace.getActiveTextEditor()) != null ? _ref1.getPath() : void 0) === fs.realpathSync(outputPath);
        });
        return runs(function() {
          expect(fs.isFileSync(outputPath)).toBe(true);
          return expect(atom.workspace.getActiveTextEditor().getText()).toBe(expectedOutput);
        });
      });
    });
    describe('when core:refresh is triggered', function() {
      return it('refreshes the list', function() {
        return executeCommand(function() {
          atom.commands.dispatch(workspaceElement.querySelector('.show-todo-preview'), 'core:refresh');
          expect(showTodoModule.showTodoView.loading).toBe(true);
          waitsFor(function() {
            return !showTodoModule.showTodoView.loading;
          });
          return runs(function() {
            return expect(showTodoModule.showTodoView.loading).toBe(false);
          });
        });
      });
    });
    return describe('when the show-todo:find-in-open-files event is triggered', function() {
      beforeEach(function() {
        atom.commands.dispatch(workspaceElement, 'todo-show:find-in-open-files');
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          return waitsFor(function() {
            return !showTodoModule.showTodoView.loading && showTodoModule.showTodoView.isVisible();
          });
        });
      });
      it('does not show any results with no open files', function() {
        var element;
        element = showTodoModule.showTodoView.find('p').last();
        expect(showTodoModule.showTodoView.getTodos()).toHaveLength(0);
        expect(element.text()).toContain('No results...');
        return expect(element.isVisible()).toBe(true);
      });
      return it('only shows todos from open files', function() {
        waitsForPromise(function() {
          return atom.workspace.open('sample.c');
        });
        waitsFor(function() {
          return !showTodoModule.showTodoView.loading;
        });
        return runs(function() {
          var todos;
          todos = showTodoModule.showTodoView.getTodos();
          console.log(todos);
          expect(todos).toHaveLength(1);
          expect(todos[0].title).toBe('TODOs');
          expect(todos[0].matchText).toBe('Comment in C');
          return expect(todos[0].relativePath).toBe('sample.c');
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy90b2RvLXNob3cvc3BlYy9zaG93LXRvZG8tc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsY0FBQTs7QUFBQSxFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUFQLENBQUE7O0FBQUEsRUFDQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVIsQ0FETCxDQUFBOztBQUFBLEVBRUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRlAsQ0FBQTs7QUFBQSxFQUlBLFFBQUEsQ0FBUywrQ0FBVCxFQUEwRCxTQUFBLEdBQUE7QUFDeEQsUUFBQSx1RkFBQTtBQUFBLElBQUEsT0FBc0UsRUFBdEUsRUFBQywwQkFBRCxFQUFtQiwyQkFBbkIsRUFBc0Msd0JBQXRDLEVBQXNELHNCQUF0RCxDQUFBO0FBQUEsSUFJQSxjQUFBLEdBQWlCLFNBQUMsUUFBRCxHQUFBO0FBQ2YsVUFBQSxVQUFBO0FBQUEsTUFBQSxVQUFBLDRCQUFhLGNBQWMsQ0FBRSxZQUFZLENBQUMsU0FBN0IsQ0FBQSxVQUFiLENBQUE7QUFBQSxNQUNBLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBZCxDQUF1QixnQkFBdkIsRUFBeUMsMkJBQXpDLENBREEsQ0FBQTtBQUFBLE1BRUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFBRyxrQkFBSDtNQUFBLENBQWhCLENBRkEsQ0FBQTthQUdBLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFDSCxRQUFBLFFBQUEsQ0FBUyxTQUFBLEdBQUE7QUFDUCxVQUFBLElBQW1ELFVBQW5EO0FBQUEsbUJBQU8sQ0FBQSxjQUFlLENBQUMsWUFBWSxDQUFDLFNBQTVCLENBQUEsQ0FBUixDQUFBO1dBQUE7aUJBQ0EsQ0FBQSxjQUFlLENBQUMsWUFBWSxDQUFDLE9BQTdCLElBQXlDLGNBQWMsQ0FBQyxZQUFZLENBQUMsU0FBNUIsQ0FBQSxFQUZsQztRQUFBLENBQVQsQ0FBQSxDQUFBO2VBR0EsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILFVBQUEsWUFBQSxHQUFlLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBZixDQUEyQixjQUFjLENBQUMsWUFBMUMsQ0FBZixDQUFBO2lCQUNBLFFBQUEsQ0FBQSxFQUZHO1FBQUEsQ0FBTCxFQUpHO01BQUEsQ0FBTCxFQUplO0lBQUEsQ0FKakIsQ0FBQTtBQUFBLElBZ0JBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBYixDQUFzQixDQUFDLElBQUksQ0FBQyxJQUFMLENBQVUsU0FBVixFQUFxQixrQkFBckIsQ0FBRCxDQUF0QixDQUFBLENBQUE7QUFBQSxNQUNBLGdCQUFBLEdBQW1CLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixJQUFJLENBQUMsU0FBeEIsQ0FEbkIsQ0FBQTtBQUFBLE1BRUEsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsZ0JBQXBCLENBRkEsQ0FBQTthQUdBLGlCQUFBLEdBQW9CLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixXQUE5QixDQUEwQyxDQUFDLElBQTNDLENBQWdELFNBQUMsSUFBRCxHQUFBO2VBQ2xFLGNBQUEsR0FBaUIsSUFBSSxDQUFDLFdBRDRDO01BQUEsQ0FBaEQsRUFKWDtJQUFBLENBQVgsQ0FoQkEsQ0FBQTtBQUFBLElBdUJBLFFBQUEsQ0FBUyx1REFBVCxFQUFrRSxTQUFBLEdBQUE7QUFDaEUsTUFBQSxFQUFBLENBQUcsMENBQUgsRUFBK0MsU0FBQSxHQUFBO0FBQzdDLFFBQUEsTUFBQSxDQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBZSxDQUFBLFdBQUEsQ0FBcEMsQ0FBaUQsQ0FBQyxXQUFsRCxDQUFBLENBQUEsQ0FBQTtBQUFBLFFBQ0EsTUFBQSxDQUFPLGdCQUFnQixDQUFDLGFBQWpCLENBQStCLG9CQUEvQixDQUFQLENBQTRELENBQUMsR0FBRyxDQUFDLE9BQWpFLENBQUEsQ0FEQSxDQUFBO2VBSUEsY0FBQSxDQUFlLFNBQUEsR0FBQTtBQUNiLFVBQUEsTUFBQSxDQUFPLGdCQUFnQixDQUFDLGFBQWpCLENBQStCLG9CQUEvQixDQUFQLENBQTRELENBQUMsT0FBN0QsQ0FBQSxDQUFBLENBQUE7QUFBQSxVQUNBLE1BQUEsQ0FBTyxZQUFZLENBQUMsTUFBTSxDQUFDLFdBQTNCLENBQXVDLENBQUMsSUFBeEMsQ0FBNkMsWUFBN0MsQ0FEQSxDQUFBO2lCQUlBLGNBQUEsQ0FBZSxTQUFBLEdBQUE7bUJBQ2IsTUFBQSxDQUFPLGdCQUFnQixDQUFDLGFBQWpCLENBQStCLG9CQUEvQixDQUFQLENBQTRELENBQUMsR0FBRyxDQUFDLE9BQWpFLENBQUEsRUFEYTtVQUFBLENBQWYsRUFMYTtRQUFBLENBQWYsRUFMNkM7TUFBQSxDQUEvQyxDQUFBLENBQUE7QUFBQSxNQWFBLEVBQUEsQ0FBRyw0QkFBSCxFQUFpQyxTQUFBLEdBQUE7QUFDL0IsUUFBQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsK0JBQWhCLEVBQWlELE1BQWpELENBQUEsQ0FBQTtlQUVBLGNBQUEsQ0FBZSxTQUFBLEdBQUE7QUFDYixVQUFBLE1BQUEsQ0FBTyxnQkFBZ0IsQ0FBQyxhQUFqQixDQUErQixvQkFBL0IsQ0FBUCxDQUE0RCxDQUFDLE9BQTdELENBQUEsQ0FBQSxDQUFBO2lCQUNBLE1BQUEsQ0FBTyxZQUFZLENBQUMsTUFBTSxDQUFDLFdBQTNCLENBQXVDLENBQUMsSUFBeEMsQ0FBNkMsVUFBN0MsRUFGYTtRQUFBLENBQWYsRUFIK0I7TUFBQSxDQUFqQyxDQWJBLENBQUE7QUFBQSxNQW9CQSxFQUFBLENBQUcsZ0NBQUgsRUFBcUMsU0FBQSxHQUFBO0FBQ25DLFFBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLCtCQUFoQixFQUFpRCxPQUFqRCxDQUFBLENBQUE7ZUFFQSxjQUFBLENBQWUsU0FBQSxHQUFBO0FBQ2IsVUFBQSxNQUFBLENBQU8sZ0JBQWdCLENBQUMsYUFBakIsQ0FBK0Isb0JBQS9CLENBQVAsQ0FBNEQsQ0FBQyxPQUE3RCxDQUFBLENBQUEsQ0FBQTtpQkFDQSxNQUFBLENBQU8sWUFBWSxDQUFDLE1BQU0sQ0FBQyxXQUEzQixDQUF1QyxDQUFDLEdBQUcsQ0FBQyxPQUE1QyxDQUFBLEVBRmE7UUFBQSxDQUFmLEVBSG1DO01BQUEsQ0FBckMsQ0FwQkEsQ0FBQTtBQUFBLE1BMkJBLEVBQUEsQ0FBRyw4QkFBSCxFQUFtQyxTQUFBLEdBQUE7ZUFDakMsY0FBQSxDQUFlLFNBQUEsR0FBQTtBQUNiLGNBQUEsT0FBQTtBQUFBLFVBQUEsT0FBQSxHQUFVLGNBQWMsQ0FBQyxZQUFZLENBQUMsSUFBNUIsQ0FBaUMsSUFBakMsQ0FBc0MsQ0FBQyxJQUF2QyxDQUFBLENBQVYsQ0FBQTtBQUFBLFVBQ0EsTUFBQSxDQUFPLE9BQU8sQ0FBQyxJQUFSLENBQUEsQ0FBUCxDQUFzQixDQUFDLE9BQXZCLENBQStCLFdBQS9CLENBREEsQ0FBQTtpQkFFQSxNQUFBLENBQU8sT0FBTyxDQUFDLFNBQVIsQ0FBQSxDQUFQLENBQTJCLENBQUMsSUFBNUIsQ0FBaUMsSUFBakMsRUFIYTtRQUFBLENBQWYsRUFEaUM7TUFBQSxDQUFuQyxDQTNCQSxDQUFBO0FBQUEsTUFpQ0EsRUFBQSxDQUFHLHFCQUFILEVBQTBCLFNBQUEsR0FBQTtlQUN4QixjQUFBLENBQWUsU0FBQSxHQUFBO0FBQ2IsY0FBQSxxQkFBQTtBQUFBLFVBQUEsWUFBQSxHQUFlLFlBQVksQ0FBQyxZQUFiLENBQUEsQ0FBZixDQUFBO0FBQUEsVUFDQSxPQUFBLEdBQVUsWUFBQSxHQUFlLEdBRHpCLENBQUE7QUFBQSxVQUVBLE1BQUEsQ0FBTyxNQUFBLENBQUEsWUFBUCxDQUEyQixDQUFDLE9BQTVCLENBQW9DLFFBQXBDLENBRkEsQ0FBQTtBQUFBLFVBR0EsTUFBQSxDQUFPLGNBQWMsQ0FBQyxZQUF0QixDQUFtQyxDQUFDLFdBQXBDLENBQUEsQ0FIQSxDQUFBO0FBQUEsVUFJQSxZQUFZLENBQUMsWUFBYixDQUEwQixPQUExQixDQUpBLENBQUE7aUJBTUEsY0FBQSxDQUFlLFNBQUEsR0FBQTtBQUNiLFlBQUEsTUFBQSxDQUFPLFlBQVAsQ0FBb0IsQ0FBQyxHQUFHLENBQUMsT0FBekIsQ0FBQSxDQUFBLENBQUE7QUFBQSxZQUNBLE1BQUEsQ0FBTyxjQUFjLENBQUMsWUFBdEIsQ0FBbUMsQ0FBQyxHQUFHLENBQUMsV0FBeEMsQ0FBQSxDQURBLENBQUE7bUJBR0EsY0FBQSxDQUFlLFNBQUEsR0FBQTtBQUNiLGNBQUEsTUFBQSxDQUFPLFlBQVksQ0FBQyxZQUFiLENBQUEsQ0FBUCxDQUFtQyxDQUFDLE9BQXBDLENBQTRDLE9BQTVDLENBQUEsQ0FBQTtxQkFDQSxZQUFZLENBQUMsWUFBYixDQUEwQixZQUExQixFQUZhO1lBQUEsQ0FBZixFQUphO1VBQUEsQ0FBZixFQVBhO1FBQUEsQ0FBZixFQUR3QjtNQUFBLENBQTFCLENBakNBLENBQUE7QUFBQSxNQWlEQSxFQUFBLENBQUcsNkNBQUgsRUFBa0QsU0FBQSxHQUFBO0FBQ2hELFFBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDRCQUFoQixFQUE4QyxLQUE5QyxDQUFBLENBQUE7ZUFFQSxjQUFBLENBQWUsU0FBQSxHQUFBO0FBQ2IsY0FBQSxxQkFBQTtBQUFBLFVBQUEsWUFBQSxHQUFlLFlBQVksQ0FBQyxZQUFiLENBQUEsQ0FBZixDQUFBO0FBQUEsVUFDQSxPQUFBLEdBQVUsWUFBQSxHQUFlLEdBRHpCLENBQUE7QUFBQSxVQUVBLE1BQUEsQ0FBTyxNQUFBLENBQUEsWUFBUCxDQUEyQixDQUFDLE9BQTVCLENBQW9DLFFBQXBDLENBRkEsQ0FBQTtBQUFBLFVBSUEsWUFBWSxDQUFDLFlBQWIsQ0FBMEIsT0FBMUIsQ0FKQSxDQUFBO2lCQUtBLGNBQUEsQ0FBZSxTQUFBLEdBQUE7bUJBQ2IsY0FBQSxDQUFlLFNBQUEsR0FBQTtBQUNiLGNBQUEsTUFBQSxDQUFPLFlBQVksQ0FBQyxZQUFiLENBQUEsQ0FBUCxDQUFtQyxDQUFDLEdBQUcsQ0FBQyxPQUF4QyxDQUFnRCxPQUFoRCxDQUFBLENBQUE7cUJBQ0EsTUFBQSxDQUFPLFlBQVksQ0FBQyxZQUFiLENBQUEsQ0FBUCxDQUFtQyxDQUFDLE9BQXBDLENBQTRDLFlBQTVDLEVBRmE7WUFBQSxDQUFmLEVBRGE7VUFBQSxDQUFmLEVBTmE7UUFBQSxDQUFmLEVBSGdEO01BQUEsQ0FBbEQsQ0FqREEsQ0FBQTthQStEQSxFQUFBLENBQUcsaUNBQUgsRUFBc0MsU0FBQSxHQUFBO0FBQ3BDLFFBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLCtCQUFoQixFQUFpRCxNQUFqRCxDQUFBLENBQUE7ZUFFQSxjQUFBLENBQWUsU0FBQSxHQUFBO0FBQ2IsY0FBQSxxQkFBQTtBQUFBLFVBQUEsWUFBQSxHQUFlLFlBQVksQ0FBQyxZQUFiLENBQUEsQ0FBZixDQUFBO0FBQUEsVUFDQSxPQUFBLEdBQVUsWUFBQSxHQUFlLEdBRHpCLENBQUE7QUFBQSxVQUVBLE1BQUEsQ0FBTyxNQUFBLENBQUEsWUFBUCxDQUEyQixDQUFDLE9BQTVCLENBQW9DLFFBQXBDLENBRkEsQ0FBQTtBQUFBLFVBSUEsWUFBWSxDQUFDLFlBQWIsQ0FBMEIsT0FBMUIsQ0FKQSxDQUFBO2lCQUtBLGNBQUEsQ0FBZSxTQUFBLEdBQUE7QUFDYixZQUFBLE1BQUEsQ0FBTyxZQUFQLENBQW9CLENBQUMsR0FBRyxDQUFDLE9BQXpCLENBQUEsQ0FBQSxDQUFBO21CQUNBLGNBQUEsQ0FBZSxTQUFBLEdBQUE7QUFDYixjQUFBLE1BQUEsQ0FBTyxZQUFZLENBQUMsWUFBYixDQUFBLENBQVAsQ0FBbUMsQ0FBQyxPQUFwQyxDQUE0QyxPQUE1QyxDQUFBLENBQUE7cUJBQ0EsWUFBWSxDQUFDLFlBQWIsQ0FBMEIsWUFBMUIsRUFGYTtZQUFBLENBQWYsRUFGYTtVQUFBLENBQWYsRUFOYTtRQUFBLENBQWYsRUFIb0M7TUFBQSxDQUF0QyxFQWhFZ0U7SUFBQSxDQUFsRSxDQXZCQSxDQUFBO0FBQUEsSUFzR0EsUUFBQSxDQUFTLGdDQUFULEVBQTJDLFNBQUEsR0FBQTtBQUN6QyxNQUFBLEVBQUEsQ0FBRyx5Q0FBSCxFQUE4QyxTQUFBLEdBQUE7QUFDNUMsWUFBQSw0Q0FBQTtBQUFBLFFBQUEsVUFBQSxHQUFhLElBQUksQ0FBQyxJQUFMLENBQVU7QUFBQSxVQUFBLE1BQUEsRUFBUSxLQUFSO1NBQVYsQ0FBYixDQUFBO0FBQUEsUUFDQSxnQkFBQSxHQUFtQixJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWIsQ0FBQSxDQUE4QixDQUFBLENBQUEsQ0FBRSxDQUFDLE9BQWpDLENBQXlDLG9CQUF6QyxDQURuQixDQUFBO0FBQUEsUUFFQSxjQUFBLEdBQWlCLEVBQUUsQ0FBQyxZQUFILENBQWdCLGdCQUFoQixDQUFpQyxDQUFDLFFBQWxDLENBQUEsQ0FGakIsQ0FBQTtBQUFBLFFBR0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGtCQUFoQixFQUFvQyxNQUFwQyxDQUhBLENBQUE7QUFBQSxRQUtBLE1BQUEsQ0FBTyxFQUFFLENBQUMsVUFBSCxDQUFjLFVBQWQsQ0FBUCxDQUFpQyxDQUFDLElBQWxDLENBQXVDLEtBQXZDLENBTEEsQ0FBQTtBQUFBLFFBT0EsY0FBQSxDQUFlLFNBQUEsR0FBQTtBQUNiLFVBQUEsS0FBQSxDQUFNLElBQU4sRUFBWSxvQkFBWixDQUFpQyxDQUFDLFNBQWxDLENBQTRDLFVBQTVDLENBQUEsQ0FBQTtpQkFDQSxjQUFjLENBQUMsWUFBWSxDQUFDLE1BQTVCLENBQUEsRUFGYTtRQUFBLENBQWYsQ0FQQSxDQUFBO0FBQUEsUUFXQSxRQUFBLENBQVMsU0FBQSxHQUFBO0FBQ1AsY0FBQSxLQUFBO2lCQUFBLEVBQUUsQ0FBQyxVQUFILENBQWMsVUFBZCxDQUFBLG1FQUFpRSxDQUFFLE9BQXRDLENBQUEsV0FBQSxLQUFtRCxFQUFFLENBQUMsWUFBSCxDQUFnQixVQUFoQixFQUR6RTtRQUFBLENBQVQsQ0FYQSxDQUFBO2VBY0EsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILFVBQUEsTUFBQSxDQUFPLEVBQUUsQ0FBQyxVQUFILENBQWMsVUFBZCxDQUFQLENBQWlDLENBQUMsSUFBbEMsQ0FBdUMsSUFBdkMsQ0FBQSxDQUFBO2lCQUNBLE1BQUEsQ0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsQ0FBb0MsQ0FBQyxPQUFyQyxDQUFBLENBQVAsQ0FBc0QsQ0FBQyxJQUF2RCxDQUE0RCxjQUE1RCxFQUZHO1FBQUEsQ0FBTCxFQWY0QztNQUFBLENBQTlDLENBQUEsQ0FBQTthQW1CQSxFQUFBLENBQUcsZ0RBQUgsRUFBcUQsU0FBQSxHQUFBO0FBQ25ELFlBQUEsNENBQUE7QUFBQSxRQUFBLFVBQUEsR0FBYSxJQUFJLENBQUMsSUFBTCxDQUFVO0FBQUEsVUFBQSxNQUFBLEVBQVEsS0FBUjtTQUFWLENBQWIsQ0FBQTtBQUFBLFFBQ0EsZ0JBQUEsR0FBbUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFiLENBQUEsQ0FBOEIsQ0FBQSxDQUFBLENBQUUsQ0FBQyxPQUFqQyxDQUF5Qyw0QkFBekMsQ0FEbkIsQ0FBQTtBQUFBLFFBRUEsY0FBQSxHQUFpQixFQUFFLENBQUMsWUFBSCxDQUFnQixnQkFBaEIsQ0FBaUMsQ0FBQyxRQUFsQyxDQUFBLENBRmpCLENBQUE7QUFBQSxRQUlBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw0QkFBaEIsRUFBOEMsQ0FBQyxPQUFELEVBQVUsd0JBQVYsQ0FBOUMsQ0FKQSxDQUFBO0FBQUEsUUFLQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsdUJBQWhCLEVBQXlDLENBQUMsTUFBRCxFQUFTLE1BQVQsRUFBaUIsTUFBakIsRUFBeUIsTUFBekIsQ0FBekMsQ0FMQSxDQUFBO0FBQUEsUUFNQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isa0JBQWhCLEVBQW9DLE1BQXBDLENBTkEsQ0FBQTtBQUFBLFFBUUEsTUFBQSxDQUFPLEVBQUUsQ0FBQyxVQUFILENBQWMsVUFBZCxDQUFQLENBQWlDLENBQUMsSUFBbEMsQ0FBdUMsS0FBdkMsQ0FSQSxDQUFBO0FBQUEsUUFVQSxjQUFBLENBQWUsU0FBQSxHQUFBO0FBQ2IsVUFBQSxLQUFBLENBQU0sSUFBTixFQUFZLG9CQUFaLENBQWlDLENBQUMsU0FBbEMsQ0FBNEMsVUFBNUMsQ0FBQSxDQUFBO2lCQUNBLGNBQWMsQ0FBQyxZQUFZLENBQUMsTUFBNUIsQ0FBQSxFQUZhO1FBQUEsQ0FBZixDQVZBLENBQUE7QUFBQSxRQWNBLFFBQUEsQ0FBUyxTQUFBLEdBQUE7QUFDUCxjQUFBLEtBQUE7aUJBQUEsRUFBRSxDQUFDLFVBQUgsQ0FBYyxVQUFkLENBQUEsbUVBQWlFLENBQUUsT0FBdEMsQ0FBQSxXQUFBLEtBQW1ELEVBQUUsQ0FBQyxZQUFILENBQWdCLFVBQWhCLEVBRHpFO1FBQUEsQ0FBVCxDQWRBLENBQUE7ZUFpQkEsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILFVBQUEsTUFBQSxDQUFPLEVBQUUsQ0FBQyxVQUFILENBQWMsVUFBZCxDQUFQLENBQWlDLENBQUMsSUFBbEMsQ0FBdUMsSUFBdkMsQ0FBQSxDQUFBO2lCQUNBLE1BQUEsQ0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsQ0FBb0MsQ0FBQyxPQUFyQyxDQUFBLENBQVAsQ0FBc0QsQ0FBQyxJQUF2RCxDQUE0RCxjQUE1RCxFQUZHO1FBQUEsQ0FBTCxFQWxCbUQ7TUFBQSxDQUFyRCxFQXBCeUM7SUFBQSxDQUEzQyxDQXRHQSxDQUFBO0FBQUEsSUFnSkEsUUFBQSxDQUFTLGdDQUFULEVBQTJDLFNBQUEsR0FBQTthQUN6QyxFQUFBLENBQUcsb0JBQUgsRUFBeUIsU0FBQSxHQUFBO2VBQ3ZCLGNBQUEsQ0FBZSxTQUFBLEdBQUE7QUFDYixVQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBZCxDQUF1QixnQkFBZ0IsQ0FBQyxhQUFqQixDQUErQixvQkFBL0IsQ0FBdkIsRUFBNkUsY0FBN0UsQ0FBQSxDQUFBO0FBQUEsVUFFQSxNQUFBLENBQU8sY0FBYyxDQUFDLFlBQVksQ0FBQyxPQUFuQyxDQUEyQyxDQUFDLElBQTVDLENBQWlELElBQWpELENBRkEsQ0FBQTtBQUFBLFVBSUEsUUFBQSxDQUFTLFNBQUEsR0FBQTttQkFDUCxDQUFBLGNBQWUsQ0FBQyxZQUFZLENBQUMsUUFEdEI7VUFBQSxDQUFULENBSkEsQ0FBQTtpQkFPQSxJQUFBLENBQUssU0FBQSxHQUFBO21CQUNILE1BQUEsQ0FBTyxjQUFjLENBQUMsWUFBWSxDQUFDLE9BQW5DLENBQTJDLENBQUMsSUFBNUMsQ0FBaUQsS0FBakQsRUFERztVQUFBLENBQUwsRUFSYTtRQUFBLENBQWYsRUFEdUI7TUFBQSxDQUF6QixFQUR5QztJQUFBLENBQTNDLENBaEpBLENBQUE7V0E2SkEsUUFBQSxDQUFTLDBEQUFULEVBQXFFLFNBQUEsR0FBQTtBQUNuRSxNQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxRQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBZCxDQUF1QixnQkFBdkIsRUFBeUMsOEJBQXpDLENBQUEsQ0FBQTtBQUFBLFFBQ0EsZUFBQSxDQUFnQixTQUFBLEdBQUE7aUJBQUcsa0JBQUg7UUFBQSxDQUFoQixDQURBLENBQUE7ZUFFQSxJQUFBLENBQUssU0FBQSxHQUFBO2lCQUNILFFBQUEsQ0FBUyxTQUFBLEdBQUE7bUJBQ1AsQ0FBQSxjQUFlLENBQUMsWUFBWSxDQUFDLE9BQTdCLElBQXlDLGNBQWMsQ0FBQyxZQUFZLENBQUMsU0FBNUIsQ0FBQSxFQURsQztVQUFBLENBQVQsRUFERztRQUFBLENBQUwsRUFIUztNQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsTUFPQSxFQUFBLENBQUcsOENBQUgsRUFBbUQsU0FBQSxHQUFBO0FBQ2pELFlBQUEsT0FBQTtBQUFBLFFBQUEsT0FBQSxHQUFVLGNBQWMsQ0FBQyxZQUFZLENBQUMsSUFBNUIsQ0FBaUMsR0FBakMsQ0FBcUMsQ0FBQyxJQUF0QyxDQUFBLENBQVYsQ0FBQTtBQUFBLFFBRUEsTUFBQSxDQUFPLGNBQWMsQ0FBQyxZQUFZLENBQUMsUUFBNUIsQ0FBQSxDQUFQLENBQThDLENBQUMsWUFBL0MsQ0FBNEQsQ0FBNUQsQ0FGQSxDQUFBO0FBQUEsUUFHQSxNQUFBLENBQU8sT0FBTyxDQUFDLElBQVIsQ0FBQSxDQUFQLENBQXNCLENBQUMsU0FBdkIsQ0FBaUMsZUFBakMsQ0FIQSxDQUFBO2VBSUEsTUFBQSxDQUFPLE9BQU8sQ0FBQyxTQUFSLENBQUEsQ0FBUCxDQUEyQixDQUFDLElBQTVCLENBQWlDLElBQWpDLEVBTGlEO01BQUEsQ0FBbkQsQ0FQQSxDQUFBO2FBY0EsRUFBQSxDQUFHLGtDQUFILEVBQXVDLFNBQUEsR0FBQTtBQUNyQyxRQUFBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2lCQUNkLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixVQUFwQixFQURjO1FBQUEsQ0FBaEIsQ0FBQSxDQUFBO0FBQUEsUUFHQSxRQUFBLENBQVMsU0FBQSxHQUFBO2lCQUNQLENBQUEsY0FBZSxDQUFDLFlBQVksQ0FBQyxRQUR0QjtRQUFBLENBQVQsQ0FIQSxDQUFBO2VBTUEsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILGNBQUEsS0FBQTtBQUFBLFVBQUEsS0FBQSxHQUFRLGNBQWMsQ0FBQyxZQUFZLENBQUMsUUFBNUIsQ0FBQSxDQUFSLENBQUE7QUFBQSxVQUNBLE9BQU8sQ0FBQyxHQUFSLENBQVksS0FBWixDQURBLENBQUE7QUFBQSxVQUVBLE1BQUEsQ0FBTyxLQUFQLENBQWEsQ0FBQyxZQUFkLENBQTJCLENBQTNCLENBRkEsQ0FBQTtBQUFBLFVBR0EsTUFBQSxDQUFPLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFoQixDQUFzQixDQUFDLElBQXZCLENBQTRCLE9BQTVCLENBSEEsQ0FBQTtBQUFBLFVBSUEsTUFBQSxDQUFPLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxTQUFoQixDQUEwQixDQUFDLElBQTNCLENBQWdDLGNBQWhDLENBSkEsQ0FBQTtpQkFLQSxNQUFBLENBQU8sS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLFlBQWhCLENBQTZCLENBQUMsSUFBOUIsQ0FBbUMsVUFBbkMsRUFORztRQUFBLENBQUwsRUFQcUM7TUFBQSxDQUF2QyxFQWZtRTtJQUFBLENBQXJFLEVBOUp3RDtFQUFBLENBQTFELENBSkEsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/gsmyrnaios/.atom/packages/todo-show/spec/show-todo-spec.coffee
