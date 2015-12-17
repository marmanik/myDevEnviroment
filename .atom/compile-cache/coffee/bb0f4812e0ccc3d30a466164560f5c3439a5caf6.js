(function() {
  describe('directive grammar', function() {
    var grammar;
    grammar = null;
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.packages.activatePackage('angularjs');
      });
      return runs(function() {
        return grammar = atom.grammars.grammarForScopeName('text.html.angular');
      });
    });
    it('parses the grammar', function() {
      expect(grammar).toBeTruthy();
      return expect(grammar.scopeName).toBe('text.html.angular');
    });
    describe('directive attributes', function() {
      it('tokenizes ng-repeat attribute inside HTML', function() {
        var lines;
        lines = grammar.tokenizeLines('<dd ng-repeat="availability in phone.availability">{{availability}}</dd>');
        return expect(lines[0][3]).toEqual({
          value: 'ng-repeat',
          scopes: ['text.html.angular', 'meta.tag.block.any.html', 'meta.attribute.html.angular', 'entity.other.attribute-name.html.angular']
        });
      });
      it('tokenizes ng-src and ng-click attributes inside HTML', function() {
        var lines;
        lines = grammar.tokenizeLines('<li ng-repeat="img in phone.images">\n  <img ng-src="{{img}}" ng-click="setImage(img)">\n</li>');
        expect(lines[0][3]).toEqual({
          value: 'ng-repeat',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'entity.other.attribute-name.html.angular']
        });
        expect(lines[1][4]).toEqual({
          value: 'ng-src',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'entity.other.attribute-name.html.angular']
        });
        return expect(lines[1][12]).toEqual({
          value: 'ng-click',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'entity.other.attribute-name.html.angular']
        });
      });
      it('tokenizes ng-view attribute without value inside HTML', function() {
        var lines;
        lines = grammar.tokenizeLines('<div ng-view class="view-frame"></div>');
        return expect(lines[0][3]).toEqual({
          value: 'ng-view',
          scopes: ['text.html.angular', 'meta.tag.block.any.html', 'meta.attribute.html.angular', 'entity.other.attribute-name.html.angular']
        });
      });
      it('tokenizes capitalized ng-repeat attribute inside HTML', function() {
        var lines;
        lines = grammar.tokenizeLines('<dd NG-REPEAT="availability in phone.availability">{{availability}}</dd>');
        return expect(lines[0][3]).toEqual({
          value: 'NG-REPEAT',
          scopes: ['text.html.angular', 'meta.tag.block.any.html', 'meta.attribute.html.angular', 'entity.other.attribute-name.html.angular']
        });
      });
      it('tokenizes ng-controller attribute in body tag', function() {
        var lines;
        lines = grammar.tokenizeLines('<body ng-controller="TestCtrl">');
        return expect(lines[0][3]).toEqual({
          value: 'ng-controller',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'entity.other.attribute-name.html.angular']
        });
      });
      it('tokenizes ng-s attribute', function() {
        var lines;
        lines = grammar.tokenizeLines('<select ng-options="color.name group by color.shade for color in colors">');
        return expect(lines[0][3]).toEqual({
          value: 'ng-options',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'entity.other.attribute-name.html.angular']
        });
      });
      return it('tokenizes ng- attributes for anchor tags', function() {
        var lines;
        lines = grammar.tokenizeLines('<a href="/url" ng-click=\'{{setImage(img)}}\'>');
        return expect(lines[0][9]).toEqual({
          value: 'ng-click',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'entity.other.attribute-name.html.angular']
        });
      });
    });
    describe('directive element', function() {
      it('tokenizes ng-include element inside HTML', function() {
        var lines;
        lines = grammar.tokenizeLines('<ng-include src=""></ng-include>');
        expect(lines[0][1]).toEqual({
          value: 'ng-include',
          scopes: ['text.html.angular', 'meta.tag.block.any.html', 'entity.name.tag.block.any.html.angular']
        });
        return expect(lines[0][5]).toEqual({
          value: 'ng-include',
          scopes: ['text.html.angular', 'meta.tag.block.any.html', 'entity.name.tag.block.any.html.angular']
        });
      });
      return it('tokenizes capitalized ng-include element inside HTML', function() {
        var lines;
        lines = grammar.tokenizeLines('<NG-INCLUDE src=""></NG-INCLUDE>');
        expect(lines[0][1]).toEqual({
          value: 'NG-INCLUDE',
          scopes: ['text.html.angular', 'meta.tag.block.any.html', 'entity.name.tag.block.any.html.angular']
        });
        return expect(lines[0][5]).toEqual({
          value: 'NG-INCLUDE',
          scopes: ['text.html.angular', 'meta.tag.block.any.html', 'entity.name.tag.block.any.html.angular']
        });
      });
    });
    describe('normalization angular tag and attribute', function() {
      it('tokenizes data- prefixed angular attributes', function() {
        var lines;
        lines = grammar.tokenizeLines('<body data-ng-controller="TestCtrl">');
        return expect(lines[0][3]).toEqual({
          value: 'data-ng-controller',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'entity.other.attribute-name.html.angular']
        });
      });
      it('tokenizes x- prefixed angular attributes', function() {
        var lines;
        lines = grammar.tokenizeLines('<body x-ng-controller="TestCtrl">');
        return expect(lines[0][3]).toEqual({
          value: 'x-ng-controller',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'entity.other.attribute-name.html.angular']
        });
      });
      it('tokenizes _ suffixed angular attributes', function() {
        var lines;
        lines = grammar.tokenizeLines('<body ng_controller="TestCtrl">');
        return expect(lines[0][3]).toEqual({
          value: 'ng_controller',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'entity.other.attribute-name.html.angular']
        });
      });
      it('tokenizes : suffixed angular attributes', function() {
        var lines;
        lines = grammar.tokenizeLines('<body ng:controller="TestCtrl">');
        return expect(lines[0][3]).toEqual({
          value: 'ng:controller',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'entity.other.attribute-name.html.angular']
        });
      });
      it('tokenizes data- prefixed angular element', function() {
        var lines;
        lines = grammar.tokenizeLines('<data-ng-include src=""></data-ng-include>');
        expect(lines[0][1]).toEqual({
          value: 'data-ng-include',
          scopes: ['text.html.angular', 'meta.tag.block.any.html', 'entity.name.tag.block.any.html.angular']
        });
        return expect(lines[0][5]).toEqual({
          value: 'data-ng-include',
          scopes: ['text.html.angular', 'meta.tag.block.any.html', 'entity.name.tag.block.any.html.angular']
        });
      });
      it('tokenizes x- prefixed angular element', function() {
        var lines;
        lines = grammar.tokenizeLines('<x-ng-include src=""></x-ng-include>');
        expect(lines[0][1]).toEqual({
          value: 'x-ng-include',
          scopes: ['text.html.angular', 'meta.tag.block.any.html', 'entity.name.tag.block.any.html.angular']
        });
        return expect(lines[0][5]).toEqual({
          value: 'x-ng-include',
          scopes: ['text.html.angular', 'meta.tag.block.any.html', 'entity.name.tag.block.any.html.angular']
        });
      });
      it('tokenizes _ suffixed angular element', function() {
        var lines;
        lines = grammar.tokenizeLines('<ng_include src=""></ng_include>');
        expect(lines[0][1]).toEqual({
          value: 'ng_include',
          scopes: ['text.html.angular', 'meta.tag.block.any.html', 'entity.name.tag.block.any.html.angular']
        });
        return expect(lines[0][5]).toEqual({
          value: 'ng_include',
          scopes: ['text.html.angular', 'meta.tag.block.any.html', 'entity.name.tag.block.any.html.angular']
        });
      });
      return it('tokenizes : suffixed angular element', function() {
        var lines;
        lines = grammar.tokenizeLines('<ng:include src=""></ng:include>');
        expect(lines[0][1]).toEqual({
          value: 'ng:include',
          scopes: ['text.html.angular', 'meta.tag.block.any.html', 'entity.name.tag.block.any.html.angular']
        });
        return expect(lines[0][5]).toEqual({
          value: 'ng:include',
          scopes: ['text.html.angular', 'meta.tag.block.any.html', 'entity.name.tag.block.any.html.angular']
        });
      });
    });
    return describe('angular expression', function() {
      it('tokenizes angular expressions in HTML tags', function() {
        var lines;
        lines = grammar.tokenizeLines('<dd>{{phone.camera.primary}}</dd>');
        expect(lines[0][3]).toEqual({
          value: '{{',
          scopes: ['text.html.angular', 'meta.tag.template.angular', 'punctuation.definition.block.begin.angular']
        });
        expect(lines[0][4]).toEqual({
          value: 'phone.camera.primary',
          scopes: ['text.html.angular', 'meta.tag.template.angular']
        });
        return expect(lines[0][5]).toEqual({
          value: '}}',
          scopes: ['text.html.angular', 'meta.tag.template.angular', 'punctuation.definition.block.end.angular']
        });
      });
      it('tokenizes angular expressions in value of attributes with double quoted', function() {
        var lines;
        lines = grammar.tokenizeLines('<li ng-repeat="phone in phones | filter:query | orderBy:orderProp"></li>');
        expect(lines[0][5]).toEqual({
          value: '"',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'string.quoted.double.html.angular', 'punctuation.definition.string.begin.html.angular']
        });
        expect(lines[0][6]).toEqual({
          value: 'phone in phones | filter:query | orderBy:orderProp',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'string.quoted.double.html.angular', 'meta.tag.template.angular']
        });
        return expect(lines[0][7]).toEqual({
          value: '"',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'string.quoted.double.html.angular', 'punctuation.definition.string.end.html.angular']
        });
      });
      it('tokenizes angular expressions in value of attributes with single quoted', function() {
        var lines;
        lines = grammar.tokenizeLines('<li ng-repeat=\'img in phone.images\'>');
        expect(lines[0][5]).toEqual({
          value: '\'',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'string.quoted.single.html.angular', 'punctuation.definition.string.begin.html.angular']
        });
        expect(lines[0][6]).toEqual({
          value: 'img in phone.images',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'string.quoted.single.html.angular', 'meta.tag.template.angular']
        });
        return expect(lines[0][7]).toEqual({
          value: '\'',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'string.quoted.single.html.angular', 'punctuation.definition.string.end.html.angular']
        });
      });
      return it('tokenizes angular expressions in value of attributes with {{}}', function() {
        var lines;
        lines = grammar.tokenizeLines('<img ng-src="{{img}}" ng-click="{{setImage(img)}}">');
        expect(lines[0][5]).toEqual({
          value: '"',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'string.quoted.double.html.angular', 'punctuation.definition.string.begin.html.angular']
        });
        expect(lines[0][6]).toEqual({
          value: '{{',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'string.quoted.double.html.angular', 'meta.tag.template.angular', 'meta.tag.template.angular', 'punctuation.definition.block.begin.angular']
        });
        expect(lines[0][7]).toEqual({
          value: 'img',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'string.quoted.double.html.angular', 'meta.tag.template.angular', 'meta.tag.template.angular']
        });
        expect(lines[0][8]).toEqual({
          value: '}}',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'string.quoted.double.html.angular', 'meta.tag.template.angular', 'meta.tag.template.angular', 'punctuation.definition.block.end.angular']
        });
        expect(lines[0][9]).toEqual({
          value: '"',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'string.quoted.double.html.angular', 'punctuation.definition.string.end.html.angular']
        });
        expect(lines[0][13]).toEqual({
          value: '"',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'string.quoted.double.html.angular', 'punctuation.definition.string.begin.html.angular']
        });
        expect(lines[0][14]).toEqual({
          value: '{{',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'string.quoted.double.html.angular', 'meta.tag.template.angular', 'meta.tag.template.angular', 'punctuation.definition.block.begin.angular']
        });
        expect(lines[0][15]).toEqual({
          value: 'setImage(img)',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'string.quoted.double.html.angular', 'meta.tag.template.angular', 'meta.tag.template.angular']
        });
        expect(lines[0][16]).toEqual({
          value: '}}',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'string.quoted.double.html.angular', 'meta.tag.template.angular', 'meta.tag.template.angular', 'punctuation.definition.block.end.angular']
        });
        return expect(lines[0][17]).toEqual({
          value: '"',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'string.quoted.double.html.angular', 'punctuation.definition.string.end.html.angular']
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy9hbmd1bGFyanMvc3BlYy9ncmFtbWFyLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLFFBQUEsQ0FBUyxtQkFBVCxFQUE4QixTQUFBLEdBQUE7QUFDNUIsUUFBQSxPQUFBO0FBQUEsSUFBQSxPQUFBLEdBQVUsSUFBVixDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsTUFBQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtlQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixXQUE5QixFQURjO01BQUEsQ0FBaEIsQ0FBQSxDQUFBO2FBR0EsSUFBQSxDQUFLLFNBQUEsR0FBQTtlQUNILE9BQUEsR0FBVSxJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFkLENBQWtDLG1CQUFsQyxFQURQO01BQUEsQ0FBTCxFQUpTO0lBQUEsQ0FBWCxDQUZBLENBQUE7QUFBQSxJQVNBLEVBQUEsQ0FBRyxvQkFBSCxFQUF5QixTQUFBLEdBQUE7QUFDdkIsTUFBQSxNQUFBLENBQU8sT0FBUCxDQUFlLENBQUMsVUFBaEIsQ0FBQSxDQUFBLENBQUE7YUFDQSxNQUFBLENBQU8sT0FBTyxDQUFDLFNBQWYsQ0FBeUIsQ0FBQyxJQUExQixDQUErQixtQkFBL0IsRUFGdUI7SUFBQSxDQUF6QixDQVRBLENBQUE7QUFBQSxJQWFBLFFBQUEsQ0FBUyxzQkFBVCxFQUFpQyxTQUFBLEdBQUE7QUFDL0IsTUFBQSxFQUFBLENBQUcsMkNBQUgsRUFBZ0QsU0FBQSxHQUFBO0FBQzlDLFlBQUEsS0FBQTtBQUFBLFFBQUEsS0FBQSxHQUFRLE9BQU8sQ0FBQyxhQUFSLENBQXNCLDBFQUF0QixDQUFSLENBQUE7ZUFJQSxNQUFBLENBQU8sS0FBTSxDQUFBLENBQUEsQ0FBRyxDQUFB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

//# sourceURL=/home/gsmyrnaios/.atom/packages/angularjs/spec/grammar-spec.coffee
