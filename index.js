import { Object, setTimeout } from "core-js/library/web/timers";
import { clearTimeout } from "timers";



export function addEvent($dom, config={}){
  var type = config.type;

  if(type === undefined || _EVENT[type] === undefined)
    throw '请配置事件的type,或者检查拼写正确';

  var on_which = _EVENT[type].on;
  
  //初始化dom里面的储存结构
  if($dom.__event === undefined){
    $dom.__event = {
      list: {
        [_ON_DOM]: {},
        [_ON_EVENT]: {},
        [_ON_FINGER]: {}
      },
      IDGenerator: new IDGenerator()
    };

    $dom.addEventListener('touchstart', _bus, false);
    $dom.addEventListener('touchmove', _bus, false);
    $dom.addEventListener('touchend', _bus, false);
    $dom.addEventListener('touchcancel', _bus, false);

    $dom.__event.bus = _bus.bind($dom);
  }

  //设置一些默认值
  if(type === 'longtap'){
    if(config.longtapThreshold === undefined)
      config.longtapThreshold = _DEFAULT_LONGTAP_THRESHOLD;
  }

  var list = $dom.__event.list;
  var IDGenerator = $dom.__event.IDGenerator;
  var newId = $dom.__event.IDGenerator.new();
  var group, _info;

  //添加事件配置
  if(_EVENT[type].on === _ON_FINGER){
    //finger需要打扁
    group = _make_flat_group(config);

    //基事件需要被转化为单个的group
    _info = {
      id: newId,
      $dom: $dom,
      config: config,
      group: group,
      groupId: _get_group_Id(group)
    };
    list[on_which][newId] = _info;
  }else{
    // dom/event的事件储存到树状结构
    if(list[on_which][type] === undefined)
      list[on_which][type] = {};

    // config是否都应该设置默认值?
    // 配置一定是需要配置上默认值,这样就可以实现配置和代码的分离了
    // 但是不同类别的又需要不同的默认配置就..唉心累啊
    _info = {
      id: newId,
      $dom: $dom,
      config: config
    };
    list[on_which][type][newId] = _info;
  }

  //返回controller
  return new EventController(_info);
}

// 内部实现

var _schedule = new _ScheduleController();
var _triggerlist;
var _bubble_started = false;
var _dom_involved;// [], order from bubble start to end
var _last_dom_involved;
var _group_progress = 0;
var _during_gap = false;
var _finger_on_screen_num = 0;
var _timer = new _TimerController();

const _DEFAULT_LONGTAP_THRESHOLD = 700;

const _TYPE_MONENT = 0;
const _TYPE_CONTINUOUS = 1;
const _TYPE_UNKNOW = 2;

const _ON_FINGER = 0;
const _ON_DOM = 1;
const _ON_EVENT = 2;

const _STATUS_INIT = 0;
const _STATUS_START = -1;
const _STATUS_END = -2;
const _STATUS_MOVE = -3;
const _STATUS_CANCEL = -4;
//正数用于gourp的进度

const _EVENT = {
  // 离散事件
  tap: {
    type: _TYPE_MONENT,
    on: _ON_FINGER
  },
  longtap: {
    type: _TYPE_MONENT,
    on: _ON_FINGER
  },

  //连续事件
  swipe: {
    type: _TYPE_CONTINUOUS,
    on: _ON_FINGER
  },
  pinch: {
    type: _TYPE_CONTINUOUS,
    on: _ON_FINGER
  },
  rotate: {
    type: _TYPE_CONTINUOUS,
    on: _ON_FINGER
  },
  //finger事件的自定义组合
  group: {
    type: _TYPE_UNKNOW,
    on: _ON_FINGER
  },

  //相对dom来说
  focus: {
    type: _TYPE_MONENT,
    on: _ON_DOM
  },
  blur: {
    type: _TYPE_MONENT,
    on: _ON_DOM
  },
  enter: {
    type: _TYPE_MONENT,
    on: _ON_DOM
  },
  leave: {
    type: _TYPE_MONENT,
    on: _ON_DOM
  },
  over: {
    type: _TYPE_CONTINUOUS,
    on: _ON_DOM
  },

  //对事件的继续分化事件
  groupstart: {
    type: _TYPE_MONENT,
    on: _ON_EVENT
  },
  groupend: {
    type: _TYPE_MONENT,
    on: _ON_EVENT
  },
  bubblestart: {
    type: _TYPE_MONENT,
    on: _ON_EVENT
  },
  bubbleend: {
    type: _TYPE_MONENT,
    on: _ON_EVENT
  }
};

function _bus(evt){
  // 原生事件,定时器事件都走这个bus
  _triggerbubble(this, evt);
}

