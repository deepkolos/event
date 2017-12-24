import { make_flat_group, get_group_Id, get_type_id, last_arr } from './tool';
import EventController from './event-controller';
import ScheduleController from './schedule-controller';
import TimerController from './timer-controller';
import IDGenerator from './id-generator';
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
  DEFAULT_LONGTAP_THRESHOLD,
  DEFAULT_TAP_FINGER,

  STATUS_TO_STRING
} from './define';


function addEvent($dom, config = {}) {
  var type = config.type;

  if (type === undefined || EVENT[type] === undefined)
    throw '请配置事件的type,或者检查拼写正确';

  var on_which = EVENT[type].on;

  //初始化dom里面的储存结构
  if ($dom.__event === undefined) {
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

  var list = $dom.__event.list;
  var newId = $dom.__event.IDGenerator.new();
  var group, _info;

  //设置一些默认值
  if (type === 'longtap') {
    if (config.longtapThreshold === undefined)
      config.longtapThreshold = DEFAULT_LONGTAP_THRESHOLD;
  }

  if (config.after && config.after.type === 'longtap') {
    if (config.after.longtapThreshold === undefined)
      config.after.longtapThreshold = DEFAULT_LONGTAP_THRESHOLD;
  }

  if (type === 'tap') {
    if (config.finger === undefined)
      config.finger = DEFAULT_TAP_FINGER;
  }

  //添加事件配置
  if (EVENT[type].on === ON_FINGER) {
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
  } else {
    // dom/event的事件储存到树状结构
    if (list[on_which][type] === undefined)
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
var max_group_len = 0;
var actived_finger_num = 0;
// var bubbleend_task = [];
var group_gap_stack = [];//储存groupid因为还有更长的group而已延迟触发的end事件
var timer = new TimerController(schedule, start_bus_bubble);
var evt_stack = {
  start: [],
  // move: [],
  end: []
};

function bus(evt, usePatch) {
  var $dom = this;

  if (bubble_started === false && usePatch !== true) {
    bubble_started = true;
    bubblestart(evt);
  }

  // 消化triggerlist
  // 这里的循环可以优化
  triggerlist.forEach(function (groupId) {
    // triggerlist仅仅包含gourp了
    var grouplist = $dom.__event.list[ON_FINGER];

    for (let id in grouplist) {
      let info = grouplist[id];
      if (info.groupId === groupId) {
        let group = schedule.group[groupId];
        let listener = info.config[STATUS_TO_STRING(group.status)];

        if (group_progress !== max_group_len && group.status === STATUS_END) {
          // 意味着end事件需要压栈

        } else if (info.config.disable !== true) {
          listener instanceof Function && listener.call($dom, evt);

          // start补一帧move, TYPE_CONTINUOUS的事件
          EVENT[group.group[group_progress].type].type === TYPE_CONTINUOUS &&
            group.status === STATUS_START &&
            info.config.move instanceof Function &&
            info.config.move.call($dom, evt);
        }
      }
    }
  });

  if (bubble_started === true && $dom === last_dom_involved && usePatch !== true) {
    //不过一般一个bubble的执行时间不会那么长的,不过如果使用了模版编译之类的,就有可能很长时间,
    //本来打算使用一个frame的时间结束所谓end的,还是不行,行为就不同了
    bubble_started = false;
    bubbleend(evt);
  }
}

function bubblestart(evt, patch) {
  triggerlist = [];

  schedule.empty_updated_base();
  //更新基事件的
  if (patch instanceof Function) {
    patch();
  } else {
    //尝试去触发groupstart
    if (evt.touches.length === 1 && evt.type === 'touchstart' && evt.type === 'touchstart') {
      groupstart(evt);
    }
    update_base_status(evt);
  }

  // console.log(schedule.updated_base);

  //事件发生源,生成triggerlist
  update_triggerlist(evt);
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
  //推迟的group触发cancel
  group_gap_stack.forEach(function (groupId) {
    triggerlist.push(groupId);
    //并且设置cancel事件
    schedule.group[groupId].status = STATUS_CANCEL;
  });
  evt.path.forEach(function ($dom) {
    if ($dom.__event !== undefined) {
      dom_involved.push($dom);
    }
  });
  last_dom_involved = dom_involved[dom_involved.length - 1];

  //每次都会清空状态
  schedule.empty_base();

  //需要判断是否需要重新生成group
  group_progress === 0 && schedule.empty_group();

  //生成schedule
  dom_involved.forEach(function ($dom) {
    var groups = $dom.__event.list[ON_FINGER];
    var base;

    for (let id in groups)
      schedule.write_group(groups[id]);

    //根据目前group的进度去初始化
    for (let id in schedule.group) {
      base = schedule.group[id].group[group_progress];
      //基事件使用type->的映射就可以了,细微的状态更新方便
      schedule.write_base(base);
      base.after !== undefined && 
        schedule.write_base(base.after);
    }

    //初始化完毕

    // 触发bubbulestart
  });
}

function groupend(evt) {
  // gourp commit
  schedule.commit_to_group(group_progress);
  // 设置延迟groupgap的timer

  group_progress = group_progress === max_group_len ? 0 : group_progress + 1;
}

function group_gap_trigger() {
  triggerlist = group_gap_stack;
  group_gap_stack = [];//虽然js内置的堆栈的操作,但是在代码的语义上面欠缺
  start_bus_bubble({
    type: 'group_gap'
  });
}


//工具函数, 不过不太适合拆分到tool里面
function start_bus_bubble(evt, startPatch, endPatch) {
  // debugger;
  bubblestart(evt, startPatch);

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

  case 'group_gap':
    group_gap(evt);
    break;
  }

}

function update_triggerlist(evt) {
  // goroup的触发的规则
  max_group_len = group_progress;
  var tmp_len, group, base, base_config;
  var groupid_in_process = [];

  // 找出max_group_len
  if (schedule.updated_base.length !== 0) {
    for (let groupId in schedule.group) {
      group = schedule.group[groupId];
      if (
        group.status === group_progress ||
        group.status === STATUS_START ||
        group.status === STATUS_MOVE
      ) {
        tmp_len = group.group.length - 1;

        if (tmp_len > max_group_len)
          max_group_len = tmp_len;

        if(schedule.updated_base.includes(get_type_id(last_arr(1, group.group))))
          groupid_in_process.push(groupId);
      }
    }
  }

  // 更新triggerList,问题,在进度的状态不一定是这次bubble里修改的
  groupid_in_process.forEach(function (groupId) {
    group = schedule.group[groupId];

    // 同步base的状态到group里面
    if (
      group.status === group.group.length - 1 ||
      group.status === STATUS_START ||
      group.status === STATUS_MOVE
    ) {
      base_config = schedule.get_base_config_of_groupId(groupId);
      base = schedule.get_base_of_groupId(groupId);

      if (base.status === STATUS_INIT)
        return;

      // 需要处理after, startWith, endWith, finger
      if (
        // startWith
        (
          base.status === STATUS_START &&
          base_config.startWith !== undefined &&
          base_config.startWith !== base.startWith
        ) ||
        // endWith
        (
          base.status === STATUS_END &&
          base_config.endWith !== undefined &&
          base_config.endWith !== base.endWith
        ) ||
        // after
        (
          base_config.after !== undefined &&
          schedule.base[get_type_id(base_config.after)].status !== STATUS_END
        )
      ) {

        if(status === STATUS_START || status === STATUS_MOVE) {
          group.status = STATUS_CANCEL;
        }

      } else {
        group.status = base.status;
      }

      if (
        base_config.finger !== undefined &&
        base_config.finger === get_current_finger(base, base_config, evt) || //longtap的自定义触发引用需要更换
        base_config.finger === undefined
      ) {
        if (group_progress < max_group_len && group.status === STATUS_END) {
          // 把这次的触发压到堆栈里面去
          group_gap_stack.push(groupId);
        } else {
          triggerlist.push(groupId);
        }
      }
    }
  });
}

function get_current_finger(base, base_config, evt) {
  switch (base_config.type) {
  case 'tap':

    switch (base.status) {
    case STATUS_START:
      return last_arr(1, evt_stack.start).touches.length;
    case STATUS_END:
      return last_arr(1, evt_stack.start).touches.length;
    case STATUS_CANCEL:
      return last_arr(1, evt_stack.start).touches.length;
    }

    break;
  case 'longtap':

    switch (base.status) {
    case STATUS_START:
      return last_arr(1, evt_stack.start).touches.length;
    case STATUS_END:
      return last_arr(1, evt_stack.start).touches.length;
    }

    break;
  }

  return evt.touches.length;
}

//update trigger status, 这里仅仅做更新triggerlist
function touchstart(evt) {
  var touch_num = evt.touches.length;
  var last_actived_finger_num = actived_finger_num;
  //更新finger信息
  actived_finger_num = Math.max(actived_finger_num, touch_num);

  if (actived_finger_num > last_actived_finger_num) {
    evt_stack.start.push(evt);
    // 使用最先手指变更的时候就好了
    // 这样允许1->2 也可以兼容1->3的情况
    if (evt_stack.start.length > 1) {
      start_bus_bubble(
        last_arr(2, evt_stack.start),
        function () {// start patch
          schedule.set_base('tap', STATUS_CANCEL);
          schedule.set_base('longtap', STATUS_CANCEL);
        },
        function () {// end patch
          schedule.set_base('longtap', STATUS_INIT);
          schedule.set_base('tap', STATUS_INIT);
        }
      );
    }

    // 更新tap status->start, 这个是使用现有的tap的longtapThreshold来区别的所以是没有
    // 这一层是源触发的bus
    schedule.set_base('tap', STATUS_START);
  }

  //longtap 的16ms的定时器
  timer.start('longtap_debounce');
}

function touchmove(evt) {
  // debugger;
  schedule.set_base('tap', STATUS_CANCEL);
  schedule.set_base('longtap', STATUS_CANCEL);
  schedule.set_base('swipe', STATUS_MOVE);
  schedule.set_base('swipe', STATUS_START);
  timer.stop('longtap');
  // 将会在start里面补一帧的move

  if (evt.touches.length > 1) {
    schedule.set_base('pinch', STATUS_MOVE);
    schedule.set_base('pinch', STATUS_START);
    schedule.set_base('rotate', STATUS_MOVE);
    schedule.set_base('rotate', STATUS_START);
  }
}

function touchend(evt) {
  if (evt.touches.length === 0) {
    schedule.set_base('tap', STATUS_END);
    schedule.set_base('swipe', STATUS_END);
  }
  schedule.set_base('longtap', STATUS_CANCEL);
  timer.stop('longtap_debounce');
}

function touchcancel(evt) {
  // 目前还不是很清楚touchcancel的触发时机, MDN也就简单说创建了太多的触控点, 会触发,但是还是不清楚
  console.log(evt);
}

function group_gap(evt) {

}

export default addEvent;
export { schedule, start_bus_bubble, addEvent, group_gap_trigger, evt_stack };