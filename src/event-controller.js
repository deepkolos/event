import { _make_flat_group} from './tool';
import { _get_group_Id } from './index';
import {
  _EVENT,
  _ON_FINGER,
} from './define';

function EventController(info){
  this._info = info;
}

EventController.prototype.enable = function(){
  //不需要同步到group
  this._info.config.disable = false;
};

EventController.prototype.disable = function(){
  this._info.config.disable = true;
};

EventController.prototype.set = function(key, value){
  var need_to_sync_key = [
    'finger',
    'startWidth',
    'endWidth',
    'group',
    'repeat'
  ];
  this._info.config[key] = value;

  //同步更新group
  if(need_to_sync_key.indexOf(key) > -1){
    this._info.group = _make_flat_group(this._info.config);
    this._info.groupId = _get_group_Id(this._info.group);
  }
};

EventController.prototype.removeEvent = function(){
  var id = this._info.id;
  var type = this._info.config.type;
  var on_which = _EVENT[type].on;
  var $dom = this._info.$dom;

  if(on_which === _ON_FINGER)
    delete $dom.__event.list[on_which][id];
  else
    delete $dom.__event.list[on_which][type][id];  
};