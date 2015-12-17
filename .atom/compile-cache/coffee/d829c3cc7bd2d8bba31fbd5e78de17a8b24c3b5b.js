(function() {
  var BetaAdater;

  module.exports = BetaAdater = (function() {
    function BetaAdater(textEditor) {
      this.textEditor = textEditor;
      this.textEditorElement = atom.views.getView(this.textEditor);
    }

    BetaAdater.prototype.enableCache = function() {
      return this.useCache = true;
    };

    BetaAdater.prototype.clearCache = function() {
      this.useCache = false;
      delete this.heightCache;
      delete this.scrollTopCache;
      delete this.scrollLeftCache;
      return delete this.maxScrollTopCache;
    };

    BetaAdater.prototype.onDidChangeScrollTop = function(callback) {
      return this.textEditorElement.onDidChangeScrollTop(callback);
    };

    BetaAdater.prototype.onDidChangeScrollLeft = function(callback) {
      return this.textEditorElement.onDidChangeScrollLeft(callback);
    };

    BetaAdater.prototype.getHeight = function() {
      if (this.useCache) {
        return this.heightCache != null ? this.heightCache : this.heightCache = this.textEditorElement.getHeight();
      }
      return this.textEditorElement.getHeight();
    };

    BetaAdater.prototype.getScrollTop = function() {
      if (this.useCache) {
        return this.scrollTopCache != null ? this.scrollTopCache : this.scrollTopCache = this.textEditorElement.getScrollTop();
      }
      return this.textEditorElement.getScrollTop();
    };

    BetaAdater.prototype.setScrollTop = function(scrollTop) {
      return this.textEditorElement.setScrollTop(scrollTop);
    };

    BetaAdater.prototype.getScrollLeft = function() {
      if (this.useCache) {
        return this.scrollLeftCache != null ? this.scrollLeftCache : this.scrollLeftCache = this.textEditorElement.getScrollLeft();
      }
      return this.textEditorElement.getScrollLeft();
    };

    BetaAdater.prototype.getMaxScrollTop = function() {
      var lineHeight, maxScrollTop;
      if ((this.maxScrollTopCache != null) && this.useCache) {
        return this.maxScrollTopCache;
      }
      maxScrollTop = this.textEditorElement.getScrollHeight() - this.getHeight();
      lineHeight = this.textEditor.getLineHeightInPixels();
      if (this.scrollPastEnd) {
        maxScrollTop -= this.getHeight() - 3 * lineHeight;
      }
      if (this.useCache) {
        return this.maxScrollTopCache = maxScrollTop;
      }
      return maxScrollTop;
    };

    return BetaAdater;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL2xpYi9hZGFwdGVycy9iZXRhLWFkYXB0ZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQ0E7QUFBQSxNQUFBLFVBQUE7O0FBQUEsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ1MsSUFBQSxvQkFBRSxVQUFGLEdBQUE7QUFDWCxNQURZLElBQUMsQ0FBQSxhQUFBLFVBQ2IsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLGlCQUFELEdBQXFCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixJQUFDLENBQUEsVUFBcEIsQ0FBckIsQ0FEVztJQUFBLENBQWI7O0FBQUEseUJBR0EsV0FBQSxHQUFhLFNBQUEsR0FBQTthQUFHLElBQUMsQ0FBQSxRQUFELEdBQVksS0FBZjtJQUFBLENBSGIsQ0FBQTs7QUFBQSx5QkFLQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1YsTUFBQSxJQUFDLENBQUEsUUFBRCxHQUFZLEtBQVosQ0FBQTtBQUFBLE1BQ0EsTUFBQSxDQUFBLElBQVEsQ0FBQSxXQURSLENBQUE7QUFBQSxNQUVBLE1BQUEsQ0FBQSxJQUFRLENBQUEsY0FGUixDQUFBO0FBQUEsTUFHQSxNQUFBLENBQUEsSUFBUSxDQUFBLGVBSFIsQ0FBQTthQUlBLE1BQUEsQ0FBQSxJQUFRLENBQUEsa0JBTEU7SUFBQSxDQUxaLENBQUE7O0FBQUEseUJBWUEsb0JBQUEsR0FBc0IsU0FBQyxRQUFELEdBQUE7YUFDcEIsSUFBQyxDQUFBLGlCQUFpQixDQUFDLG9CQUFuQixDQUF3QyxRQUF4QyxFQURvQjtJQUFBLENBWnRCLENBQUE7O0FBQUEseUJBZUEscUJBQUEsR0FBdUIsU0FBQyxRQUFELEdBQUE7YUFDckIsSUFBQyxDQUFBLGlCQUFpQixDQUFDLHFCQUFuQixDQUF5QyxRQUF6QyxFQURxQjtJQUFBLENBZnZCLENBQUE7O0FBQUEseUJBa0JBLFNBQUEsR0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLElBQXlELElBQUMsQ0FBQSxRQUExRDtBQUFBLDBDQUFPLElBQUMsQ0FBQSxjQUFELElBQUMsQ0FBQSxjQUFlLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxTQUFuQixDQUFBLENBQXZCLENBQUE7T0FBQTthQUNBLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxTQUFuQixDQUFBLEVBRlM7SUFBQSxDQWxCWCxDQUFBOztBQUFBLHlCQXNCQSxZQUFBLEdBQWMsU0FBQSxHQUFBO0FBQ1osTUFBQSxJQUErRCxJQUFDLENBQUEsUUFBaEU7QUFBQSw2Q0FBTyxJQUFDLENBQUEsaUJBQUQsSUFBQyxDQUFBLGlCQUFrQixJQUFDLENBQUEsaUJBQWlCLENBQUMsWUFBbkIsQ0FBQSxDQUExQixDQUFBO09BQUE7YUFDQSxJQUFDLENBQUEsaUJBQWlCLENBQUMsWUFBbkIsQ0FBQSxFQUZZO0lBQUEsQ0F0QmQsQ0FBQTs7QUFBQSx5QkEwQkEsWUFBQSxHQUFjLFNBQUMsU0FBRCxHQUFBO2FBQ1osSUFBQyxDQUFBLGlCQUFpQixDQUFDLFlBQW5CLENBQWdDLFNBQWhDLEVBRFk7SUFBQSxDQTFCZCxDQUFBOztBQUFBLHlCQTZCQSxhQUFBLEdBQWUsU0FBQSxHQUFBO0FBQ2IsTUFBQSxJQUFpRSxJQUFDLENBQUEsUUFBbEU7QUFBQSw4Q0FBTyxJQUFDLENBQUEsa0JBQUQsSUFBQyxDQUFBLGtCQUFtQixJQUFDLENBQUEsaUJBQWlCLENBQUMsYUFBbkIsQ0FBQSxDQUEzQixDQUFBO09BQUE7YUFDQSxJQUFDLENBQUEsaUJBQWlCLENBQUMsYUFBbkIsQ0FBQSxFQUZhO0lBQUEsQ0E3QmYsQ0FBQTs7QUFBQSx5QkFpQ0EsZUFBQSxHQUFpQixTQUFBLEdBQUE7QUFDZixVQUFBLHdCQUFBO0FBQUEsTUFBQSxJQUE2QixnQ0FBQSxJQUF3QixJQUFDLENBQUEsUUFBdEQ7QUFBQSxlQUFPLElBQUMsQ0FBQSxpQkFBUixDQUFBO09BQUE7QUFBQSxNQUNBLFlBQUEsR0FBZSxJQUFDLENBQUEsaUJBQWlCLENBQUMsZUFBbkIsQ0FBQSxDQUFBLEdBQXVDLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FEdEQsQ0FBQTtBQUFBLE1BRUEsVUFBQSxHQUFhLElBQUMsQ0FBQSxVQUFVLENBQUMscUJBQVosQ0FBQSxDQUZiLENBQUE7QUFJQSxNQUFBLElBQWlELElBQUMsQ0FBQSxhQUFsRDtBQUFBLFFBQUEsWUFBQSxJQUFnQixJQUFDLENBQUEsU0FBRCxDQUFBLENBQUEsR0FBZSxDQUFBLEdBQUksVUFBbkMsQ0FBQTtPQUpBO0FBS0EsTUFBQSxJQUE0QyxJQUFDLENBQUEsUUFBN0M7QUFBQSxlQUFPLElBQUMsQ0FBQSxpQkFBRCxHQUFxQixZQUE1QixDQUFBO09BTEE7YUFNQSxhQVBlO0lBQUEsQ0FqQ2pCLENBQUE7O3NCQUFBOztNQUZGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/gsmyrnaios/.atom/packages/minimap/lib/adapters/beta-adapter.coffee
