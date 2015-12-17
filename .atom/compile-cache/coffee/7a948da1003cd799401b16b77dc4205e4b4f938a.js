(function() {
  var MinimapGitDiff, WorkspaceView;

  MinimapGitDiff = require('../lib/minimap-git-diff');

  WorkspaceView = require('atom').WorkspaceView;

  describe("MinimapGitDiff", function() {
    var activationPromise;
    activationPromise = null;
    beforeEach(function() {
      atom.workspaceView = new WorkspaceView;
      return activationPromise = atom.packages.activatePackage('minimap-git-diff');
    });
    return describe("when the minimap-git-diff:toggle event is triggered", function() {
      return it("attaches and then detaches the view", function() {
        expect(atom.workspaceView.find('.minimap-git-diff')).not.toExist();
        atom.workspaceView.trigger('minimap-git-diff:toggle');
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          expect(atom.workspaceView.find('.minimap-git-diff')).toExist();
          atom.workspaceView.trigger('minimap-git-diff:toggle');
          return expect(atom.workspaceView.find('.minimap-git-diff')).not.toExist();
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy9taW5pbWFwLWdpdC1kaWZmL3NwZWMvbWluaW1hcC1naXQtZGlmZi1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw2QkFBQTs7QUFBQSxFQUFBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLHlCQUFSLENBQWpCLENBQUE7O0FBQUEsRUFDQyxnQkFBaUIsT0FBQSxDQUFRLE1BQVIsRUFBakIsYUFERCxDQUFBOztBQUFBLEVBUUEsUUFBQSxDQUFTLGdCQUFULEVBQTJCLFNBQUEsR0FBQTtBQUN6QixRQUFBLGlCQUFBO0FBQUEsSUFBQSxpQkFBQSxHQUFvQixJQUFwQixDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsTUFBQSxJQUFJLENBQUMsYUFBTCxHQUFxQixHQUFBLENBQUEsYUFBckIsQ0FBQTthQUNBLGlCQUFBLEdBQW9CLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixrQkFBOUIsRUFGWDtJQUFBLENBQVgsQ0FGQSxDQUFBO1dBTUEsUUFBQSxDQUFTLHFEQUFULEVBQWdFLFNBQUEsR0FBQTthQUM5RCxFQUFBLENBQUcscUNBQUgsRUFBMEMsU0FBQSxHQUFBO0FBQ3hDLFFBQUEsTUFBQSxDQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBbkIsQ0FBd0IsbUJBQXhCLENBQVAsQ0FBb0QsQ0FBQyxHQUFHLENBQUMsT0FBekQsQ0FBQSxDQUFBLENBQUE7QUFBQSxRQUlBLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIseUJBQTNCLENBSkEsQ0FBQTtBQUFBLFFBTUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7aUJBQ2Qsa0JBRGM7UUFBQSxDQUFoQixDQU5BLENBQUE7ZUFTQSxJQUFBLENBQUssU0FBQSxHQUFBO0FBQ0gsVUFBQSxNQUFBLENBQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFuQixDQUF3QixtQkFBeEIsQ0FBUCxDQUFvRCxDQUFDLE9BQXJELENBQUEsQ0FBQSxDQUFBO0FBQUEsVUFDQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLHlCQUEzQixDQURBLENBQUE7aUJBRUEsTUFBQSxDQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBbkIsQ0FBd0IsbUJBQXhCLENBQVAsQ0FBb0QsQ0FBQyxHQUFHLENBQUMsT0FBekQsQ0FBQSxFQUhHO1FBQUEsQ0FBTCxFQVZ3QztNQUFBLENBQTFDLEVBRDhEO0lBQUEsQ0FBaEUsRUFQeUI7RUFBQSxDQUEzQixDQVJBLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/gsmyrnaios/.atom/packages/minimap-git-diff/spec/minimap-git-diff-spec.coffee