function _triggerbubble($nowDom, evt){
  if(_bubble_started === false){
    _bubble_started = true;
    _bubblestart(evt);
  }
  if(_bubble_started === true && $nowDom === _last_dom_involved){
    //不过一般一个bubble的执行时间不会那么长的,不过如果使用了模版编译之类的,就有可能很长时间,
    //本来打算使用一个frame的时间结束所谓end的,还是不行,行为就不同了
    _bubble_started = false;
    _bubbleend(evt);
  }
}

function _bubblestart(evt){
  //尝试去触发groupstart
  if(evt.touches.length === 1 && evt.type === 'touchstart'){
    _groupstart(evt);
  }

  //更新基事件的
  _update_base_status(evt);

  //事件发生源,生成triggerlist
  _update_triggerlist(evt);

}

function _bubbleend(evt){
  //尝试去触发groupsend
  if(evt.touches.length === 1 && evt.type === 'touchend'){
    _groupend(evt);
  }
}

function _groupstart(evt){
  //初始化这次group涉及涉及的dom
  _dom_involved = [];
  evt.path.forEach(function($dom){
    if($dom.__event !== undefined){
      _dom_involved.push($dom);
    }
  });
  _last_dom_involved = _dom_involved[_dom_involved.length-1];

  //判断是否重新schedule
  
  //生成schedule
  _dom_involved.forEach(function($dom){
    var groups = $dom.__event.list[_ON_FINGER];
    var info, base;

    //需要判断是否需要重新生成group
    if(_check_need_of_regenerate_gourp())
      for(let id in groups){
        info = groups[id];
        if(_schedule.group[info.groupId] === undefined )
          _schedule.group[info.groupId] = {
            status: _STATUS_INIT,
            group: info.group
          };
      }

    //根据现在的group,初始化base
    //每次都会清空状态
    _schedule.base = {};
    //更具目前group的进度去初始化
    for(let id in _schedule.group){
      base = _schedule.group[id].group[_group_progress];
      //基事件使用type->的映射就可以了,细微的状态更新方便
      _write_base(base);
      if(base.after !== undefined)
        _write_base(base.after);
    }
    
    //初始化完毕
    
  });
}

function _groupend(evt){

}


//工具函数
function _get_base_id(config){
  var type = _EVENT[config.type].type;
  var opts = [
    {
      key: 'finger',
      value: config.finger
    }
  ];
  var opts_string = [];
  var after = '';

  opts.push();

  if(type === _TYPE_CONTINUOUS){
    opts.push({
      key: 'startWidth',
      value: config.startWidth
    });
    opts.push({
      key: 'endWidth',
      value: config.endWidth
    });
  }

  if(config.type === 'longtap'){
    opts.push({
      key: 'longtapThreshold',
      value: config.longtapThreshold
    });
  }

  if(config.after !== undefined){
    after = _get_base_id(config.after);
  }

  opts.forEach(function(opt){
    opts_string.push(`${opt.key}=${opt.value}`);
  });

  return `${config.type}[${opts_string.join(',')}]{${after}}`;
}

function _get_group_Id(config){
  var opts_string = [];

  config.group.forEach(function(baseconfig){
    opts_string.push(_get_base_id(baseconfig));
  });

  return opts_string.join(',');
}

function _make_flat_base(config){
  var repeat = config.repeat || 1;
  var result = [];

  if(repeat !== undefined && repeat > 1){
    for(var i = 0; i < repeat; i++){
      result.push(Object.assign({}, config));
    }
  }
  return result;
}

function _make_flat_group(config){
  if(config.group === undefined || config.group instanceof Array === false)
    return console.log('group配置有误');
  
  var result = [];

  if(config.type !== 'group')
    return _make_flat_base(config);
  
  config.group.forEach(function(baseconfig){
    if(baseconfig.type === 'group')
      _make_flat_group(baseconfig).forEach(function(item){
        result.push(item);
      });
    else
      _make_flat_base(baseconfig).forEach(function(item){
        result.push(item);
      });
  });

  return result;
}

function _write_base(config){
  var type = config.type;
  
  //特殊处理longtap
  if(config.type === 'longtap'){
    if(_schedule.base[type+'_'+config.longtapThreshold] === undefined){
      _schedule.base[type] = {
        status: _STATUS_INIT,
        finger: undefined,
        threshold: config.longtapThreshold
      };
    }
  }else if(_schedule.base[type] === undefined){
    _schedule.base[type] = {
      status: _STATUS_INIT,
      finger: undefined
    };

    if(_EVENT[type].type === _TYPE_CONTINUOUS){
      _schedule.base[type].startWidth = undefined;
      _schedule.base[type].endWidth = undefined;
    }
  }
}

