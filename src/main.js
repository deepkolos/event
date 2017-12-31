import Info               from './info';
import IDGenerator        from './id-generator';
import TimerController    from './timer-controller';
import EventController    from './event-controller';
import ScheduleController from './schedule-controller';
import {
  get_avg,
  last_arr,
  init_when,
  clean_arr,
  get_rotate,
  parse_alias,
  get_type_id,
  get_group_Id,
  get_destance,
  config_equal,
  get_orthocenter,
  make_flat_group,
  get_swipe_offset,
  get_pinch_offset,
  get_rotate_offset,
  get_swipe_direction,
  get_pinch_direction,
  get_rotate_direction,
  get_points_from_fingers,
} from './tool';
import {
  EVENT,
  STATUS,

  ON_DOM,
  ON_EVENT,
  ON_FINGER,

  TYPE_MONENT,/* eslint no-unused-vars: 0 */
  TYPE_UNKNOW,/* eslint no-unused-vars: 0 */
  TYPE_CONTINUOUS,
  
  START_END_WITH,
  DEFAULT_TAP_FINGER,
  DEFAULT_LONGTAP_THRESHOLD
} from './define';

// 对外接口
function addEvent($dom, config = {}) {
  var type = config.type;

  // 处理alias
  parse_alias(config);

  if (type === undefined || EVENT[type] === undefined)
    throw '请配置事件的type,或者检查拼写正确';

  var on_which = EVENT[type].on;

  //初始化dom里面的储存结构
  if ($dom.__event === undefined) {
    $dom.__event = {
      list: {
        [ON_DOM]:     {},
        [ON_EVENT]:   {},
        [ON_FINGER]:  {}
      },
      IDGenerator: new IDGenerator()
    };

    $dom.addEventListener('touchstart',   bus, false);
    $dom.addEventListener('touchmove',    bus, false);
    $dom.addEventListener('touchend',     bus, false);
    $dom.addEventListener('touchcancel',  bus, false);

    $dom.__event.bus = bus.bind($dom);
  }

  var group, _info;
  var list  = $dom.__event.list;
  var newId = $dom.__event.IDGenerator.new();

  //设置一些默认值
  if (type === 'longtap') {
    if (config.longtapThreshold === undefined)
      config.longtapThreshold = DEFAULT_LONGTAP_THRESHOLD;
  }

  if (type === 'tap') {
    if (config.finger === undefined)
      config.finger = DEFAULT_TAP_FINGER;
  }

  init_when(config);

  //添加事件配置
  if (EVENT[type].on === ON_FINGER) {
    //finger需要打扁
    group = make_flat_group(config);

    //基事件需要被转化为单个的group
    _info = {
      id:       newId,
      $dom:     $dom,
      config:   config,
      group:    group,
      groupId:  get_group_Id(group)
    };
    list[on_which][newId] = _info;
  } else {
    // dom/event的事件储存到树状结构
    if (list[on_which][type] === undefined)
      list[on_which][type] = {};

    // config是否都应该设置默认值?
    // 配置一定是需要配置上默认值,这样就可以实现配置和代码的分离了
    // 但是不同类别的又需要不同的默认配置就..唉心累啊
    _info = {
      id:     newId,
      $dom:   $dom,
      config: config
    };
    list[on_which][type][newId] = _info;
  }

  //返回controller
  return new EventController(_info);
}

// 内部实现
var schedule = new ScheduleController();
var timer    = new TimerController(schedule, start_bus_bubble);

var max_group_len      = 0;
var group_progress     = 0;
var actived_finger_num = 0;
var lock_dom           = -1;     // 储存锁住的dom在dom_involved的引用
var triggerlist        = [];
var dom_involved       = [];     // order from bubble start to end
var group_gap_stack    = [];     // 储存groupid因为还有更长的group而已延迟触发的end事件
var last_dom_involved  = [];
var lock_status        = false;
var bubble_started     = false;
var evt_info           = null;

var cache = {
  start_points:        null,
  swipe_start_offset:  null,
  pinch_start_offset:  null,
  rotate_start_offset: null,
};

var evt_stack = {
  start: {
    increase: [],
    current:  null
  },
  move:  {
    last:     null,
    current:  null
  },
  continuous: {
    start:    null
  },
  end: []
};

var offset_stack = {
  swipe:  [],
  pinch:  [],
  rotate: []
};

