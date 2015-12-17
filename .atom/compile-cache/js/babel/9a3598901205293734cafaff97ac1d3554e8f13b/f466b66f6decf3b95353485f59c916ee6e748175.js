'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var CompositeDisposable = undefined;
var ProjectsListView = undefined;
var Projects = undefined;
var SaveDialog = undefined;
var DB = undefined;

var ProjectManager = (function () {
  function ProjectManager() {
    _classCallCheck(this, ProjectManager);
  }

  _createClass(ProjectManager, null, [{
    key: 'activate',
    value: function activate() {
      var _this = this;

      CompositeDisposable = require('atom').CompositeDisposable;
      this.disposables = new CompositeDisposable();

      this.disposables.add(atom.commands.add('atom-workspace', {
        'project-manager:list-projects': function projectManagerListProjects() {
          ProjectsListView = require('./projects-list-view');
          var projectsListView = new ProjectsListView();
          projectsListView.toggle();
        },

        'project-manager:save-project': function projectManagerSaveProject() {
          SaveDialog = require('./save-dialog');
          var saveDialog = new SaveDialog();
          saveDialog.attach();
        },

        'project-manager:edit-projects': function projectManagerEditProjects() {
          DB = require('./db');
          var db = new DB();
          atom.workspace.open(db.file());
        }
      }));

      atom.project.onDidChangePaths(function () {
        return _this.updatePaths();
      });
      this.loadProject();
    }
  }, {
    key: 'loadProject',
    value: function loadProject() {
      var _this2 = this;

      Projects = require('./projects');
      this.projects = new Projects();
      this.projects.getCurrent(function (project) {
        if (project) {
          _this2.project = project;
          _this2.project.load();
        }
      });
    }
  }, {
    key: 'updatePaths',
    value: function updatePaths() {
      var paths = atom.project.getPaths();
      if (this.project && paths.length) {
        this.project.set('paths', paths);
      }
    }
  }, {
    key: 'provideProjects',
    value: function provideProjects() {
      Projects = require('./projects');
      return {
        projects: new Projects()
      };
    }
  }, {
    key: 'deactivate',
    value: function deactivate() {
      this.disposables.dispose();
    }
  }, {
    key: 'config',
    get: function get() {
      return {
        showPath: {
          type: 'boolean',
          'default': true
        },
        closeCurrent: {
          type: 'boolean',
          'default': false,
          description: 'Currently disabled since it\'s broken.\n          Waiting for a better way to implement it.'
        },
        environmentSpecificProjects: {
          type: 'boolean',
          'default': false
        },
        sortBy: {
          type: 'string',
          description: 'Default sorting is the order in which the projects are',
          'default': 'default',
          'enum': ['default', 'title', 'group']
        }
      };
    }
  }]);

  return ProjectManager;
})();

