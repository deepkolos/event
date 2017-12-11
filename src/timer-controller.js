import { setTimeout } from "core-js/library/web/timers";
import { clearTimeout } from "timers";
import { STATUS_START, STATUS_END} from './define';
import {
  schedule,
  triggerlist,/* eslint no-unused-vars: 0 */
  start_bus_bubble
} from './index';

export function TimerController(){
  //储存引用
  // this.longtap_debounce = null;
  this.list = {};
}

TimerController.prototype.stop = function(name){
  if(this.list[name] !== null)
    return clearTimeout(this.list[name]);
};

TimerController.prototype.start = function(name, delay){
  var _callback;
  var _delay;
  var self = this;

  function _warp_callback(func){
    _callback = function(){
      func();
      this.list[name] = null;
    };
  }

  //一些预设的timer定义,一些执行流的定义不应该嵌套到其他的执行流当中的
  if(name === 'longtap_debounce'){
    _delay = delay || 20;
    _warp_callback(function(){
      var longtap_ids = [];

      for(let base_name in schedule.base){
        if(base_name.indexOf('longtap') === 0 ){
          longtap_ids.push(base_name);
        }
      }
  
      start_bus_bubble({
        type: 'longtap',
        status: STATUS_START,
        name: 'longtap'
      });
      
      // 设置longtap end timer
      longtap_ids.forEach(function(longtap_id){
        self.start(longtap_id, schedule.base[longtap_id].threshold);
      });
    });
  }else if(name.indexOf('longtap') === 0){
    _delay = delay;
    _warp_callback(function(){
      start_bus_bubble({
        type: 'longtap',
        status: STATUS_END,
        name: name
      });
    });
  }

  return this.list[name] = setTimeout(_callback, _delay);
};