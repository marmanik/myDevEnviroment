(function() {
  describe('Bottom Container', function() {
    var BottomContainer, bottomContainer, trigger;
    BottomContainer = require('../../lib/ui/bottom-container');
    bottomContainer = null;
    trigger = require('../common').trigger;
    beforeEach(function() {
      return waitsForPromise(function() {
        return atom.packages.activatePackage('linter').then(function() {
          if (bottomContainer != null) {
            bottomContainer.dispose();
          }
          return bottomContainer = BottomContainer.create('File');
        });
      });
    });
    describe('::getTab', function() {
      return it('returns HTMLElements of tabs', function() {
        expect(bottomContainer.getTab('File') instanceof HTMLElement).toBe(true);
        expect(bottomContainer.getTab('Line') instanceof HTMLElement).toBe(true);
        expect(bottomContainer.getTab('Project') instanceof HTMLElement).toBe(true);
        return expect(bottomContainer.getTab('a') instanceof HTMLElement).toBe(false);
      });
    });
    describe('::setCount', function() {
      return it('updates count on underlying HTMLElements', function() {
        bottomContainer.setCount({
          Project: 1,
          File: 2,
          Line: 3
        });
        bottomContainer.iconScope = 'File';
        expect(bottomContainer.getTab('Project').count).toBe(1);
        expect(bottomContainer.getTab('File').count).toBe(2);
        return expect(bottomContainer.getTab('Line').count).toBe(3);
      });
    });
    describe('::{set, get}ActiveTab', function() {
      return it('works', function() {
        expect(bottomContainer.getTab('File').active).toBe(true);
        expect(bottomContainer.getTab('Line').active).toBe(false);
        expect(bottomContainer.getTab('Project').active).toBe(false);
        expect(bottomContainer.activeTab).toBe('File');
        bottomContainer.activeTab = 'Line';
        expect(bottomContainer.getTab('File').active).toBe(false);
        expect(bottomContainer.getTab('Line').active).toBe(true);
        expect(bottomContainer.getTab('Project').active).toBe(false);
        expect(bottomContainer.activeTab).toBe('Line');
        bottomContainer.activeTab = 'Project';
        expect(bottomContainer.getTab('File').active).toBe(false);
        expect(bottomContainer.getTab('Line').active).toBe(false);
        expect(bottomContainer.getTab('Project').active).toBe(true);
        expect(bottomContainer.activeTab).toBe('Project');
        bottomContainer.activeTab = 'File';
        expect(bottomContainer.activeTab).toBe('File');
        expect(bottomContainer.getTab('File').active).toBe(true);
        expect(bottomContainer.getTab('Line').active).toBe(false);
        return expect(bottomContainer.getTab('Project').active).toBe(false);
      });
    });
    describe('::{get, set}Visibility', function() {
      return it('manages element visibility', function() {
        bottomContainer.visibility = false;
        expect(bottomContainer.visibility).toBe(false);
        expect(bottomContainer.hasAttribute('hidden')).toBe(true);
        bottomContainer.visibility = true;
        expect(bottomContainer.visibility).toBe(true);
        return expect(bottomContainer.hasAttribute('hidden')).toBe(false);
      });
    });
    describe('::onDidChangeTab', function() {
      return it('is triggered when tab is changed', function() {
        var listener;
        listener = jasmine.createSpy('onDidChangeTab');
        bottomContainer.onDidChangeTab(listener);
        trigger(bottomContainer.getTab('File'), 'click');
        expect(listener).not.toHaveBeenCalled();
        trigger(bottomContainer.getTab('Project'), 'click');
        expect(listener).toHaveBeenCalledWith('Project');
        trigger(bottomContainer.getTab('File'), 'click');
        expect(listener).toHaveBeenCalledWith('File');
        trigger(bottomContainer.getTab('Line'), 'click');
        return expect(listener).toHaveBeenCalledWith('Line');
      });
    });
    describe('::onShouldTogglePanel', function() {
      return it('is triggered when active tab is clicked', function() {
        var listener;
        listener = jasmine.createSpy('onShouldTogglePanel');
        bottomContainer.onShouldTogglePanel(listener);
        trigger(bottomContainer.getTab('Project'), 'click');
        expect(listener).not.toHaveBeenCalled();
        trigger(bottomContainer.getTab('Project'), 'click');
        return expect(listener).toHaveBeenCalled();
      });
    });
    describe('::visibility', function() {
      return it('depends on displayLinterInfo', function() {
        atom.config.set('linter.displayLinterInfo', true);
        bottomContainer.visibility = true;
        expect(bottomContainer.visibility).toBe(true);
        atom.config.set('linter.displayLinterInfo', false);
        expect(bottomContainer.visibility).toBe(false);
        bottomContainer.visibility = true;
        expect(bottomContainer.visibility).toBe(false);
        atom.config.set('linter.displayLinterInfo', true);
        bottomContainer.visibility = true;
        expect(bottomContainer.visibility).toBe(true);
        bottomContainer.visibility = false;
        return expect(bottomContainer.visibility).toBe(false);
      });
    });
    return describe('.status::visibility', function() {
      return it('depends on displayLinterStatus', function() {
        atom.config.set('linter.displayLinterStatus', true);
        expect(bottomContainer.status.visibility).toBe(true);
        atom.config.set('linter.displayLinterStatus', false);
        expect(bottomContainer.status.visibility).toBe(false);
        atom.config.set('linter.displayLinterStatus', true);
        return expect(bottomContainer.status.visibility).toBe(true);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy9saW50ZXIvc3BlYy91aS9ib3R0b20tY29udGFpbmVyLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLFFBQUEsQ0FBUyxrQkFBVCxFQUE2QixTQUFBLEdBQUE7QUFDM0IsUUFBQSx5Q0FBQTtBQUFBLElBQUEsZUFBQSxHQUFrQixPQUFBLENBQVEsK0JBQVIsQ0FBbEIsQ0FBQTtBQUFBLElBQ0EsZUFBQSxHQUFrQixJQURsQixDQUFBO0FBQUEsSUFHQyxVQUFXLE9BQUEsQ0FBUSxXQUFSLEVBQVgsT0FIRCxDQUFBO0FBQUEsSUFLQSxVQUFBLENBQVcsU0FBQSxHQUFBO2FBQ1QsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsUUFBOUIsQ0FBdUMsQ0FBQyxJQUF4QyxDQUE2QyxTQUFBLEdBQUE7O1lBQzNDLGVBQWUsQ0FBRSxPQUFqQixDQUFBO1dBQUE7aUJBQ0EsZUFBQSxHQUFrQixlQUFlLENBQUMsTUFBaEIsQ0FBdUIsTUFBdkIsRUFGeUI7UUFBQSxDQUE3QyxFQURjO01BQUEsQ0FBaEIsRUFEUztJQUFBLENBQVgsQ0FMQSxDQUFBO0FBQUEsSUFXQSxRQUFBLENBQVMsVUFBVCxFQUFxQixTQUFBLEdBQUE7YUFDbkIsRUFBQSxDQUFHLDhCQUFILEVBQW1DLFNBQUEsR0FBQTtBQUNqQyxRQUFBLE1BQUEsQ0FBTyxlQUFlLENBQUMsTUFBaEIsQ0FBdUIsTUFBdkIsQ0FBQSxZQUEwQyxXQUFqRCxDQUE2RCxDQUFDLElBQTlELENBQW1FLElBQW5FLENBQUEsQ0FBQTtBQUFBLFFBQ0EsTUFBQSxDQUFPLGVBQWUsQ0FBQyxNQUFoQixDQUF1QixNQUF2QixDQUFBLFlBQTBDLFdBQWpELENBQTZELENBQUMs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

//# sourceURL=/home/gsmyrnaios/.atom/packages/linter/spec/ui/bottom-container-spec.coffee
