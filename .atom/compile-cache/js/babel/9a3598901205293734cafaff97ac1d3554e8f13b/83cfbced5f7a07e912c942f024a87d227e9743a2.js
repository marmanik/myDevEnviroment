Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _db = require('./db');

var _db2 = _interopRequireDefault(_db);

var _project = require('./project');

var _project2 = _interopRequireDefault(_project);

'use babel';

var Projects = (function () {
  function Projects() {
    var _this = this;

    _classCallCheck(this, Projects);

    this.emitter = new _atom.Emitter();
    this.db = new _db2['default']();
    this.db.onUpdate(function () {
      return _this.emitter.emit('projects-updated');
    });
  }

  _createClass(Projects, [{
    key: 'onUpdate',
    value: function onUpdate(callback) {
      this.emitter.on('projects-updated', callback);
    }
  }, {
    key: 'getAll',
    value: function getAll(callback) {
      this.db.find(function (projectSettings) {
        var projects = [];
        var setting = undefined;
        var project = undefined;
        var key = undefined;
        for (key in projectSettings) {
          setting = projectSettings[key];
          if (setting.paths) {
            project = new _project2['default'](setting);
            projects.push(project);
          }
        }

        callback(projects);
      });
    }
  }, {
    key: 'getCurrent',
    value: function getCurrent(callback) {
      this.getAll(function (projects) {
        projects.forEach(function (project) {
          if (project.isCurrent()) {
            callback(project);
          }
        });
      });
    }
  }]);

  return Projects;
})();

exports['default'] = Projects;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2dzbXlybmFpb3MvLmF0b20vcGFja2FnZXMvcHJvamVjdC1tYW5hZ2VyL2xpYi9wcm9qZWN0cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O29CQUVzQixNQUFNOztrQkFDYixNQUFNOzs7O3VCQUNELFdBQVc7Ozs7QUFKL0IsV0FBVyxDQUFDOztJQU1TLFFBQVE7QUFDaEIsV0FEUSxRQUFRLEdBQ2I7OzswQkFESyxRQUFROztBQUV6QixRQUFJLENBQUMsT0FBTyxHQUFHLG1CQUFhLENBQUM7QUFDN0IsUUFBSSxDQUFDLEVBQUUsR0FBRyxxQkFBUSxDQUFDO0FBQ25CLFFBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDO2FBQU0sTUFBSyxPQUFPLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDO0tBQUEsQ0FBQyxDQUFDO0dBQy9EOztlQUxrQixRQUFROztXQU9uQixrQkFBQyxRQUFRLEVBQUU7QUFDakIsVUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsa0JBQWtCLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDL0M7OztXQUVLLGdCQUFDLFFBQVEsRUFBRTtBQUNmLFVBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQUEsZUFBZSxFQUFJO0FBQzlCLFlBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQztBQUNsQixZQUFJLE9BQU8sWUFBQSxDQUFDO0FBQ1osWUFBSSxPQUFPLFlBQUEsQ0FBQztBQUNaLFlBQUksR0FBRyxZQUFBLENBQUM7QUFDUixhQUFLLEdBQUcsSUFBSSxlQUFlLEVBQUU7QUFDM0IsaUJBQU8sR0FBRyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDL0IsY0FBSSxPQUFPLENBQUMsS0FBSyxFQUFFO0FBQ2pCLG1CQUFPLEdBQUcseUJBQVksT0FBTyxDQUFDLENBQUM7QUFDL0Isb0JBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7V0FDeEI7U0FDRjs7QUFFRCxnQkFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO09BQ3BCLENBQUMsQ0FBQztLQUNKOzs7V0FFUyxvQkFBQyxRQUFRLEVBQUU7QUFDbkIsVUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFBLFFBQVEsRUFBSTtBQUN0QixnQkFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFBLE9BQU8sRUFBSTtBQUMxQixjQUFJLE9BQU8sQ0FBQyxTQUFTLEVBQUUsRUFBRTtBQUN2QixvQkFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1dBQ25CO1NBQ0YsQ0FBQyxDQUFDO09BQ0osQ0FBQyxDQUFDO0tBQ0o7OztTQXJDa0IsUUFBUTs7O3FCQUFSLFFBQVEiLCJmaWxlIjoiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy9wcm9qZWN0LW1hbmFnZXIvbGliL3Byb2plY3RzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCB7RW1pdHRlcn0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgREIgZnJvbSAnLi9kYic7XG5pbXBvcnQgUHJvamVjdCBmcm9tICcuL3Byb2plY3QnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQcm9qZWN0cyB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgdGhpcy5kYiA9IG5ldyBEQigpO1xuICAgIHRoaXMuZGIub25VcGRhdGUoKCkgPT4gdGhpcy5lbWl0dGVyLmVtaXQoJ3Byb2plY3RzLXVwZGF0ZWQnKSk7XG4gIH1cblxuICBvblVwZGF0ZShjYWxsYmFjaykge1xuICAgIHRoaXMuZW1pdHRlci5vbigncHJvamVjdHMtdXBkYXRlZCcsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIGdldEFsbChjYWxsYmFjaykge1xuICAgIHRoaXMuZGIuZmluZChwcm9qZWN0U2V0dGluZ3MgPT4ge1xuICAgICAgbGV0IHByb2plY3RzID0gW107XG4gICAgICBsZXQgc2V0dGluZztcbiAgICAgIGxldCBwcm9qZWN0O1xuICAgICAgbGV0IGtleTtcbiAgICAgIGZvciAoa2V5IGluIHByb2plY3RTZXR0aW5ncykge1xuICAgICAgICBzZXR0aW5nID0gcHJvamVjdFNldHRpbmdzW2tleV07XG4gICAgICAgIGlmIChzZXR0aW5nLnBhdGhzKSB7XG4gICAgICAgICAgcHJvamVjdCA9IG5ldyBQcm9qZWN0KHNldHRpbmcpO1xuICAgICAgICAgIHByb2plY3RzLnB1c2gocHJvamVjdCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY2FsbGJhY2socHJvamVjdHMpO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0Q3VycmVudChjYWxsYmFjaykge1xuICAgIHRoaXMuZ2V0QWxsKHByb2plY3RzID0+IHtcbiAgICAgIHByb2plY3RzLmZvckVhY2gocHJvamVjdCA9PiB7XG4gICAgICAgIGlmIChwcm9qZWN0LmlzQ3VycmVudCgpKSB7XG4gICAgICAgICAgY2FsbGJhY2socHJvamVjdCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59XG4iXX0=
//# sourceURL=/home/gsmyrnaios/.atom/packages/project-manager/lib/projects.js
