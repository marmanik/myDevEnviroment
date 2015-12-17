(function() {
  var Dialog, Project, Projects, SaveDialog, path,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Dialog = require('./dialog');

  Project = require('./project');

  Projects = require('./projects');

  path = require('path');

  module.exports = SaveDialog = (function(_super) {
    __extends(SaveDialog, _super);

    SaveDialog.prototype.filePath = null;

    function SaveDialog() {
      var firstPath, projects, title;
      firstPath = atom.project.getPaths()[0];
      title = path.basename(firstPath);
      SaveDialog.__super__.constructor.call(this, {
        prompt: 'Enter name of project',
        input: title,
        select: true,
        iconClass: 'icon-arrow-right'
      });
      projects = new Projects();
      projects.getCurrent((function(_this) {
        return function(project) {
          if (project.props.paths[0] === firstPath) {
            return _this.showError("This project is already saved as " + project.props.title);
          }
        };
      })(this));
    }

    SaveDialog.prototype.onConfirm = function(title) {
      var project, properties;
      if (title) {
        properties = {
          title: title,
          paths: atom.project.getPaths()
        };
        project = new Project(properties);
        project.save();
        return this.close();
      } else {
        return this.showError('You need to specify a name for the project');
      }
    };

    return SaveDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy9wcm9qZWN0LW1hbmFnZXIvbGliL3NhdmUtZGlhbG9nLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwyQ0FBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSLENBQVQsQ0FBQTs7QUFBQSxFQUNBLE9BQUEsR0FBVSxPQUFBLENBQVEsV0FBUixDQURWLENBQUE7O0FBQUEsRUFFQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVIsQ0FGWCxDQUFBOztBQUFBLEVBR0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBSFAsQ0FBQTs7QUFBQSxFQUtBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixpQ0FBQSxDQUFBOztBQUFBLHlCQUFBLFFBQUEsR0FBVSxJQUFWLENBQUE7O0FBRWEsSUFBQSxvQkFBQSxHQUFBO0FBQ1gsVUFBQSwwQkFBQTtBQUFBLE1BQUEsU0FBQSxHQUFZLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBYixDQUFBLENBQXdCLENBQUEsQ0FBQSxDQUFwQyxDQUFBO0FBQUEsTUFDQSxLQUFBLEdBQVEsSUFBSSxDQUFDLFFBQUwsQ0FBYyxTQUFkLENBRFIsQ0FBQTtBQUFBLE1BR0EsNENBQ0U7QUFBQSxRQUFBLE1BQUEsRUFBUSx1QkFBUjtBQUFBLFFBQ0EsS0FBQSxFQUFPLEtBRFA7QUFBQSxRQUVBLE1BQUEsRUFBUSxJQUZSO0FBQUEsUUFHQSxTQUFBLEVBQVcsa0JBSFg7T0FERixDQUhBLENBQUE7QUFBQSxNQVNBLFFBQUEsR0FBZSxJQUFBLFFBQUEsQ0FBQSxDQVRmLENBQUE7QUFBQSxNQVVBLFFBQVEsQ0FBQyxVQUFULENBQW9CLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLE9BQUQsR0FBQTtBQUNsQixVQUFBLElBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFwQixLQUEwQixTQUE3QjttQkFDRSxLQUFDLENBQUEsU0FBRCxDQUFZLG1DQUFBLEdBQW1DLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBN0QsRUFERjtXQURrQjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBCLENBVkEsQ0FEVztJQUFBLENBRmI7O0FBQUEseUJBa0JBLFNBQUEsR0FBVyxTQUFDLEtBQUQsR0FBQTtBQUNULFVBQUEsbUJBQUE7QUFBQSxNQUFBLElBQUcsS0FBSDtBQUNFLFFBQUEsVUFBQSxHQUNFO0FBQUEsVUFBQSxLQUFBLEVBQU8sS0FBUDtBQUFBLFVBQ0EsS0FBQSxFQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBYixDQUFBLENBRFA7U0FERixDQUFBO0FBQUEsUUFJQSxPQUFBLEdBQWMsSUFBQSxPQUFBLENBQVEsVUFBUixDQUpkLENBQUE7QUFBQSxRQUtBLE9BQU8sQ0FBQyxJQUFSLENBQUEsQ0FMQSxDQUFBO2VBT0EsSUFBQyxDQUFBLEtBQUQsQ0FBQSxFQVJGO09BQUEsTUFBQTtlQVVFLElBQUMsQ0FBQSxTQUFELENBQVcsNENBQVgsRUFWRjtPQURTO0lBQUEsQ0FsQlgsQ0FBQTs7c0JBQUE7O0tBRHVCLE9BTnpCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/gsmyrnaios/.atom/packages/project-manager/lib/save-dialog.coffee
