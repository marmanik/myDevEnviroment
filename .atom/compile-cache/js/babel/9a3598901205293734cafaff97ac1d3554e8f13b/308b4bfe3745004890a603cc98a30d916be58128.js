Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _underscorePlus = require('underscore-plus');

var _underscorePlus2 = _interopRequireDefault(_underscorePlus);

var _settings = require('./settings');

var _settings2 = _interopRequireDefault(_settings);

var _db = require('./db');

var _db2 = _interopRequireDefault(_db);

'use babel';

var Project = (function () {
  function Project() {
    var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Project);

    this.props = {};
    this.emitter = new _atom.Emitter();
    this.db = new _db2['default']();
    this.updateProps(props);
    this.lookForUpdates();
  }

  _createClass(Project, [{
    key: 'updateProps',
    value: function updateProps(props) {
      this.props = _underscorePlus2['default'].deepExtend(this.defaultProps, props);
    }
  }, {
    key: 'getPropsToSave',
    value: function getPropsToSave() {
      var saveProps = {};
      var value = undefined;
      var key = undefined;
      for (key in this.props) {
        value = this.props[key];
        if (!this.isDefaultProp(key, value)) {
          saveProps[key] = value;
        }
      }

      return saveProps;
    }
  }, {
    key: 'isDefaultProp',
    value: function isDefaultProp(key, value) {
      if (!this.defaultProps.hasOwnProperty(key)) {
        return false;
      }

      var defaultProp = this.defaultProps[key];
      if (typeof defaultProp === 'object' && _underscorePlus2['default'].isEqual(defaultProp, value)) {
        return true;
      }

      if (defaultProp === value) {
        return true;
      }

      return false;
    }
  }, {
    key: 'set',
    value: function set(key, value) {
      if (typeof key === 'object') {
        for (var i in key) {
          value = key[i];
          this.props[i] = value;
        }

        this.save();
      } else {
        this.props[key] = value;
        this.save();
      }
    }
  }, {
    key: 'unset',
    value: function unset(key) {
      if (_underscorePlus2['default'].has(this.defaultProps, key)) {
        this.props[key] = this.defaultProps[key];
      } else {
        this.props[key] = null;
      }

      this.save();
    }
  }, {
    key: 'lookForUpdates',
    value: function lookForUpdates() {
      var _this = this;

      if (this.props._id) {
        this.db.setSearchQuery('_id', this.props._id);
        this.db.onUpdate(function (props) {
          if (props) {
            var updatedProps = _underscorePlus2['default'].deepExtend(_this.defaultProps, props);
            if (!_underscorePlus2['default'].isEqual(_this.props, updatedProps)) {
              _this.updateProps(props);
              _this.emitter.emit('updated');
              if (_this.isCurrent()) {
                _this.load();
              }
            }
          } else {
            _this.db.setSearchQuery('paths', _this.props.paths);
            _this.db.find(function (props) {
              _this.updateProps(props);
              _this.db.setSearchQuery('_id', _this.props._id);
              _this.emitter.emit('updated');
              if (_this.isCurrent()) {
                _this.load();
              }
            });
          }
        });
      }
    }
  }, {
    key: 'isCurrent',
    value: function isCurrent() {
      var activePath = atom.project.getPaths()[0];
      var mainPath = this.props.paths[0];
      if (activePath === mainPath) {
        return true;
      }

      return false;
    }
  }, {
    key: 'isValid',
    value: function isValid() {
      var _this2 = this;

      var valid = true;
      this.requiredProperties.forEach(function (key) {
        if (!_this2.props[key] || !_this2.props[key].length) {
          valid = false;
        }
      });

      return valid;
    }
  }, {
    key: 'load',
    value: function load() {
      if (this.isCurrent()) {
        var projectSettings = new _settings2['default']();
        projectSettings.load(this.props.settings);
      }
    }
  }, {
    key: 'save',
    value: function save() {
      var _this3 = this;

      if (this.isValid()) {
        if (this.props._id) {
          this.db.update(this.getPropsToSave());
        } else {
          this.db.add(this.getPropsToSave(), function (id) {
            _this3.props._id = id;
            _this3.lookForUpdates();
          });
        }

        return true;
      }

      return false;
    }
  }, {
    key: 'remove',
    value: function remove() {
      this.db['delete'](this.props._id);
    }
  }, {
    key: 'open',
    value: function open() {
      atom.open({
        pathsToOpen: this.props.paths,
        devMode: this.props.devMode
      });
    }
  }, {
    key: 'onUpdate',
    value: function onUpdate(callback) {
      this.emitter.on('updated', function () {
        return callback();
      });
    }
  }, {
    key: 'requiredProperties',
    get: function get() {
      return ['title', 'paths'];
    }
  }, {
    key: 'defaultProps',
    get: function get() {
      return {
        title: '',
        paths: [],
        icon: 'icon-chevron-right',
        settings: {},
        group: null,
        devMode: false,
        template: null
      };
    }
  }]);

  return Project;
})();

