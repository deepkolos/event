import {
  EVENT,
  TYPE_CONTINUOUS,
  STATUS_INIT,
  STATUS_MOVE,
  STATUS_CANCEL,
  STATUS_END
} from './define';
import { get_type_id } from './tool';


function ScheduleController(){
  this.base = null;
  this.group = null;
}

ScheduleController.prototype.set_base = function(type, set_status){
  var status;
  if(this.base[type]){
    status = this.base[type].status;

    if(set_status === STATUS_INIT)
      throw 'init不应该触发事件的';

    if(set_status === STATUS_MOVE){
      if(this.base[type] !== undefined)
        this.base[type].status = status;

    // 要求状态往前推进
    }else if(status > set_status){

      // 不允许init->cancel
      if(status === STATUS_INIT && set_status === STATUS_CANCEL)
        return;

      if(type === 'longtap'){
        //longtap仅仅允许做start/cancel的操作了, 不会包含longtap_debounce, 因为不是基事件来的

        this.base.forEach(function(id){
          status = this.base[id].status;

          if(id.indexOf('longtap') === 0 && status !== STATUS_INIT){
            if(this.base[type] !== undefined)
              this.base[type].status = status;
          }
        });
        return;
      }

      //start/end/cancel, 包括longtap_xxx
      if(this.base[type] !== undefined)
        this.base[type].status = status;
    }
  }
};

ScheduleController.prototype.commit_to_group = function(current_process){
  for(var gourpid in this.group) {
    let group = this.group[gourpid];

    if (
      group.status === current_process && 
      this.base[get_type_id(group.group[current_process])].status === STATUS_END
    ) {
      group.status++;
    }
  }
};

ScheduleController.prototype.empty_base = function(){
  this.base = {};
};

ScheduleController.prototype.write_base = function(config){
  var type = config.type;
  
  //特殊处理longtap
  if(config.type === 'longtap'){
    if(this.base[type+'_'+config.longtapThreshold] === undefined){
      this.base[type] = {
        status: STATUS_INIT,
        finger: undefined,
        threshold: config.longtapThreshold
      };
    }
  }else if(this.base[type] === undefined){
    this.base[type] = {
      status: STATUS_INIT,
      finger: undefined
    };
  }

  if(EVENT[type].type === TYPE_CONTINUOUS){
    this.base[type].startWith = undefined;
    this.base[type].endWith = undefined;
  }
};

ScheduleController.prototype.write_group = function(config){
  if(this.group[config.groupId] === undefined )
    this.group[config.groupId] = {
      status: STATUS_INIT,
      group: config.group
    };
};

ScheduleController.prototype.set_longtap = function(status){
  for(var name in this.base){
    if(name.indexOf('longtap') === 0 ){
      this.base[name].status = status;
    }
  }
};

export default ScheduleController;