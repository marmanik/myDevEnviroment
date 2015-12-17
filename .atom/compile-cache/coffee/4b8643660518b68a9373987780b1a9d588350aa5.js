(function() {
  var CompositeDisposable, HtmlPreviewView, url;

  url = require('url');

  CompositeDisposable = require('atom').CompositeDisposable;

  HtmlPreviewView = require('./atom-html-preview-view');

  module.exports = {
    config: {
      triggerOnSave: {
        type: 'boolean',
        description: 'Watch will trigger on save.',
        "default": false
      }
    },
    htmlPreviewView: null,
    activate: function(state) {
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'atom-html-preview:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this)
      }));
      return atom.workspace.addOpener(function(uriToOpen) {
        var error, host, pathname, protocol, _ref;
        try {
          _ref = url.parse(uriToOpen), protocol = _ref.protocol, host = _ref.host, pathname = _ref.pathname;
        } catch (_error) {
          error = _error;
          return;
        }
        if (protocol !== 'html-preview:') {
          return;
        }
        try {
          if (pathname) {
            pathname = decodeURI(pathname);
          }
        } catch (_error) {
          error = _error;
          return;
        }
        if (host === 'editor') {
          return new HtmlPreviewView({
            editorId: pathname.substring(1)
          });
        } else {
          return new HtmlPreviewView({
            filePath: pathname
          });
        }
      });
    },
    toggle: function() {
      var editor, previewPane, previousActivePane, uri;
      editor = atom.workspace.getActiveTextEditor();
      if (editor == null) {
        return;
      }
      uri = "html-preview://editor/" + editor.id;
      previewPane = atom.workspace.paneForURI(uri);
      if (previewPane) {
        previewPane.destroyItem(previewPane.itemForURI(uri));
        return;
      }
      previousActivePane = atom.workspace.getActivePane();
      return atom.workspace.open(uri, {
        split: 'right',
        searchAllPanes: true
      }).done(function(htmlPreviewView) {
        if (htmlPreviewView instanceof HtmlPreviewView) {
          htmlPreviewView.renderHTML();
          return previousActivePane.activate();
        }
      });
    },
    deactivate: function() {
      return this.subscriptions.dispose();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy9hdG9tLWh0bWwtcHJldmlldy9saWIvYXRvbS1odG1sLXByZXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHlDQUFBOztBQUFBLEVBQUEsR0FBQSxHQUF3QixPQUFBLENBQVEsS0FBUixDQUF4QixDQUFBOztBQUFBLEVBQ0Msc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQURELENBQUE7O0FBQUEsRUFHQSxlQUFBLEdBQXdCLE9BQUEsQ0FBUSwwQkFBUixDQUh4QixDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsTUFBQSxFQUNFO0FBQUEsTUFBQSxhQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBYyxTQUFkO0FBQUEsUUFDQSxXQUFBLEVBQWMsNkJBRGQ7QUFBQSxRQUVBLFNBQUEsRUFBYyxLQUZkO09BREY7S0FERjtBQUFBLElBTUEsZUFBQSxFQUFpQixJQU5qQjtBQUFBLElBUUEsUUFBQSxFQUFVLFNBQUMsS0FBRCxHQUFBO0FBRVIsTUFBQSxJQUFDLENBQUEsYUFBRCxHQUFpQixHQUFBLENBQUEsbUJBQWpCLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DO0FBQUEsUUFBQSwwQkFBQSxFQUE0QixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsTUFBRCxDQUFBLEVBQUg7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE1QjtPQUFwQyxDQUFuQixDQUhBLENBQUE7YUFLQSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQWYsQ0FBeUIsU0FBQyxTQUFELEdBQUE7QUFDdkIsWUFBQSxxQ0FBQTtBQUFBO0FBQ0UsVUFBQSxPQUE2QixHQUFHLENBQUMsS0FBSixDQUFVLFNBQVYsQ0FBN0IsRUFBQyxnQkFBQSxRQUFELEVBQVcsWUFBQSxJQUFYLEVBQWlCLGdCQUFBLFFBQWpCLENBREY7U0FBQSxjQUFBO0FBR0UsVUFESSxjQUNKLENBQUE7QUFBQSxnQkFBQSxDQUhGO1NBQUE7QUFLQSxRQUFBLElBQWMsUUFBQSxLQUFZLGVBQTFCO0FBQUEsZ0JBQUEsQ0FBQTtTQUxBO0FBT0E7QUFDRSxVQUFBLElBQWtDLFFBQWxDO0FBQUEsWUFBQSxRQUFBLEdBQVcsU0FBQSxDQUFVLFFBQVYsQ0FBWCxDQUFBO1dBREY7U0FBQSxjQUFBO0FBR0UsVUFESSxjQUNKLENBQUE7QUFBQSxnQkFBQSxDQUhGO1NBUEE7QUFZQSxRQUFBLElBQUcsSUFBQSxLQUFRLFFBQVg7aUJBQ00sSUFBQSxlQUFBLENBQWdCO0FBQUEsWUFBQSxRQUFBLEVBQVUsUUFBUSxDQUFDLFNBQVQsQ0FBbUIsQ0FBbkIsQ0FBVjtXQUFoQixFQUROO1NBQUEsTUFBQTtpQkFHTSxJQUFBLGVBQUEsQ0FBZ0I7QUFBQSxZQUFBLFFBQUEsRUFBVSxRQUFWO1dBQWhCLEVBSE47U0FidUI7TUFBQSxDQUF6QixFQVBRO0lBQUEsQ0FSVjtBQUFBLElBaUNBLE1BQUEsRUFBUSxTQUFBLEdBQUE7QUFDTixVQUFBLDRDQUFBO0FBQUEsTUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBLENBQVQsQ0FBQTtBQUNBLE1BQUEsSUFBYyxjQUFkO0FBQUEsY0FBQSxDQUFBO09BREE7QUFBQSxNQUdBLEdBQUEsR0FBTyx3QkFBQSxHQUF3QixNQUFNLENBQUMsRUFIdEMsQ0FBQTtBQUFBLE1BS0EsV0FBQSxHQUFjLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBZixDQUEwQixHQUExQixDQUxkLENBQUE7QUFNQSxNQUFBLElBQUcsV0FBSDtBQUNFLFFBQUEsV0FBVyxDQUFDLFdBQVosQ0FBd0IsV0FBVyxDQUFDLFVBQVosQ0FBdUIsR0FBdkIsQ0FBeEIsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUZGO09BTkE7QUFBQSxNQVVBLGtCQUFBLEdBQXFCLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUFBLENBVnJCLENBQUE7YUFXQSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsR0FBcEIsRUFBeUI7QUFBQSxRQUFBLEtBQUEsRUFBTyxPQUFQO0FBQUEsUUFBZ0IsY0FBQSxFQUFnQixJQUFoQztPQUF6QixDQUE4RCxDQUFDLElBQS9ELENBQW9FLFNBQUMsZUFBRCxHQUFBO0FBQ2xFLFFBQUEsSUFBRyxlQUFBLFlBQTJCLGVBQTlCO0FBQ0UsVUFBQSxlQUFlLENBQUMsVUFBaEIsQ0FBQSxDQUFBLENBQUE7aUJBQ0Esa0JBQWtCLENBQUMsUUFBbkIsQ0FBQSxFQUZGO1NBRGtFO01BQUEsQ0FBcEUsRUFaTTtJQUFBLENBakNSO0FBQUEsSUFrREEsVUFBQSxFQUFZLFNBQUEsR0FBQTthQUNWLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBLEVBRFU7SUFBQSxDQWxEWjtHQU5GLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/gsmyrnaios/.atom/packages/atom-html-preview/lib/atom-html-preview.coffee
