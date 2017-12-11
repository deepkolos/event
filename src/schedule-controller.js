import {EVENT, TYPE_CONTINUOUS, STATUS_INIT} from './define';


function ScheduleController(){
  this.base = null;
  this.group = null;
}

ScheduleController.prototype.set_base = function(name, status){
  if(this.base[name] !== undefined)
    this.base[name].status = status;
};

ScheduleController.prototype.commit_to_group = function(){
  
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

    if(EVENT[type].type === TYPE_CONTINUOUS){
      this.base[type].startWidth = undefined;
      this.base[type].endWidth = undefined;
    }
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