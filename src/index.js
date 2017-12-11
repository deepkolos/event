import { make_flat_group, get_base_id, get_group_Id } from './tool';
import { EventController } from './event-controller';
import { ScheduleController } from './schedule-controller';
import { TimerController } from './timer-controller';
import {
  EVENT,

  STATUS_INIT,
  STATUS_START,
  STATUS_MOVE,
  STATUS_END,
  STATUS_CANCEL,

  ON_FINGER,
  ON_DOM,
  ON_EVENT,

  TYPE_UNKNOW,/* eslint no-unused-vars: 0 */
  TYPE_CONTINUOUS,
  TYPE_MONENT,/* eslint no-unused-vars: 0 */
  DEFAULT_LONGTAP_THRESHOLD
} from './define';


function addEvent($dom, config={}){
  var type = config.type;

  if(type === undefined || EVENT[type] === undefined)
    throw '请配置事件的type,或者检查拼写正确';

  var on_which = EVENT[type].on;
  
  //初始化dom里面的储存结构
  if($dom.__event === undefined){
    $dom.__event = {
      list: {
        [ON_DOM]: {},
        [ON_EVENT]: {},
        [ON_FINGER]: {}
      },
      IDGenerator: new IDGenerator()
    };

    $dom.addEventListener('touchstart', bus, false);
    $dom.addEventListener('touchmove', bus, false);
    $dom.addEventListener('touchend', bus, false);
    $dom.addEventListener('touchcancel', bus, false);

    $dom.__event.bus = bus.bind($dom);
  }

  //设置一些默认值
  if(type === 'longtap'){
    if(config.longtapThreshold === undefined)
      config.longtapThreshold = DEFAULT_LONGTAP_THRESHOLD;
  }

  var list = $dom.__event.list;
  var IDGenerator = $dom.__event.IDGenerator;
  var newId = $dom.__event.IDGenerator.new();
  var group, _info;

  //添加事件配置
  if(EVENT[type].on === ON_FINGER){
    //finger需要打扁
    group = make_flat_group(config);

    //基事件需要被转化为单个的group
    _info = {
      id: newId,
      $dom: $dom,
      config: config,
      group: group,
      groupId: get_group_Id(group)
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

var schedule = new ScheduleController();
var triggerlist; // []
var dom_involved;// [] order from bubble start to end
var bubble_started = false;
var last_dom_involved;
var group_progress = 0;
var during_gap = false;
var actived_finger_num = 0;
var timer = new TimerController(schedule, start_bus_bubble);

function bus(evt){
  var $dom = this;
  // 原生事件,定时器事件都走这个bus
  triggerbubble(this, evt);

  // 消化triggerlist
  triggerlist.forEach(function(id){
    // triggerlist仅仅包含gourp了

  });
}

function triggerbubble($nowDom, evt){
  if(bubble_started === false){
    bubble_started = true;
    bubblestart(evt);
  }
  if(bubble_started === true && $nowDom === last_dom_involved){
    //不过一般一个bubble的执行时间不会那么长的,不过如果使用了模版编译之类的,就有可能很长时间,
    //本来打算使用一个frame的时间结束所谓end的,还是不行,行为就不同了
    bubble_started = false;
    bubbleend(evt);
  }
}

function bubblestart(evt){
  //尝试去触发groupstart
  if(evt.touches.length === 1 && evt.type === 'touchstart'){
    groupstart(evt);
  }

  //更新基事件的
  update_base_status(evt);

  //事件发生源,生成triggerlist
  update_triggerlist(evt);

}

function bubbleend(evt){
  //尝试去触发groupsend
  if(evt.touches.length === 1 && evt.type === 'touchend'){
    groupend(evt);
  }
}

function groupstart(evt){
  //初始化这次group涉及涉及的dom
  dom_involved = [];
  evt.path.forEach(function($dom){
    if($dom.__event !== undefined){
      dom_involved.push($dom);
    }
  });
  last_dom_involved = dom_involved[dom_involved.length-1];

  //判断是否重新schedule
  
  //生成schedule
  dom_involved.forEach(function($dom){
    var groups = $dom.__event.list[ON_FINGER];
    var info, base;

    //需要判断是否需要重新生成group
    if(check_need_of_regenerate_gourp())
      for(let id in groups)
        schedule.write_group(groups[id]);

    //根据现在的group,初始化base
    //每次都会清空状态
    schedule.empty_base();

    //更具目前group的进度去初始化
    for(let id in schedule.group){
      base = schedule.group[id].group[group_progress];
      //基事件使用type->的映射就可以了,细微的状态更新方便
      schedule.write_base(base);
      if(base.after !== undefined)
        schedule.write_base(base.after);
    }
    
    //初始化完毕
    
  });
}

function groupend(evt){

}


//工具函数, 不过不太适合拆分到tool里面
function check_need_of_regenerate_gourp(){
  //判断标准是是否目前group有中间状态,并且是否在gap的期间
  if(during_gap === false)
    return true;
  
  //检查是否有中间状态
  var group;
  for(let id in schedule.group){
    group = schedule.group[id];

    //group的规则和base的规则有区别,在_STATUS_的部分是指向对应group末尾事件的触发
    //其中的到因为触发groupend的时候,状态都会被更新到cancel/end,所以不会出现start/move的情况
    if(group.status > 0)
      return true;
  }
}

function start_bus_bubble(evt){
  bubblestart(evt);

  dom_involved.forEach(function($dom){
    $dom.__event.bus(evt);
  });
}

function update_base_status(evt){
  //这里是同一的分发,感觉需要做一个函数分发,阅读起来好一些
  switch (evt.type){
  case 'touchstart':
    touchstart(evt);
    break;

  case 'touchmove':
    touchmove(evt);
    break;

  case 'touchend':
    touchend(evt);
    break;

  case 'touchcancel':
    touchcancel(evt);
    break;

  case 'longtap':
    longtap(evt);
    break;
  }
}

function update_triggerlist(evt){
  // 嗯这样逻辑就统一了
  // 根据目前的base状态去做把适合的group导出出来咯
  // 我需要想一下这个时候的group的结构,记得是经过扁平化的
  
  // goroup的触发的规则
  // 先找出这次满足触发条件的,group
  
  // 找出可能符合进阶的group
  // group之前的触发规则也是在这里做

}

//update trigger status, 这里仅仅做更新triggerlist
function touchstart (evt){
  var touch_num = evt.touches.length;
  //更新finger信息
  actived_finger_num = Math.max(actived_finger_num, touch_num);

  //更新tap status->start
  if(touch_num === 1)
    schedule.set_base('tap', STATUS_START);

  //longtap 的16ms的定时器
  timer.start('longtap_debounce');
}

function touchmove(evt){
  triggerlist = [];
  schedule.set_base('tap', STATUS_CANCEL);
  schedule.set_base('longtap', STATUS_CANCEL);
  schedule.set_base('swipe', STATUS_START);
  schedule.set_base('swipe', STATUS_MOVE);

  if(evt.touches.length > 1){
    schedule.set_base('pinch', STATUS_START);
    schedule.set_base('rotate', STATUS_MOVE);
  }
}

function touchend(evt){
  if(evt.touches.length === 1)
    schedule.set_base('tap', STATUS_END);
}

function touchcancel(evt){
  // 目前还不是很清楚touchcancel的触发时机, MDN也就简单说创建了太多的触控点, 会触发,但是还是不清楚
  console.log(evt);
}

function longtap(evt){
  schedule.set_base(evt.name, evt.status);
}

export default addEvent;
export { schedule, start_bus_bubble, addEvent };