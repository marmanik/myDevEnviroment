(function() {
  var CompositeDisposable, PigmentsProvider, Range, variablesRegExp, _, _ref;

  _ = require('underscore-plus');

  _ref = require('atom'), CompositeDisposable = _ref.CompositeDisposable, Range = _ref.Range;

  variablesRegExp = require('./regexes').variables;

  module.exports = PigmentsProvider = (function() {
    function PigmentsProvider(pigments) {
      this.pigments = pigments;
      this.subscriptions = new CompositeDisposable;
      this.selector = atom.config.get('pigments.autocompleteScopes').join(',');
      this.subscriptions.add(atom.config.observe('pigments.autocompleteScopes', (function(_this) {
        return function(scopes) {
          return _this.selector = scopes.join(',');
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.extendAutocompleteToVariables', (function(_this) {
        return function(extendAutocompleteToVariables) {
          _this.extendAutocompleteToVariables = extendAutocompleteToVariables;
        };
      })(this)));
    }

    PigmentsProvider.prototype.dispose = function() {
      this.subscriptions.dispose();
      return this.pigments = null;
    };

    PigmentsProvider.prototype.getProject = function() {
      return this.pigments.getProject();
    };

    PigmentsProvider.prototype.getSuggestions = function(_arg) {
      var bufferPosition, editor, prefix, project, suggestions, variables;
      editor = _arg.editor, bufferPosition = _arg.bufferPosition;
      prefix = this.getPrefix(editor, bufferPosition);
      project = this.getProject();
      if (!(prefix != null ? prefix.length : void 0)) {
        return;
      }
      if (project == null) {
        return;
      }
      if (this.extendAutocompleteToVariables) {
        variables = project.getVariables();
      } else {
        variables = project.getColorVariables();
      }
      suggestions = this.findSuggestionsForPrefix(variables, prefix);
      return suggestions;
    };

    PigmentsProvider.prototype.getPrefix = function(editor, bufferPosition) {
      var line, _ref1;
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      return ((_ref1 = line.match(new RegExp(variablesRegExp + '$'))) != null ? _ref1[0] : void 0) || '';
    };

    PigmentsProvider.prototype.findSuggestionsForPrefix = function(variables, prefix) {
      var matchedVariables, suggestions;
      if (variables == null) {
        return [];
      }
      suggestions = [];
      matchedVariables = variables.filter(function(v) {
        return RegExp("^" + (_.escapeRegExp(prefix))).test(v.name);
      });
      matchedVariables.forEach(function(v) {
        if (v.isColor) {
          return suggestions.push({
            text: v.name,
            rightLabelHTML: "<span class='color-suggestion-preview' style='background: " + (v.color.toCSS()) + "'></span>",
            replacementPrefix: prefix,
            className: 'color-suggestion'
          });
        } else {
          return suggestions.push({
            text: v.name,
            rightLabel: v.value,
            replacementPrefix: prefix,
            className: 'pigments-suggestion'
          });
        }
      });
      return suggestions;
    };

    return PigmentsProvider;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvcGlnbWVudHMtcHJvdmlkZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHNFQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxPQUFnQyxPQUFBLENBQVEsTUFBUixDQUFoQyxFQUFDLDJCQUFBLG1CQUFELEVBQXNCLGFBQUEsS0FEdEIsQ0FBQTs7QUFBQSxFQUVZLGtCQUFtQixPQUFBLENBQVEsV0FBUixFQUE5QixTQUZELENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ1MsSUFBQSwwQkFBRSxRQUFGLEdBQUE7QUFDWCxNQURZLElBQUMsQ0FBQSxXQUFBLFFBQ2IsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsR0FBQSxDQUFBLG1CQUFqQixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsUUFBRCxHQUFZLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw2QkFBaEIsQ0FBOEMsQ0FBQyxJQUEvQyxDQUFvRCxHQUFwRCxDQURaLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0IsNkJBQXBCLEVBQW1ELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLE1BQUQsR0FBQTtpQkFDcEUsS0FBQyxDQUFBLFFBQUQsR0FBWSxNQUFNLENBQUMsSUFBUCxDQUFZLEdBQVosRUFEd0Q7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuRCxDQUFuQixDQUhBLENBQUE7QUFBQSxNQUtBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixD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

//# sourceURL=/home/gsmyrnaios/.atom/packages/pigments/lib/pigments-provider.coffee
