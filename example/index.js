import addEvent from '../src/index';

document.addEventListener("DOMContentLoaded", function() {
  var $box  = document.querySelector('#box');
  var $foo  = document.querySelector('#foo');
  var $bar  = document.querySelector('#bar');
  var count = 0;

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

  addEvent($foo, {
    type:      'swipe',
    when: {
      type:    'longtap',
      status:  ['cancel', 'init'],
      longtapThreshold: 1000/*ms*/
    },

    endWith:   ['right', 'vertical', 'horizontal'],
    startWith: ['left'],

    end:       function(){console.log('foo swipe end');},
    start:     function(){console.log('foo swipe start');},
    cancel:    function(){console.log('foo swipe cancel');},
    move: function(info, lock, unlock){
      console.log('foo swipe move');
      if (count === 51) {
        lock();
        console.log('lock to foo');
      }

      if (count === 100) {
        unlock();
        console.log('unlock from foo');
      }

      count++;
    },
  });

  addEvent($bar, {
    type:      'swipe',
    when: {
      type:    'longtap',
      status:  ['cancel', 'init'],
      longtapThreshold: 1000/*ms*/
    },

    finger:    1,
    endWith:   ['right', 'vertical', 'horizontal'],
    startWith: ['left'],

    end:       function(){console.log('bar swipe end');},
    start:     function(){console.log('bar swipe start');count=0;},
    cancel:    function(){console.log('bar swipe cancel');},
    move: function(info, lock, unlock){
      console.log('bar swipe move');
      if (count === 0) {
        lock();
        console.log('lock to bar');
      }

      if (count === 50) {
        unlock();
        console.log('unlock from bar');
      }

      count++;
    },
  });
});