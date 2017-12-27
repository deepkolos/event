import addEvent from '../src/index';

document.addEventListener("DOMContentLoaded", function() {
  var $box = document.querySelector('#box');

  var swipeCtrl = addEvent($box, {
    type:      'swipe',

    end:       function(){console.log('swipe end');},
    move:      function(){console.log('swipe move');},
    start:     function(){console.log('swipe start');},
    cancel:    function(){console.log('swipe cancel');},
  });

  swipeCtrl.removeEvent();

  addEvent($box, {
    type:      'swipe',
    when: {
      type:    'longtap',
      status:  ['cancel', 'init'],
      longtapThreshold: 1000/*ms*/
    },

    endWith:   ['right', 'vertical', 'horizontal'],
    startWith: ['left'],

    end:       function(){console.log('swipe end');},
    move:      function(){console.log('swipe move');},
    start:     function(){console.log('swipe start');},
    cancel:    function(){console.log('swipe cancel');},
  });

  addEvent($box, {
    type:      'tap',
    repeat:    3,

    end:       function(){console.log('tap end');},
    move:      function(){console.log('tap move');},
    start:     function(){console.log('tap start');},
    cancel:    function(){console.log('tap cancel');},
  });

  addEvent($box, {
    type:      'longtap',

    end:       function(){console.log('longtap end');},
    move:      function(){console.log('longtap move');},
    start:     function(){console.log('longtap start');},
    cancel:    function(){console.log('longtap cancel');},
  });

});