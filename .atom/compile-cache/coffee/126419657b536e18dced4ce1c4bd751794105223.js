(function() {
  var ColorBuffer, ColorProject, SERIALIZE_MARKERS_VERSION, SERIALIZE_VERSION, TOTAL_COLORS_VARIABLES_IN_PROJECT, TOTAL_VARIABLES_IN_PROJECT, click, fs, jsonFixture, path, temp, _ref;

  fs = require('fs-plus');

  path = require('path');

  temp = require('temp');

  _ref = require('../lib/versions'), SERIALIZE_VERSION = _ref.SERIALIZE_VERSION, SERIALIZE_MARKERS_VERSION = _ref.SERIALIZE_MARKERS_VERSION;

  ColorProject = require('../lib/color-project');

  ColorBuffer = require('../lib/color-buffer');

  jsonFixture = require('./helpers/fixtures').jsonFixture(__dirname, 'fixtures');

  click = require('./helpers/events').click;

  TOTAL_VARIABLES_IN_PROJECT = 12;

  TOTAL_COLORS_VARIABLES_IN_PROJECT = 10;

  describe('ColorProject', function() {
    var eventSpy, paths, project, promise, rootPath, _ref1;
    _ref1 = [], project = _ref1[0], promise = _ref1[1], rootPath = _ref1[2], paths = _ref1[3], eventSpy = _ref1[4];
    beforeEach(function() {
      var fixturesPath;
      atom.config.set('pigments.sourceNames', ['*.styl']);
      atom.config.set('pigments.ignoredNames', []);
      fixturesPath = atom.project.getPaths()[0];
      rootPath = "" + fixturesPath + "/project";
      atom.project.setPaths([rootPath]);
      return project = new ColorProject({
        ignoredNames: ['vendor/*'],
        sourceNames: ['*.less'],
        ignoredScopes: ['\\.comment']
      });
    });
    afterEach(function() {
      return project.destroy();
    });
    describe('.deserialize', function() {
      return it('restores the project in its previous state', function() {
        var data, json;
        data = {
          root: rootPath,
          timestamp: new Date().toJSON(),
          version: SERIALIZE_VERSION,
          markersVersion: SERIALIZE_MARKERS_VERSION
        };
        json = jsonFixture('base-project.json', data);
        project = ColorProject.deserialize(json);
        expect(project).toBeDefined();
        expect(project.getPaths()).toEqual(["" + rootPath + "/styles/buttons.styl", "" + rootPath + "/styles/variables.styl"]);
        expect(project.getVariables().length).toEqual(TOTAL_VARIABLES_IN_PROJECT);
        return expect(project.getColorVariables().length).toEqual(TOTAL_COLORS_VARIABLES_IN_PROJECT);
      });
    });
    describe('::initialize', function() {
      beforeEach(function() {
        eventSpy = jasmine.createSpy('did-initialize');
        project.onDidInitialize(eventSpy);
        return waitsForPromise(function() {
          return project.initialize();
        });
      });
      it('loads the paths to scan in the project', function() {
        return expect(project.getPaths()).toEqual(["" + rootPath + "/styles/buttons.styl", "" + rootPath + "/styles/variables.styl"]);
      });
      it('scans the loaded paths to retrieve the variables', function() {
        expect(project.getVariables()).toBeDefined();
        return expect(project.getVariables().length).toEqual(TOTAL_VARIABLES_IN_PROJECT);
      });
      return it('dispatches a did-initialize event', function() {
        return expect(eventSpy).toHaveBeenCalled();
      });
    });
    describe('::findAllColors', function() {
      return it('returns all the colors in the legibles files of the project', function() {
        var search;
        search = project.findAllColors();
        return expect(search).toBeDefined();
      });
    });
    describe('when the variables have not been loaded yet', function() {
      describe('::serialize', function() {
        return it('returns an object without paths nor variables', function() {
          var date, expected;
          date = new Date;
          spyOn(project, 'getTimestamp').andCallFake(function() {
            return date;
          });
          expected = {
            deserializer: 'ColorProject',
            timestamp: date,
            version: SERIALIZE_VERSION,
            markersVersion: SERIALIZE_MARKERS_VERSION,
            globalSourceNames: ['*.styl'],
            globalIgnoredNames: [],
            ignoredNames: ['vendor/*'],
            sourceNames: ['*.less'],
            ignoredScopes: ['\\.comment'],
            buffers: {}
          };
          return expect(project.serialize()).toEqual(expected);
        });
      });
      describe('::getVariablesForPath', function() {
        return it('returns undefined', function() {
          return expect(project.getVariablesForPath("" + rootPath + "/styles/variables.styl")).toEqual([]);
        });
      });
      describe('::getVariableByName', function() {
        return it('returns undefined', function() {
          return expect(project.getVariableByName("foo")).toBeUndefined();
        });
      });
      describe('::getVariableById', function() {
        return it('returns undefined', function() {
          return expect(project.getVariableById(0)).toBeUndefined();
        });
      });
      describe('::getContext', function() {
        return it('returns an empty context', function() {
          expect(project.getContext()).toBeDefined();
          return expect(project.getContext().getVariablesCount()).toEqual(0);
        });
      });
      describe('::getPalette', function() {
        return it('returns an empty palette', function() {
          expect(project.getPalette()).toBeDefined();
          return expect(project.getPalette().getColorsCount()).toEqual(0);
        });
      });
      describe('::reloadVariablesForPath', function() {
        beforeEach(function() {
          spyOn(project, 'initialize').andCallThrough();
          return waitsForPromise(function() {
            return project.reloadVariablesForPath("" + rootPath + "/styles/variables.styl");
          });
        });
        return it('returns a promise hooked on the initialize promise', function() {
          return expect(project.initialize).toHaveBeenCalled();
        });
      });
      describe('::setIgnoredNames', function() {
        beforeEach(function() {
          project.setIgnoredNames([]);
          return waitsForPromise(function() {
            return project.initialize();
          });
        });
        return it('initializes the project with the new paths', function() {
          return expect(project.getVariables().length).toEqual(32);
        });
      });
      return describe('::setSourceNames', function() {
        beforeEach(function() {
          project.setSourceNames([]);
          return waitsForPromise(function() {
            return project.initialize();
          });
        });
        return it('initializes the project with the new paths', function() {
          return expect(project.getVariables().length).toEqual(12);
        });
      });
    });
    describe('when the project has no variables source files', function() {
      beforeEach(function() {
        var fixturesPath;
        atom.config.set('pigments.sourceNames', ['*.sass']);
        fixturesPath = atom.project.getPaths()[0];
        rootPath = "" + fixturesPath + "-no-sources";
        atom.project.setPaths([rootPath]);
        project = new ColorProject({});
        return waitsForPromise(function() {
          return project.initialize();
        });
      });
      it('initializes the paths with an empty array', function() {
        return expect(project.getPaths()).toEqual([]);
      });
      return it('initializes the variables with an empty array', function() {
        return expect(project.getVariables()).toEqual([]);
      });
    });
    describe('when the project has custom source names defined', function() {
      beforeEach(function() {
        var fixturesPath;
        atom.config.set('pigments.sourceNames', ['*.sass']);
        fixturesPath = atom.project.getPaths()[0];
        project = new ColorProject({
          sourceNames: ['*.styl']
        });
        return waitsForPromise(function() {
          return project.initialize();
        });
      });
      it('initializes the paths with an empty array', function() {
        return expect(project.getPaths().length).toEqual(2);
      });
      return it('initializes the variables with an empty array', function() {
        expect(project.getVariables().length).toEqual(TOTAL_VARIABLES_IN_PROJECT);
        return expect(project.getColorVariables().length).toEqual(TOTAL_COLORS_VARIABLES_IN_PROJECT);
      });
    });
    describe('when the project has looping variable definition', function() {
      beforeEach(function() {
        var fixturesPath;
        atom.config.set('pigments.sourceNames', ['*.sass']);
        fixturesPath = atom.project.getPaths()[0];
        rootPath = "" + fixturesPath + "-with-recursion";
        atom.project.setPaths([rootPath]);
        project = new ColorProject({});
        return waitsForPromise(function() {
          return project.initialize();
        });
      });
      return it('ignores the looping definition', function() {
        expect(project.getVariables().length).toEqual(4);
        return expect(project.getColorVariables().length).toEqual(4);
      });
    });
    describe('when the variables have been loaded', function() {
      beforeEach(function() {
        return waitsForPromise(function() {
          return project.initialize();
        });
      });
      describe('::serialize', function() {
        return it('returns an object with project properties', function() {
          var date;
          date = new Date;
          spyOn(project, 'getTimestamp').andCallFake(function() {
            return date;
          });
          return expect(project.serialize()).toEqual({
            deserializer: 'ColorProject',
            ignoredNames: ['vendor/*'],
            sourceNames: ['*.less'],
            ignoredScopes: ['\\.comment'],
            timestamp: date,
            version: SERIALIZE_VERSION,
            markersVersion: SERIALIZE_MARKERS_VERSION,
            paths: ["" + rootPath + "/styles/buttons.styl", "" + rootPath + "/styles/variables.styl"],
            globalSourceNames: ['*.styl'],
            globalIgnoredNames: [],
            buffers: {},
            variables: project.variables.serialize()
          });
        });
      });
      describe('::getVariablesForPath', function() {
        it('returns the variables defined in the file', function() {
          return expect(project.getVariablesForPath("" + rootPath + "/styles/variables.styl").length).toEqual(TOTAL_VARIABLES_IN_PROJECT);
        });
        return describe('for a file that was ignored in the scanning process', function() {
          return it('returns undefined', function() {
            return expect(project.getVariablesForPath("" + rootPath + "/vendor/css/variables.less")).toEqual([]);
          });
        });
      });
      describe('::deleteVariablesForPath', function() {
        return it('removes all the variables coming from the specified file', function() {
          project.deleteVariablesForPath("" + rootPath + "/styles/variables.styl");
          return expect(project.getVariablesForPath("" + rootPath + "/styles/variables.styl")).toEqual([]);
        });
      });
      describe('::getContext', function() {
        return it('returns a context with the project variables', function() {
          expect(project.getContext()).toBeDefined();
          return expect(project.getContext().getVariablesCount()).toEqual(TOTAL_VARIABLES_IN_PROJECT);
        });
      });
      describe('::getPalette', function() {
        return it('returns a palette with the colors from the project', function() {
          expect(project.getPalette()).toBeDefined();
          return expect(project.getPalette().getColorsCount()).toEqual(10);
        });
      });
      describe('::showVariableInFile', function() {
        return it('opens the file where is located the variable', function() {
          var spy;
          spy = jasmine.createSpy('did-add-text-editor');
          atom.workspace.onDidAddTextEditor(spy);
          project.showVariableInFile(project.getVariables()[0]);
          waitsFor(function() {
            return spy.callCount > 0;
          });
          return runs(function() {
            var editor;
            editor = atom.workspace.getActiveTextEditor();
            return expect(editor.getSelectedBufferRange()).toEqual([[1, 2], [1, 14]]);
          });
        });
      });
      describe('::reloadVariablesForPath', function() {
        return describe('for a file that is part of the loaded paths', function() {
          describe('where the reload finds new variables', function() {
            beforeEach(function() {
              project.deleteVariablesForPath("" + rootPath + "/styles/variables.styl");
              eventSpy = jasmine.createSpy('did-update-variables');
              project.onDidUpdateVariables(eventSpy);
              return waitsForPromise(function() {
                return project.reloadVariablesForPath("" + rootPath + "/styles/variables.styl");
              });
            });
            it('scans again the file to find variables', function() {
              return expect(project.getVariables().length).toEqual(TOTAL_VARIABLES_IN_PROJECT);
            });
            return it('dispatches a did-update-variables event', function() {
              return expect(eventSpy).toHaveBeenCalled();
            });
          });
          return describe('where the reload finds nothing new', function() {
            beforeEach(function() {
              eventSpy = jasmine.createSpy('did-update-variables');
              project.onDidUpdateVariables(eventSpy);
              return waitsForPromise(function() {
                return project.reloadVariablesForPath("" + rootPath + "/styles/variables.styl");
              });
            });
            it('leaves the file variables intact', function() {
              return expect(project.getVariables().length).toEqual(TOTAL_VARIABLES_IN_PROJECT);
            });
            return it('does not dispatch a did-update-variables event', function() {
              return expect(eventSpy).not.toHaveBeenCalled();
            });
          });
        });
      });
      describe('::reloadVariablesForPaths', function() {
        describe('for a file that is part of the loaded paths', function() {
          describe('where the reload finds new variables', function() {
            beforeEach(function() {
              project.deleteVariablesForPaths(["" + rootPath + "/styles/variables.styl", "" + rootPath + "/styles/buttons.styl"]);
              eventSpy = jasmine.createSpy('did-update-variables');
              project.onDidUpdateVariables(eventSpy);
              return waitsForPromise(function() {
                return project.reloadVariablesForPaths(["" + rootPath + "/styles/variables.styl", "" + rootPath + "/styles/buttons.styl"]);
              });
            });
            it('scans again the file to find variables', function() {
              return expect(project.getVariables().length).toEqual(TOTAL_VARIABLES_IN_PROJECT);
            });
            return it('dispatches a did-update-variables event', function() {
              return expect(eventSpy).toHaveBeenCalled();
            });
          });
          return describe('where the reload finds nothing new', function() {
            beforeEach(function() {
              eventSpy = jasmine.createSpy('did-update-variables');
              project.onDidUpdateVariables(eventSpy);
              return waitsForPromise(function() {
                return project.reloadVariablesForPaths(["" + rootPath + "/styles/variables.styl", "" + rootPath + "/styles/buttons.styl"]);
              });
            });
            it('leaves the file variables intact', function() {
              return expect(project.getVariables().length).toEqual(TOTAL_VARIABLES_IN_PROJECT);
            });
            return it('does not dispatch a did-update-variables event', function() {
              return expect(eventSpy).not.toHaveBeenCalled();
            });
          });
        });
        return describe('for a file that is not part of the loaded paths', function() {
          beforeEach(function() {
            spyOn(project, 'loadVariablesForPath').andCallThrough();
            return waitsForPromise(function() {
              return project.reloadVariablesForPath("" + rootPath + "/vendor/css/variables.less");
            });
          });
          return it('does nothing', function() {
            return expect(project.loadVariablesForPath).not.toHaveBeenCalled();
          });
        });
      });
      describe('when a buffer with variables is open', function() {
        var colorBuffer, editor, _ref2;
        _ref2 = [], editor = _ref2[0], colorBuffer = _ref2[1];
        beforeEach(function() {
          eventSpy = jasmine.createSpy('did-update-variables');
          project.onDidUpdateVariables(eventSpy);
          waitsForPromise(function() {
            return atom.workspace.open('styles/variables.styl').then(function(o) {
              return editor = o;
            });
          });
          runs(function() {
            colorBuffer = project.colorBufferForEditor(editor);
            return spyOn(colorBuffer, 'scanBufferForVariables').andCallThrough();
          });
          waitsForPromise(function() {
            return project.initialize();
          });
          return waitsForPromise(function() {
            return colorBuffer.variablesAvailable();
          });
        });
        it('updates the project variable with the buffer ranges', function() {
          var variable, _i, _len, _ref3, _results;
          _ref3 = project.getVariables();
          _results = [];
          for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
            variable = _ref3[_i];
            _results.push(expect(variable.bufferRange).toBeDefined());
          }
          return _results;
        });
        describe('when a color is modified that does not affect other variables ranges', function() {
          var variablesTextRanges;
          variablesTextRanges = [][0];
          beforeEach(function() {
            variablesTextRanges = {};
            project.getVariablesForPath(editor.getPath()).forEach(function(variable) {
              return variablesTextRanges[variable.name] = variable.range;
            });
            editor.setSelectedBufferRange([[1, 7], [1, 14]]);
            editor.insertText('#336');
            editor.getBuffer().emitter.emit('did-stop-changing');
            return waitsFor(function() {
              return eventSpy.callCount > 0;
            });
          });
          it('reloads the variables with the buffer instead of the file', function() {
            expect(colorBuffer.scanBufferForVariables).toHaveBeenCalled();
            return expect(project.getVariables().length).toEqual(TOTAL_VARIABLES_IN_PROJECT);
          });
          it('uses the buffer ranges to detect which variables were really changed', function() {
            expect(eventSpy.argsForCall[0][0].destroyed).toBeUndefined();
            expect(eventSpy.argsForCall[0][0].created).toBeUndefined();
            return expect(eventSpy.argsForCall[0][0].updated.length).toEqual(1);
          });
          it('updates the text range of the other variables', function() {
            return project.getVariablesForPath("" + rootPath + "/styles/variables.styl").forEach(function(variable) {
              if (variable.name !== 'colors.red') {
                expect(variable.range[0]).toEqual(variablesTextRanges[variable.name][0] - 3);
                return expect(variable.range[1]).toEqual(variablesTextRanges[variable.name][1] - 3);
              }
            });
          });
          return it('dispatches a did-update-variables event', function() {
            return expect(eventSpy).toHaveBeenCalled();
          });
        });
        describe('when a text is inserted that affects other variables ranges', function() {
          var variablesBufferRanges, variablesTextRanges, _ref3;
          _ref3 = [], variablesTextRanges = _ref3[0], variablesBufferRanges = _ref3[1];
          beforeEach(function() {
            runs(function() {
              variablesTextRanges = {};
              variablesBufferRanges = {};
              project.getVariablesForPath(editor.getPath()).forEach(function(variable) {
                variablesTextRanges[variable.name] = variable.range;
                return variablesBufferRanges[variable.name] = variable.bufferRange;
              });
              spyOn(project.variables, 'addMany').andCallThrough();
              editor.setSelectedBufferRange([[0, 0], [0, 0]]);
              editor.insertText('\n\n');
              return editor.getBuffer().emitter.emit('did-stop-changing');
            });
            return waitsFor(function() {
              return project.variables.addMany.callCount > 0;
            });
          });
          it('does not trigger a change event', function() {
            return expect(eventSpy.callCount).toEqual(0);
          });
          return it('updates the range of the updated variables', function() {
            return project.getVariablesForPath("" + rootPath + "/styles/variables.styl").forEach(function(variable) {
              if (variable.name !== 'colors.red') {
                expect(variable.range[0]).toEqual(variablesTextRanges[variable.name][0] + 2);
                expect(variable.range[1]).toEqual(variablesTextRanges[variable.name][1] + 2);
                return expect(variable.bufferRange.isEqual(variablesBufferRanges[variable.name])).toBeFalsy();
              }
            });
          });
        });
        describe('when a color is removed', function() {
          var variablesTextRanges;
          variablesTextRanges = [][0];
          beforeEach(function() {
            runs(function() {
              variablesTextRanges = {};
              project.getVariablesForPath(editor.getPath()).forEach(function(variable) {
                return variablesTextRanges[variable.name] = variable.range;
              });
              editor.setSelectedBufferRange([[1, 0], [2, 0]]);
              editor.insertText('');
              return editor.getBuffer().emitter.emit('did-stop-changing');
            });
            return waitsFor(function() {
              return eventSpy.callCount > 0;
            });
          });
          it('reloads the variables with the buffer instead of the file', function() {
            expect(colorBuffer.scanBufferForVariables).toHaveBeenCalled();
            return expect(project.getVariables().length).toEqual(TOTAL_VARIABLES_IN_PROJECT - 1);
          });
          it('uses the buffer ranges to detect which variables were really changed', function() {
            expect(eventSpy.argsForCall[0][0].destroyed.length).toEqual(1);
            expect(eventSpy.argsForCall[0][0].created).toBeUndefined();
            return expect(eventSpy.argsForCall[0][0].updated).toBeUndefined();
          });
          it('can no longer be found in the project variables', function() {
            expect(project.getVariables().some(function(v) {
              return v.name === 'colors.red';
            })).toBeFalsy();
            return expect(project.getColorVariables().some(function(v) {
              return v.name === 'colors.red';
            })).toBeFalsy();
          });
          return it('dispatches a did-update-variables event', function() {
            return expect(eventSpy).toHaveBeenCalled();
          });
        });
        return describe('when all the colors are removed', function() {
          var variablesTextRanges;
          variablesTextRanges = [][0];
          beforeEach(function() {
            runs(function() {
              variablesTextRanges = {};
              project.getVariablesForPath(editor.getPath()).forEach(function(variable) {
                return variablesTextRanges[variable.name] = variable.range;
              });
              editor.setSelectedBufferRange([[0, 0], [Infinity, Infinity]]);
              editor.insertText('');
              return editor.getBuffer().emitter.emit('did-stop-changing');
            });
            return waitsFor(function() {
              return eventSpy.callCount > 0;
            });
          });
          it('removes every variable from the file', function() {
            expect(colorBuffer.scanBufferForVariables).toHaveBeenCalled();
            expect(project.getVariables().length).toEqual(0);
            expect(eventSpy.argsForCall[0][0].destroyed.length).toEqual(TOTAL_VARIABLES_IN_PROJECT);
            expect(eventSpy.argsForCall[0][0].created).toBeUndefined();
            return expect(eventSpy.argsForCall[0][0].updated).toBeUndefined();
          });
          it('can no longer be found in the project variables', function() {
            expect(project.getVariables().some(function(v) {
              return v.name === 'colors.red';
            })).toBeFalsy();
            return expect(project.getColorVariables().some(function(v) {
              return v.name === 'colors.red';
            })).toBeFalsy();
          });
          return it('dispatches a did-update-variables event', function() {
            return expect(eventSpy).toHaveBeenCalled();
          });
        });
      });
      describe('::setIgnoredNames', function() {
        describe('with an empty array', function() {
          beforeEach(function() {
            var spy;
            expect(project.getVariables().length).toEqual(12);
            spy = jasmine.createSpy('did-update-variables');
            project.onDidUpdateVariables(spy);
            project.setIgnoredNames([]);
            return waitsFor(function() {
              return spy.callCount > 0;
            });
          });
          return it('reloads the variables from the new paths', function() {
            return expect(project.getVariables().length).toEqual(32);
          });
        });
        return describe('with a more restrictive array', function() {
          beforeEach(function() {
            var spy;
            expect(project.getVariables().length).toEqual(12);
            spy = jasmine.createSpy('did-update-variables');
            project.onDidUpdateVariables(spy);
            project.setIgnoredNames(['vendor/*', '**/*.styl']);
            return waitsFor(function() {
              return project.getVariables().length < 12;
            });
          });
          return it('clears all the variables as there is no legible paths', function() {
            expect(project.getPaths().length).toEqual(0);
            return expect(project.getVariables().length).toEqual(0);
          });
        });
      });
      describe('when the project has multiple root directory', function() {
        beforeEach(function() {
          var fixturesPath;
          atom.config.set('pigments.sourceNames', ['**/*.sass', '**/*.styl']);
          fixturesPath = atom.project.getPaths()[0];
          atom.project.setPaths(["" + fixturesPath, "" + fixturesPath + "-with-recursion"]);
          project = new ColorProject({});
          return waitsForPromise(function() {
            return project.initialize();
          });
        });
        return it('finds the variables from the two directories', function() {
          return expect(project.getVariables().length).toEqual(16);
        });
      });
      describe('when the project has VCS ignored files', function() {
        var projectPath;
        projectPath = [][0];
        beforeEach(function() {
          var dotGit, dotGitFixture, fixture;
          atom.config.set('pigments.sourceNames', ['*.sass']);
          fixture = path.join(__dirname, 'fixtures', 'project-with-gitignore');
          projectPath = temp.mkdirSync('pigments-project');
          dotGitFixture = path.join(fixture, 'git.git');
          dotGit = path.join(projectPath, '.git');
          fs.copySync(dotGitFixture, dotGit);
          fs.writeFileSync(path.join(projectPath, '.gitignore'), fs.readFileSync(path.join(fixture, 'git.gitignore')));
          fs.writeFileSync(path.join(projectPath, 'base.sass'), fs.readFileSync(path.join(fixture, 'base.sass')));
          fs.writeFileSync(path.join(projectPath, 'ignored.sass'), fs.readFileSync(path.join(fixture, 'ignored.sass')));
          return atom.project.setPaths([path.join('/private', projectPath)]);
        });
        describe('when the ignoreVcsIgnoredPaths setting is enabled', function() {
          beforeEach(function() {
            atom.config.set('pigments.ignoreVcsIgnoredPaths', true);
            project = new ColorProject({});
            return waitsForPromise(function() {
              return project.initialize();
            });
          });
          it('finds the variables from the two directories', function() {
            return expect(project.getVariables().length).toEqual(3);
          });
          return describe('and then disabled', function() {
            beforeEach(function() {
              var spy;
              spy = jasmine.createSpy('did-update-variables');
              project.onDidUpdateVariables(spy);
              atom.config.set('pigments.ignoreVcsIgnoredPaths', false);
              return waitsFor(function() {
                return spy.callCount > 0;
              });
            });
            it('reloads the paths', function() {
              return expect(project.getPaths().length).toEqual(2);
            });
            return it('reloads the variables', function() {
              return expect(project.getVariables().length).toEqual(6);
            });
          });
        });
        return describe('when the ignoreVcsIgnoredPaths setting is disabled', function() {
          beforeEach(function() {
            atom.config.set('pigments.ignoreVcsIgnoredPaths', false);
            project = new ColorProject({});
            return waitsForPromise(function() {
              return project.initialize();
            });
          });
          it('finds the variables from the two directories', function() {
            return expect(project.getVariables().length).toEqual(6);
          });
          return describe('and then enabled', function() {
            beforeEach(function() {
              var spy;
              spy = jasmine.createSpy('did-update-variables');
              project.onDidUpdateVariables(spy);
              atom.config.set('pigments.ignoreVcsIgnoredPaths', true);
              return waitsFor(function() {
                return spy.callCount > 0;
              });
            });
            it('reloads the paths', function() {
              return expect(project.getPaths().length).toEqual(1);
            });
            return it('reloads the variables', function() {
              return expect(project.getVariables().length).toEqual(3);
            });
          });
        });
      });
      describe('when the sourceNames setting is changed', function() {
        var updateSpy;
        updateSpy = [][0];
        beforeEach(function() {
          var originalPaths;
          originalPaths = project.getPaths();
          atom.config.set('pigments.sourceNames', []);
          return waitsFor(function() {
            return project.getPaths().join(',') !== originalPaths.join(',');
          });
        });
        it('updates the variables using the new pattern', function() {
          return expect(project.getVariables().length).toEqual(0);
        });
        return describe('so that new paths are found', function() {
          beforeEach(function() {
            var originalPaths;
            updateSpy = jasmine.createSpy('did-update-variables');
            originalPaths = project.getPaths();
            project.onDidUpdateVariables(updateSpy);
            atom.config.set('pigments.sourceNames', ['**/*.styl']);
            waitsFor(function() {
              return project.getPaths().join(',') !== originalPaths.join(',');
            });
            return waitsFor(function() {
              return updateSpy.callCount > 0;
            });
          });
          return it('loads the variables from these new paths', function() {
            return expect(project.getVariables().length).toEqual(TOTAL_VARIABLES_IN_PROJECT);
          });
        });
      });
      describe('when the ignoredNames setting is changed', function() {
        var updateSpy;
        updateSpy = [][0];
        beforeEach(function() {
          var originalPaths;
          originalPaths = project.getPaths();
          atom.config.set('pigments.ignoredNames', ['**/*.styl']);
          return waitsFor(function() {
            return project.getPaths().join(',') !== originalPaths.join(',');
          });
        });
        it('updates the found using the new pattern', function() {
          return expect(project.getVariables().length).toEqual(0);
        });
        return describe('so that new paths are found', function() {
          beforeEach(function() {
            var originalPaths;
            updateSpy = jasmine.createSpy('did-update-variables');
            originalPaths = project.getPaths();
            project.onDidUpdateVariables(updateSpy);
            atom.config.set('pigments.ignoredNames', []);
            waitsFor(function() {
              return project.getPaths().join(',') !== originalPaths.join(',');
            });
            return waitsFor(function() {
              return updateSpy.callCount > 0;
            });
          });
          return it('loads the variables from these new paths', function() {
            return expect(project.getVariables().length).toEqual(TOTAL_VARIABLES_IN_PROJECT);
          });
        });
      });
      describe('when the extendedSearchNames setting is changed', function() {
        var updateSpy;
        updateSpy = [][0];
        beforeEach(function() {
          return project.setSearchNames(['*.foo']);
        });
        it('updates the search names', function() {
          return expect(project.getSearchNames().length).toEqual(3);
        });
        return it('serializes the setting', function() {
          return expect(project.serialize().searchNames).toEqual(['*.foo']);
        });
      });
      describe('when the ignore global config settings are enabled', function() {
        describe('for the sourceNames field', function() {
          beforeEach(function() {
            project.sourceNames = ['*.foo'];
            return waitsForPromise(function() {
              return project.setIgnoreGlobalSourceNames(true);
            });
          });
          it('ignores the content of the global config', function() {
            return expect(project.getSourceNames()).toEqual(['.pigments', '*.foo']);
          });
          return it('serializes the project setting', function() {
            return expect(project.serialize().ignoreGlobalSourceNames).toBeTruthy();
          });
        });
        describe('for the ignoredNames field', function() {
          beforeEach(function() {
            atom.config.set('pigments.ignoredNames', ['*.foo']);
            project.ignoredNames = ['*.bar'];
            return project.setIgnoreGlobalIgnoredNames(true);
          });
          it('ignores the content of the global config', function() {
            return expect(project.getIgnoredNames()).toEqual(['*.bar']);
          });
          return it('serializes the project setting', function() {
            return expect(project.serialize().ignoreGlobalIgnoredNames).toBeTruthy();
          });
        });
        describe('for the ignoredScopes field', function() {
          beforeEach(function() {
            atom.config.set('pigments.ignoredScopes', ['\\.comment']);
            project.ignoredScopes = ['\\.source'];
            return project.setIgnoreGlobalIgnoredScopes(true);
          });
          it('ignores the content of the global config', function() {
            return expect(project.getIgnoredScopes()).toEqual(['\\.source']);
          });
          return it('serializes the project setting', function() {
            return expect(project.serialize().ignoreGlobalIgnoredScopes).toBeTruthy();
          });
        });
        return describe('for the searchNames field', function() {
          beforeEach(function() {
            atom.config.set('pigments.extendedSearchNames', ['*.css']);
            project.searchNames = ['*.foo'];
            return project.setIgnoreGlobalSearchNames(true);
          });
          it('ignores the content of the global config', function() {
            return expect(project.getSearchNames()).toEqual(['*.less', '*.foo']);
          });
          return it('serializes the project setting', function() {
            return expect(project.serialize().ignoreGlobalSearchNames).toBeTruthy();
          });
        });
      });
      describe('::loadThemesVariables', function() {
        beforeEach(function() {
          atom.packages.activatePackage('atom-light-ui');
          atom.packages.activatePackage('atom-light-syntax');
          atom.config.set('core.themes', ['atom-light-ui', 'atom-light-syntax']);
          waitsForPromise(function() {
            return atom.themes.activateThemes();
          });
          return waitsForPromise(function() {
            return atom.packages.activatePackage('pigments');
          });
        });
        afterEach(function() {
          atom.themes.deactivateThemes();
          return atom.themes.unwatchUserStylesheet();
        });
        return it('returns an array of 62 variables', function() {
          var themeVariables;
          themeVariables = project.loadThemesVariables();
          return expect(themeVariables.length).toEqual(62);
        });
      });
      return describe('when the includeThemes setting is enabled', function() {
        var spy, _ref2;
        _ref2 = [], paths = _ref2[0], spy = _ref2[1];
        beforeEach(function() {
          paths = project.getPaths();
          expect(project.getColorVariables().length).toEqual(10);
          atom.packages.activatePackage('atom-light-ui');
          atom.packages.activatePackage('atom-light-syntax');
          atom.packages.activatePackage('atom-dark-ui');
          atom.packages.activatePackage('atom-dark-syntax');
          atom.config.set('core.themes', ['atom-light-ui', 'atom-light-syntax']);
          waitsForPromise(function() {
            return atom.themes.activateThemes();
          });
          waitsForPromise(function() {
            return atom.packages.activatePackage('pigments');
          });
          waitsForPromise(function() {
            return project.initialize();
          });
          return runs(function() {
            spy = jasmine.createSpy('did-change-active-themes');
            atom.themes.onDidChangeActiveThemes(spy);
            return project.setIncludeThemes(true);
          });
        });
        afterEach(function() {
          atom.themes.deactivateThemes();
          return atom.themes.unwatchUserStylesheet();
        });
        it('includes the variables set for ui and syntax themes in the palette', function() {
          return expect(project.getColorVariables().length).toEqual(72);
        });
        it('still includes the paths from the project', function() {
          var p, _i, _len, _results;
          _results = [];
          for (_i = 0, _len = paths.length; _i < _len; _i++) {
            p = paths[_i];
            _results.push(expect(project.getPaths().indexOf(p)).not.toEqual(-1));
          }
          return _results;
        });
        it('serializes the setting with the project', function() {
          var serialized;
          serialized = project.serialize();
          return expect(serialized.includeThemes).toEqual(true);
        });
        describe('and then disabled', function() {
          beforeEach(function() {
            return project.setIncludeThemes(false);
          });
          it('removes all the paths to the themes stylesheets', function() {
            return expect(project.getColorVariables().length).toEqual(10);
          });
          return describe('when the core.themes setting is modified', function() {
            beforeEach(function() {
              spyOn(project, 'loadThemesVariables').andCallThrough();
              atom.config.set('core.themes', ['atom-dark-ui', 'atom-dark-syntax']);
              return waitsFor(function() {
                return spy.callCount > 0;
              });
            });
            return it('does not trigger a paths update', function() {
              return expect(project.loadThemesVariables).not.toHaveBeenCalled();
            });
          });
        });
        return describe('when the core.themes setting is modified', function() {
          beforeEach(function() {
            spyOn(project, 'loadThemesVariables').andCallThrough();
            atom.config.set('core.themes', ['atom-dark-ui', 'atom-dark-syntax']);
            return waitsFor(function() {
              return spy.callCount > 0;
            });
          });
          return it('triggers a paths update', function() {
            return expect(project.loadThemesVariables).toHaveBeenCalled();
          });
        });
      });
    });
    return describe('when restored', function() {
      var createProject;
      createProject = function(params) {
        var stateFixture;
        if (params == null) {
          params = {};
        }
        stateFixture = params.stateFixture;
        delete params.stateFixture;
        if (params.root == null) {
          params.root = rootPath;
        }
        if (params.timestamp == null) {
          params.timestamp = new Date().toJSON();
        }
        if (params.variableMarkers == null) {
          params.variableMarkers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        }
        if (params.colorMarkers == null) {
          params.colorMarkers = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
        }
        if (params.version == null) {
          params.version = SERIALIZE_VERSION;
        }
        if (params.markersVersion == null) {
          params.markersVersion = SERIALIZE_MARKERS_VERSION;
        }
        return ColorProject.deserialize(jsonFixture(stateFixture, params));
      };
      describe('with a timestamp more recent than the files last modification date', function() {
        beforeEach(function() {
          project = createProject({
            stateFixture: "empty-project.json"
          });
          return waitsForPromise(function() {
            return project.initialize();
          });
        });
        return it('does not rescans the files', function() {
          return expect(project.getVariables().length).toEqual(1);
        });
      });
      describe('with a version different that the current one', function() {
        beforeEach(function() {
          project = createProject({
            stateFixture: "empty-project.json",
            version: "0.0.0"
          });
          return waitsForPromise(function() {
            return project.initialize();
          });
        });
        return it('drops the whole serialized state and rescans all the project', function() {
          return expect(project.getVariables().length).toEqual(12);
        });
      });
      describe('with a serialized path that no longer exist', function() {
        beforeEach(function() {
          project = createProject({
            stateFixture: "rename-file-project.json"
          });
          return waitsForPromise(function() {
            return project.initialize();
          });
        });
        it('drops drops the non-existing and reload the paths', function() {
          return expect(project.getPaths()).toEqual(["" + rootPath + "/styles/buttons.styl", "" + rootPath + "/styles/variables.styl"]);
        });
        it('drops the variables from the removed paths', function() {
          return expect(project.getVariablesForPath("" + rootPath + "/styles/foo.styl").length).toEqual(0);
        });
        return it('loads the variables from the new file', function() {
          return expect(project.getVariablesForPath("" + rootPath + "/styles/variables.styl").length).toEqual(12);
        });
      });
      describe('with a sourceNames setting value different than when serialized', function() {
        beforeEach(function() {
          atom.config.set('pigments.sourceNames', []);
          project = createProject({
            stateFixture: "empty-project.json"
          });
          return waitsForPromise(function() {
            return project.initialize();
          });
        });
        return it('drops the whole serialized state and rescans all the project', function() {
          return expect(project.getVariables().length).toEqual(0);
        });
      });
      describe('with a markers version different that the current one', function() {
        beforeEach(function() {
          project = createProject({
            stateFixture: "empty-project.json",
            markersVersion: "0.0.0"
          });
          return waitsForPromise(function() {
            return project.initialize();
          });
        });
        it('keeps the project related data', function() {
          expect(project.ignoredNames).toEqual(['vendor/*']);
          return expect(project.getPaths()).toEqual(["" + rootPath + "/styles/buttons.styl", "" + rootPath + "/styles/variables.styl"]);
        });
        return it('drops the variables and buffers data', function() {
          return expect(project.getVariables().length).toEqual(TOTAL_VARIABLES_IN_PROJECT);
        });
      });
      describe('with a timestamp older than the files last modification date', function() {
        beforeEach(function() {
          project = createProject({
            timestamp: new Date(0).toJSON(),
            stateFixture: "empty-project.json"
          });
          return waitsForPromise(function() {
            return project.initialize();
          });
        });
        return it('scans again all the files that have a more recent modification date', function() {
          return expect(project.getVariables().length).toEqual(TOTAL_VARIABLES_IN_PROJECT);
        });
      });
      describe('with some files not saved in the project state', function() {
        beforeEach(function() {
          project = createProject({
            stateFixture: "partial-project.json"
          });
          return waitsForPromise(function() {
            return project.initialize();
          });
        });
        return it('detects the new files and scans them', function() {
          return expect(project.getVariables().length).toEqual(12);
        });
      });
      describe('with an open editor and the corresponding buffer state', function() {
        var colorBuffer, editor, _ref2;
        _ref2 = [], editor = _ref2[0], colorBuffer = _ref2[1];
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.workspace.open('variables.styl').then(function(o) {
              return editor = o;
            });
          });
          runs(function() {
            project = createProject({
              stateFixture: "open-buffer-project.json",
              id: editor.id
            });
            return spyOn(ColorBuffer.prototype, 'variablesAvailable').andCallThrough();
          });
          return runs(function() {
            return colorBuffer = project.colorBuffersByEditorId[editor.id];
          });
        });
        it('restores the color buffer in its previous state', function() {
          expect(colorBuffer).toBeDefined();
          return expect(colorBuffer.getColorMarkers().length).toEqual(TOTAL_COLORS_VARIABLES_IN_PROJECT);
        });
        return it('does not wait for the project variables', function() {
          return expect(colorBuffer.variablesAvailable).not.toHaveBeenCalled();
        });
      });
      return describe('with an open editor, the corresponding buffer state and a old timestamp', function() {
        var colorBuffer, editor, _ref2;
        _ref2 = [], editor = _ref2[0], colorBuffer = _ref2[1];
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.workspace.open('variables.styl').then(function(o) {
              return editor = o;
            });
          });
          runs(function() {
            spyOn(ColorBuffer.prototype, 'updateVariableRanges').andCallThrough();
            return project = createProject({
              timestamp: new Date(0).toJSON(),
              stateFixture: "open-buffer-project.json",
              id: editor.id
            });
          });
          runs(function() {
            return colorBuffer = project.colorBuffersByEditorId[editor.id];
          });
          return waitsFor(function() {
            return colorBuffer.updateVariableRanges.callCount > 0;
          });
        });
        return it('invalidates the color buffer markers as soon as the dirty paths have been determined', function() {
          return expect(colorBuffer.updateVariableRanges).toHaveBeenCalled();
        });
      });
    });
  });

  describe('ColorProject', function() {
    var project, rootPath, _ref1;
    _ref1 = [], project = _ref1[0], rootPath = _ref1[1];
    return describe('when the project has a pigments defaults file', function() {
      beforeEach(function() {
        var fixturesPath;
        atom.config.set('pigments.sourceNames', ['*.sass']);
        fixturesPath = atom.project.getPaths()[0];
        rootPath = "" + fixturesPath + "/project-with-defaults";
        atom.project.setPaths([rootPath]);
        project = new ColorProject({});
        return waitsForPromise(function() {
          return project.initialize();
        });
      });
      return it('loads the defaults file content', function() {
        return expect(project.getColorVariables().length).toEqual(6);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9zcGVjL2NvbG9yLXByb2plY3Qtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsZ0xBQUE7O0FBQUEsRUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVIsQ0FBTCxDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRFAsQ0FBQTs7QUFBQSxFQUVBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUZQLENBQUE7O0FBQUEsRUFJQSxPQUFpRCxPQUFBLENBQVEsaUJBQVIsQ0FBakQsRUFBQyx5QkFBQSxpQkFBRCxFQUFvQixpQ0FBQSx5QkFKcEIsQ0FBQTs7QUFBQSxFQUtBLFlBQUEsR0FBZSxPQUFBLENBQVEsc0JBQVIsQ0FMZixDQUFBOztBQUFBLEVBTUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxxQkFBUixDQU5kLENBQUE7O0FBQUEsRUFPQSxXQUFBLEdBQWMsT0FBQSxDQUFRLG9CQUFSLENBQTZCLENBQUMsV0FBOUIsQ0FBMEMsU0FBMUMsRUFBcUQsVUFBckQsQ0FQZCxDQUFBOztBQUFBLEVBUUMsUUFBUyxPQUFBLENBQVEsa0JBQVIsRUFBVCxLQVJELENBQUE7O0FBQUEsRUFVQSwwQkFBQSxHQUE2QixFQVY3QixDQUFBOztBQUFBLEVBV0EsaUNBQUEsR0FBb0MsRUFYcEMsQ0FBQTs7QUFBQSxFQWFBLFFBQUEsQ0FBUyxjQUFULEVBQXlCLFNBQUEsR0FBQTtBQUN2QixRQUFBLGtEQUFBO0FBQUEsSUFBQSxRQUFnRCxFQUFoRCxFQUFDLGtCQUFELEVBQVUsa0JBQVYsRUFBbUIsbUJBQW5CLEVBQTZCLGdCQUE3QixFQUFvQyxtQkFBcEMsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFVB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

//# sourceURL=/home/gsmyrnaios/.atom/packages/pigments/spec/color-project-spec.coffee
