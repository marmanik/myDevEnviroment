(function() {
  var LegacyAdater;

  module.exports = LegacyAdater = (function() {
    function LegacyAdater(textEditor) {
      this.textEditor = textEditor;
    }

    LegacyAdater.prototype.enableCache = function() {
      return this.useCache = true;
    };

    LegacyAdater.prototype.clearCache = function() {
      this.useCache = false;
      delete this.heightCache;
      delete this.scrollTopCache;
      delete this.scrollLeftCache;
      return delete this.maxScrollTopCache;
    };

    LegacyAdater.prototype.onDidChangeScrollTop = function(callback) {
      return this.textEditor.onDidChangeScrollTop(callback);
    };

    LegacyAdater.prototype.onDidChangeScrollLeft = function(callback) {
      return this.textEditor.onDidChangeScrollLeft(callback);
    };

    LegacyAdater.prototype.getHeight = function() {
      if (this.useCache) {
        return this.heightCache != null ? this.heightCache : this.heightCache = this.textEditor.getHeight();
      }
      return this.textEditor.getHeight();
    };

    LegacyAdater.prototype.getScrollTop = function() {
      if (this.useCache) {
        return this.scrollTopCache != null ? this.scrollTopCache : this.scrollTopCache = this.textEditor.getScrollTop();
      }
      return this.textEditor.getScrollTop();
    };

    LegacyAdater.prototype.setScrollTop = function(scrollTop) {
      return this.textEditor.setScrollTop(scrollTop);
    };

    LegacyAdater.prototype.getScrollLeft = function() {
      if (this.useCache) {
        return this.scrollLeftCache != null ? this.scrollLeftCache : this.scrollLeftCache = this.textEditor.getScrollLeft();
      }
      return this.textEditor.getScrollLeft();
    };

    LegacyAdater.prototype.getMaxScrollTop = function() {
      var lineHeight, maxScrollTop;
      if ((this.maxScrollTopCache != null) && this.useCache) {
        return this.maxScrollTopCache;
      }
      maxScrollTop = this.textEditor.displayBuffer.getMaxScrollTop();
      lineHeight = this.textEditor.getLineHeightInPixels();
      if (this.scrollPastEnd) {
        maxScrollTop -= this.getHeight() - 3 * lineHeight;
      }
      if (this.useCache) {
        return this.maxScrollTopCache = maxScrollTop;
      }
      return maxScrollTop;
    };

    return LegacyAdater;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL2xpYi9hZGFwdGVycy9sZWdhY3ktYWRhcHRlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFDQTtBQUFBLE1BQUEsWUFBQTs7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDUyxJQUFBLHNCQUFFLFVBQUYsR0FBQTtBQUFlLE1BQWQsSUFBQyxDQUFBLGFBQUEsVUFBYSxDQUFmO0lBQUEsQ0FBYjs7QUFBQSwyQkFFQSxXQUFBLEdBQWEsU0FBQSxHQUFBO2FBQUcsSUFBQyxDQUFBLFFBQUQsR0FBWSxLQUFmO0lBQUEsQ0FGYixDQUFBOztBQUFBLDJCQUlBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDVixNQUFBLElBQUMsQ0FBQSxRQUFELEdBQVksS0FBWixDQUFBO0FBQUEsTUFDQSxNQUFBLENBQUEsSUFBUSxDQUFBLFdBRFIsQ0FBQTtBQUFBLE1BRUEsTUFBQSxDQUFBLElBQVEsQ0FBQSxjQUZSLENBQUE7QUFBQSxNQUdBLE1BQUEsQ0FBQSxJQUFRLENBQUEsZUFIUixDQUFBO2FBSUEsTUFBQSxDQUFBLElBQVEsQ0FBQSxrQkFMRTtJQUFBLENBSlosQ0FBQTs7QUFBQSwyQkFXQSxvQkFBQSxHQUFzQixTQUFDLFFBQUQsR0FBQTthQUNwQixJQUFDLENBQUEsVUFBVSxDQUFDLG9CQUFaLENBQWlDLFFBQWpDLEVBRG9CO0lBQUEsQ0FYdEIsQ0FBQTs7QUFBQSwyQkFjQSxxQkFBQSxHQUF1QixTQUFDLFFBQUQsR0FBQTthQUNyQixJQUFDLENBQUEsVUFBVSxDQUFDLHFCQUFaLENBQWtDLFFBQWxDLEVBRHFCO0lBQUEsQ0FkdkIsQ0FBQTs7QUFBQSwyQkFpQkEsU0FBQSxHQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsSUFBa0QsSUFBQyxDQUFBLFFBQW5EO0FBQUEsMENBQU8sSUFBQyxDQUFBLGNBQUQsSUFBQyxDQUFBLGNBQWUsSUFBQyxDQUFBLFVBQVUsQ0FBQyxTQUFaLENBQUEsQ0FBdkIsQ0FBQTtPQUFBO2FBQ0EsSUFBQyxDQUFBLFVBQVUsQ0FBQyxTQUFaLENBQUEsRUFGUztJQUFBLENBakJYLENBQUE7O0FBQUEsMkJBcUJBLFlBQUEsR0FBYyxTQUFBLEdBQUE7QUFDWixNQUFBLElBQXdELElBQUMsQ0FBQSxRQUF6RDtBQUFBLDZDQUFPLElBQUMsQ0FBQSxpQkFBRCxJQUFDLENBQUEsaUJBQWtCLElBQUMsQ0FBQSxVQUFVLENBQUMsWUFBWixDQUFBLENBQTFCLENBQUE7T0FBQTthQUNBLElBQUMsQ0FBQSxVQUFVLENBQUMsWUFBWixDQUFBLEVBRlk7SUFBQSxDQXJCZCxDQUFBOztBQUFBLDJCQXlCQSxZQUFBLEdBQWMsU0FBQyxTQUFELEdBQUE7YUFDWixJQUFDLENBQUEsVUFBVSxDQUFDLFlBQVosQ0FBeUIsU0FBekIsRUFEWTtJQUFBLENBekJkLENBQUE7O0FBQUEsMkJBNEJBLGFBQUEsR0FBZSxTQUFBLEdBQUE7QUFDYixNQUFBLElBQTBELElBQUMsQ0FBQSxRQUEzRDtBQUFBLDhDQUFPLElBQUMsQ0FBQSxrQkFBRCxJQUFDLENBQUEsa0JBQW1CLElBQUMsQ0FBQSxVQUFVLENBQUMsYUFBWixDQUFBLENBQTNCLENBQUE7T0FBQTthQUNBLElBQUMsQ0FBQSxVQUFVLENBQUMsYUFBWixDQUFBLEVBRmE7SUFBQSxDQTVCZixDQUFBOztBQUFBLDJCQWdDQSxlQUFBLEdBQWlCLFNBQUEsR0FBQTtBQUNmLFVBQUEsd0JBQUE7QUFBQSxNQUFBLElBQTZCLGdDQUFBLElBQXdCLElBQUMsQ0FBQSxRQUF0RDtBQUFBLGVBQU8sSUFBQyxDQUFBLGlCQUFSLENBQUE7T0FBQTtBQUFBLE1BQ0EsWUFBQSxHQUFlLElBQUMsQ0FBQSxVQUFVLENBQUMsYUFBYSxDQUFDLGVBQTFCLENBQUEsQ0FEZixDQUFBO0FBQUEsTUFFQSxVQUFBLEdBQWEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxxQkFBWixDQUFBLENBRmIsQ0FBQTtBQUlBLE1BQUEsSUFBaUQsSUFBQyxDQUFBLGFBQWxEO0FBQUEsUUFBQSxZQUFBLElBQWdCLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBQSxHQUFlLENBQUEsR0FBSSxVQUFuQyxDQUFBO09BSkE7QUFLQSxNQUFBLElBQTRDLElBQUMsQ0FBQSxRQUE3QztBQUFBLGVBQU8sSUFBQyxDQUFBLGlCQUFELEdBQXFCLFlBQTVCLENBQUE7T0FMQTthQU1BLGFBUGU7SUFBQSxDQWhDakIsQ0FBQTs7d0JBQUE7O01BRkYsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/gsmyrnaios/.atom/packages/minimap/lib/adapters/legacy-adapter.coffee