// 核心流程
function bus(evt, usePatch) {
  var $dom = this;
  var dom_index = $dom.__event._tmp_index;

  if (bubble_started === false && usePatch !== true) {
    bubble_started = true;
    bubblestart(evt);
  }

  if (
    (
      // 锁的判断
      // 如果锁了的话, 仅仅触发lock的dom,在这个次bus中
      lock_status === true && dom_index === lock_dom 
    ) || (
      // 如果之前lock过, 仅仅触发index之后的
      lock_status === false && lock_dom !== -1 && dom_index > lock_dom
    ) || (
      lock_status === false && lock_dom === -1
    )
  ) {
    // 初始化evt_ctrl

    var evt_ctrl = {
      lock:             function(){
        lock_dom = dom_index;
        lock_status = true;
      },
      unlock:           function(){
        lock_status = false;
      },
      preventDefault:   function(){
        evt.preventDefault();
      },
      stopPropagation:  function(){
        evt.stopPropagation();
        bubble_started = false;
        bubbleend(evt);
      },
    };

    // 消化triggerlist
    // 这里的循环可以优化
    triggerlist.forEach(function (groupId) {
      // triggerlist仅仅包含gourp了
      var grouplist = $dom.__event.list[ON_FINGER];

      for (let id in grouplist) {
        let info = grouplist[id];
        if (info.groupId === groupId) {
          let group = schedule.group[groupId];
          let listener = info.config[STATUS[group.status]];

          if (info.config.disable !== true) {
            listener instanceof Function && listener.call($dom,
              evt_info,
              evt_ctrl
            );

            // start补一帧move, TYPE_CONTINUOUS的事件
            EVENT[group.group[group_progress].type].type === TYPE_CONTINUOUS &&
            group.status === STATUS.start &&
            info.config.move instanceof Function &&
              info.config.move.call($dom,
                evt_info,
                evt_ctrl
              );
          }
        }
      }
    });
  }

  if (
    bubble_started === true && 
    $dom === last_dom_involved && 
    usePatch !== true
  ) {
    //不过一般一个bubble的执行时间不会那么长的,不过如果使用了模版编译之类的,就有可能很长时间,
    //本来打算使用一个frame的时间结束所谓end的,还是不行,行为就不同了
    bubble_started = false;
    bubbleend(evt);
  }
}

function bubblestart(evt, patch) {
  var need_trigger_groupstart = false;

  triggerlist = [];
  
  schedule.empty_updated_base();
  //更新基事件的
  if (patch instanceof Function) {
    patch();
  } else {
    //尝试去触发groupstart
    if (evt.touches.length === 1 && evt.type === 'touchstart' && evt.type === 'touchstart') {
      groupstart(evt);

      need_trigger_groupstart = true;
    }
    update_base_status(evt);
  }

  evt_info = new Info();

  // 事件发生源,生成triggerlist
  update_triggerlist(evt);

  // 触发bubblestart
  dom_involved.forEach(function($dom){
    var bubbleEvent = $dom.__event[ON_EVENT].bubbleEvent;

    if (bubbleEvent) {
      for (var id in bubbleEvent) {
        bubbleEvent[id].config.start instanceof Function &&
          bubbleEvent[id].config.start.call($dom);
      }
    }
  });
  
  // 触发groupstart
  dom_involved.forEach(function($dom){
    var groupEvent = $dom.__event[ON_EVENT].groupEvent;

    if (groupEvent) {
      for (var id in groupEvent) {
        groupEvent[id].config.start instanceof Function &&
          groupEvent[id].config.start.call($dom);
      }
    }
  });
}

function bubbleend(evt, patch) {
  if (patch instanceof Function) {
    patch();
  } else {
    //尝试去触发groupsend
    if (evt.touches.length === 0 && evt.type === 'touchend') {
      groupend(evt);
    }
  }
}