exports['default'] = Project;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2dzbXlybmFpb3MvLmF0b20vcGFja2FnZXMvcHJvamVjdC1tYW5hZ2VyL2xpYi9wcm9qZWN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7b0JBRXNCLE1BQU07OzhCQUNkLGlCQUFpQjs7Ozt3QkFDVixZQUFZOzs7O2tCQUNsQixNQUFNOzs7O0FBTHJCLFdBQVcsQ0FBQzs7SUFPUyxPQUFPO0FBRWYsV0FGUSxPQUFPLEdBRUo7UUFBVixLQUFLLHlEQUFDLEVBQUU7OzBCQUZELE9BQU87O0FBR3hCLFFBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO0FBQ2hCLFFBQUksQ0FBQyxPQUFPLEdBQUcsbUJBQWEsQ0FBQztBQUM3QixRQUFJLENBQUMsRUFBRSxHQUFHLHFCQUFRLENBQUM7QUFDbkIsUUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN4QixRQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7R0FDdkI7O2VBUmtCLE9BQU87O1dBMEJmLHFCQUFDLEtBQUssRUFBRTtBQUNqQixVQUFJLENBQUMsS0FBSyxHQUFHLDRCQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQ3JEOzs7V0FFYSwwQkFBRztBQUNmLFVBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQztBQUNuQixVQUFJLEtBQUssWUFBQSxDQUFDO0FBQ1YsVUFBSSxHQUFHLFlBQUEsQ0FBQztBQUNSLFdBQUssR0FBRyxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7QUFDdEIsYUFBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDeEIsWUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxFQUFFO0FBQ25DLG1CQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO1NBQ3hCO09BQ0Y7O0FBRUQsYUFBTyxTQUFTLENBQUM7S0FDbEI7OztXQUVZ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QUUsRUFBRSxVQUFBLEVBQUUsRUFBSTtBQUN2QyxtQkFBSyxLQUFLLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztBQUNwQixtQkFBSyxjQUFjLEVBQUUsQ0FBQztXQUN2QixDQUFDLENBQUM7U0FDSjs7QUFFRCxlQUFPLElBQUksQ0FBQztPQUNiOztBQUVELGFBQU8sS0FBSyxDQUFDO0tBQ2Q7OztXQUVLLGtCQUFHO0FBQ1AsVUFBSSxDQUFDLEVBQUUsVUFBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDaEM7OztXQUVHLGdCQUFHO0FBQ0wsVUFBSSxDQUFDLElBQUksQ0FBQztBQUNSLG1CQUFXLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLO0FBQzdCLGVBQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU87T0FDNUIsQ0FBQyxDQUFDO0tBQ0o7OztXQUVPLGtCQUFDLFFBQVEsRUFBRTtBQUNqQixVQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUU7ZUFBTSxRQUFRLEVBQUU7T0FBQSxDQUFDLENBQUM7S0FDOUM7OztTQWpLcUIsZUFBRztBQUN2QixhQUFPLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQzNCOzs7U0FFZSxlQUFHO0FBQ2pCLGFBQU87QUFDTCxhQUFLLEVBQUUsRUFBRTtBQUNULGFBQUssRUFBRSxFQUFFO0FBQ1QsWUFBSSxFQUFFLG9CQUFvQjtBQUMxQixnQkFBUSxFQUFFLEVBQUU7QUFDWixhQUFLLEVBQUUsSUFBSTtBQUNYLGVBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVEsRUFBRSxJQUFJO09BQ2YsQ0FBQztLQUNIOzs7U0F4QmtCLE9BQU87OztxQkFBUCxPQUFPIiwiZmlsZSI6Ii9ob21lL2dzbXlybmFpb3MvLmF0b20vcGFja2FnZXMvcHJvamVjdC1tYW5hZ2VyL2xpYi9wcm9qZWN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCB7RW1pdHRlcn0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlLXBsdXMnO1xuaW1wb3J0IFNldHRpbmdzIGZyb20gJy4vc2V0dGluZ3MnO1xuaW1wb3J0IERCIGZyb20gJy4vZGInO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQcm9qZWN0IHtcblxuICBjb25zdHJ1Y3Rvcihwcm9wcz17fSkge1xuICAgIHRoaXMucHJvcHMgPSB7fTtcbiAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgIHRoaXMuZGIgPSBuZXcgREIoKTtcbiAgICB0aGlzLnVwZGF0ZVByb3BzKHByb3BzKTtcbiAgICB0aGlzLmxvb2tGb3JVcGRhdGVzKCk7XG4gIH1cblxuICBnZXQgcmVxdWlyZWRQcm9wZXJ0aWVzKCkge1xuICAgIHJldHVybiBbJ3RpdGxlJywgJ3BhdGhzJ107XG4gIH1cblxuICBnZXQgZGVmYXVsdFByb3BzKCkge1xuICAgIHJldHVybiB7XG4gICAgICB0aXRsZTogJycsXG4gICAgICBwYXRoczogW10sXG4gICAgICBpY29uOiAnaWNvbi1jaGV2cm9uLXJpZ2h0JyxcbiAgICAgIHNldHRpbmdzOiB7fSxcbiAgICAgIGdyb3VwOiBudWxsLFxuICAgICAgZGV2TW9kZTogZmFsc2UsXG4gICAgICB0ZW1wbGF0ZTogbnVsbFxuICAgIH07XG4gIH1cblxuICB1cGRhdGVQcm9wcyhwcm9wcykge1xuICAgIHRoaXMucHJvcHMgPSBfLmRlZXBFeHRlbmQodGhpcy5kZWZhdWx0UHJvcHMsIHByb3BzKTtcbiAgfVxuXG4gIGdldFByb3BzVG9TYXZlKCkge1xuICAgIGxldCBzYXZlUHJvcHMgPSB7fTtcbiAgICBsZXQgdmFsdWU7XG4gICAgbGV0IGtleTtcbiAgICBmb3IgKGtleSBpbiB0aGlzLnByb3BzKSB7XG4gICAgICB2YWx1ZSA9IHRoaXMucHJvcHNba2V5XTtcbiAgICAgIGlmICghdGhpcy5pc0RlZmF1bHRQcm9wKGtleSwgdmFsdWUpKSB7XG4gICAgICAgIHNhdmVQcm9wc1trZXldID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHNhdmVQcm9wcztcbiAgfVxuXG4gIGlzRGVmYXVsdFByb3Aoa2V5LCB2YWx1ZSkge1xuICAgIGlmICghdGhpcy5kZWZhdWx0UHJvcHMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IGRlZmF1bHRQcm9wID0gdGhpcy5kZWZhdWx0UHJvcHNba2V5XTtcbiAgICBpZiAodHlwZW9mIGRlZmF1bHRQcm9wID09PSAnb2JqZWN0JyAmJiBfLmlzRXF1YWwoZGVmYXVsdFByb3AsIHZhbHVlKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgaWYgKGRlZmF1bHRQcm9wID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgc2V0KGtleSwgdmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIGtleSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGZvciAobGV0IGkgaW4ga2V5KSB7XG4gICAgICAgIHZhbHVlID0ga2V5W2ldO1xuICAgICAgICB0aGlzLnByb3BzW2ldID0gdmFsdWU7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2F2ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnByb3BzW2tleV0gPSB2YWx1ZTtcbiAgICAgIHRoaXMuc2F2ZSgpO1xuICAgIH1cbiAgfVxuXG4gIHVuc2V0KGtleSkge1xuICAgIGlmIChfLmhhcyh0aGlzLmRlZmF1bHRQcm9wcywga2V5KSkge1xuICAgICAgdGhpcy5wcm9wc1trZXldID0gdGhpcy5kZWZhdWx0UHJvcHNba2V5XTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wcm9wc1trZXldID0gbnVsbDtcbiAgICB9XG5cbiAgICB0aGlzLnNhdmUoKTtcbiAgfVxuXG4gIGxvb2tGb3JVcGRhdGVzKCkge1xuICAgIGlmICh0aGlzLnByb3BzLl9pZCkge1xuICAgICAgdGhpcy5kYi5zZXRTZWFyY2hRdWVyeSgnX2lkJywgdGhpcy5wcm9wcy5faWQpO1xuICAgICAgdGhpcy5kYi5vblVwZGF0ZSgocHJvcHMpID0+IHtcbiAgICAgICAgaWYgKHByb3BzKSB7XG4gICAgICAgICAgY29uc3QgdXBkYXRlZFByb3BzID0gXy5kZWVwRXh0ZW5kKHRoaXMuZGVmYXVsdFByb3BzLCBwcm9wcyk7XG4gICAgICAgICAgaWYgKCFfLmlzRXF1YWwodGhpcy5wcm9wcywgdXBkYXRlZFByb3BzKSkge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVQcm9wcyhwcm9wcyk7XG4gICAgICAgICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgndXBkYXRlZCcpO1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNDdXJyZW50KCkpIHtcbiAgICAgICAgICAgICAgdGhpcy5sb2FkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuZGIuc2V0U2VhcmNoUXVlcnkoJ3BhdGhzJywgdGhpcy5wcm9wcy5wYXRocyk7XG4gICAgICAgICAgdGhpcy5kYi5maW5kKChwcm9wcykgPT4ge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVQcm9wcyhwcm9wcyk7XG4gICAgICAgICAgICB0aGlzLmRiLnNldFNlYXJjaFF1ZXJ5KCdfaWQnLCB0aGlzLnByb3BzLl9pZCk7XG4gICAgICAgICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgndXBkYXRlZCcpO1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNDdXJyZW50KCkpIHtcbiAgICAgICAgICAgICAgdGhpcy5sb2FkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGlzQ3VycmVudCgpIHtcbiAgICBjb25zdCBhY3RpdmVQYXRoID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF07XG4gICAgY29uc3QgbWFpblBhdGggPSB0aGlzLnByb3BzLnBhdGhzWzBdO1xuICAgIGlmIChhY3RpdmVQYXRoID09PSBtYWluUGF0aCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaXNWYWxpZCgpIHtcbiAgICBsZXQgdmFsaWQgPSB0cnVlO1xuICAgIHRoaXMucmVxdWlyZWRQcm9wZXJ0aWVzLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIGlmICghdGhpcy5wcm9wc1trZXldIHx8ICF0aGlzLnByb3BzW2tleV0ubGVuZ3RoKSB7XG4gICAgICAgIHZhbGlkID0gZmFsc2U7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdmFsaWQ7XG4gIH1cblxuICBsb2FkKCkge1xuICAgIGlmICh0aGlzLmlzQ3VycmVudCgpKSB7XG4gICAgICBsZXQgcHJvamVjdFNldHRpbmdzID0gbmV3IFNldHRpbmdzKCk7XG4gICAgICBwcm9qZWN0U2V0dGluZ3MubG9hZCh0aGlzLnByb3BzLnNldHRpbmdzKTtcbiAgICB9XG4gIH1cblxuICBzYXZlKCkge1xuICAgIGlmICh0aGlzLmlzVmFsaWQoKSkge1xuICAgICAgaWYgKHRoaXMucHJvcHMuX2lkKSB7XG4gICAgICAgIHRoaXMuZGIudXBkYXRlKHRoaXMuZ2V0UHJvcHNUb1NhdmUoKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmRiLmFkZCh0aGlzLmdldFByb3BzVG9TYXZlKCksIGlkID0+IHtcbiAgICAgICAgICB0aGlzLnByb3BzLl9pZCA9IGlkO1xuICAgICAgICAgIHRoaXMubG9va0ZvclVwZGF0ZXMoKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJlbW92ZSgpIHtcbiAgICB0aGlzLmRiLmRlbGV0ZSh0aGlzLnByb3BzLl9pZCk7XG4gIH1cblxuICBvcGVuKCkge1xuICAgIGF0b20ub3Blbih7XG4gICAgICBwYXRoc1RvT3BlbjogdGhpcy5wcm9wcy5wYXRocyxcbiAgICAgIGRldk1vZGU6IHRoaXMucHJvcHMuZGV2TW9kZVxuICAgIH0pO1xuICB9XG5cbiAgb25VcGRhdGUoY2FsbGJhY2spIHtcbiAgICB0aGlzLmVtaXR0ZXIub24oJ3VwZGF0ZWQnLCAoKSA9PiBjYWxsYmFjaygpKTtcbiAgfVxufVxuIl19
//# sourceURL=/home/gsmyrnaios/.atom/packages/project-manager/lib/project.js
