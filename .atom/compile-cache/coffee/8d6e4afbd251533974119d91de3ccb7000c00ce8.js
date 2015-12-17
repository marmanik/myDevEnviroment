(function() {
  var CSON, DB, Emitter, fs, path, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Emitter = require('atom').Emitter;

  CSON = require('season');

  fs = require('fs');

  path = require('path');

  _ = require('underscore-plus');

  module.exports = DB = (function() {
    DB.prototype.filepath = null;

    function DB(searchKey, searchValue) {
      this.searchKey = searchKey;
      this.searchValue = searchValue;
      this.subscribeToProjectsFile = __bind(this.subscribeToProjectsFile, this);
      this.lookForChanges = __bind(this.lookForChanges, this);
      this.find = __bind(this.find, this);
      this.emitter = new Emitter;
      fs.exists(this.file(), (function(_this) {
        return function(exists) {
          if (!exists) {
            return _this.writeFile({});
          } else {
            return _this.subscribeToProjectsFile();
          }
        };
      })(this));
    }

    DB.prototype.setSearchQuery = function(searchKey, searchValue) {
      this.searchKey = searchKey;
      this.searchValue = searchValue;
    };

    DB.prototype.find = function(callback) {
      return this.readFile((function(_this) {
        return function(results) {
          var found, key, project, projects, result;
          found = false;
          projects = [];
          for (key in results) {
            result = results[key];
            result._id = key;
            if ((result.template != null) && (results[result.template] != null)) {
              result = _.deepExtend(result, results[result.template]);
            }
            projects.push(result);
          }
          if (_this.searchKey && _this.searchValue) {
            for (key in projects) {
              project = projects[key];
              if (_.isEqual(project[_this.searchKey], _this.searchValue)) {
                found = project;
              }
            }
          } else {
            found = projects;
          }
          return typeof callback === "function" ? callback(found) : void 0;
        };
      })(this));
    };

    DB.prototype.add = function(props, callback) {
      return this.readFile((function(_this) {
        return function(projects) {
          var id;
          id = _this.generateID(props.title);
          projects[id] = props;
          return _this.writeFile(projects, function() {
            var _ref;
            if ((_ref = atom.notifications) != null) {
              _ref.addSuccess("" + props.title + " has been added");
            }
            return typeof callback === "function" ? callback(id) : void 0;
          });
        };
      })(this));
    };

    DB.prototype.update = function(props, callback) {
      if (!props._id) {
        return false;
      }
      return this.readFile((function(_this) {
        return function(projects) {
          var data, key;
          for (key in projects) {
            data = projects[key];
            if (key === props._id) {
              delete props._id;
              projects[key] = props;
            }
          }
          return _this.writeFile(projects, function() {
            return typeof callback === "function" ? callback() : void 0;
          });
        };
      })(this));
    };

    DB.prototype["delete"] = function(id, callback) {
      return this.readFile((function(_this) {
        return function(projects) {
          var data, key;
          for (key in projects) {
            data = projects[key];
            if (key === id) {
              delete projects[key];
            }
          }
          return _this.writeFile(projects, function() {
            return typeof callback === "function" ? callback() : void 0;
          });
        };
      })(this));
    };

    DB.prototype.onUpdate = function(callback) {
      return this.emitter.on('db-updated', (function(_this) {
        return function() {
          return _this.find(callback);
        };
      })(this));
    };

    DB.prototype.lookForChanges = function() {
      return atom.config.observe('project-manager.environmentSpecificProjects', (function(_this) {
        return function(newValue, obj) {
          var previous;
          if (obj == null) {
            obj = {};
          }
          previous = obj.previous != null ? obj.previous : newValue;
          if (newValue !== previous) {
            _this.subscribeToProjectsFile();
            return _this.updateFile();
          }
        };
      })(this));
    };

    DB.prototype.subscribeToProjectsFile = function() {
      var error, watchErrorUrl, _ref;
      if (this.fileWatcher != null) {
        this.fileWatcher.close();
      }
      try {
        return this.fileWatcher = fs.watch(this.file(), (function(_this) {
          return function(event, filename) {
            return _this.emitter.emit('db-updated');
          };
        })(this));
      } catch (_error) {
        error = _error;
        watchErrorUrl = 'https://github.com/atom/atom/blob/master/docs/build-instructions/linux.md#typeerror-unable-to-watch-path';
        return (_ref = atom.notifications) != null ? _ref.addError("<b>Project Manager</b><br>\nCould not watch for changes to `" + (path.basename(this.file())) + "`.\nMake sure you have permissions to `" + (this.file()) + "`. On linux there\ncan be problems with watch sizes. See <a href='" + watchErrorUrl + "'>\nthis document</a> for more info.", {
          dismissable: true
        }) : void 0;
      }
    };

    DB.prototype.updateFile = function() {
      return fs.exists(this.file(true), (function(_this) {
        return function(exists) {
          if (!exists) {
            return fs.writeFile(_this.file(), '{}', function(error) {
              var options, _ref;
              if (error) {
                return (_ref = atom.notifications) != null ? _ref.addError("Project Manager", options = {
                  details: "Could not create the file for storing projects"
                }) : void 0;
              }
            });
          }
        };
      })(this));
    };

    DB.prototype.generateID = function(string) {
      return string.replace(/\s+/g, '').toLowerCase();
    };

    DB.prototype.file = function(update) {
      var filedir, filename, hostname, os;
      if (update == null) {
        update = false;
      }
      if (update) {
        this.filepath = null;
      }
      if (this.filepath == null) {
        filename = 'projects.cson';
        filedir = atom.getConfigDirPath();
        if (atom.config.get('project-manager.environmentSpecificProjects')) {
          os = require('os');
          hostname = os.hostname().split('.').shift().toLowerCase();
          filename = "projects." + hostname + ".cson";
        }
        this.filepath = "" + filedir + "/" + filename;
      }
      return this.filepath;
    };

    DB.prototype.readFile = function(callback) {
      return fs.exists(this.file(), (function(_this) {
        return function(exists) {
          var detail, error, message, projects;
          if (exists) {
            try {
              projects = CSON.readFileSync(_this.file()) || {};
              return typeof callback === "function" ? callback(projects) : void 0;
            } catch (_error) {
              error = _error;
              message = "Failed to load " + (path.basename(_this.file()));
              detail = error.location != null ? error.stack : error.message;
              return _this.notifyFailure(message, detail);
            }
          } else {
            return fs.writeFile(_this.file(), '{}', function(error) {
              return typeof callback === "function" ? callback({}) : void 0;
            });
          }
        };
      })(this));
    };

    DB.prototype.writeFile = function(projects, callback) {
      CSON.writeFileSync(this.file(), projects);
      return typeof callback === "function" ? callback() : void 0;
    };

    DB.prototype.notifyFailure = function(message, detail) {
      return atom.notifications.addError(message, {
        detail: detail,
        dismissable: true
      });
    };

    return DB;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy9wcm9qZWN0LW1hbmFnZXIvbGliL2RiLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw4QkFBQTtJQUFBLGtGQUFBOztBQUFBLEVBQUMsVUFBVyxPQUFBLENBQVEsTUFBUixFQUFYLE9BQUQsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUixDQURQLENBQUE7O0FBQUEsRUFFQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FGTCxDQUFBOztBQUFBLEVBR0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBSFAsQ0FBQTs7QUFBQSxFQUlBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FKSixDQUFBOztBQUFBLEVBTUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLGlCQUFBLFFBQUEsR0FBVSxJQUFWLENBQUE7O0FBRWEsSUFBQSxZQUFFLFNBQUYsRUFBYyxXQUFkLEdBQUE7QUFDWCxNQURZLElBQUMsQ0FBQSxZQUFBLFNBQ2IsQ0FBQTtBQUFBLE1BRHdCLElBQUMsQ0FBQSxjQUFBLFdBQ3pCLENBQUE7QUFBQSwrRUFBQSxDQUFBO0FBQUEsNkRBQUEsQ0FBQTtBQUFBLHlDQUFBLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxPQUFELEdBQVcsR0FBQSxDQUFBLE9BQVgsQ0FBQTtBQUFBLE1BRUEsRUFBRSxDQUFDLE1BQUgsQ0FBVSxJQUFDLENBQUEsSUFBRCxDQUFBLENBQVYsRUFBbUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsTUFBRCxHQUFBO0FBQ2pCLFVBQUEsSUFBQSxDQUFBLE1BQUE7bUJBQ0UsS0FBQyxDQUFBLFNBQUQsQ0FBVyxFQUFYLEVBREY7V0FBQSxNQUFBO21CQUdFLEtBQUMsQ0FBQSx1QkFBRCxDQUFB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

//# sourceURL=/home/gsmyrnaios/.atom/packages/project-manager/lib/db.coffee