function groupstart(evt) {
  //初始化这次group涉及涉及的dom
  dom_involved = [];
  actived_finger_num = 0;
  timer.stop('group_gap');
  var dom_index = 0;

  //推迟的group触发cancel
  group_gap_stack.forEach(function (groupId) {
    triggerlist.push(groupId);
    //并且设置cancel事件
    schedule.group[groupId].status = STATUS.cancel;
  });
  evt.path.forEach(function ($dom) {
    if ($dom.__event !== undefined) {
      dom_involved.push($dom);
      $dom.__event._tmp_index = dom_index++;
    }
  });
  last_dom_involved = dom_involved[dom_involved.length - 1];

  //每次都会清空状态
  schedule.empty_base();

  //需要判断是否需要重新生成group
  if (group_progress === 0) {
    schedule.empty_group();
    lock_dom    = -1;
    lock_status = false;
  }

  if(group_progress === 0) console.log('进度重置了');

  //生成schedule
  dom_involved.forEach(function ($dom) {
    var groups = $dom.__event.list[ON_FINGER];
    var base;

    if (group_progress === 0) {
      for (let id in groups)
        schedule.write_group(groups[id]);
    }

    //根据目前group的进度去初始化
    for (let id in schedule.group) {
      if(schedule.group[id].group.length > group_progress) {
        base = schedule.group[id].group[group_progress];
        //基事件使用type->的映射就可以了,细微的状态更新方便
        schedule.write_base(base);
        base.when !== undefined && 
          schedule.write_base(base.when);
      }
    }
  });
}

function groupend(evt) {
  if (schedule.commit_to_group(group_progress)) {
    group_progress++;
    timer.start('group_gap');
  } else {
    reset();
  }
}

function group_gap_trigger() {
  start_bus_bubble({
    type: 'group_gap'
  }, function(){}, function(){
    reset();
    console.log('group_gap 重置进度');
  }, function(){
    // debugger;
    triggerlist = group_gap_stack;
    group_gap_stack = [];//虽然js内置的堆栈的操作,但是在代码的语义上面欠缺
  });
}


// 工具函数, 不过不太适合拆分到tool里面
function start_bus_bubble(evt, startPatch, endPatch, triggerListPatch) {
  // debugger;
  bubblestart(evt, startPatch);

  triggerListPatch instanceof Function && triggerListPatch();

  dom_involved.forEach(function ($dom) {
    $dom.__event.bus(evt, startPatch !== undefined || endPatch !== undefined);
  });

  bubbleend(evt, endPatch);
}

function update_base_status(evt) {
  //这里是同一的分发,感觉需要做一个函数分发,阅读起来好一些
  switch (evt.type) {
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
  }
}

function update_triggerlist(evt) {
  // goroup的触发的规则
  max_group_len          = group_progress;
  var longer_groups      = [];
  var groupid_in_process = [];
  var tmp_len, group, base, base_config;

  // 找出max_group_len, 可以在groupstart的时候生成, 不过还是可以的
  if (schedule.updated_base.length !== 0) {
    for (let groupId in schedule.group) {
      group = schedule.group[groupId];
      if (
        group.status === group_progress ||
        group.status === STATUS.start ||
        group.status === STATUS.move
      ) {
        tmp_len = group.group.length - 1;

        if (tmp_len > max_group_len)
          max_group_len = tmp_len;

        if(tmp_len > group_progress)
          longer_groups.push(group);

        if(schedule.updated_base.includes(last_arr(1, group.group).type_id))
          groupid_in_process.push(groupId);
      }
    }
  }

  // 初始化更新base的相关信息
  update_base_info();

  // 更新triggerList,问题,在进度的状态不一定是这次bubble里修改的
  groupid_in_process.forEach(function (groupId) {
    group = schedule.group[groupId];

    // 同步base的状态到group里面
    if (
      group.status === group.group.length - 1 ||
      group.status === STATUS.start ||
      group.status === STATUS.move
    ) {
      base_config = schedule.get_base_config_of_groupId(groupId);
      base = schedule.get_base_of_groupId(groupId);

      if (base.status === STATUS.init)
        return;

      // 需要处理when, startWith, endWith, finger
      if (
        // startWith
        (
          base.status <= STATUS.start && 
          !config_equal(base.startWith, base_config.startWith)
        ) ||
        // endWith
        (
          base.status === STATUS.end &&
          !config_equal(base.endWith, base_config.endWith)
        ) ||
        // when
        (
          base_config.when instanceof Object && 
          test_when(base_config.when)
        ) || (
          base_config.when instanceof Array && 
          base_config.when.every(test_when)
        )
      ) {
        
        if(group.status === STATUS.start || group.status === STATUS.move) {
          group.status = STATUS.cancel;
        }

      } else {
        group.status = base.status;
      }

      if (
        base_config.finger !== undefined &&
        base_config.finger === get_current_finger(base, base_config, evt) || //longtap的自定义触发引用需要更换
        base_config.finger === undefined
      ) {
        
        //目前给设置了finger的continuous直接通过触发就好的了,感觉设计有问题,group_gap的问题
        if (EVENT[base_config.type].type === TYPE_CONTINUOUS && base_config === undefined) {

          // if (group.status === EVENT_STATUS.end) debugger;
          // 需要查看是否有更长的group, 是否还有机会触发
          if (group_progress < max_group_len && group.status === STATUS.end) {
            // 把这次的触发压到堆栈里面去
            if (longer_groups.some(function(group){
              // 相当于是提前检查一下了, 的确感觉会比较慢的感觉, 唉
              // get_type_id绝对有问题, 不应该这么频繁出现的
              var base_status = schedule.base[group.group[group_progress].type_id].status;
    
              return (
                base_status === STATUS.start ||
                base_status === STATUS.move ||
                base_status === STATUS.end
              );
            })) {
              group_gap_stack.push(groupId);
              return;
            }
          }
        }

        triggerlist.push(groupId);
      }
    }
  });
}

