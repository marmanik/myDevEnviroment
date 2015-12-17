(function() {
  var FailureTree, coffeestack, path, sourceMaps, _,
    __slice = [].slice;

  path = require('path');

  _ = require('underscore');

  coffeestack = require('coffeestack');

  sourceMaps = {};

  module.exports = FailureTree = (function() {
    FailureTree.prototype.suites = null;

    function FailureTree() {
      this.suites = [];
    }

    FailureTree.prototype.isEmpty = function() {
      return this.suites.length === 0;
    };

    FailureTree.prototype.add = function(spec) {
      var failure, failurePath, item, parent, parentSuite, _base, _base1, _i, _j, _len, _len1, _name, _name1, _ref, _results;
      _ref = spec.results().items_;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        if (!(item.passed_ === false)) {
          continue;
        }
        failurePath = [];
        parent = spec.suite;
        while (parent) {
          failurePath.unshift(parent);
          parent = parent.parentSuite;
        }
        parentSuite = this;
        for (_j = 0, _len1 = failurePath.length; _j < _len1; _j++) {
          failure = failurePath[_j];
          if ((_base = parentSuite.suites)[_name = failure.id] == null) {
            _base[_name] = {
              spec: failure,
              suites: [],
              specs: []
            };
          }
          parentSuite = parentSuite.suites[failure.id];
        }
        if ((_base1 = parentSuite.specs)[_name1 = spec.id] == null) {
          _base1[_name1] = {
            spec: spec,
            failures: []
          };
        }
        parentSuite.specs[spec.id].failures.push(item);
        _results.push(this.filterStackTrace(item));
      }
      return _results;
    };

    FailureTree.prototype.filterJasmineLines = function(stackTraceLines) {
      var index, jasminePattern, _results;
      jasminePattern = /^\s*at\s+.*\(?.*[\\/]jasmine(-[^\\/]*)?\.js:\d+:\d+\)?\s*$/;
      index = 0;
      _results = [];
      while (index < stackTraceLines.length) {
        if (jasminePattern.test(stackTraceLines[index])) {
          _results.push(stackTraceLines.splice(index, 1));
        } else {
          _results.push(index++);
        }
      }
      return _results;
    };

    FailureTree.prototype.filterTrailingTimersLine = function(stackTraceLines) {
      if (/^(\s*at .* )\(timers\.js:\d+:\d+\)/.test(_.last(stackTraceLines))) {
        return stackTraceLines.pop();
      }
    };

    FailureTree.prototype.filterSetupLines = function(stackTraceLines) {
      var index, removeLine, _results;
      removeLine = false;
      index = 0;
      _results = [];
      while (index < stackTraceLines.length) {
        removeLine || (removeLine = /^\s*at Object\.jasmine\.executeSpecsInFolder/.test(stackTraceLines[index]));
        if (removeLine) {
          _results.push(stackTraceLines.splice(index, 1));
        } else {
          _results.push(index++);
        }
      }
      return _results;
    };

    FailureTree.prototype.filterFailureMessageLine = function(failure, stackTraceLines) {
      var errorLines, message, stackTraceErrorMessage;
      errorLines = [];
      while (stackTraceLines.length > 0) {
        if (/^\s+at\s+.*\((.*):(\d+):(\d+)\)\s*$/.test(stackTraceLines[0])) {
          break;
        } else {
          errorLines.push(stackTraceLines.shift());
        }
      }
      stackTraceErrorMessage = errorLines.join('\n');
      message = failure.message;
      if (stackTraceErrorMessage !== message && stackTraceErrorMessage !== ("Error: " + message)) {
        return stackTraceLines.splice.apply(stackTraceLines, [0, 0].concat(__slice.call(errorLines)));
      }
    };

    FailureTree.prototype.filterOriginLine = function(failure, stackTraceLines) {
      var column, filePath, line, match;
      if (stackTraceLines.length !== 1) {
        return stackTraceLines;
      }
      if (match = /^\s*at\s+((\[object Object\])|(null))\.<anonymous>\s+\((.*):(\d+):(\d+)\)\s*$/.exec(stackTraceLines[0])) {
        stackTraceLines.shift();
        filePath = path.relative(process.cwd(), match[4]);
        line = match[5];
        column = match[6];
        return failure.messageLine = "" + filePath + ":" + line + ":" + column;
      }
    };

    FailureTree.prototype.filterStackTrace = function(failure) {
      var stackTrace, stackTraceLines;
      stackTrace = failure.trace.stack;
      if (!stackTrace) {
        return;
      }
      stackTraceLines = stackTrace.split('\n').filter(function(line) {
        return line;
      });
      this.filterJasmineLines(stackTraceLines);
      this.filterTrailingTimersLine(stackTraceLines);
      this.filterSetupLines(stackTraceLines);
      stackTrace = coffeestack.convertStackTrace(stackTraceLines.join('\n'), sourceMaps);
      if (!stackTrace) {
        return;
      }
      stackTraceLines = stackTrace.split('\n').filter(function(line) {
        return line;
      });
      this.filterFailureMessageLine(failure, stackTraceLines);
      this.filterOriginLine(failure, stackTraceLines);
      return failure.filteredStackTrace = stackTraceLines.join('\n');
    };

    FailureTree.prototype.forEachSpec = function(_arg, callback, depth) {
      var child, failure, failures, spec, specs, suites, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _results, _results1;
      _ref = _arg != null ? _arg : {}, spec = _ref.spec, suites = _ref.suites, specs = _ref.specs, failures = _ref.failures;
      if (depth == null) {
        depth = 0;
      }
      if (failures != null) {
        callback(spec, null, depth);
        _results = [];
        for (_i = 0, _len = failures.length; _i < _len; _i++) {
          failure = failures[_i];
          _results.push(callback(spec, failure, depth));
        }
        return _results;
      } else {
        callback(spec, null, depth);
        depth++;
        _ref1 = _.compact(suites);
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          child = _ref1[_j];
          this.forEachSpec(child, callback, depth);
        }
        _ref2 = _.compact(specs);
        _results1 = [];
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          child = _ref2[_k];
          _results1.push(this.forEachSpec(child, callback, depth));
        }
        return _results1;
      }
    };

    FailureTree.prototype.forEach = function(callback) {
      var suite, _i, _len, _ref, _results;
      _ref = _.compact(this.suites);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        suite = _ref[_i];
        _results.push(this.forEachSpec(suite, callback));
      }
      return _results;
    };

    return FailureTree;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL29wdC9hdG9tL3Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvamFzbWluZS10YWdnZWQvbm9kZV9tb2R1bGVzL2phc21pbmUtZm9jdXNlZC9ub2RlX21vZHVsZXMvamFzbWluZS1ub2RlL2xpYi9qYXNtaW5lLW5vZGUvZmFpbHVyZS10cmVlLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw2Q0FBQTtJQUFBLGtCQUFBOztBQUFBLEVBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBQVAsQ0FBQTs7QUFBQSxFQUVBLENBQUEsR0FBSSxPQUFBLENBQVEsWUFBUixDQUZKLENBQUE7O0FBQUEsRUFHQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGFBQVIsQ0FIZCxDQUFBOztBQUFBLEVBS0EsVUFBQSxHQUFhLEVBTGIsQ0FBQTs7QUFBQSxFQU9BLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSiwwQkFBQSxNQUFBLEdBQVEsSUFBUixDQUFBOztBQUVhLElBQUEscUJBQUEsR0FBQTtBQUNYLE1BQUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxFQUFWLENBRFc7SUFBQSxDQUZiOztBQUFBLDBCQUtBLE9BQUEsR0FBUyxTQUFBLEdBQUE7YUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsS0FBa0IsRUFBckI7SUFBQSxDQUxULENBQUE7O0FBQUEsMEJBT0EsR0FBQSxHQUFLLFNBQUMsSUFBRCxHQUFBO0FBQ0gsVUFBQSxrSEFBQTtBQUFBO0FBQUE7V0FBQSwyQ0FBQTt3QkFBQTtjQUF1QyxJQUFJLENBQUMsT0FBTCxLQUFnQjs7U0FDckQ7QUFBQSxRQUFBLFdBQUEsR0FBYyxFQUFkLENBQUE7QUFBQSxRQUNBLE1BQUEsR0FBUyxJQUFJLENBQUMsS0FEZCxDQUFBO0FBRUEsZUFBTSxNQUFOLEdBQUE7QUFDRSxVQUFBLFdBQVcs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

//# sourceURL=/opt/atom/resources/app.asar/node_modules/jasmine-tagged/node_modules/jasmine-focused/node_modules/jasmine-node/lib/jasmine-node/failure-tree.coffee
