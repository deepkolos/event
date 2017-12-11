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
      // 更新所有longtap的状态
      for(var name in schedule.base){
        if(name.indexOf('longtap') === 0 ){
          schedule.base[name].status = STATUS_START;
          longtap_ids.push(name);
        }
      }
      
      // 更新triggerlist
      triggerlist = longtap_ids;
  
      // 触发一个longtap start 的冒泡
      start_bus_bubble({
        type: 'longtap'
      });
      
      // 设置longtap end timer,这个循环还是不提前了,复用了,行为上面不合理感觉
      longtap_ids.forEach(function(longtap_id){
        self.start(longtap_id, schedule.base[longtap_id].threshold);
      });
    });
  }else if(name.indexOf('longtap') === 0){
    _delay = delay;
    _warp_callback(function(){
      // 更新schedule的状态
      schedule.set_base(name, STATUS_END);

      // 更新triggerlist
      triggerlist = [name];

      // 触发一个longtap start 的冒泡即可
      start_bus_bubble({
        type: 'longtap'
      });
    });
  }

  return this.list[name] = setTimeout(_callback, _delay);
};