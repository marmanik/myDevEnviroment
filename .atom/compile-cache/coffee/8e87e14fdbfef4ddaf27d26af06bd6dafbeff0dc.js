(function() {
  var path, stylesheet, stylesheetPath;

  path = require('path');

  stylesheetPath = path.resolve(__dirname, '../../styles/minimap.less');

  stylesheet = atom.themes.loadStylesheet(stylesheetPath);

  module.exports = {
    stylesheet: stylesheet
  };

  beforeEach(function() {
    var TextEditor, jasmineContent, styleNode;
    if (atom.workspace.buildTextEditor == null) {
      TextEditor = require('atom').TextEditor;
      atom.workspace.buildTextEditor = function(opts) {
        return new TextEditor(opts);
      };
    }
    jasmineContent = document.body.querySelector('#jasmine-content');
    styleNode = document.createElement('style');
    styleNode.textContent = "" + stylesheet + "\n\natom-text-editor-minimap[stand-alone] {\n  width: 100px;\n  height: 100px;\n}\n\natom-text-editor, atom-text-editor::shadow {\n  line-height: 17px;\n}\n\natom-text-editor atom-text-editor-minimap, atom-text-editor::shadow atom-text-editor-minimap {\n  background: rgba(255,0,0,0.3);\n}\n\natom-text-editor atom-text-editor-minimap::shadow .minimap-scroll-indicator, atom-text-editor::shadow atom-text-editor-minimap::shadow .minimap-scroll-indicator {\n  background: rgba(0,0,255,0.3);\n}\n\natom-text-editor atom-text-editor-minimap::shadow .minimap-visible-area, atom-text-editor::shadow atom-text-editor-minimap::shadow .minimap-visible-area {\n  background: rgba(0,255,0,0.3);\n  opacity: 1;\n}\n\natom-text-editor::shadow atom-text-editor-minimap::shadow .open-minimap-quick-settings {\n  opacity: 1 !important;\n}";
    return jasmineContent.appendChild(styleNode);
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL3NwZWMvaGVscGVycy93b3Jrc3BhY2UuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdDQUFBOztBQUFBLEVBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBQVAsQ0FBQTs7QUFBQSxFQUNBLGNBQUEsR0FBaUIsSUFBSSxDQUFDLE9BQUwsQ0FBYSxTQUFiLEVBQXdCLDJCQUF4QixDQURqQixDQUFBOztBQUFBLEVBRUEsVUFBQSxHQUFhLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBWixDQUEyQixjQUEzQixDQUZiLENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUFpQjtBQUFBLElBQUMsWUFBQSxVQUFEO0dBSmpCLENBQUE7O0FBQUEsRUFNQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsUUFBQSxxQ0FBQTtBQUFBLElBQUEsSUFBTyxzQ0FBUDtBQUNFLE1BQUMsYUFBYyxPQUFBLENBQVEsTUFBUixFQUFkLFVBQUQsQ0FBQTtBQUFBLE1BQ0EsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFmLEdBQWlDLFNBQUMsSUFBRCxHQUFBO2VBQWMsSUFBQSxVQUFBLENBQVcsSUFBWCxFQUFkO01BQUEsQ0FEakMsQ0FERjtLQUFBO0FBQUEsSUFJQSxjQUFBLEdBQWlCLFFBQVEsQ0FBQyxJQUFJLENBQUMsYUFBZCxDQUE0QixrQkFBNUIsQ0FKakIsQ0FBQTtBQUFBLElBS0EsU0FBQSxHQUFZLFFBQVEsQ0FBQyxhQUFULENBQXVCLE9BQXZCLENBTFosQ0FBQTtBQUFBLElBTUEsU0FBUyxDQUFDLFdBQVYsR0FBd0IsRUFBQSxHQUN4QixVQUR3QixHQUNiLHl6QkFQWCxDQUFBO1dBb0NBLGNBQWMsQ0FBQyxXQUFmLENBQTJCLFNBQTNCLEVBckNTO0VBQUEsQ0FBWCxDQU5BLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/gsmyrnaios/.atom/packages/minimap/spec/helpers/workspace.coffee
