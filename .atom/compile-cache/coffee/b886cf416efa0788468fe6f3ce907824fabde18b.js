(function() {
  var MinimapFindAndReplace, WorkspaceView;

  MinimapFindAndReplace = require('../lib/minimap-find-and-replace');

  WorkspaceView = require('atom').WorkspaceView;

  describe("MinimapFindAndReplace", function() {
    beforeEach(function() {
      runs(function() {
        atom.workspaceView = new WorkspaceView;
        return atom.workspaceView.openSync('sample.js');
      });
      runs(function() {
        var editorView;
        atom.workspaceView.attachToDom();
        editorView = atom.workspaceView.getActiveView();
        return editorView.setText("This is the file content");
      });
      waitsForPromise(function() {
        var promise;
        promise = atom.packages.activatePackage('minimap');
        atom.workspaceView.trigger('minimap:toggle');
        return promise;
      });
      return waitsForPromise(function() {
        var promise;
        promise = atom.packages.activatePackage('find-and-replace');
        atom.workspaceView.trigger('find-and-replace:show');
        return promise;
      });
    });
    return describe("when the toggle event is triggered", function() {
      beforeEach(function() {
        return waitsForPromise(function() {
          var promise;
          promise = atom.packages.activatePackage('minimap-find-and-replace');
          atom.workspaceView.trigger('minimap-find-and-replace:toggle');
          return promise;
        });
      });
      return it('should exist', function() {
        return expect();
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy9taW5pbWFwLWZpbmQtYW5kLXJlcGxhY2Uvc3BlYy9taW5pbWFwLWZpbmQtYW5kLXJlcGxhY2Utc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsb0NBQUE7O0FBQUEsRUFBQSxxQkFBQSxHQUF3QixPQUFBLENBQVEsaUNBQVIsQ0FBeEIsQ0FBQTs7QUFBQSxFQUNDLGdCQUFpQixPQUFBLENBQVEsTUFBUixFQUFqQixhQURELENBQUE7O0FBQUEsRUFHQSxRQUFBLENBQVMsdUJBQVQsRUFBa0MsU0FBQSxHQUFBO0FBQ2hDLElBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILFFBQUEsSUFBSSxDQUFDLGFBQUwsR0FBcUIsR0FBQSxDQUFBLGFBQXJCLENBQUE7ZUFDQSxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQW5CLENBQTRCLFdBQTVCLEVBRkc7TUFBQSxDQUFMLENBQUEsQ0FBQTtBQUFBLE1BSUEsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILFlBQUEsVUFBQTtBQUFBLFFBQUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFuQixDQUFBLENBQUEsQ0FBQTtBQUFBLFFBQ0EsVUFBQSxHQUFhLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBbkIsQ0FBQSxDQURiLENBQUE7ZUFFQSxVQUFVLENBQUMsT0FBWCxDQUFtQiwwQkFBbkIsRUFIRztNQUFBLENBQUwsQ0FKQSxDQUFBO0FBQUEsTUFTQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtBQUNkLFlBQUEsT0FBQTtBQUFBLFFBQUEsT0FBQSxHQUFVLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixTQUE5QixDQUFWLENBQUE7QUFBQSxRQUNBLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIsZ0JBQTNCLENBREEsQ0FBQTtlQUVBLFFBSGM7TUFBQSxDQUFoQixDQVRBLENBQUE7YUFjQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtBQUNkLFlBQUEsT0FBQTtBQUFBLFFBQUEsT0FBQSxHQUFVLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixrQkFBOUIsQ0FBVixDQUFBO0FBQUEsUUFDQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLHVCQUEzQixDQURBLENBQUE7ZUFFQSxRQUhjO01BQUEsQ0FBaEIsRUFmUztJQUFBLENBQVgsQ0FBQSxDQUFBO1dBb0JBLFFBQUEsQ0FBUyxvQ0FBVCxFQUErQyxTQUFBLEdBQUE7QUFDN0MsTUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO2VBQ1QsZUFBQSxDQUFnQixTQUFBLEdBQUE7QUFDZCxjQUFBLE9BQUE7QUFBQSxVQUFBLE9BQUEsR0FBVSxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsMEJBQTlCLENBQVYsQ0FBQTtBQUFBLFVBQ0EsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFuQixDQUEyQixpQ0FBM0IsQ0FEQSxDQUFBO2lCQUVBLFFBSGM7UUFBQSxDQUFoQixFQURTO01BQUEsQ0FBWCxDQUFBLENBQUE7YUFNQSxFQUFBLENBQUcsY0FBSCxFQUFtQixTQUFBLEdBQUE7ZUFDakIsTUFBQSxDQUFBLEVBRGlCO01BQUEsQ0FBbkIsRUFQNkM7SUFBQSxDQUEvQyxFQXJCZ0M7RUFBQSxDQUFsQyxDQUhBLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/gsmyrnaios/.atom/packages/minimap-find-and-replace/spec/minimap-find-and-replace-spec.coffee
