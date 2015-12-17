(function() {
  var $, Project, ProjectsListView;

  ProjectsListView = require('../lib/projects-list-view');

  Project = require('../lib/project');

  $ = require('atom-space-pen-views').$;

  describe("List View", function() {
    var data, filterEditorView, list, listView, projects, workspaceElement, _ref;
    _ref = [], listView = _ref[0], workspaceElement = _ref[1], list = _ref[2], filterEditorView = _ref[3];
    data = {
      testproject1: {
        _id: 'testproject1',
        title: "Test project 1",
        paths: ["/Users/project-1"]
      },
      testproject2: {
        _id: 'testproject2',
        title: "Test project 2",
        paths: ["/Users/project-2"],
        template: "test-template",
        icon: "icon-bug",
        group: "Test"
      }
    };
    projects = function() {
      var array, key, project, setting;
      array = [];
      for (key in data) {
        setting = data[key];
        project = new Project(setting);
        array.push(project);
      }
      return array;
    };
    beforeEach(function() {
      workspaceElement = atom.views.getView(atom.workspace);
      listView = new ProjectsListView;
      return list = listView.list, filterEditorView = listView.filterEditorView, listView;
    });
    it("will list all projects", function() {
      listView.show(projects());
      return expect(list.find('li').length).toBe(2);
    });
    it("will add the correct icon to each project", function() {
      var icon1, icon2;
      listView.show(projects());
      icon1 = list.find('li[data-project-id="testproject1"]').find('.icon');
      icon2 = list.find('li[data-project-id="testproject2"]').find('.icon');
      expect(icon1.attr('class')).toContain('icon-chevron-right');
      return expect(icon2.attr('class')).toContain('icon-bug');
    });
    describe("When the text of the mini editor changes", function() {
      beforeEach(function() {
        listView.show(projects());
        return listView.isOnDom = function() {
          return true;
        };
      });
      it("will only list projects with the correct title", function() {
        filterEditorView.getModel().setText('title:1');
        window.advanceClock(listView.inputThrottle);
        expect(listView.getFilterKey()).toBe('title');
        expect(listView.getFilterQuery()).toBe('1');
        return expect(list.find('li').length).toBe(1);
      });
      it("will only list projects with the correct group", function() {
        filterEditorView.getModel().setText('group:test');
        window.advanceClock(listView.inputThrottle);
        expect(listView.getFilterKey()).toBe('group');
        expect(listView.getFilterQuery()).toBe('test');
        expect(list.find('li').length).toBe(1);
        return expect(list.find('li:eq(0)').find('.project-manager-list-group')).toHaveText('Test');
      });
      it("will only list projects with the correct template", function() {
        filterEditorView.getModel().setText('template:test');
        window.advanceClock(listView.inputThrottle);
        expect(listView.getFilterKey()).toBe('template');
        expect(listView.getFilterQuery()).toBe('test');
        return expect(list.find('li').length).toBe(1);
      });
      return it("will fall back to default filter key if it's not valid", function() {
        filterEditorView.getModel().setText('test:1');
        window.advanceClock(listView.inputThrottle);
        expect(listView.getFilterKey()).toBe(listView.defaultFilterKey);
        expect(listView.getFilterQuery()).toBe('1');
        return expect(list.find('li').length).toBe(1);
      });
    });
    return describe("It sorts the projects in correct order", function() {
      it("sorts after title", function() {
        atom.config.set('project-manager.sortBy', 'title');
        listView.show(projects());
        return expect(list.find('li:eq(0)').data('projectId')).toBe("testproject1");
      });
      return it("sort after group", function() {
        atom.config.set('project-manager.sortBy', 'group');
        listView.show(projects());
        return expect(list.find('li:eq(0)').data('projectId')).toBe("testproject2");
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy9wcm9qZWN0LW1hbmFnZXIvc3BlYy9wcm9qZWN0cy1saXN0LXZpZXctc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsNEJBQUE7O0FBQUEsRUFBQSxnQkFBQSxHQUFtQixPQUFBLENBQVEsMkJBQVIsQ0FBbkIsQ0FBQTs7QUFBQSxFQUNBLE9BQUEsR0FBVSxPQUFBLENBQVEsZ0JBQVIsQ0FEVixDQUFBOztBQUFBLEVBRUMsSUFBSyxPQUFBLENBQVEsc0JBQVIsRUFBTCxDQUZELENBQUE7O0FBQUEsRUFJQSxRQUFBLENBQVMsV0FBVCxFQUFzQixTQUFBLEdBQUE7QUFDcEIsUUFBQSx3RUFBQTtBQUFBLElBQUEsT0FBdUQsRUFBdkQsRUFBQyxrQkFBRCxFQUFXLDBCQUFYLEVBQTZCLGNBQTdCLEVBQW1DLDBCQUFuQyxDQUFBO0FBQUEsSUFFQSxJQUFBLEdBQ0U7QUFBQSxNQUFBLFlBQUEsRUFDRTtBQUFBLFFBQUEsR0FBQSxFQUFLLGNBQUw7QUFBQSxRQUNBLEtBQUEsRUFBTyxnQkFEUDtBQUFBLFFBRUEsS0FBQSxFQUFPLENBQUMsa0JBQUQsQ0FGUDtPQURGO0FBQUEsTUFJQSxZQUFBLEVBQ0U7QUFBQSxRQUFBLEdBQUEsRUFBSyxjQUFMO0FBQUEsUUFDQSxLQUFBLEVBQU8sZ0JBRFA7QUFBQSxRQUVBLEtBQUEsRUFBTyxDQUFDLGtCQUFELENBRlA7QUFBQSxRQUdBLFFBQUEsRUFBVSxlQUhWO0FBQUEsUUFJQSxJQUFBLEVBQU0sVUFKTjtBQUFBLFFBS0EsS0FBQSxFQUFPLE1BTFA7T0FMRjtLQUhGLENBQUE7QUFBQSxJQWVBLFFBQUEsR0FBVyxTQUFBLEdBQUE7QUFDVCxVQUFBLDRCQUFBO0FBQUEsTUFBQSxLQUFBLEdBQVEsRUFBUixDQUFBO0FBQ0EsV0FBQSxXQUFBOzRCQUFBO0FBQ0UsUUFBQSxPQUFBLEdBQWMsSUFBQSxPQUFBLENBQVEsT0FBUixDQUFkLENBQUE7QUFBQSxRQUNBLEtBQUssQ0FBQyxJQUFOLENBQVcsT0FBWCxDQURBLENBREY7QUFBQSxPQURBO0FBSUEsYUFBTyxLQUFQLENBTFM7SUFBQSxDQWZYLENBQUE7QUFBQSxJQXNCQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsTUFBQSxnQkFBQSxHQUFtQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsSUFBSSxDQUFDLFNBQXhCLENBQW5CLENBQUE7QUFBQSxNQUNBLFFBQUEsR0FBVyxHQUFBLENBQUEsZ0JBRFgsQ0FBQTthQUVDLGdCQUFBLElBQUQsRUFBTyw0QkFBQSxnQkFBUCxFQUEyQixTQUhsQjtJQUFBLENBQVgsQ0F0QkEsQ0FBQTtBQUFBLElBMkJBLEVBQUEsQ0FBRyx3QkFBSCxFQUE2QixTQUFBLEdBQUE7QUFDM0IsTUFBQSxRQUFRLENBQUMsSUFBVCxDQUFjLFFBQUEsQ0FBQSxDQUFkLENBQUEsQ0FBQTthQUNBLE1BQUEsQ0FBTyxJQUFJLENBQUMsSUFBTCxDQUFVLElBQVYsQ0FBZSxDQUFDLE1BQXZCLENBQThCLENBQUMsSUFBL0IsQ0FBb0MsQ0FBcEMsRUFGMkI7SUFBQSxDQUE3QixDQTNCQSxDQUFBO0FBQUEsSUErQkEsRUFBQSxDQUFHLDJDQUFILEVBQWdELFNBQUEsR0FBQTtBQUM5QyxVQUFBLFlBQUE7QUFBQSxNQUFBLFFBQVEsQ0FBQyxJQUFULENBQWMsUUFBQSxDQUFBLENBQWQsQ0FBQSxDQUFBO0FBQUEsTUFDQSxLQUFBLEdBQVEsSUFBSSxDQUFDLElBQUwsQ0FBVSxvQ0FBVixDQUErQyxDQUFDLElBQWhELENBQXFELE9BQXJELENBRFIsQ0FBQTtBQUFBLE1BRUEsS0FBQSxHQUFRLElBQUksQ0FBQyxJQUFMLENBQVUsb0NBQVYsQ0FBK0MsQ0FBQyxJQUFoRCxDQUFxRCxPQUFyRCxDQUZSLENBQUE7QUFBQSxNQUdBLE1BQUEsQ0FBTyxLQUFLLENBQUMsSUFBTixDQUFXLE9BQVgsQ0FBUCxDQUEyQixDQUFDLFNBQTVCLENBQXNDLG9CQUF0QyxDQUhBLENBQUE7YUFJQSxNQUFBLENBQU8sS0FBSyxDQUFDLElBQU4sQ0FBVyxPQUFYLENBQVAsQ0FBMkIsQ0FBQyxTQUE1QixDQUFzQyxVQUF0QyxFQUw4QztJQUFBLENBQWhELENBL0JBLENBQUE7QUFBQSxJQXNDQSxRQUFBLENBQVMsMENBQVQsRUFBcUQsU0FBQSxHQUFBO0FBQ25ELE1BQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFFBQUEsUUFBUSxDQUFDLElBQVQsQ0FBYyxRQUFBLENBQUEsQ0FBZCxDQUFBLENBQUE7ZUFDQSxRQUFRLENBQUMsT0FBVCxHQUFtQixTQUFBLEdBQUE7aUJBQUcsS0FBSDtRQUFBLEVBRlY7TUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLE1BSUEsRUFBQSxDQUFHLGdEQUFILEVBQXFELFNBQUEsR0FBQTtBQUNuRCxRQUFBLGdCQUFnQixDQUFDLFFBQWpCLENBQUEsQ0FBMkIsQ0FBQyxPQUE1QixDQUFvQyxTQUFwQyxDQUFBLENBQUE7QUFBQSxRQUNBLE1BQU0sQ0FBQyxZQUFQLENBQW9CLFFBQVEsQ0FBQyxhQUE3QixDQURBLENBQUE7QUFBQSxRQUdBLE1BQUEsQ0FBTyxRQUFRLENBQUMsWUFBVCxDQUFBLENBQVAsQ0FBK0IsQ0FBQyxJQUFoQyxDQUFxQyxPQUFyQyxDQUhBLENBQUE7QUFBQSxRQUlBLE1BQUEsQ0FBTyxRQUFRLENBQUMsY0FBVCxDQUFBLENBQVAsQ0FBaUMsQ0FBQyxJQUFsQyxDQUF1QyxHQUF2QyxDQUpBLENBQUE7ZUFLQSxNQUFBLENBQU8sSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFWLENBQWUsQ0FBQyxNQUF2QixDQUE4QixDQUFDLElBQS9CLENBQW9DLENBQXBDLEVBTm1EO01BQUEsQ0FBckQsQ0FKQSxDQUFBO0FBQUEsTUFZQSxFQUFBLENBQUcsZ0RBQUgsRUFBcUQsU0FBQSxHQUFBO0FBQ25ELFFBQUEsZ0JBQWdCLENBQUMsUUFBakIsQ0FBQSxDQUEyQixDQUFDLE9BQTVCLENBQW9DLFlBQXBDLENBQUEsQ0FBQTtBQUFBLFFBQ0EsTUFBTSxDQUFDLFlBQVAsQ0FBb0IsUUFBUSxDQUFDLGFBQTdCLENBREEsQ0FBQTtBQUFBLFFBR0EsTUFBQSxDQUFPLFFBQVEsQ0FBQyxZQUFULENBQUEsQ0FBUCxDQUErQixDQUFDLElBQWhDLENBQXFDLE9BQXJDLENBSEEsQ0FBQTtBQUFBLFFBSUEsTUFBQSxDQUFPLFFBQVEsQ0FBQyxjQUFULENBQUEsQ0FBUCxDQUFpQyxDQUFDLElBQWxDLENBQXVDLE1BQXZDLENBSkEsQ0FBQTtBQUFBLFFBS0EsTUFBQSxDQUFPLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBVixDQUFlLENBQUMsTUFBdkIsQ0FBOEIsQ0FBQyxJQUEvQixDQUFvQyxDQUFwQyxDQUxBLENBQUE7ZUFNQSxNQUFBLENBQU8sSUFBSSxDQUFDLElBQUwsQ0FBVSxVQUFWLENBQ0wsQ0FBQyxJQURJLENBQ0MsNkJBREQsQ0FBUCxDQUN1QyxDQUFDLFVBRHhDLENBQ21ELE1BRG5ELEVBUG1EO01BQUEsQ0FBckQsQ0FaQSxDQUFBO0FBQUEsTUFzQkEsRUFBQSxDQUFHLG1EQUFILEVBQXdELFNBQUEsR0FBQTtBQUN0RCxRQUFBLGdCQUFnQixDQUFDLFFBQWpCLENBQUEsQ0FBMkIsQ0FBQyxPQUE1QixDQUFvQyxlQUFwQyxDQUFBLENBQUE7QUFBQSxRQUNBLE1BQU0sQ0FBQyxZQUFQLENBQW9CLFFBQVEsQ0FBQyxhQUE3QixDQURBLENBQUE7QUFBQSxRQUdBLE1BQUEsQ0FBTyxRQUFRLENBQUMsWUFBVCxDQUFBLENBQVAsQ0FBK0IsQ0FBQyxJQUFoQyxDQUFxQyxVQUFyQyxDQUhBLENBQUE7QUFBQSxRQUlBLE1BQUEsQ0FBTyxRQUFRLENBQUMsY0FBVCxDQUFBLENBQVAsQ0FBaUMsQ0FBQyxJQUFsQyxDQUF1QyxNQUF2QyxDQUpBLENBQUE7ZUFLQSxNQUFBLENBQU8sSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFWLENBQWUsQ0FBQyxNQUF2QixDQUE4QixDQUFDLElBQS9CLENBQW9DLENBQXBDLEVBTnNEO01BQUEsQ0FBeEQsQ0F0QkEsQ0FBQTthQThCQSxFQUFBLENBQUcsd0RBQUgsRUFBNkQsU0FBQSxHQUFBO0FBQzNELFFBQUEsZ0JBQWdCLENBQUMsUUFBakIsQ0FBQSxDQUEyQixDQUFDLE9BQTVCLENBQW9DLFFBQXBDLENBQUEsQ0FBQTtBQUFBLFFBQ0EsTUFBTSxDQUFDLFlBQVAsQ0FBb0IsUUFBUSxDQUFDLGFBQTdCLENBREEsQ0FBQTtBQUFBLFFBR0EsTUFBQSxDQUFPLFFBQVEsQ0FBQyxZQUFULENBQUEsQ0FBUCxDQUErQixDQUFDLElBQWhDLENBQXFDLFFBQVEsQ0FBQyxnQkFBOUMsQ0FIQSxDQUFBO0FBQUEsUUFJQSxNQUFBLENBQU8sUUFBUSxDQUFDLGNBQVQsQ0FBQSxDQUFQLENBQWlDLENBQUMsSUFBbEMsQ0FBdUMsR0FBdkMsQ0FKQSxDQUFBO2VBS0EsTUFBQSxDQUFPLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBVixDQUFlLENBQUMsTUFBdkIsQ0FBOEIsQ0FBQyxJQUEvQixDQUFvQyxDQUFwQyxFQU4yRDtNQUFBLENBQTdELEVBL0JtRDtJQUFBLENBQXJELENBdENBLENBQUE7V0E2RUEsUUFBQSxDQUFTLHdDQUFULEVBQW1ELFNBQUEsR0FBQTtBQUNqRCxNQUFBLEVBQUEsQ0FBRyxtQkFBSCxFQUF3QixTQUFBLEdBQUE7QUFDdEIsUUFBQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isd0JBQWhCLEVBQTBDLE9BQTFDLENBQUEsQ0FBQTtBQUFBLFFBQ0EsUUFBUSxDQUFDLElBQVQsQ0FBYyxRQUFBLENBQUEsQ0FBZCxDQURBLENBQUE7ZUFFQSxNQUFBLENBQU8sSUFBSSxDQUFDLElBQUwsQ0FBVSxVQUFWLENBQXFCLENBQUMsSUFBdEIsQ0FBMkIsV0FBM0IsQ0FBUCxDQUErQyxDQUFDLElBQWhELENBQXFELGNBQXJELEVBSHNCO01BQUEsQ0FBeEIsQ0FBQSxDQUFBO2FBS0EsRUFBQSxDQUFHLGtCQUFILEVBQXVCLFNBQUEsR0FBQTtBQUNyQixRQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix3QkFBaEIsRUFBMEMsT0FBMUMsQ0FBQSxDQUFBO0FBQUEsUUFDQSxRQUFRLENBQUMsSUFBVCxDQUFjLFFBQUEsQ0FBQSxDQUFkLENBREEsQ0FBQTtlQUVBLE1BQUEsQ0FBTyxJQUFJLENBQUMsSUFBTCxDQUFVLFVBQVYsQ0FBcUIsQ0FBQyxJQUF0QixDQUEyQixXQUEzQixDQUFQLENBQStDLENBQUMsSUFBaEQsQ0FBcUQsY0FBckQsRUFIcUI7TUFBQSxDQUF2QixFQU5pRDtJQUFBLENBQW5ELEVBOUVvQjtFQUFBLENBQXRCLENBSkEsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/gsmyrnaios/.atom/packages/project-manager/spec/projects-list-view-spec.coffee
