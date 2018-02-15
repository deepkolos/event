import { STATUS } from './define';
import {
  schedule,
  start_bus_bubble,
  group_gap_trigger
} from './main';

function TimerController(){
  this.list = {};
}

TimerController.prototype.stop = function(name){
  if(this.list[name] !== undefined) {
    clearTimeout(this.list[name]);
    this.list[name] = undefined;

  } else if(name === 'longtap') {
    
    for (var id in this.list) {
      if(id.indexOf(name) === 0 && this.list[id] !== undefined) {
        clearTimeout(this.list[id]);
        this.list[id] = undefined;
      }
    }
  }
};

TimerController.prototype.start = function(name, delay){
  var _callback;
  var _delay;
  var self = this;

  function _warp_callback(func){
    _callback = function(){
      func();
      self.list[name] = undefined;
    };
  }

  //一些预设的timer定义,一些执行流的定义不应该嵌套到其他的执行流当中的
  if(name === 'longtap_debounce'){
    _delay = delay || 350;
    _warp_callback(function(){
      var longtap_ids = [];

      for(let base_name in schedule.base){
        if(base_name.indexOf('longtap') === 0 ){
          longtap_ids.push(base_name);
        }
      }

      if (longtap_ids.length !== 0){
        console.log('longtap debounce trigger');
        start_bus_bubble({
          type: 'longtap',
        }, function(){
          schedule.set_base('longtap', STATUS.start);
        }, function (){});
      }

      // 设置longtap end timer
      longtap_ids.forEach(function(longtap_id){
        self.start(longtap_id, schedule.base[longtap_id].threshold);
      });
    });
  }else

  if(name.indexOf('longtap') === 0){
    _delay = delay;
    _warp_callback(function(){
      start_bus_bubble({
        type: 'longtap',
      }, function(){
        schedule.set_base(name, STATUS.end);
        schedule.set_base('tap', STATUS.cancel);
      }, function (){});
    });
  }else

  if(name === 'group_gap') {
    _delay = 300;
    _warp_callback(group_gap_trigger);
  }

  return this.list[name] = setTimeout(_callback, _delay);
};

export default TimerController;