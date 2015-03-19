
var React = require('react');

var STYLE = {
  bottom: 0,
  left: 0,
  overflow: 'hidden',
  position: 'absolute',
  right: 0,
  top: 0
};

var App = React.createClass({
  handleTouch: function(e) {
    e.preventDefault();
  },

  render: function() {
    return (
      <div {...this.props} onTouchMove={this.handleTouch} style={STYLE}>
        {this.props.children}
      </div>
    );
  }
});

module.exports = App;
