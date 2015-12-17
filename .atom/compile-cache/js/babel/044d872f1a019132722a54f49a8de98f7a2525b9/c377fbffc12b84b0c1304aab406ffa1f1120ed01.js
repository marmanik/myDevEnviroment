Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _underscorePlus = require('underscore-plus');

var _underscorePlus2 = _interopRequireDefault(_underscorePlus);

'use babel';

var Settings = (function () {
  function Settings() {
    _classCallCheck(this, Settings);
  }

  _createClass(Settings, [{
    key: 'update',
    value: function update() {
      var settings = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      this.load(settings);
    }
  }, {
    key: 'load',
    value: function load() {
      var settings = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      if ('global' in settings) {
        settings['*'] = settings.global;
        delete settings.global;
      }

      if ('*' in settings) {
        var scopedSettings = settings;
        settings = settings['*'];
        delete scopedSettings['*'];

        var setting = undefined;
        var scope = undefined;
        for (scope in scopedSettings) {
          setting = scopedSettings[scope];
          this.set(setting, scope);
        }
      }

      this.set(settings);
    }
  }, {
    key: 'set',
    value: function set(settings, scope) {
      var flatSettings = {};
      var setting = undefined;
      var value = undefined;
      var valueOptions = undefined;
      var currentValue = undefined;
      var options = scope ? { scopeSelector: scope } : {};
      options.save = false;
      this.flatten(flatSettings, settings);

      for (setting in flatSettings) {
        value = flatSettings[setting];
        if (_underscorePlus2['default'].isArray(value)) {
          valueOptions = scope ? { scope: scope } : {};
          currentValue = atom.config.get(setting, valueOptions);
          value = _underscorePlus2['default'].union(currentValue, value);
        }

        atom.config.set(setting, value, options);
      }
    }
  }, {
    key: 'flatten',
    value: function flatten(root, dict, path) {
      var key = undefined;
      var value = undefined;
      var dotPath = undefined;
      var isObject = undefined;
      for (key in dict) {
        value = dict[key];
        dotPath = path ? path + '.' + key : key;
        isObject = !_underscorePlus2['default'].isArray(value) && _underscorePlus2['default'].isObject(value);

        if (isObject) {
          this.flatten(root, dict[key], dotPath);
        } else {
          root[dotPath] = value;
        }
      }
    }
  }]);

  return Settings;
})();