function update_base_info () {
  schedule.updated_base.forEach(function(type_id){
    var offset = offset_stack[type_id];
    var base   = schedule.base[type_id];
    var reduce = {
      swipe: function(sum, current){
        return {
          x: sum.x + current.x,
          y: sum.y + current.y};
      },
      pinch:  function(sum, current){return sum + current;},
      rotate: function(sum, current){return sum + current;}
    }; 

    function start_helper (type) {
      if (type_id.indexOf(type) === 0) {
        base.startWith = require('./tool')[`get_${type}_direction`](
          require('./tool')[`get_${type}_offset`](
            cache.start_points,
            get_points_from_fingers(evt_stack.move.current.touches),
            cache[`swipe_${type}_offset`]
          )
        );
      }
    }

    function end_helper (type) {
      if (type_id.indexOf('swipe') === 0) {
        if(type_id === 'swipe') {
          base.endWith = require('./tool')[`get_${type}_direction`](
            offset_stack[type].reduce(reduce[type])
          );
        } else {
          base.endWith = require('./tool')[`get_${type}_direction`](
            last_arr(1, offset_stack[type])
          );
        }
      }
    }

    if(base.status === STATUS.start) {
      // 生成startWidth
      start_helper('swipe');
      start_helper('pinch');
      start_helper('rotate');
    } else 
    
    if (base.status === STATUS.move || base.status === STATUS.start) {
      // continuous offset 更新栈顶的数据
      if (
        type_id.indexOf('swipe') === 0 ||
        type_id.indexOf('pinch') === 0 ||
        type_id.indexOf('rotate') === 0
      ) {
        offset[offset.length-1] = 
          require('./tool')[`get_${type_id}_offset`](
            cache.start_points,
            get_points_from_fingers(evt_stack.move.current.touches),
            cache[`${type_id}_start_offset`]
          );
      }
    } else

    if(base.status === STATUS.end) {
      // endWith
      end_helper('swipe');
      end_helper('pinch');
      end_helper('rotate');
    }
  });
}

function test_when(when){
  var base = schedule.base[when.type_id];
  return (
    !config_equal(base.status, when.status)
  ) || (
    when.startWith !== undefined &&
    when.startWith !== base.startWith
  ) || (
    when.endWith !== undefined &&
    when.endWith !== base.endWith
  );
}

function get_current_finger(base, base_config, evt) {
  var type = base_config.type;

  if (type === 'tap') {
    return last_arr(1, evt_stack.start.increase).touches.length;
  } else

  if (type === 'longtap') {
    return last_arr(1, evt_stack.start.increase).touches.length;
  }

  // finger设置的end一般都是直接放行
  if (
    EVENT[base_config.type].type === TYPE_CONTINUOUS && 
    base_config.finger !== undefined &&
    base.status === STATUS.end
  ) {
    return base_config.finger;
  }

  return evt.touches.length;
}

function update_cache (evt) {
  // continuous offset 每次点击都会压栈, finger数目变更都会用新的记录
  evt_stack.continuous.start = evt;
  cache.start_points         = get_points_from_fingers(evt.touches);
  cache.swipe_start_offset   = get_orthocenter(cache.start_points);
  cache.pinch_start_offset   = get_avg(cache.start_points.map(function(point){
    return get_destance(point, cache.swipe_start_offset);
  }));
  cache.rotate_start_offset  = get_avg(cache.start_points.map(function(point){
    return get_rotate(point, cache.swipe_start_offset);
  }));
  offset_stack.swipe.push({x: 0, y: 0});

  if (evt.touches.length > 1 ) {
    offset_stack.pinch.push(0);
    offset_stack.rotate.push(0);
  }
}

