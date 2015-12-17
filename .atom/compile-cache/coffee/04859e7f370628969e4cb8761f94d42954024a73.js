(function() {
  module.exports = {
    config: {
      additionalGrammars: {
        title: 'Additional Grammars',
        description: 'Comma delimited list of grammar names, other than HTML and PHP, to apply this plugin to. Use "*" to run for all grammars.',
        type: 'array',
        "default": []
      },
      forceInline: {
        title: 'Force Inline',
        description: 'Elements in this comma delimited list will render their closing tags on the same line, even if they are block by default',
        type: 'array',
        "default": ['title', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']
      },
      forceBlock: {
        title: 'Force Block',
        description: 'Elements in this comma delimited list will render their closing tags after a tabbed line, even if they are inline by default',
        type: 'array',
        "default": ['head']
      },
      neverClose: {
        title: 'Never Close Elements',
        description: 'Comma delimited list of elements to never close',
        type: 'array',
        "default": ['br', 'hr', 'img', 'input', 'link', 'meta', 'area', 'base', 'col', 'command', 'embed', 'keygen', 'param', 'source', 'track', 'wbr']
      },
      makNeverCloseeSelfClosing: {
        title: 'Make Never Close Elements Self-Closing',
        description: 'Closes elements with " />" (ie <br> becomes <br />)',
        type: 'boolean',
        "default": true
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZ3NteXJuYWlvcy8uYXRvbS9wYWNrYWdlcy9hdXRvY2xvc2UtaHRtbC9saWIvY29uZmlndXJhdGlvbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLEVBQUEsTUFBTSxDQUFDLE9BQVAsR0FDSTtBQUFBLElBQUEsTUFBQSxFQUNJO0FBQUEsTUFBQSxrQkFBQSxFQUNJO0FBQUEsUUFBQSxLQUFBLEVBQU8scUJBQVA7QUFBQSxRQUNBLFdBQUEsRUFBYSwySEFEYjtBQUFBLFFBRUEsSUFBQSxFQUFNLE9BRk47QUFBQSxRQUdBLFNBQUEsRUFBUyxFQUhUO09BREo7QUFBQSxNQU1BLFdBQUEsRUFDSTtBQUFBLFFBQUEsS0FBQSxFQUFPLGNBQVA7QUFBQSxRQUNBLFdBQUEsRUFBYSwwSEFEYjtBQUFBLFFBRUEsSUFBQSxFQUFNLE9BRk47QUFBQSxRQUdBLFNBQUEsRUFBUyxDQUFDLE9BQUQsRUFBVSxJQUFWLEVBQWdCLElBQWhCLEVBQXNCLElBQXRCLEVBQTRCLElBQTVCLEVBQWtDLElBQWxDLEVBQXdDLElBQXhDLENBSFQ7T0FQSjtBQUFBLE1BV0EsVUFBQSxFQUNJO0FBQUEsUUFBQSxLQUFBLEVBQU8sYUFBUDtBQUFBLFFBQ0EsV0FBQSxFQUFhLDhIQURiO0FBQUEsUUFFQSxJQUFBLEVBQU0sT0FGTjtBQUFBLFFBR0EsU0FBQSxFQUFTLENBQUMsTUFBRCxDQUhUO09BWko7QUFBQSxNQWdCQSxVQUFBLEVBQ0k7QUFBQSxRQUFBLEtBQUEsRUFBTyxzQkFBUDtBQUFBLFFBQ0EsV0FBQSxFQUFhLGlEQURiO0FBQUEsUUFFQSxJQUFBLEVBQU0sT0FGTjtBQUFBLFFBR0EsU0FBQSxFQUFTLENBQUMsSUFBRCxFQUFPLElBQVAsRUFBYSxLQUFiLEVBQW9CLE9BQXBCLEVBQTZCLE1BQTdCLEVBQXFDLE1BQXJDLEVBQTZDLE1BQTdDLEVBQXFELE1BQXJELEVBQTZELEtBQTdELEVBQW9FLFNBQXBFLEVBQStFLE9BQS9FLEVBQXdGLFFBQXhGLEVBQWtHLE9BQWxHLEVBQTJHLFFBQTNHLEVBQXFILE9BQXJILEVBQThILEtBQTlILENBSFQ7T0FqQko7QUFBQSxNQXFCQSx5QkFBQSxFQUNJO0FBQUEsUUFBQSxLQUFBLEVBQU8sd0NBQVA7QUFBQSxRQUNBLFdBQUEsRUFBYSxxREFEYjtBQUFBLFFBRUEsSUFBQSxFQUFNLFNBRk47QUFBQSxRQUdBLFNBQUEsRUFBUyxJQUhUO09BdEJKO0tBREo7R0FESixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/gsmyrnaios/.atom/packages/autoclose-html/lib/configuration.coffee
