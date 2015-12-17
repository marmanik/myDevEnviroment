Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x4, _x5, _x6) { var _again = true; _function: while (_again) { var object = _x4, property = _x5, receiver = _x6; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x4 = parent; _x5 = property; _x6 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atom = require('atom');

'use babel';

var Dialog = (function (_HTMLElement) {
  _inherits(Dialog, _HTMLElement);

  function Dialog() {
    _classCallCheck(this, Dialog);

    _get(Object.getPrototypeOf(Dialog.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(Dialog, [{
    key: 'createdCallback',
    value: function createdCallback() {
      var _this = this;

      this.disposables = new _atom.CompositeDisposable();

      this.classList.add('project-manager-dialog', 'overlay', 'from-top');

      this.label = document.createElement('label');
      this.label.classList.add('project-manager-dialog-label', 'icon');

      this.editor = new _atom.TextEditor({ mini: true });
      this.editorElement = atom.views.getView(this.editor);

      this.errorMessage = document.createElement('div');
      this.errorMessage.classList.add('error');

      this.appendChild(this.label);
      this.appendChild(this.editorElement);
      this.appendChild(this.errorMessage);

      this.disposables.add(atom.commands.add('project-manager-dialog', {
        'core:confirm': function coreConfirm() {
          return _this.confirm();
        },
        'core:cancel': function coreCancel() {
          return _this.cancel();
        }
      }));

      this.editorElement.addEventListener('blur', function () {
        return _this.cancel();
      });

      this.isAttached();
    }
  }, {
    key: 'attachedCallback',
    value: function attachedCallback() {
      this.editorElement.focus();
    }
  }, {
    key: 'attach',
    value: function attach() {
      atom.views.getView(atom.workspace).appendChild(this);
    }
  }, {
    key: 'detach',
    value: function detach() {
      console.log('Detached called');
      console.log(this);
      console.log(this.parentNode);
      if (this.parentNode == 'undefined' || this.parentNode == null) {
        return false;
      }

      this.disposables.dispose();
      atom.workspace.getActivePane().activate();
      this.parentNode.removeChild(this);
    }

    // attributeChangedCallback(attr, oldVal, newVal) {
    //
    // }

  }, {
    key: 'setLabel',
    value: function setLabel(text, iconClass) {
      if (text === undefined) text = '';

      this.label.textContent = text;
      if (iconClass) {
        this.label.classList.add(iconClass);
      }
    }
  }, {
    key: 'setInput',
    value: function setInput() {
      var input = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
      var select = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      this.editor.setText(input);

      if (select) {
        var range = [[0, 0], [0, input.length]];
        this.editor.setSelectedBufferRange(range);
      }
    }
  }, {
    key: 'showError',
    value: function showError() {
      var message = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

      this.errorMessage.textContent(message);
    }
  }, {
    key: 'cancel',
    value: function cancel() {
      this.detach();
    }
  }, {
    key: 'close',
    value: function close() {
      this.detach();
    }
  }]);

  return Dialog;
})(HTMLElement);

exports['default'] = Dialog;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2dzbXlybmFpb3MvLmF0b20vcGFja2FnZXMvcHJvamVjdC1tYW5hZ2VyL2xpYi9fZGlhbG9nLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztvQkFFOEMsTUFBTTs7QUFGcEQsV0FBVyxDQUFDOztJQUlTLE1BQU07WUFBTixNQUFNOztXQUFOLE1BQU07MEJBQU4sTUFBTTs7K0JBQU4sTUFBTTs7O2VBQU4sTUFBTTs7V0FFViwyQkFBRzs7O0FBQ2hCLFVBQUksQ0FBQyxXQUFXLEdBQUcsK0JBQXlCLENBQUM7O0FBRTdDLFVBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLHdCQUF3QixFQUFFLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQzs7QUFFcEUsVUFBSSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzdDLFVBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsRUFBRSxNQUFNLENBQUMsQ0FBQzs7QUFFakUsVUFBSSxDQUFDLE1BQU0sR0FBRyxxQkFBZSxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO0FBQzNDLFVBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUVyRCxVQUFJLENBQUMsWUFBWSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDbEQsVUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUV6QyxVQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM3QixVQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUNyQyxVQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQzs7QUFFcEMsVUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsd0JBQXdCLEVBQUU7QUFDL0Qsc0JBQWMsRUFBRTtpQkFBTSxNQUFLLE9BQU8sRUFBRTtTQUFBO0FBQ3BDLHFCQUFhLEVBQUU7aUJBQU0sTUFBSyxNQUFNLEVBQUU7U0FBQTtPQUNuQyxDQUFDLENBQUMsQ0FBQzs7QUFFSixVQUFJLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRTtlQUFNLE1BQUssTUFBTSxFQUFFO09BQUEsQ0FBQyxDQUFDOztBQUVqRSxVQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7S0FDbkI7OztXQUVlLDRCQUFHO0FBQ2pCLFVBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDNUI7OztXQUVLLGtCQUFHO0FBQ1AsVUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUN0RDs7O1dBRUssa0JBQUc7QUFDUCxhQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDL0IsYUFBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNsQixhQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUM3QixVQUFJLElBQUksQ0FBQyxVQUFVLElBQUksV0FBVyxJQUFJLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxFQUFFO0FBQzdELGVBQU8sS0FBSyxDQUFDO09BQ2Q7O0FBRUQsVUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUMzQixVQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQzFDLFVBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ25DOzs7Ozs7OztXQU1PLGtCQUFDLElBQUksRUFBSyxTQUFTLEVBQUU7VUFBcEIsSUFBSSxnQkFBSixJQUFJLEdBQUMsRUFBRTs7QUFDZCxVQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7QUFDOUIsVUFBSSxTQUFTLEVBQUU7QUFDYixZQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7T0FDckM7S0FDRjs7O1dBRU8sb0JBQXlCO1VBQXhCLEtBQUsseURBQUMsRUFBRTtVQUFFLE1BQU0seURBQUMsS0FBSzs7QUFDN0IsVUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRTNCLFVBQUksTUFBTSxFQUFFO0FBQ1YsWUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUN4QyxZQUFJLENBQUMsTUFBTSxDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FBQyxDQUFDO09BQzNDO0tBQ0Y7OztXQUVRLHFCQUFhO1VBQVosT0FBTyx5REFBQyxFQUFFOztBQUNsQixVQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUN4Qzs7O1dBRUssa0JBQUc7QUFDUCxVQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDZjs7O1dBRUksaUJBQUc7QUFDTixVQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDZjs7O1NBakZrQixNQUFNO0dBQVMsV0FBVzs7cUJBQTFCLE1BQU0iLCJmaWxlIjoiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy9wcm9qZWN0LW1hbmFnZXIvbGliL19kaWFsb2cuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IHtUZXh0RWRpdG9yLCBDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlhbG9nIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuXG4gIGNyZWF0ZWRDYWxsYmFjaygpIHtcbiAgICB0aGlzLmRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcblxuICAgIHRoaXMuY2xhc3NMaXN0LmFkZCgncHJvamVjdC1tYW5hZ2VyLWRpYWxvZycsICdvdmVybGF5JywgJ2Zyb20tdG9wJyk7XG5cbiAgICB0aGlzLmxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcbiAgICB0aGlzLmxhYmVsLmNsYXNzTGlzdC5hZGQoJ3Byb2plY3QtbWFuYWdlci1kaWFsb2ctbGFiZWwnLCAnaWNvbicpO1xuXG4gICAgdGhpcy5lZGl0b3IgPSBuZXcgVGV4dEVkaXRvcih7bWluaTogdHJ1ZX0pO1xuICAgIHRoaXMuZWRpdG9yRWxlbWVudCA9IGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLmVkaXRvcik7XG5cbiAgICB0aGlzLmVycm9yTWVzc2FnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMuZXJyb3JNZXNzYWdlLmNsYXNzTGlzdC5hZGQoJ2Vycm9yJyk7XG5cbiAgICB0aGlzLmFwcGVuZENoaWxkKHRoaXMubGFiZWwpO1xuICAgIHRoaXMuYXBwZW5kQ2hpbGQodGhpcy5lZGl0b3JFbGVtZW50KTtcbiAgICB0aGlzLmFwcGVuZENoaWxkKHRoaXMuZXJyb3JNZXNzYWdlKTtcblxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdwcm9qZWN0LW1hbmFnZXItZGlhbG9nJywge1xuICAgICAgJ2NvcmU6Y29uZmlybSc6ICgpID0+IHRoaXMuY29uZmlybSgpLFxuICAgICAgJ2NvcmU6Y2FuY2VsJzogKCkgPT4gdGhpcy5jYW5jZWwoKVxuICAgIH0pKTtcblxuICAgIHRoaXMuZWRpdG9yRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgKCkgPT4gdGhpcy5jYW5jZWwoKSk7XG5cbiAgICB0aGlzLmlzQXR0YWNoZWQoKTtcbiAgfVxuXG4gIGF0dGFjaGVkQ2FsbGJhY2soKSB7XG4gICAgdGhpcy5lZGl0b3JFbGVtZW50LmZvY3VzKCk7XG4gIH1cblxuICBhdHRhY2goKSB7XG4gICAgYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKS5hcHBlbmRDaGlsZCh0aGlzKTtcbiAgfVxuXG4gIGRldGFjaCgpIHtcbiAgICBjb25zb2xlLmxvZygnRGV0YWNoZWQgY2FsbGVkJyk7XG4gICAgY29uc29sZS5sb2codGhpcyk7XG4gICAgY29uc29sZS5sb2codGhpcy5wYXJlbnROb2RlKTtcbiAgICBpZiAodGhpcy5wYXJlbnROb2RlID09ICd1bmRlZmluZWQnIHx8IHRoaXMucGFyZW50Tm9kZSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpLmFjdGl2YXRlKCk7XG4gICAgdGhpcy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMpO1xuICB9XG5cbiAgLy8gYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrKGF0dHIsIG9sZFZhbCwgbmV3VmFsKSB7XG4gIC8vXG4gIC8vIH1cblxuICBzZXRMYWJlbCh0ZXh0PScnLCBpY29uQ2xhc3MpIHtcbiAgICB0aGlzLmxhYmVsLnRleHRDb250ZW50ID0gdGV4dDtcbiAgICBpZiAoaWNvbkNsYXNzKSB7XG4gICAgICB0aGlzLmxhYmVsLmNsYXNzTGlzdC5hZGQoaWNvbkNsYXNzKTtcbiAgICB9XG4gIH1cblxuICBzZXRJbnB1dChpbnB1dD0nJywgc2VsZWN0PWZhbHNlKSB7XG4gICAgdGhpcy5lZGl0b3Iuc2V0VGV4dChpbnB1dCk7XG5cbiAgICBpZiAoc2VsZWN0KSB7XG4gICAgICBsZXQgcmFuZ2UgPSBbWzAsIDBdLCBbMCwgaW5wdXQubGVuZ3RoXV07XG4gICAgICB0aGlzLmVkaXRvci5zZXRTZWxlY3RlZEJ1ZmZlclJhbmdlKHJhbmdlKTtcbiAgICB9XG4gIH1cblxuICBzaG93RXJyb3IobWVzc2FnZT0nJykge1xuICAgIHRoaXMuZXJyb3JNZXNzYWdlLnRleHRDb250ZW50KG1lc3NhZ2UpO1xuICB9XG5cbiAgY2FuY2VsKCkge1xuICAgIHRoaXMuZGV0YWNoKCk7XG4gIH1cblxuICBjbG9zZSgpIHtcbiAgICB0aGlzLmRldGFjaCgpO1xuICB9XG5cbn1cbiJdfQ==
//# sourceURL=/home/gsmyrnaios/.atom/packages/project-manager/lib/_dialog.js
