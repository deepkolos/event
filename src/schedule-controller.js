
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

ScheduleController.prototype.set_longtap = function(status){
  for(var name in this.base){
    if(name.indexOf('longtap') === 0 ){
      this.base[name].status = status;
    }
  }
};

export default ScheduleController;