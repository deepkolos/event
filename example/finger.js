import addEvent from '../src/index';
import { STATUS } from '../src/define';
import { dom } from './utils';

document.addEventListener("DOMContentLoaded", function() {
  var $box = document.getElementById('interact');
  var $log = document.getElementById('status-displayer');
  var $table = $log.querySelector('tbody');
  var $head = $log.querySelector('tr:first-child');
  var $resetBtn = document.getElementById('reset');
  var defaultCfg = {
    cancel: log,
    start: log,
    move: log,
    end: log,
  };
  var evts = [
    'tap',
    'longtap',
    'swipe',
    'pinch',
    'rotate'
  ];
  var lastInfo = {};
  var counter = 1;

  function log (info) {
    if (
      lastInfo.type === info.type &&
      lastInfo.status === info.status &&
      lastInfo.cfg.finger === info.cfg.finger
    ) {
      counter++;
      var $lastNode = $table.querySelector('tr:last-child td:last-child');
      $lastNode.innerText = counter;
    } else {
      counter = 1;
      $table.appendChild(dom(`
        <tr>
          <td>${info.type}</td>
          <td>${info.cfg.finger}</td>
          <td>${STATUS[info.status]}</td>
          <td></td>
        </tr>
      `, 'table')[0].children[0]);
    }

    $log.scrollTop = $log.scrollHeight - $log.clientHeight;
    console.log(`${info.type}: ${STATUS[info.status]}`);
    lastInfo = info;
  }

  function cfg (obj) {
    return Object.assign({}, defaultCfg, obj);
  }

  function lockTableHead () {
    $head.style.transform = `translateY(${Math.floor($log.scrollTop)}px)`;
  }

  evts.forEach(function(evt){
    [1,2,3].forEach(function(finger){
      addEvent($box, cfg({
        type: evt,
        finger: finger
      }));
    });
  });

  $log.onscroll = lockTableHead;

  $resetBtn.onclick = function () {
    $table.style.display = 'none';
    for (var i = $table.children.length - 1, $trs = $table.children; i > 0 ; i--) {
      $table.removeChild($trs[i]);
    }
    $table.style.display = '';
  };
});