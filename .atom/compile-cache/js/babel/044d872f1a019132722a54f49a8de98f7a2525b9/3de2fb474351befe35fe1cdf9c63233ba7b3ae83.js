Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _season = require('season');

var _season2 = _interopRequireDefault(_season);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _underscorePlus = require('underscore-plus');

var _underscorePlus2 = _interopRequireDefault(_underscorePlus);

'use babel';

var DB = (function () {
  function DB() {
    var _this = this;

    var searchKey = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
    var searchValue = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    _classCallCheck(this, DB);

    this.setSearchQuery(searchKey, searchValue);
    this.emitter = new _atom.Emitter();

    _fs2['default'].exists(this.file(), function (exists) {
      if (exists) {
        _this.observeProjects();
      } else {
        _this.writeFile({});
      }
    });
  }

  _createClass(DB, [{
    key: 'setSearchQuery',
    value: function setSearchQuery() {
      var searchKey = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
      var searchValue = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      this.searchKey = searchKey;
      this.searchValue = searchValue;
    }
  }, {
    key: 'find',
    value: function find(callback) {
      var _this2 = this;

      this.readFile(function (results) {
        var found = false;
        var projects = [];
        var project = null;
        var result = null;
        var template = null;
        var key = undefined;

        for (key in results) {
          result = results[key];
          template = result.template || null;
          result._id = key;

          if (template && results[template] !== null) {
            result = _underscorePlus2['default'].deepExtend(result, results[template]);
          }

          projects.push(result);
        }

        if (_this2.searchKey && _this2.searchValue) {
          for (key in projects) {
            project = projects[key];
            if (_underscorePlus2['default'].isEqual(project[_this2.searchKey], _this2.searchValue)) {
              found = project;
            }
          }
        } else {
          found = projects;
        }

        callback(found);
      });
    }
  }, {
    key: 'add',
    value: function add(props, callback) {
      var _this3 = this;

      this.readFile(function (projects) {
        var id = _this3.generateID(props.title);
        projects[id] = props;

        _this3.writeFile(projects, function () {
          atom.notifications.addSuccess(props.title + ' has been added');
          callback(id);
        });
      });
    }
  }, {
    key: 'update',
    value: function update(props) {
      var _this4 = this;

      if (!props._id) {
        return false;
      }

      var project = null;
      var key = undefined;
      this.readFile(function (projects) {
        for (key in projects) {
          project = projects[key];
          if (key === props._id) {
            delete props._id;
            projects[key] = props;
          }

          _this4.writeFile(projects);
        }
      });
    }
  }, {
    key: 'delete',
    value: function _delete(id, callback) {
      var _this5 = this;

      this.readFile(function (projects) {
        for (var key in projects) {
          if (key === id) {
            delete projects[key];
          }
        }

        _this5.writeFile(projects, function () {
          if (callback) {
            callback();
          }
        });
      });
    }
  }, {
    key: 'onUpdate',
    value: function onUpdate(callback) {
      var _this6 = this;

      this.emitter.on('db-updated', function () {
        _this6.find(callback);
      });
    }
  }, {
    key: 'observeProjects',
    value: function observeProjects() {
      var _this7 = this;

      if (this.fileWatcher) {
        this.fileWatcher.close();
      }

      try {
        this.fileWatcher = _fs2['default'].watch(this.file(), function () {
          _this7.emitter.emit('db-updated');
        });
      } catch (error) {
        var url = 'https://github.com/atom/atom/blob/master/docs/';
        url += 'build-instructions/linux.md#typeerror-unable-to-watch-path';
        var filename = _path2['default'].basename(this.file());
        var errorMessage = '<b>Project Manager</b><br>Could not watch changes\n        to ' + filename + '. Make sure you have permissions to ' + this.file() + '.\n        On linux there can be problems with watch sizes.\n        See <a href=\'' + url + '\'> this document</a> for more info.>';
        this.notifyFailure(errorMessage);
      }
    }
  }, {
    key: 'updateFile',
    value: function updateFile() {
      var _this8 = this;

      _fs2['default'].exists(this.file(true), function (exists) {
        if (!exists) {
          _this8.writeFile({});
        }
      });
    }
  }, {
    key: 'generateID',
    value: function generateID(string) {
      return string.replace(/\s+/g, '').toLowerCase();
    }
  }, {
    key: 'file',
    value: function file() {
      var filename = 'projects.cson';
      var filedir = atom.getConfigDirPath();

      if (this.environmentSpecificProjects) {
        var hostname = _os2['default'].hostname().split('.').shift().toLowerCase();
        filename = 'projects.' + hostname + '.cson';
      }

      return filedir + '/' + filename;
    }
  }, {
    key: 'readFile',
    value: function readFile(callback) {
      var _this9 = this;

      _fs2['default'].exists(this.file(), function (exists) {
        if (exists) {
          try {
            var projects = _season2['default'].readFileSync(_this9.file()) || {};
            callback(projects);
          } catch (error) {
            var message = 'Failed to load ' + _path2['default'].basename(_this9.file());
            var detail = error.location != null ? error.stack : error.message;
            _this9.notifyFailure(message, detail);
          }
        } else {
          _fs2['default'].writeFile(_this9.file(), '{}', function () {
            return callback({});
          });
        }
      });
    }
  }, {
    key: 'writeFile',
    value: function writeFile(projects, callback) {
      _season2['default'].writeFileSync(this.file(), projects);
      if (callback) {
        callback();
      }
    }
  }, {
    key: 'notifyFailure',
    value: function notifyFailure(message) {
      var detail = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      atom.notifications.addError(message, {
        detail: detail,
        dismissable: true
      });
    }
  }, {
    key: 'environmentSpecificProjects',
    get: function get() {
      return atom.config.get('project-manager.environmentSpecificProjects');
    }
  }]);

  return DB;
})();

