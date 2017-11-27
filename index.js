


export function addEvent($dom, type, config){

  //初始化dom里面的储存结构
  if($dom.__event === undefined){
    $dom.__event = {
      list: {

      }
    };

    $dom.addEventListener('touchstart', _touchstart, false);
    $dom.addEventListener('touchmove', _touchmove, false);
    $dom.addEventListener('touchend', _touchend, false);
    $dom.addEventListener('touchcancel', _touchcancel, false);
  }

  //添加事件配置

  //初始化对应的数组
  //TODO: 想一个把这类初始化可以变得优雅的方式,还有长长链
  if($dom.__event.list[type] === undefined){
    $dom.__event.list[type] = [config];
  }else{
    $dom.__event.list[type].push(config);
  }
}

// 内部实现

var _schedule = {
  base: null,
  group: null
};
var _triggerlist;
var _bubble_started = false;
var _dom_involved;// [], order from bubble start to end
var _last_dom_involved;


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

function _touchstart (evt){
  _triggerbubble(this, evt);
}

function _touchmove(evt){
  _triggerbubble(this, evt);
}

function _touchend(evt){
  _triggerbubble(this, evt);
}

function _touchcancel(evt){
  _triggerbubble(this, evt);
}

function _bubblestart(evt){
  //尝试去触发groupstart
  if(evt.touches.length === 1 && evt.type === 'touchstart'){
    _groupstart(evt);
  }

  //事件发生源,生成triggerlist


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
    var list = $dom.__event.list;
    for(var event in list){
      if(event === 'group'){
        list[event].forEach(function(config){
          _schedule.group[_getEventId(event, config)] = {
            status: _STATUS_INIT
          };
        });
      }else{
        list[event].forEach(function(config){

          if(typeof config.repeat === 'number' && config.repeat > 1){
            // 将会由group来实现
            _schedule.group[_getEventId(event, config)] = {
              status: _STATUS_INIT
            };
          }else{

            // 其实直接写入好了,不需要做重复的判断
            if(_EVENT[event].on === _ON_FINGER){
              //仅仅处理on finger的手势类就行了
              if(_EVENT[event].type === _TYPE_MONENT){
                //离散事件
                var data = {
                  status: _STATUS_INIT,
                  finger: 1
                };
                
                if(event === 'longtap')
                  _schedule.base[event+'-'+config.longtapThreshold] = data;
                else
                  _schedule.base[event] = data;

              }else if(_EVENT[event].type === _TYPE_CONTINUOUS){
                //连续事件
                _schedule.base[event] = {
                  status: _STATUS_INIT,
                  finger: 1,
                  startWidth: null,
                  endWidth: null
                };
              }
            }
          }
        });
      }
    }
  });
}

function _groupend(evt){

}

function _triggerbubble($nowDom, evt){
  if(_bubble_started === false){
    _bubble_started = true;
    _bubblestart(evt);
  }
  if(_bubble_started === true && $nowDom === _last_dom_involved){
    _bubble_started = false;
    _bubbleend(evt);
  }
}


//工具函数
function _getEventId(event, config){
  //突然发现基事件,其实就是一个group..靠
  if(event === 'group'){
    //group

  }else{

    //repeat
    if(typeof config.repeat === 'number' && config.repeat > 1){
      //longtap

      //其他

    }else{
      //longtap

      //其他
      
    }

  }

  
  return ;

}