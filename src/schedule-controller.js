import {
  EVENT,
  TYPE_CONTINUOUS,
  STATUS_INIT,
  STATUS_MOVE,
  STATUS_CANCEL,
  STATUS_END,
  STATUS_START
} from './define';
import { get_type_id } from './tool';


function ScheduleController(){
  this.base = {};
  this.group = {};
  this.updated_base = [];
}

ScheduleController.prototype.set_base = function(type, set_status){
  var status;
  if(this.base[type] !== undefined){
    status = this.base[type].status;

    // 设置init
    if (set_status === STATUS_INIT && status !== STATUS_END) {
      this.base[type].status = STATUS_INIT;
      return;
    }

    if (
      // 设置start
      (
        set_status === STATUS_START && status === STATUS_INIT
      ) ||
      // 设置move
      (
        set_status === STATUS_MOVE &&
        (status === STATUS_START || status === STATUS_MOVE)
      ) ||
      // 设置end
      (
        set_status === STATUS_END &&
        (status === STATUS_START || status === STATUS_MOVE)
      ) ||
      // 设置cancel
      (
        set_status === STATUS_CANCEL &&
        (status === STATUS_START || status === STATUS_MOVE)
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
          (status === STATUS_INIT && set_status === STATUS_CANCEL) ||
          (status === STATUS_END && set_status === STATUS_CANCEL) ||
          (status === STATUS_INIT && set_status === STATUS_END)
        )
          return;

        this.base[id].status = set_status;
        this.updated_base.push(id);
      }
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

ScheduleController.prototype.empty_group = function(){
  this.group = {};
};

ScheduleController.prototype.write_base = function(config){
  var type = config.type;

  //特殊处理longtap
  if(type === 'longtap'){
    if(this.base[type+'_'+config.longtapThreshold] === undefined){
      this.base[type+'_'+config.longtapThreshold] = {
        status: STATUS_INIT,
        threshold: config.longtapThreshold
      };
    }
  }else if(this.base[type] === undefined){
    this.base[type] = {
      status: STATUS_INIT
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