function _check_need_of_regenerate_gourp(){
  //判断标准是是否目前group有中间状态,并且是否在gap的期间
  if(_during_gap === false)
    return true;
  
  //检查是否有中间状态
  var group;
  for(let id in _schedule.group){
    group = _schedule.group[id];

    //group的规则和base的规则有区别,在_STATUS_的部分是指向对应group末尾事件的触发
    //其中的到因为触发groupend的时候,状态都会被更新到cancel/end,所以不会出现start/move的情况
    if(group.status > 0)
      return true;
  }
}

function _start_bus_bubble(evt){
  _bubblestart(evt);

  _dom_involved.forEach(function($dom){
    $dom.__event.bus(evt);
  });
}

function _update_base_status(evt){
  //这里是同一的分发,感觉需要做一个函数分发,阅读起来好一些
  switch (evt.type){
  case 'touchstart':
    _touchstart(evt);
    break;

  case 'touchmove':
    _touchmove(evt);
    break;

  case 'touchend':
    _touchend(evt);
    break;

  case 'touchcancel':
    _touchcancel(evt);
    break;

  case 'longtap':
    _longtap(evt);
    break;
  }
}

function _update_triggerlist(evt){
  
}

//update status trigger
function _touchstart (evt){
  //更新finger信息
  _finger_on_screen_num++;

  //更新tap status->start
  _schedule.set_base('tap', _STATUS_START);

  //longtap 的16ms的定时器
  _timer.start('longtap_debounce');
}

function _touchmove(evt){
  // 需要检测目前的状态,如果是触发tap的cancal,基本上每次都会去触发的了
  // longtap就会触发这个cancal,所以这个cancel,tap会触发两次,所以是否有需要触发一下呢
  _triggerlist = [];
  _trigger('tap', _STATUS_CANCEL);
  _trigger('longtap', _STATUS_CANCEL);
  _trigger('swipe', _STATUS_START);
  _trigger('swipe', _STATUS_MOVE);
}

function _touchend(evt){
  
}

function _touchcancel(evt){
  
}

function _longtap(evt){

}

function _trigger(type, set_status){
  var status;
  if(_schedule.base[type]){
    status = _schedule.base[type].status;

    if(set_status === _STATUS_INIT)
      throw 'init不应该触发事件的';

    if(set_status === _STATUS_MOVE){
      _schedule.set_base(type, set_status);
      _triggerlist.push(type);
    }else{
      if(status === _STATUS_INIT && set_status === _STATUS_CANCEL)
        return;

      if(type === 'longtap' && set_status === _STATUS_CANCEL){
        //longtap仅仅允许做cancel的操作了

        _schedule.base.forEach(function(id){
          status = _schedule.base[id].status;

          if(id.indexOf('longtap') === 0 && status !== set_status){
            _schedule.set_base(type, set_status);
            _triggerlist.push(type);
          }
        });
        return;
      }

      //start/end/cancel
      if(status !== set_status){
        _schedule.set_base(type, set_status);
        _triggerlist.push(type);
      }
    }
  }
}

//类的定义

//目前先一个文件内编写,之后再做拆分
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



function IDGenerator(){
  this._id = 0;
}

IDGenerator.prototype.new = function(){
  return this._id++;
};


function _ScheduleController(){
  this.base = null;
  this.group = null;
}

_ScheduleController.prototype.set_base = function(name, status){
  if(this.base[name] !== undefined)
    this.base[name].status = status;
};

_ScheduleController.prototype.commit_to_group = function(){
  
};

_ScheduleController.prototype.set_longtap = function(status){
  for(var name in this.base){
    if(name.indexOf('longtap') === 0 ){
      this.base[name].status = status;
    }
  }
};

function _TimerController(){
  //储存引用
  // this.longtap_debounce = null;
  this.list = {};
}

_TimerController.prototype.start = function(name, delay){
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
      for(var name in _schedule.base){
        if(name.indexOf('longtap') === 0 ){
          _schedule.base[name].status = _STATUS_START;
          longtap_ids.push(name);
        }
      }
      
      // 更新triggerlist
      _triggerlist = longtap_ids;
  
      // 触发一个longtap start 的冒泡
      _start_bus_bubble({
        type: 'longtap'
      });
      
      // 设置longtap end timer,这个循环还是不提前了,复用了,行为上面不合理感觉
      longtap_ids.forEach(function(longtap_id){
        self.start(longtap_id, _schedule.base[longtap_id].threshold);
      });
    });
  }else if(name.indexOf('longtap') === 0){
    _delay = delay;
    _warp_callback(function(){
      // 更新schedule的状态
      _schedule.set_base(name, _STATUS_END);

      // 更新triggerlist
      _triggerlist = [name];

      // 触发一个longtap start 的冒泡即可
      _start_bus_bubble({
        type: 'longtap'
      });
    });
  }

  return this.list[name] = setTimeout(_callback, _delay);
};

_TimerController.prototype.stop = function(name){
  if(this.list[name] !== null)
    return clearTimeout(this.list[name]);
};