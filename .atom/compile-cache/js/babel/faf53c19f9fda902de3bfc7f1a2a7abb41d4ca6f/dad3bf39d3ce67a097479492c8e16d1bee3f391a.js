Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.create = create;

var _messageElement = require('./message-element');

'use babel';

function create(message) {
  var bubble = document.createElement('div');
  bubble.id = 'linter-inline';
  bubble.appendChild(_messageElement.Message.fromMessage(message, false));
  if (message.trace && message.trace.length) {
    message.trace.forEach(function (trace) {
      bubble.appendChild(_messageElement.Message.fromMessage(trace).updateVisibility('Project'));
    });
  }
  return bubble;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2dzbXlybmFpb3MvLmF0b20vcGFja2FnZXMvbGludGVyL2xpYi91aS9tZXNzYWdlLWJ1YmJsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs4QkFFc0IsbUJBQW1COztBQUZ6QyxXQUFXLENBQUE7O0FBSUosU0FBUyxNQUFNLENBQUMsT0FBTyxFQUFFO0FBQzlCLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDNUMsUUFBTSxDQUFDLEVBQUUsR0FBRyxlQUFlLENBQUE7QUFDM0IsUUFBTSxDQUFDLFdBQVcsQ0FBQyx3QkFBUSxXQUFXLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUE7QUFDdkQsTUFBSSxPQUFPLENBQUMsS0FBSyxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFO0FBQ3pDLFdBQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQVMsS0FBSyxFQUFFO0FBQ3BDLFlBQU0sQ0FBQyxXQUFXLENBQUMsd0JBQVEsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUE7S0FDM0UsQ0FBQyxDQUFBO0dBQ0g7QUFDRCxTQUFPLE1BQU0sQ0FBQTtDQUNkIiwiZmlsZSI6Ii9ob21lL2dzbXlybmFpb3MvLmF0b20vcGFja2FnZXMvbGludGVyL2xpYi91aS9tZXNzYWdlLWJ1YmJsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCB7TWVzc2FnZX0gZnJvbSAnLi9tZXNzYWdlLWVsZW1lbnQnXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGUobWVzc2FnZSkge1xuICBjb25zdCBidWJibGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICBidWJibGUuaWQgPSAnbGludGVyLWlubGluZSdcbiAgYnViYmxlLmFwcGVuZENoaWxkKE1lc3NhZ2UuZnJvbU1lc3NhZ2UobWVzc2FnZSwgZmFsc2UpKVxuICBpZiAobWVzc2FnZS50cmFjZSAmJiBtZXNzYWdlLnRyYWNlLmxlbmd0aCkge1xuICAgIG1lc3NhZ2UudHJhY2UuZm9yRWFjaChmdW5jdGlvbih0cmFjZSkge1xuICAgICAgYnViYmxlLmFwcGVuZENoaWxkKE1lc3NhZ2UuZnJvbU1lc3NhZ2UodHJhY2UpLnVwZGF0ZVZpc2liaWxpdHkoJ1Byb2plY3QnKSlcbiAgICB9KVxuICB9XG4gIHJldHVybiBidWJibGVcbn1cbiJdfQ==
//# sourceURL=/home/gsmyrnaios/.atom/packages/linter/lib/ui/message-bubble.js