exports['default'] = ProjectManager;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2dzbXlybmFpb3MvLmF0b20vcGFja2FnZXMvcHJvamVjdC1tYW5hZ2VyL2xpYi9wcm9qZWN0LW1hbmFnZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFDOzs7Ozs7Ozs7O0FBRVosSUFBSSxtQkFBbUIsWUFBQSxDQUFDO0FBQ3hCLElBQUksZ0JBQWdCLFlBQUEsQ0FBQztBQUNyQixJQUFJLFFBQVEsWUFBQSxDQUFDO0FBQ2IsSUFBSSxVQUFVLFlBQUEsQ0FBQztBQUNmLElBQUksRUFBRSxZQUFBLENBQUM7O0lBRWMsY0FBYztXQUFkLGNBQWM7MEJBQWQsY0FBYzs7O2VBQWQsY0FBYzs7V0EyQmxCLG9CQUFHOzs7QUFDaEIseUJBQW1CLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLG1CQUFtQixDQUFDO0FBQzFELFVBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxtQkFBbUIsRUFBRSxDQUFDOztBQUU3QyxVQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtBQUN2RCx1Q0FBK0IsRUFBRSxzQ0FBTTtBQUNyQywwQkFBZ0IsR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQztBQUNuRCxjQUFJLGdCQUFnQixHQUFHLElBQUksZ0JBQWdCLEVBQUUsQ0FBQztBQUM5QywwQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUMzQjs7QUFFRCxzQ0FBOEIsRUFBRSxxQ0FBTTtBQUNwQyxvQkFBVSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUN0QyxjQUFJLFVBQVUsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO0FBQ2xDLG9CQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7U0FDckI7O0FBRUQsdUNBQStCLEVBQUUsc0NBQU07QUFDckMsWUFBRSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNyQixjQUFJLEVBQUUsR0FBRyxJQUFJLEVBQUUsRUFBRSxDQUFDO0FBQ2xCLGNBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1NBQ2hDO09BQ0YsQ0FBQyxDQUFDLENBQUM7O0FBRUosVUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQztlQUFNLE1BQUssV0FBVyxFQUFFO09BQUEsQ0FBQyxDQUFDO0FBQ3hELFVBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztLQUNwQjs7O1dBRWlCLHVCQUFHOzs7QUFDbkIsY0FBUSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNqQyxVQUFJLENBQUMsUUFBUSxHQUFHLElBQUksUUFBUSxFQUFFLENBQUM7QUFDL0IsVUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsVUFBQSxPQUFPLEVBQUk7QUFDbEMsWUFBSSxPQUFPLEVBQUU7QUFDWCxpQkFBSyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQ3ZCLGlCQUFLLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztTQUNyQjtPQUNGLENBQUMsQ0FBQztLQUNKOzs7V0FFaUIsdUJBQUc7QUFDbkIsVUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUNwQyxVQUFJLElBQUksQ0FBQyxPQUFPLElBQUksS0FBSyxDQUFDLE1BQU0sRUFBRTtBQUNoQyxZQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7T0FDbEM7S0FDRjs7O1dBRXFCLDJCQUFHO0FBQ3ZCLGNBQVEsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDakMsYUFBTztBQUNMLGdCQUFRLEVBQUUsSUFBSSxRQUFRLEVBQUU7T0FDekIsQ0FBQztLQUNIOzs7V0FFZ0Isc0JBQUc7QUFDbEIsVUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUM1Qjs7O1NBaEZnQixlQUFHO0FBQ2xCLGFBQU87QUFDTCxnQkFBUSxFQUFFO0FBQ1IsY0FBSSxFQUFFLFNBQVM7QUFDZixxQkFBUyxJQUFJO1NBQ2Q7QUFDRCxvQkFBWSxFQUFFO0FBQ1osY0FBSSxFQUFFLFNBQVM7QUFDZixxQkFBUyxLQUFLO0FBQ2QscUJBQVcsK0ZBQ2lDO1NBQzdDO0FBQ0QsbUNBQTJCLEVBQUU7QUFDM0IsY0FBSSxFQUFFLFNBQVM7QUFDZixxQkFBUyxLQUFLO1NBQ2Y7QUFDRCxjQUFNLEVBQUU7QUFDTixjQUFJLEVBQUUsUUFBUTtBQUNkLHFCQUFXLEVBQUUsd0RBQXdEO0FBQ3JFLHFCQUFTLFNBQVM7QUFDbEIsa0JBQU0sQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQztTQUNwQztPQUNGLENBQUM7S0FDSDs7O1NBekJrQixjQUFjOzs7cUJBQWQsY0FBYyIsImZpbGUiOiIvaG9tZS9nc215cm5haW9zLy5hdG9tL3BhY2thZ2VzL3Byb2plY3QtbWFuYWdlci9saWIvcHJvamVjdC1tYW5hZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmxldCBDb21wb3NpdGVEaXNwb3NhYmxlO1xubGV0IFByb2plY3RzTGlzdFZpZXc7XG5sZXQgUHJvamVjdHM7XG5sZXQgU2F2ZURpYWxvZztcbmxldCBEQjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJvamVjdE1hbmFnZXIge1xuXG4gIHN0YXRpYyBnZXQgY29uZmlnKCkge1xuICAgIHJldHVybiB7XG4gICAgICBzaG93UGF0aDoge1xuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIH0sXG4gICAgICBjbG9zZUN1cnJlbnQ6IHtcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgZGVzY3JpcHRpb246IGBDdXJyZW50bHkgZGlzYWJsZWQgc2luY2UgaXRcXCdzIGJyb2tlbi5cbiAgICAgICAgICBXYWl0aW5nIGZvciBhIGJldHRlciB3YXkgdG8gaW1wbGVtZW50IGl0LmBcbiAgICAgIH0sXG4gICAgICBlbnZpcm9ubWVudFNwZWNpZmljUHJvamVjdHM6IHtcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgfSxcbiAgICAgIHNvcnRCeToge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdEZWZhdWx0IHNvcnRpbmcgaXMgdGhlIG9yZGVyIGluIHdoaWNoIHRoZSBwcm9qZWN0cyBhcmUnLFxuICAgICAgICBkZWZhdWx0OiAnZGVmYXVsdCcsXG4gICAgICAgIGVudW06IFsnZGVmYXVsdCcsICd0aXRsZScsICdncm91cCddXG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIHN0YXRpYyBhY3RpdmF0ZSgpIHtcbiAgICBDb21wb3NpdGVEaXNwb3NhYmxlID0gcmVxdWlyZSgnYXRvbScpLkNvbXBvc2l0ZURpc3Bvc2FibGU7XG4gICAgdGhpcy5kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAncHJvamVjdC1tYW5hZ2VyOmxpc3QtcHJvamVjdHMnOiAoKSA9PiB7XG4gICAgICAgIFByb2plY3RzTGlzdFZpZXcgPSByZXF1aXJlKCcuL3Byb2plY3RzLWxpc3QtdmlldycpO1xuICAgICAgICBsZXQgcHJvamVjdHNMaXN0VmlldyA9IG5ldyBQcm9qZWN0c0xpc3RWaWV3KCk7XG4gICAgICAgIHByb2plY3RzTGlzdFZpZXcudG9nZ2xlKCk7XG4gICAgICB9LFxuXG4gICAgICAncHJvamVjdC1tYW5hZ2VyOnNhdmUtcHJvamVjdCc6ICgpID0+IHtcbiAgICAgICAgU2F2ZURpYWxvZyA9IHJlcXVpcmUoJy4vc2F2ZS1kaWFsb2cnKTtcbiAgICAgICAgbGV0IHNhdmVEaWFsb2cgPSBuZXcgU2F2ZURpYWxvZygpO1xuICAgICAgICBzYXZlRGlhbG9nLmF0dGFjaCgpO1xuICAgICAgfSxcblxuICAgICAgJ3Byb2plY3QtbWFuYWdlcjplZGl0LXByb2plY3RzJzogKCkgPT4ge1xuICAgICAgICBEQiA9IHJlcXVpcmUoJy4vZGInKTtcbiAgICAgICAgbGV0IGRiID0gbmV3IERCKCk7XG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oZGIuZmlsZSgpKTtcbiAgICAgIH1cbiAgICB9KSk7XG5cbiAgICBhdG9tLnByb2plY3Qub25EaWRDaGFuZ2VQYXRocygoKSA9PiB0aGlzLnVwZGF0ZVBhdGhzKCkpO1xuICAgIHRoaXMubG9hZFByb2plY3QoKTtcbiAgfVxuXG4gIHN0YXRpYyBsb2FkUHJvamVjdCgpIHtcbiAgICBQcm9qZWN0cyA9IHJlcXVpcmUoJy4vcHJvamVjdHMnKTtcbiAgICB0aGlzLnByb2plY3RzID0gbmV3IFByb2plY3RzKCk7XG4gICAgdGhpcy5wcm9qZWN0cy5nZXRDdXJyZW50KHByb2plY3QgPT4ge1xuICAgICAgaWYgKHByb2plY3QpIHtcbiAgICAgICAgdGhpcy5wcm9qZWN0ID0gcHJvamVjdDtcbiAgICAgICAgdGhpcy5wcm9qZWN0LmxvYWQoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHN0YXRpYyB1cGRhdGVQYXRocygpIHtcbiAgICBsZXQgcGF0aHMgPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKTtcbiAgICBpZiAodGhpcy5wcm9qZWN0ICYmIHBhdGhzLmxlbmd0aCkge1xuICAgICAgdGhpcy5wcm9qZWN0LnNldCgncGF0aHMnLCBwYXRocyk7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIHByb3ZpZGVQcm9qZWN0cygpIHtcbiAgICBQcm9qZWN0cyA9IHJlcXVpcmUoJy4vcHJvamVjdHMnKTtcbiAgICByZXR1cm4ge1xuICAgICAgcHJvamVjdHM6IG5ldyBQcm9qZWN0cygpXG4gICAgfTtcbiAgfVxuXG4gIHN0YXRpYyBkZWFjdGl2YXRlKCkge1xuICAgIHRoaXMuZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG59XG4iXX0=
//# sourceURL=/home/gsmyrnaios/.atom/packages/project-manager/lib/project-manager.js