exports['default'] = Settings;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2dzbXlybmFpb3MvLmF0b20vcGFja2FnZXMvcHJvamVjdC1tYW5hZ2VyL2xpYi9zZXR0aW5ncy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OzhCQUVjLGlCQUFpQjs7OztBQUYvQixXQUFXLENBQUM7O0lBSVMsUUFBUTtXQUFSLFFBQVE7MEJBQVIsUUFBUTs7O2VBQVIsUUFBUTs7V0FFckIsa0JBQWM7VUFBYixRQUFRLHlEQUFDLEVBQUU7O0FBQ2hCLFVBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDckI7OztXQUVHLGdCQUFjO1VBQWIsUUFBUSx5REFBQyxFQUFFOztBQUVkLFVBQUksUUFBUSxJQUFJLFFBQVEsRUFBRTtBQUN4QixnQkFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUM7QUFDaEMsZUFBTyxRQUFRLENBQUMsTUFBTSxDQUFDO09BQ3hCOztBQUVELFVBQUksR0FBRyxJQUFJLFFBQVEsRUFBRTtBQUNuQixZQUFJLGNBQWMsR0FBRyxRQUFRLENBQUM7QUFDOUIsZ0JBQVEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDekIsZUFBTyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7O0FBRTNCLFlBQUksT0FBTyxZQUFBLENBQUM7QUFDWixZQUFJLEtBQUssWUFBQSxDQUFDO0FBQ1YsYUFBSyxLQUFLLElBQUksY0FBYyxFQUFFO0FBQzVCLGlCQUFPLEdBQUcsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2hDLGNBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQzFCO09BQ0Y7O0FBRUQsVUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUNwQjs7O1dBRUUsYUFBQyxRQUFRLEVBQUUsS0FBSyxFQUFFO0FBQ25CLFVBQUksWUFBWSxHQUFHLEVBQUUsQ0FBQztBQUN0QixVQUFJLE9BQU8sWUFBQSxDQUFDO0FBQ1osVUFBSSxLQUFLLFlBQUEsQ0FBQztBQUNWLFVBQUksWUFBWSxZQUFBLENBQUM7QUFDakIsVUFBSSxZQUFZLFlBQUEsQ0FBQztBQUNqQixVQUFJLE9BQU8sR0FBRyxLQUFLLEdBQUcsRUFBQyxhQUFhLEVBQUUsS0FBSyxFQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ2xELGFBQU8sQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO0FBQ3JCLFVBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxDQUFDOztBQUVyQyxXQUFLLE9BQU8sSUFBSSxZQUFZLEVBQUU7QUFDNUIsYUFBSyxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM5QixZQUFJLDRCQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUNwQixzQkFBWSxHQUFHLEtBQUssR0FBRyxFQUFDLEtBQUssRUFBRSxLQUFLLEVBQUMsR0FBRyxFQUFFLENBQUM7QUFDM0Msc0JBQVksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDdEQsZUFBSyxHQUFHLDRCQUFFLEtBQUssQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDdEM7O0FBRUQsWUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztPQUMxQztLQUNGOzs7V0FFTSxpQkFBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRTtBQUN4QixVQUFJLEdBQUcsWUFBQSxDQUFDO0FBQ1IsVUFBSSxLQUFLLFlBQUEsQ0FBQztBQUNWLFVBQUksT0FBTyxZQUFBLENBQUM7QUFDWixVQUFJLFFBQVEsWUFBQSxDQUFDO0FBQ2IsV0FBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ2hCLGFBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbEIsZUFBTyxHQUFHLElBQUksR0FBTSxJQUFJLFNBQUksR0FBRyxHQUFLLEdBQUcsQ0FBQztBQUN4QyxnQkFBUSxHQUFHLENBQUMsNEJBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLDRCQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFbEQsWUFBSSxRQUFRLEVBQUU7QUFDWixjQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDeEMsTUFBTTtBQUNMLGNBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxLQUFLLENBQUM7U0FDdkI7T0FDRjtLQUNGOzs7U0FuRWtCLFFBQVE7OztxQkFBUixRQUFRIiwiZmlsZSI6Ii9ob21lL2dzbXlybmFpb3MvLmF0b20vcGFja2FnZXMvcHJvamVjdC1tYW5hZ2VyL2xpYi9zZXR0aW5ncy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlLXBsdXMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZXR0aW5ncyB7XG5cbiAgdXBkYXRlKHNldHRpbmdzPXt9KSB7XG4gICAgdGhpcy5sb2FkKHNldHRpbmdzKTtcbiAgfVxuXG4gIGxvYWQoc2V0dGluZ3M9e30pIHtcblxuICAgIGlmICgnZ2xvYmFsJyBpbiBzZXR0aW5ncykge1xuICAgICAgc2V0dGluZ3NbJyonXSA9IHNldHRpbmdzLmdsb2JhbDtcbiAgICAgIGRlbGV0ZSBzZXR0aW5ncy5nbG9iYWw7XG4gICAgfVxuXG4gICAgaWYgKCcqJyBpbiBzZXR0aW5ncykge1xuICAgICAgbGV0IHNjb3BlZFNldHRpbmdzID0gc2V0dGluZ3M7XG4gICAgICBzZXR0aW5ncyA9IHNldHRpbmdzWycqJ107XG4gICAgICBkZWxldGUgc2NvcGVkU2V0dGluZ3NbJyonXTtcblxuICAgICAgbGV0IHNldHRpbmc7XG4gICAgICBsZXQgc2NvcGU7XG4gICAgICBmb3IgKHNjb3BlIGluIHNjb3BlZFNldHRpbmdzKSB7XG4gICAgICAgIHNldHRpbmcgPSBzY29wZWRTZXR0aW5nc1tzY29wZV07XG4gICAgICAgIHRoaXMuc2V0KHNldHRpbmcsIHNjb3BlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnNldChzZXR0aW5ncyk7XG4gIH1cblxuICBzZXQoc2V0dGluZ3MsIHNjb3BlKSB7XG4gICAgbGV0IGZsYXRTZXR0aW5ncyA9IHt9O1xuICAgIGxldCBzZXR0aW5nO1xuICAgIGxldCB2YWx1ZTtcbiAgICBsZXQgdmFsdWVPcHRpb25zO1xuICAgIGxldCBjdXJyZW50VmFsdWU7XG4gICAgbGV0IG9wdGlvbnMgPSBzY29wZSA/IHtzY29wZVNlbGVjdG9yOiBzY29wZX0gOiB7fTtcbiAgICBvcHRpb25zLnNhdmUgPSBmYWxzZTtcbiAgICB0aGlzLmZsYXR0ZW4oZmxhdFNldHRpbmdzLCBzZXR0aW5ncyk7XG5cbiAgICBmb3IgKHNldHRpbmcgaW4gZmxhdFNldHRpbmdzKSB7XG4gICAgICB2YWx1ZSA9IGZsYXRTZXR0aW5nc1tzZXR0aW5nXTtcbiAgICAgIGlmIChfLmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgIHZhbHVlT3B0aW9ucyA9IHNjb3BlID8ge3Njb3BlOiBzY29wZX0gOiB7fTtcbiAgICAgICAgY3VycmVudFZhbHVlID0gYXRvbS5jb25maWcuZ2V0KHNldHRpbmcsIHZhbHVlT3B0aW9ucyk7XG4gICAgICAgIHZhbHVlID0gXy51bmlvbihjdXJyZW50VmFsdWUsIHZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgYXRvbS5jb25maWcuc2V0KHNldHRpbmcsIHZhbHVlLCBvcHRpb25zKTtcbiAgICB9XG4gIH1cblxuICBmbGF0dGVuKHJvb3QsIGRpY3QsIHBhdGgpIHtcbiAgICBsZXQga2V5O1xuICAgIGxldCB2YWx1ZTtcbiAgICBsZXQgZG90UGF0aDtcbiAgICBsZXQgaXNPYmplY3Q7XG4gICAgZm9yIChrZXkgaW4gZGljdCkge1xuICAgICAgdmFsdWUgPSBkaWN0W2tleV07XG4gICAgICBkb3RQYXRoID0gcGF0aCA/IGAke3BhdGh9LiR7a2V5fWAgOiBrZXk7XG4gICAgICBpc09iamVjdCA9ICFfLmlzQXJyYXkodmFsdWUpICYmIF8uaXNPYmplY3QodmFsdWUpO1xuXG4gICAgICBpZiAoaXNPYmplY3QpIHtcbiAgICAgICAgdGhpcy5mbGF0dGVuKHJvb3QsIGRpY3Rba2V5XSwgZG90UGF0aCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByb290W2RvdFBhdGhdID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=
//# sourceURL=/home/gsmyrnaios/.atom/packages/project-manager/lib/settings.js
