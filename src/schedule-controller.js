import {
  EVENT,
  TYPE_CONTINUOUS,
  EVENT_STATUS
} from './define';
import { get_type_id } from './tool';

function ScheduleController(){
  this.base         = {};
  this.group        = {};
  this.updated_base = [];
}

ScheduleController.prototype.set_base = function(type, set_status){
  var status;
  if(this.base[type] !== undefined){
    status = this.base[type].status;

    // 设置init
    if (set_status === EVENT_STATUS.init && status !== EVENT_STATUS.end) {
      this.base[type].status = EVENT_STATUS.init;
      return;
    }

    if (
      // 设置start
      (
        set_status === EVENT_STATUS.start && status === EVENT_STATUS.init
      ) ||
      // 设置move
      (
        set_status === EVENT_STATUS.move &&
        (status === EVENT_STATUS.start || status === EVENT_STATUS.move)
      ) ||
      // 设置end
      (
        set_status === EVENT_STATUS.end &&
        (status === EVENT_STATUS.start || status === EVENT_STATUS.move)
      ) ||
      // 设置cancel
      (
        set_status === EVENT_STATUS.cancel &&
        (status === EVENT_STATUS.start || status === EVENT_STATUS.move)
      )
    ) {
      this.base[type].status = set_status;
      this.updated_base.push(type);
    }
  } else if(type === 'longtap'){
    //longtap仅仅允许做start/cancel的操作了, 不会包含longtap_debounce, 因为不是基事件来的

    for (let id in this.base) {
      status = this.base[id].status;

      if(id.indexOf('longtap') === 0){
        if(
          (status === EVENT_STATUS.init && set_status === EVENT_STATUS.cancel) ||
          (status === EVENT_STATUS.end && set_status === EVENT_STATUS.cancel) ||
          (status === EVENT_STATUS.init && set_status === EVENT_STATUS.end)
        )
          return;

        this.base[id].status = set_status;
        this.updated_base.push(id);
      }
    }
  }
};


ScheduleController.prototype.commit_to_group = function(current_process){
  var need_to_commit = false;
  for(var gourpid in this.group) {
    let group = this.group[gourpid];
    if (
      group.status === current_process &&
      this.base[get_type_id(group.group[current_process])].status === EVENT_STATUS.end
    ) {
      group.status++;
      need_to_commit = true;
      
    }
  }
  return need_to_commit;
};

ScheduleController.prototype.empty_base = function(){
  this.base = {};
};

ScheduleController.prototype.empty_group = function(){
  this.group = {};
};

ScheduleController.prototype.write_base = function(config){
  var type = config.type;

  //特殊处理longtap
  if(type === 'longtap'){
    if(this.base[type+'_'+config.longtapThreshold] === undefined){
      this.base[type+'_'+config.longtapThreshold] = {
        status: EVENT_STATUS.init,
        threshold: config.longtapThreshold
      };
    }
  }else if(this.base[type] === undefined){
    this.base[type] = {
      status: EVENT_STATUS.init
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
      status: EVENT_STATUS.init,
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

ScheduleController.prototype.get_base_of_groupId = function(groupId){
  return this.base[get_type_id(this.get_base_config_of_groupId(groupId))];
};

ScheduleController.prototype.get_base_config_of_groupId = function(groupId){
  var group = this.group[groupId];

  if (group.status >= 0) {
    return group.group[group.status];
  } else {
    return group.group[group.group.length-1];
  }
};

ScheduleController.prototype.empty_updated_base = function(){
  this.updated_base = [];
};


export default ScheduleController;