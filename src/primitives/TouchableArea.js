
var React = require('react');

var TouchableArea = React.createClass({
  getInitialState: function() {
    return {
      cumulativeScroll: {x:0, y:0},
      gestureStart: {x:0, y:0},
      isMouseWheeling: false,
      inertiaDeltaDirection: 0
    };
  },

  getDefaultProps: function() {
    return {
      component: React.DOM.div,
      touchable: true
    };
  },

  handleWheel: function(e) {
    if (!this.props.scroller || !this.props.touchable) {
      return;
    }

    if (e.timeStamp) {
      this.state.lastTimeStamp = e.timeStamp;
    }

    var self = this;
    var timeStamp = e.timeStamp || this.state.lastTimeStamp;
    var scrollDeltaX, scrollDeltaY;

    if (this.state.isMouseIntertia) {
      var inertiaDirection = e.deltaY > 0 ? 1 : -1;

      // End scrolling state
      if (this.state._scrollWheelEndDebouncer) {
        clearTimeout(this.state._scrollWheelEndDebouncer);
      }
      this.state._scrollWheelEndDebouncer = setTimeout(function () {
        self.state.isMouseInertia = false;
        self.state.inertiaDeltaDirection = 0;
      }, 32);
    }

    if (!this.state.isMouseWheeling) {
      this.state.isMouseWheeling = true;
      this.state.cumulativeScroll.x = 0;
      this.state.cumulativeScroll.y = 0;

      // Start a scroll event
      this.props.scroller.doTouchStart([{
        pageX: 0,
        pageY: 0,
      }], e.timeStamp);
      return;
    }

    // Convert the scrollwheel values to a scroll value
    scrollDeltaX = e.deltaX / 2;
    scrollDeltaY = -e.deltaY / 2;

    // If the scroller is constrained to an x axis, convert y scroll to allow single-axis scroll
    // wheels to scroll constrained content.
    if (this.props.scrollAxis === 'x') {
      scrollDeltaX = scrollDeltaY;
      scrollDeltaY = 0;
    }

    this.state.cumulativeScroll.x = Math.round(this.state.cumulativeScroll.x + scrollDeltaX);
    this.state.cumulativeScroll.y = Math.round(this.state.cumulativeScroll.y + scrollDeltaY);

    var pageX = -this.state.gestureStart.x + this.state.cumulativeScroll.x;
    var pageY = this.state.gestureStart.y + this.state.cumulativeScroll.y;

    this.props.scroller.doTouchMove([{pageX: pageX, pageY: pageY}], timeStamp);
    this.state.inertiaDeltaDirection = e.deltaY > 0 ? 1 : -1;

    var maxOffset = this.props.scroller.__clientHeight / 20;
    // max top offset
    if (this.props.scroller.__scrollTop < -maxOffset ||
        // max bottom offset
        this.props.scroller.__scrollTop + this.props.scroller.__clientHeight > this.props.scroller.__contentHeight + maxOffset
       ) {
      // stop acting on these events
      self.props.scroller.doTouchEnd(timeStamp);
      self.state.isMouseIntertia = true;
      self.state.isMouseWheeling = false;
    }

  },

  handleMouseStart: function(e) {
    if (!this.props.scroller || !this.props.touchable) {
      return;
    }

    // ignore middle and right clicks
    if (e.button !== 0) return;

    // TODO: what’s the best way to handle this with React?
    // The problem is if your mouse gets away from the target element it will
    // no longer receive the mousemove or mouseup events so we need to capture
    // these events at the document level.
    document.body.addEventListener('mousemove', this.handleMouseMove, false);
    document.body.addEventListener('mouseup', this.handleMouseEnd, false);
    document.body.addEventListener('mouseleave', this.handleMouseEnd, false);

    this.props.scroller.doTouchStart([e], e.timeStamp);
    e.preventDefault();
  },

  handleMouseMove: function(e) {
    if (!this.props.scroller || !this.props.touchable) {
      return;
    }

    this.props.scroller.doTouchMove([e], e.timeStamp);
    e.preventDefault();
  },

  handleMouseEnd: function(e) {
    if (!this.props.scroller || !this.props.touchable) {
      return;
    }

    document.body.removeEventListener('mousemove', this.handleMouseMove);
    document.body.removeEventListener('mouseup', this.handleMouseEnd);
    document.body.removeEventListener('mouseleave', this.handleMouseEnd);

    this.props.scroller.doTouchEnd(e.timeStamp);
    e.preventDefault();
  },

  handleTouchStart: function(e) {
    if (!this.props.scroller || !this.props.touchable) {
      return;
    }

    this.props.scroller.doTouchStart(e.touches, e.timeStamp);
    e.preventDefault();
  },

  handleTouchMove: function(e) {
    if (!this.props.scroller || !this.props.touchable) {
      return;
    }

    this.props.scroller.doTouchMove(e.touches, e.timeStamp, e.scale);
    e.preventDefault();
  },

  handleTouchEnd: function(e) {
    if (!this.props.scroller || !this.props.touchable) {
      return;
    }

    this.props.scroller.doTouchEnd(e.timeStamp);
    e.preventDefault();
  },

  render: function() {
    var Component = this.props.component;
    return (
      <Component
        {...this.props}
        onWheel={this.handleWheel}
        onMouseDown={this.handleMouseStart}
        onTouchStart={this.handleTouchStart}
        onTouchMove={this.handleTouchMove}
        onTouchEnd={this.handleTouchEnd}
        onTouchCancel={this.handleTouchEnd}>
        {this.props.children}
      </Component>
    );
  }
});

module.exports = TouchableArea;