function reset () {
  group_progress = 0;
  // 清空evt_stack
  clean_arr(evt_stack.start.increase);
  delete evt_stack.start.increase;
  evt_stack.start.increase = [];

  offset_stack.swipe  = [];
  offset_stack.pinch  = [];
  offset_stack.rotate = [];

  clean_arr(evt_stack.end);
  delete evt_stack.end;
  evt_stack.end = [];

  delete evt_stack.move.last;
  delete evt_stack.move.current;
  delete evt_stack.start.current;
  delete evt_stack.continuous.start;
}

// update base status
function touchstart(evt) {
  var touch_num               = evt.touches.length;
  var last_actived_finger_num = actived_finger_num;
  // 更新finger信息
  actived_finger_num = Math.max(actived_finger_num, touch_num);

  if (actived_finger_num > last_actived_finger_num) {
    evt_stack.start.increase.push(evt);
    // 使用最先手指变更的时候就好了
    // 这样允许1->2 也可以兼容1->3的情况
    if (evt_stack.start.increase.length > 1) {
      start_bus_bubble(
        last_arr(2, evt_stack.start.increase),
        function () {// start patch
          schedule.set_base('tap',     STATUS.cancel);
          schedule.set_base('longtap', STATUS.cancel);
        },
        function () {// end patch
          schedule.set_base('tap',     STATUS.init);
          schedule.set_base('longtap', STATUS.init);
        }
      );
    }

    // 更新tap status->start, 这个是使用现有的tap的longtapThreshold来区别的所以是没有
    // 这一层是源触发的bus
    schedule.set_base('tap', STATUS.start);
  }

  // longtap 的16ms的定时器
  timer.start('longtap_debounce');

  update_cache(evt);
  evt_stack.start.current = evt;

  // 触发finger设定为定值的continuous
  schedule.set_base(`swipe_${touch_num-1}`,  STATUS.end);
  schedule.set_base(`pinch_${touch_num-1}`,  STATUS.end);
  schedule.set_base(`rotate_${touch_num-1}`, STATUS.end);
  schedule.set_base(`swipe_${touch_num}`,   STATUS.init);
  schedule.set_base(`pinch_${touch_num}`,   STATUS.init);
  schedule.set_base(`rotate_${touch_num}`,  STATUS.init);
}

function touchmove(evt) {
  var touch_num = evt.touches.length;

  schedule.set_base('tap', STATUS.cancel);
  schedule.set_base('swipe', STATUS.move);
  schedule.set_base('swipe', STATUS.start);
  schedule.set_base(`swipe_${touch_num}`, STATUS.move);
  schedule.set_base(`swipe_${touch_num}`, STATUS.start);
  // 将会在start里面补一帧的move

  timer.stop('longtap');
  schedule.set_base('longtap', STATUS.cancel);

  evt_stack.move.last = evt_stack.move.current
                      ? evt_stack.move.current
                      : last_arr(1, evt_stack.start.increase);

  evt_stack.move.current = evt;

  if (evt.touches.length > 1) {
    schedule.set_base('pinch', STATUS.move);
    schedule.set_base('pinch', STATUS.start);
    schedule.set_base('rotate', STATUS.move);
    schedule.set_base('rotate', STATUS.start);
    schedule.set_base(`pinch_${touch_num}`, STATUS.move);
    schedule.set_base(`pinch_${touch_num}`, STATUS.start);
    schedule.set_base(`rotate_${touch_num}`, STATUS.move);
    schedule.set_base(`rotate_${touch_num}`, STATUS.start);
  }
}

function touchend(evt) {
  var touch_num = evt.touches.length;

  if (touch_num === 0) {
    schedule.set_base('tap',   STATUS.end);
    schedule.set_base('swipe', STATUS.end);
  } else {
    update_cache(evt);
  }

  schedule.set_base('longtap', STATUS.cancel);
  timer.stop('longtap_debounce');

  schedule.set_base(`swipe_${touch_num+1}`,  STATUS.end);
  schedule.set_base(`pinch_${touch_num+1}`,  STATUS.end);
  schedule.set_base(`rotate_${touch_num+1}`, STATUS.end);
}

function touchcancel(evt) {
  // 目前还不是很清楚touchcancel的触发时机, MDN也就简单说创建了太多的触控点, 会触发,但是还是不清楚
  console.log(evt);
}

export default addEvent;
export {
  schedule,
  addEvent,
  evt_stack,
  start_bus_bubble,
  group_gap_trigger
};