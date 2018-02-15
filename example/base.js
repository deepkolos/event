import addEvent from '../src/index';
import { STATUS } from '../src/define';

document.addEventListener("DOMContentLoaded", function() {
  var $box = document.getElementById('interact');
  var $log = document.getElementById('status-displayer');
  var $resetBtn = document.getElementById('reset-status');
  var $statusArr = $log.querySelectorAll('[id|="status"]');
  var defaultCfg = {
    cancel: log,
    start: log,
    move: log,
    end: log,
  };

  function log (info) {
    var $status = $log.querySelector(`#status-${info.type}`);

    $status.innerText = STATUS[info.status];
    console.log(`${info.type}: ${STATUS[info.status]}`);
  }

  function cfg (obj) {
    return Object.assign({}, defaultCfg, obj);
  }

  addEvent($box, cfg({
    type: 'tap',
  }));

  addEvent($box, cfg({
    type: 'longtap',
  }));

  addEvent($box, cfg({
    type: 'swipe',
  }));

  addEvent($box, cfg({
    type: 'pinch',
  }));

  addEvent($box, cfg({
    type: 'rotate',
  }));

  addEvent($box, cfg({
    type: 'groupEvent',

    start: function(){
      $resetBtn.onclick();
    },
    move: function(){},
    end: function(){},
    cancel: function(){}
  }));

  $resetBtn.onclick = function (){
    $statusArr.forEach(function($status){
      $status.innerHTML = 'init';
    });
  };
});