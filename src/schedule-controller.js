import {
  EVENT,
  STATUS,
  TYPE_CONTINUOUS
} from './define';

function ScheduleController(){
  this.base         = {};
  this.group        = {};
  this.updated_base = [];
}

ScheduleController.prototype.set_base = function(type, set_status){
  var status;
  if (this.base[type] !== undefined) {
    status = this.base[type].status;

    // 设置init
    if (set_status === STATUS.init && status !== STATUS.end) {
      this.base[type].status = STATUS.init;
      return;
    }

    if (
      // 设置start
      (
        set_status === STATUS.start && status === STATUS.init
      ) ||
      // 设置move
      (
        set_status === STATUS.move &&
        (status === STATUS.start || status === STATUS.move)
      ) ||
      // 设置end
      (
        set_status === STATUS.end &&
        (status === STATUS.start || status === STATUS.move)
      ) ||
      // 设置cancel
      (
        set_status === STATUS.cancel &&
        (status === STATUS.start || status === STATUS.move)
      )
    ) {
      this.base[type].status = set_status;
      this.updated_base.push(type);
    }
  } else 
  
  if (type === 'longtap') {
    //longtap仅仅允许做start/cancel的操作了, 不会包含longtap_debounce, 因为不是基事件来的

    for (let id in this.base) {
      status = this.base[id].status;

      if(id.indexOf('longtap') === 0){
        if(
          (status === STATUS.init && set_status === STATUS.cancel) ||
          (status === STATUS.end && set_status === STATUS.cancel) ||
          (status === STATUS.init && set_status === STATUS.end)
        )
          return;

        this.base[id].status = set_status;
        this.updated_base.push(id);
      }
    }
  }
};

ScheduleController.prototype.commit_to_group = function(current_process, actived_finger_num){
  var need_to_commit = false;
  
  for(var gourpid in this.group) {
    let group = this.group[gourpid];
    let base_config = group.group[current_process];

    if (
      group.status === current_process &&
      current_process < group.group.length - 1 &&
      this.base[group.group[current_process].type_id].status === STATUS.end
    ) {
      // 打补丁了, 唉
      if (base_config.type === 'tap' || base_config.type === 'longtap')
        if (base_config.finger !== actived_finger_num)
          continue;

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

  // 特殊处理longtap
  if(type === 'longtap'){
    if(this.base[type+'_'+config.longtapThreshold] === undefined){
      this.base[type+'_'+config.longtapThreshold] = {
        status: STATUS.init,
        threshold: config.longtapThreshold
      };
    }
  }else 

  // 特殊处理continuous, 允许finger之间是互斥的, 如果有设置的话
  if (EVENT[type].type === TYPE_CONTINUOUS && config.finger !== undefined) {
    if (this.base[type+'_'+config.finger] === undefined) {
      this.base[type+'_'+config.finger] = {
        status:    STATUS.init,
        endWith:   undefined,
        startWith: undefined
      };
    }
  } else
  
  // 一般的处理, 包括没有设置finger的continuous
  if(this.base[type] === undefined){
    this.base[type] = {
      status: STATUS.init
    };

    if(EVENT[type].type === TYPE_CONTINUOUS){
      this.base[type].startWith = undefined;
      this.base[type].endWith = undefined;
    }
  }
};

ScheduleController.prototype.write_group = function(config){
  if(this.group[config.groupId] === undefined )
    this.group[config.groupId] = {
      status: STATUS.init,
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
  return this.base[this.get_base_config_of_groupId(groupId).type_id];
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