exports['default'] = DB;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2dzbXlybmFpb3MvLmF0b20vcGFja2FnZXMvcHJvamVjdC1tYW5hZ2VyL2xpYi9kYi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O29CQUVzQixNQUFNOztzQkFDWCxRQUFROzs7O2tCQUNWLElBQUk7Ozs7b0JBQ0YsTUFBTTs7OztrQkFDUixJQUFJOzs7OzhCQUNMLGlCQUFpQjs7OztBQVAvQixXQUFXLENBQUM7O0lBU1MsRUFBRTtBQUNWLFdBRFEsRUFBRSxHQUN5Qjs7O1FBQWxDLFNBQVMseURBQUMsSUFBSTtRQUFFLFdBQVcseURBQUMsSUFBSTs7MEJBRHpCLEVBQUU7O0FBRW5CLFFBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBQzVDLFFBQUksQ0FBQyxPQUFPLEdBQUcsbUJBQWEsQ0FBQzs7QUFFN0Isb0JBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxVQUFDLE1BQU0sRUFBSztBQUNqQyxVQUFJLE1BQU0sRUFBRTtBQUNWLGNBQUssZUFBZSxFQUFFLENBQUM7T0FDeEIsTUFBTTtBQUNMLGNBQUssU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO09BQ3BCO0tBQ0YsQ0FBQyxDQUFDO0dBQ0o7O2VBWmtCLEVBQUU7O1dBa0JQLDBCQUFtQztVQUFsQyxTQUFTLHlEQUFDLElBQUk7VUFBRSxXQUFXLHlEQUFDLElBQUk7O0FBQzdDLFVBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0FBQzNCLFVBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO0tBQ2hDOzs7V0FFRyxjQUFDLFFBQVEsRUFBRTs7O0FBQ2IsVUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFBLE9BQU8sRUFBSTtBQUN2QixZQUFJLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDbEIsWUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDO0FBQ2xCLFlBQUksT0FBTyxHQUFHLElBQUksQ0FBQztBQUNuQixZQUFJLE1BQU0s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QUMsRUFBRSxDQUFDO1dBQUEsQ0FBQyxDQUFDO1NBQ3JEO09BQ0YsQ0FBQyxDQUFDO0tBQ0o7OztXQUVRLG1CQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUU7QUFDNUIsMEJBQUssYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUMxQyxVQUFJLFFBQVEsRUFBRTtBQUNaLGdCQUFRLEVBQUUsQ0FBQztPQUNaO0tBQ0Y7OztXQUVZLHVCQUFDLE9BQU8sRUFBZTtVQUFiLE1BQU0seURBQUMsSUFBSTs7QUFDaEMsVUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFO0FBQ25DLGNBQU0sRUFBRSxNQUFNO0FBQ2QsbUJBQVcsRUFBRSxJQUFJO09BQ2xCLENBQUMsQ0FBQztLQUNKOzs7U0E3SzhCLGVBQUc7QUFDaEMsYUFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDO0tBQ3ZFOzs7U0FoQmtCLEVBQUU7OztxQkFBRixFQUFFIiwiZmlsZSI6Ii9ob21lL2dzbXlybmFpb3MvLmF0b20vcGFja2FnZXMvcHJvamVjdC1tYW5hZ2VyL2xpYi9kYi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQge0VtaXR0ZXJ9IGZyb20gJ2F0b20nO1xuaW1wb3J0IENTT04gZnJvbSAnc2Vhc29uJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBvcyBmcm9tICdvcyc7XG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlLXBsdXMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEQiB7XG4gIGNvbnN0cnVjdG9yKHNlYXJjaEtleT1udWxsLCBzZWFyY2hWYWx1ZT1udWxsKSB7XG4gICAgdGhpcy5zZXRTZWFyY2hRdWVyeShzZWFyY2hLZXksIHNlYXJjaFZhbHVlKTtcbiAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuXG4gICAgZnMuZXhpc3RzKHRoaXMuZmlsZSgpLCAoZXhpc3RzKSA9PiB7XG4gICAgICBpZiAoZXhpc3RzKSB7XG4gICAgICAgIHRoaXMub2JzZXJ2ZVByb2plY3RzKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLndyaXRlRmlsZSh7fSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBnZXQgZW52aXJvbm1lbnRTcGVjaWZpY1Byb2plY3RzKCkge1xuICAgIHJldHVybiBhdG9tLmNvbmZpZy5nZXQoJ3Byb2plY3QtbWFuYWdlci5lbnZpcm9ubWVudFNwZWNpZmljUHJvamVjdHMnKTtcbiAgfVxuXG4gIHNldFNlYXJjaFF1ZXJ5KHNlYXJjaEtleT1udWxsLCBzZWFyY2hWYWx1ZT1udWxsKSB7XG4gICAgdGhpcy5zZWFyY2hLZXkgPSBzZWFyY2hLZXk7XG4gICAgdGhpcy5zZWFyY2hWYWx1ZSA9IHNlYXJjaFZhbHVlO1xuICB9XG5cbiAgZmluZChjYWxsYmFjaykge1xuICAgIHRoaXMucmVhZEZpbGUocmVzdWx0cyA9PiB7XG4gICAgICBsZXQgZm91bmQgPSBmYWxzZTtcbiAgICAgIGxldCBwcm9qZWN0cyA9IFtdO1xuICAgICAgbGV0IHByb2plY3QgPSBudWxsO1xuICAgICAgbGV0IHJlc3VsdCA9IG51bGw7XG4gICAgICBsZXQgdGVtcGxhdGUgPSBudWxsO1xuICAgICAgbGV0IGtleTtcblxuICAgICAgZm9yIChrZXkgaW4gcmVzdWx0cykge1xuICAgICAgICByZXN1bHQgPSByZXN1bHRzW2tleV07XG4gICAgICAgIHRlbXBsYXRlID0gcmVzdWx0LnRlbXBsYXRlIHx8IG51bGw7XG4gICAgICAgIHJlc3VsdC5faWQgPSBrZXk7XG5cbiAgICAgICAgaWYgKHRlbXBsYXRlICYmIHJlc3VsdHNbdGVtcGxhdGVdICE9PSBudWxsKSB7XG4gICAgICAgICAgcmVzdWx0ID0gXy5kZWVwRXh0ZW5kKHJlc3VsdCwgcmVzdWx0c1t0ZW1wbGF0ZV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvamVjdHMucHVzaChyZXN1bHQpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5zZWFyY2hLZXkgJiYgdGhpcy5zZWFyY2hWYWx1ZSkge1xuICAgICAgICBmb3IgKGtleSBpbiBwcm9qZWN0cykge1xuICAgICAgICAgIHByb2plY3QgPSBwcm9qZWN0c1trZXldO1xuICAgICAgICAgIGlmIChfLmlzRXF1YWwocHJvamVjdFt0aGlzLnNlYXJjaEtleV0sIHRoaXMuc2VhcmNoVmFsdWUpKSB7XG4gICAgICAgICAgICBmb3VuZCA9IHByb2plY3Q7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmb3VuZCA9IHByb2plY3RzO1xuICAgICAgfVxuXG4gICAgICBjYWxsYmFjayhmb3VuZCk7XG4gICAgfSk7XG4gIH1cblxuICBhZGQocHJvcHMsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5yZWFkRmlsZShwcm9qZWN0cyA9PiB7XG4gICAgICBjb25zdCBpZCA9IHRoaXMuZ2VuZXJhdGVJRChwcm9wcy50aXRsZSk7XG4gICAgICBwcm9qZWN0c1tpZF0gPSBwcm9wcztcblxuICAgICAgdGhpcy53cml0ZUZpbGUocHJvamVjdHMsICgpID0+IHtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFN1Y2Nlc3MoYCR7cHJvcHMudGl0bGV9IGhhcyBiZWVuIGFkZGVkYCk7XG4gICAgICAgIGNhbGxiYWNrKGlkKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgdXBkYXRlKHByb3BzKSB7XG4gICAgaWYgKCFwcm9wcy5faWQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBsZXQgcHJvamVjdCA9IG51bGw7XG4gICAgbGV0IGtleTtcbiAgICB0aGlzLnJlYWRGaWxlKHByb2plY3RzID0+IHtcbiAgICAgIGZvciAoa2V5IGluIHByb2plY3RzKSB7XG4gICAgICAgIHByb2plY3QgPSBwcm9qZWN0c1trZXldO1xuICAgICAgICBpZiAoa2V5ID09PSBwcm9wcy5faWQpIHtcbiAgICAgICAgICBkZWxldGUocHJvcHMuX2lkKTtcbiAgICAgICAgICBwcm9qZWN0c1trZXldID0gcHJvcHM7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLndyaXRlRmlsZShwcm9qZWN0cyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBkZWxldGUoaWQsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5yZWFkRmlsZShwcm9qZWN0cyA9PiB7XG4gICAgICBmb3IgKGxldCBrZXkgaW4gcHJvamVjdHMpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gaWQpIHtcbiAgICAgICAgICBkZWxldGUocHJvamVjdHNba2V5XSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy53cml0ZUZpbGUocHJvamVjdHMsICgpID0+IHtcbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBvblVwZGF0ZShjYWxsYmFjaykge1xuICAgIHRoaXMuZW1pdHRlci5vbignZGItdXBkYXRlZCcsICgpID0+IHtcbiAgICAgIHRoaXMuZmluZChjYWxsYmFjayk7XG4gICAgfSk7XG4gIH1cblxuICBvYnNlcnZlUHJvamVjdHMoKSB7XG4gICAgaWYgKHRoaXMuZmlsZVdhdGNoZXIpIHtcbiAgICAgIHRoaXMuZmlsZVdhdGNoZXIuY2xvc2UoKTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgdGhpcy5maWxlV2F0Y2hlciA9IGZzLndhdGNoKHRoaXMuZmlsZSgpLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkYi11cGRhdGVkJyk7XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbGV0IHVybCA9ICdodHRwczovL2dpdGh1Yi5jb20vYXRvbS9hdG9tL2Jsb2IvbWFzdGVyL2RvY3MvJztcbiAgICAgIHVybCArPSAnYnVpbGQtaW5zdHJ1Y3Rpb25zL2xpbnV4Lm1kI3R5cGVlcnJvci11bmFibGUtdG8td2F0Y2gtcGF0aCc7XG4gICAgICBjb25zdCBmaWxlbmFtZSA9IHBhdGguYmFzZW5hbWUodGhpcy5maWxlKCkpO1xuICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYDxiPlByb2plY3QgTWFuYWdlcjwvYj48YnI+Q291bGQgbm90IHdhdGNoIGNoYW5nZXNcbiAgICAgICAgdG8gJHtmaWxlbmFtZX0uIE1ha2Ugc3VyZSB5b3UgaGF2ZSBwZXJtaXNzaW9ucyB0byAke3RoaXMuZmlsZSgpfS5cbiAgICAgICAgT24gbGludXggdGhlcmUgY2FuIGJlIHByb2JsZW1zIHdpdGggd2F0Y2ggc2l6ZXMuXG4gICAgICAgIFNlZSA8YSBocmVmPScke3VybH0nPiB0aGlzIGRvY3VtZW50PC9hPiBmb3IgbW9yZSBpbmZvLj5gO1xuICAgICAgdGhpcy5ub3RpZnlGYWlsdXJlKGVycm9yTWVzc2FnZSk7XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlRmlsZSgpIHtcbiAgICBmcy5leGlzdHModGhpcy5maWxlKHRydWUpLCAoZXhpc3RzKSA9PiB7XG4gICAgICBpZiAoIWV4aXN0cykge1xuICAgICAgICB0aGlzLndyaXRlRmlsZSh7fSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBnZW5lcmF0ZUlEKHN0cmluZykge1xuICAgIHJldHVybiBzdHJpbmcucmVwbGFjZSgvXFxzKy9nLCAnJykudG9Mb3dlckNhc2UoKTtcbiAgfVxuXG4gIGZpbGUoKSB7XG4gICAgbGV0IGZpbGVuYW1lID0gJ3Byb2plY3RzLmNzb24nO1xuICAgIGNvbnN0IGZpbGVkaXIgPSBhdG9tLmdldENvbmZpZ0RpclBhdGgoKTtcblxuICAgIGlmICh0aGlzLmVudmlyb25tZW50U3BlY2lmaWNQcm9qZWN0cykge1xuICAgICAgbGV0IGhvc3RuYW1lID0gb3MuaG9zdG5hbWUoKS5zcGxpdCgnLicpLnNoaWZ0KCkudG9Mb3dlckNhc2UoKTtcbiAgICAgIGZpbGVuYW1lID0gYHByb2plY3RzLiR7aG9zdG5hbWV9LmNzb25gO1xuICAgIH1cblxuICAgIHJldHVybiBgJHtmaWxlZGlyfS8ke2ZpbGVuYW1lfWA7XG4gIH1cblxuICByZWFkRmlsZShjYWxsYmFjaykge1xuICAgIGZzLmV4aXN0cyh0aGlzLmZpbGUoKSwgKGV4aXN0cykgPT4ge1xuICAgICAgaWYgKGV4aXN0cykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGxldCBwcm9qZWN0cyA9IENTT04ucmVhZEZpbGVTeW5jKHRoaXMuZmlsZSgpKSB8fCB7fTtcbiAgICAgICAgICBjYWxsYmFjayhwcm9qZWN0cyk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc3QgbWVzc2FnZSA9IGBGYWlsZWQgdG8gbG9hZCAke3BhdGguYmFzZW5hbWUodGhpcy5maWxlKCkpfWA7XG4gICAgICAgICAgY29uc3QgZGV0YWlsID0gZXJyb3IubG9jYXRpb24gIT0gbnVsbCA/IGVycm9yLnN0YWNrIDogZXJyb3IubWVzc2FnZTtcbiAgICAgICAgICB0aGlzLm5vdGlmeUZhaWx1cmUobWVzc2FnZSwgZGV0YWlsKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZnMud3JpdGVGaWxlKHRoaXMuZmlsZSgpLCAne30nLCAoKSA9PiBjYWxsYmFjayh7fSkpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgd3JpdGVGaWxlKHByb2plY3RzLCBjYWxsYmFjaykge1xuICAgIENTT04ud3JpdGVGaWxlU3luYyh0aGlzLmZpbGUoKSwgcHJvamVjdHMpO1xuICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgY2FsbGJhY2soKTtcbiAgICB9XG4gIH1cblxuICBub3RpZnlGYWlsdXJlKG1lc3NhZ2UsIGRldGFpbD1udWxsKSB7XG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKG1lc3NhZ2UsIHtcbiAgICAgIGRldGFpbDogZGV0YWlsLFxuICAgICAgZGlzbWlzc2FibGU6IHRydWVcbiAgICB9KTtcbiAgfVxufVxuIl19
//# sourceURL=/home/gsmyrnaios/.atom/packages/project-manager/lib/db.js
