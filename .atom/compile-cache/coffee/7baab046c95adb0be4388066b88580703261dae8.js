(function() {
  var fuzzy, levenshtein;

  fuzzy = {};

  module.exports = fuzzy;

  fuzzy.simpleFilter = function(pattern, array) {
    return array.filter(function(string) {
      return fuzzy.test(pattern, string);
    });
  };

  fuzzy.test = function(pattern, string) {
    return fuzzy.match(pattern, string) !== null;
  };

  fuzzy.match = function(pattern, string, opts) {
    var ch, compareChar, compareString, currScore, idx, len, patternIdx, post, pre, result, totalScore;
    if (opts == null) {
      opts = {};
    }
    patternIdx = 0;
    result = [];
    len = string.length;
    totalScore = 0;
    currScore = 0;
    pre = opts.pre || "";
    post = opts.post || "";
    compareString = opts.caseSensitive && string || string.toLowerCase();
    ch = void 0;
    compareChar = void 0;
    pattern = opts.caseSensitive && pattern || pattern.toLowerCase();
    idx = 0;
    while (idx < len) {
      if (pattern[patternIdx] === ' ') {
        patternIdx++;
      }
      ch = string[idx];
      if (compareString[idx] === pattern[patternIdx]) {
        ch = pre + ch + post;
        patternIdx += 1;
        currScore += 1 + currScore;
      } else {
        currScore = 0;
      }
      totalScore += currScore;
      result[result.length] = ch;
      idx++;
    }
    if (patternIdx === pattern.length) {
      return {
        rendered: result.join(""),
        score: totalScore
      };
    }
  };

  fuzzy.filter = function(pattern, arr, opts) {
    var highlighted;
    if (opts == null) {
      opts = {};
    }
    highlighted = arr.reduce(function(prev, element, idx, arr) {
      var rendered, str;
      str = element;
      if (opts.extract) {
        str = opts.extract(element);
      }
      rendered = fuzzy.match(pattern, str, opts);
      if (rendered != null) {
        prev[prev.length] = {
          string: rendered.rendered,
          score: rendered.score,
          index: idx,
          original: element
        };
      }
      return prev;
    }, []).sort(function(a, b) {
      var compare;
      compare = b.score - a.score;
      if (compare === 0) {
        if (opts.extract) {
          return opts.extract(a.original).length - opts.extract(b.original).length;
        }
        return a.original.length - b.original.length;
      }
      if (compare) {
        return compare;
      }
      return a.index - b.index;
    });
    if (highlighted.length < 1) {
      highlighted = arr.reduce(function(prev, element, idx, arr) {
        var str;
        str = element;
        if (opts.extract) {
          str = opts.extract(element);
        }
        prev[prev.length] = {
          string: str,
          score: levenshtein(pattern, str),
          index: idx,
          original: element
        };
        return prev;
      }, []).sort(function(a, b) {
        var compare;
        compare = a.score - b.score;
        if (compare) {
          return compare;
        }
        return b.index - a.index;
      });
    }
    return highlighted;
  };


  /*
   * Copyright (c) 2011 Andrei Mackenzie
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy of
   * this software and associated documentation files (the "Software"), to deal in
   * the Software without restriction, including without limitation the rights to
   * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
   * the Software, and to permit persons to whom the Software is furnished to do so,
   * subject to the following conditions:
   *
   * The above copyright notice and this permission notice shall be included in all
   * copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
   * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
   * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
   * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
   * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
   */

  levenshtein = function(a, b) {
    var i, j, matrix;
    if (a.length === 0) {
      return b.length;
    }
    if (b.length === 0) {
      return a.length;
    }
    matrix = [];
    i = void 0;
    i = 0;
    while (i <= b.length) {
      matrix[i] = [i];
      i++;
    }
    j = void 0;
    j = 0;
    while (j <= a.length) {
      matrix[0][j] = j;
      j++;
    }
    i = 1;
    while (i <= b.length) {
      j = 1;
      while (j <= a.length) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
        }
        j++;
      }
      i++;
    }
    return matrix[b.length][a.length];
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL2Z1enp5LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQU1BO0FBQUEsTUFBQSxrQkFBQTs7QUFBQSxFQUFBLEtBQUEsR0FBUSxFQUFSLENBQUE7O0FBQUEsRUFDQSxNQUFNLENBQUMsT0FBUCxHQUFpQixLQURqQixDQUFBOztBQUFBLEVBS0EsS0FBSyxDQUFDLFlBQU4sR0FBcUIsU0FBQyxPQUFELEVBQVUsS0FBVixHQUFBO1dBQ25CLEtBQUssQ0FBQyxNQUFOLENBQWEsU0FBQyxNQUFELEdBQUE7YUFDWCxLQUFLLENBQUMsSUFBTixDQUFXLE9BQVgsRUFBb0IsTUFBcEIsRUFEVztJQUFBLENBQWIsRUFEbUI7RUFBQSxDQUxyQixDQUFBOztBQUFBLEVBVUEsS0FBSyxDQUFDLElBQU4sR0FBYSxTQUFDLE9BQUQsRUFBVSxNQUFWLEdBQUE7V0FDWCxLQUFLLENBQUMsS0FBTixDQUFZLE9BQVosRUFBcUIsTUFBckIsQ0FBQSxLQUFrQyxLQUR2QjtFQUFBLENBVmIsQ0FBQTs7QUFBQSxFQWVBLEtBQUssQ0FBQyxLQUFOLEdBQWMsU0FBQyxPQUFELEVBQVUsTUFBVixFQUFrQixJQUFsQixHQUFBO0FBQ1osUUFBQSw4RkFBQTs7TUFEOEIsT0FBSztLQUNuQztBQUFBLElBQUEsVUFBQSxHQUFhLENBQWIsQ0FBQTtBQUFBLElBQ0EsTUFBQSxHQUFTLEVBRFQsQ0FBQTtBQUFBLElBRUEsR0FBQSxHQUFNLE1BQU0sQ0FBQyxNQUZiLENBQUE7QUFBQSxJQUdBLFVBQUEsR0FBYSxDQUhiLENBQUE7QUFBQSxJQUlBLFNBQUEsR0FBWSxDQUpaLENBQUE7QUFBQSxJQU9BLEdBQUEsR0FBTSxJQUFJLENBQUMsR0FBTCxJQUFZLEVBUGxCLENBQUE7QUFBQSxJQVVBLElB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

//# sourceURL=/home/gsmyrnaios/.atom/packages/git-plus/lib/models/fuzzy.coffee
