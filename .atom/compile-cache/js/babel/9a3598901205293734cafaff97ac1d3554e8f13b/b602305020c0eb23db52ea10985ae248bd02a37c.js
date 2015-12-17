var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _dialog = require('./dialog');

var _dialog2 = _interopRequireDefault(_dialog);

var _project = require('./project');

var _project2 = _interopRequireDefault(_project);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

'use babel';

var SaveDialog = (function (_Dialog) {
  _inherits(SaveDialog, _Dialog);

  function SaveDialog() {
    _classCallCheck(this, SaveDialog);

    _get(Object.getPrototypeOf(SaveDialog.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(SaveDialog, [{
    key: 'isAttached',
    value: function isAttached() {
      var firstPath = atom.project.getPaths()[0];
      var title = _path2['default'].basename(firstPath);
      this.setLabel('Enter name of project', 'icon-arrow-right');
      this.setInput(title, true);
    }
  }, {
    key: 'confirm',
    value: function confirm() {
      var input = this.editor.getText();

      if (input) {
        var properties = {
          title: input,
          paths: atom.project.getPaths()
        };

        var project = new _project2['default'](properties);
        project.save();

        this.close();
      }
    }
  }]);

  return SaveDialog;
})(_dialog2['default']);

module.exports = SaveDialog = document.registerElement('project-manager-dialog', SaveDialog);

// atom.commands.add('project-manager-dialog', {
//   'core:confirm': () => this.confirm(),
//   'core:cancel': () => this.cancel()
// });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2dzbXlybmFpb3MvLmF0b20vcGFja2FnZXMvcHJvamVjdC1tYW5hZ2VyL2xpYi9fc2F2ZS1kaWFsb2cuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztzQkFFbUIsVUFBVTs7Ozt1QkFDVCxXQUFXOzs7O29CQUNkLE1BQU07Ozs7QUFKdkIsV0FBVyxDQUFDOztJQU1OLFVBQVU7WUFBVixVQUFVOztXQUFWLFVBQVU7MEJBQVYsVUFBVTs7K0JBQVYsVUFBVTs7O2VBQVYsVUFBVTs7V0FFSixzQkFBRztBQUNYLFVBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0MsVUFBSSxLQUFLLEdBQUcsa0JBQUssUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3JDLFVBQUksQ0FBQyxRQUFRLENBQUMsdUJBQXVCLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztBQUMzRCxVQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztLQUM1Qjs7O1dBRU0sbUJBQUc7QUFDUixVQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDOztBQUVsQyxVQUFJLEtBQUssRUFBRTtBQUNULFlBQUksVUFBVSxHQUFHO0FBQ2YsZUFBSyxFQUFFLEtBQUs7QUFDWixlQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUU7U0FDL0IsQ0FBQzs7QUFFRixZQUFJLE9BQU8sR0FBRyx5QkFBWSxVQUFVLENBQUMsQ0FBQztBQUN0QyxlQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7O0FBRWYsWUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO09BQ2Q7S0FDRjs7O1NBdkJHLFVBQVU7OztBQTBCaEIsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFVLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyx3QkFBd0IsRUFBRSxVQUFVLENBQUMsQ0FBQyIsImZpbGUiOiIvaG9tZS9nc215cm5haW9zLy5hdG9tL3BhY2thZ2VzL3Byb2plY3QtbWFuYWdlci9saWIvX3NhdmUtZGlhbG9nLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBEaWFsb2cgZnJvbSAnLi9kaWFsb2cnO1xuaW1wb3J0IFByb2plY3QgZnJvbSAnLi9wcm9qZWN0JztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG5jbGFzcyBTYXZlRGlhbG9nIGV4dGVuZHMgRGlhbG9nIHtcblxuICBpc0F0dGFjaGVkKCkge1xuICAgIGxldCBmaXJzdFBhdGggPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVswXTtcbiAgICBsZXQgdGl0bGUgPSBwYXRoLmJhc2VuYW1lKGZpcnN0UGF0aCk7XG4gICAgdGhpcy5zZXRMYWJlbCgnRW50ZXIgbmFtZSBvZiBwcm9qZWN0JywgJ2ljb24tYXJyb3ctcmlnaHQnKTtcbiAgICB0aGlzLnNldElucHV0KHRpdGxlLCB0cnVlKTtcbiAgfVxuXG4gIGNvbmZpcm0oKSB7XG4gICAgbGV0IGlucHV0ID0gdGhpcy5lZGl0b3IuZ2V0VGV4dCgpO1xuXG4gICAgaWYgKGlucHV0KSB7XG4gICAgICBsZXQgcHJvcGVydGllcyA9IHtcbiAgICAgICAgdGl0bGU6IGlucHV0LFxuICAgICAgICBwYXRoczogYXRvbS5wcm9qZWN0LmdldFBhdGhzKClcbiAgICAgIH07XG5cbiAgICAgIGxldCBwcm9qZWN0ID0gbmV3IFByb2plY3QocHJvcGVydGllcyk7XG4gICAgICBwcm9qZWN0LnNhdmUoKTtcblxuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNhdmVEaWFsb2cgPSBkb2N1bWVudC5yZWdpc3RlckVsZW1lbnQoJ3Byb2plY3QtbWFuYWdlci1kaWFsb2cnLCBTYXZlRGlhbG9nKTtcblxuLy8gYXRvbS5jb21tYW5kcy5hZGQoJ3Byb2plY3QtbWFuYWdlci1kaWFsb2cnLCB7XG4vLyAgICdjb3JlOmNvbmZpcm0nOiAoKSA9PiB0aGlzLmNvbmZpcm0oKSxcbi8vICAgJ2NvcmU6Y2FuY2VsJzogKCkgPT4gdGhpcy5jYW5jZWwoKVxuLy8gfSk7XG4iXX0=
//# sourceURL=/home/gsmyrnaios/.atom/packages/project-manager/lib/_save-dialog.js
