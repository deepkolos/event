import addEvent from '../src/index';

document.addEventListener("DOMContentLoaded", function() {
  var $box = document.querySelector('#box');

  var swipeCtrl = addEvent($box, {
    type: 'swipe',

    start:  function(){console.log('swipe start');},
    move:   function(){console.log('swipe move');},
    end:    function(){console.log('swipe end');},
    cancel: function(){console.log('swipe cancel');},
  });

  addEvent($box, {
    type: 'tap',

    start:  function(){console.log('tap start');},
    move:   function(){console.log('tap move');},
    end:    function(){console.log('tap end');},
    cancel: function(){console.log('tap cancel');},
  });

  addEvent($box, {
    type: 'longtap',

    start:  function(){console.log('longtap start');},
    move:   function(){console.log('longtap move');},
    end:    function(){console.log('longtap end');},
    cancel: function(){console.log('longtap cancel');},
  });

  // swipeCtrl.disable();
});