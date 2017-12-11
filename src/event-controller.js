import { make_flat_group} from './tool';
import { _get_group_Id } from './index';
import {
  EVENT,
  ON_FINGER,
} from './define';

function EventController(info){
  this.info = info;
}

EventController.prototype.enable = function(){
  //不需要同步到group
  this.info.config.disable = false;
};

EventController.prototype.disable = function(){
  this.info.config.disable = true;
};

EventController.prototype.set = function(key, value){
  var need_to_sync_key = [
    'finger',
    'startWidth',
    'endWidth',
    'group',
    'repeat'
  ];
  this.info.config[key] = value;

  //同步更新group
  if(need_to_sync_key.indexOf(key) > -1){
    this.info.group = make_flat_group(this.info.config);
    this.info.groupId = _get_group_Id(this.info.group);
  }
};

EventController.prototype.removeEvent = function(){
  var id = this.info.id;
  var type = this.info.config.type;
  var on_which = EVENT[type].on;
  var $dom = this.info.$dom;

  if(on_which === ON_FINGER)
    delete $dom.__event.list[on_which][id];
  else
    delete $dom.__event.list[on_which][type][id];  
};