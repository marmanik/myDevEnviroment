(function() {
  var Projects;

  Projects = require('../lib/projects');

  describe("Projects", function() {
    var data, projects;
    projects = null;
    data = {
      testproject1: {
        title: "Test project 1",
        paths: ["/Users/project-1"]
      },
      testproject2: {
        title: "Test project 2",
        paths: ["/Users/project-2"]
      }
    };
    beforeEach(function() {
      projects = new Projects();
      spyOn(projects.db, 'readFile').andCallFake(function(callback) {
        return callback(data);
      });
      return spyOn(projects.db, 'writeFile').andCallFake(function(projects, callback) {
        data = projects;
        return callback();
      });
    });
    return it("returns all projects", function() {
      return projects.getAll(function(projects) {
        return expect(projects.length).toBe(2);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy9wcm9qZWN0LW1hbmFnZXIvc3BlYy9wcm9qZWN0cy1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxRQUFBOztBQUFBLEVBQUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxpQkFBUixDQUFYLENBQUE7O0FBQUEsRUFFQSxRQUFBLENBQVMsVUFBVCxFQUFxQixTQUFBLEdBQUE7QUFDbkIsUUFBQSxjQUFBO0FBQUEsSUFBQSxRQUFBLEdBQVcsSUFBWCxDQUFBO0FBQUEsSUFFQSxJQUFBLEdBQ0U7QUFBQSxNQUFBLFlBQUEsRUFDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLGdCQUFQO0FBQUEsUUFDQSxLQUFBLEVBQU8sQ0FDTCxrQkFESyxDQURQO09BREY7QUFBQSxNQUtBLFlBQUEsRUFDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLGdCQUFQO0FBQUEsUUFDQSxLQUFBLEVBQU8sQ0FDTCxrQkFESyxDQURQO09BTkY7S0FIRixDQUFBO0FBQUEsSUFjQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsTUFBQSxRQUFBLEdBQWUsSUFBQSxRQUFBLENBQUEsQ0FBZixDQUFBO0FBQUEsTUFDQSxLQUFBLENBQU0sUUFBUSxDQUFDLEVBQWYsRUFBbUIsVUFBbkIsQ0FBOEIsQ0FBQyxXQUEvQixDQUEyQyxTQUFDLFFBQUQsR0FBQTtlQUN6QyxRQUFBLENBQVMsSUFBVCxFQUR5QztNQUFBLENBQTNDLENBREEsQ0FBQTthQUdBLEtBQUEsQ0FBTSxRQUFRLENBQUMsRUFBZixFQUFtQixXQUFuQixDQUErQixDQUFDLFdBQWhDLENBQTRDLFNBQUMsUUFBRCxFQUFXLFFBQVgsR0FBQTtBQUMxQyxRQUFBLElBQUEsR0FBTyxRQUFQLENBQUE7ZUFDQSxRQUFBLENBQUEsRUFGMEM7TUFBQSxDQUE1QyxFQUpTO0lBQUEsQ0FBWCxDQWRBLENBQUE7V0FzQkEsRUFBQSxDQUFHLHNCQUFILEVBQTJCLFNBQUEsR0FBQTthQUN6QixRQUFRLENBQUMsTUFBVCxDQUFnQixTQUFDLFFBQUQsR0FBQTtlQUNkLE1BQUEsQ0FBTyxRQUFRLENBQUMsTUFBaEIsQ0FBdUIsQ0FBQyxJQUF4QixDQUE2QixDQUE3QixFQURjO01BQUEsQ0FBaEIsRUFEeUI7SUFBQSxDQUEzQixFQXZCbUI7RUFBQSxDQUFyQixDQUZBLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/gsmyrnaios/.atom/packages/project-manager/spec/projects-spec.coffee
