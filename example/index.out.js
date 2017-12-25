/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var DEFAULT_LONGTAP_THRESHOLD = 700;
var DEFAULT_TAP_FINGER = 1;

var TYPE_MONENT = 0;
var TYPE_CONTINUOUS = 1;
var TYPE_UNKNOW = 2;

var ON_FINGER = 0;
var ON_DOM = 1;
var ON_EVENT = 2;

var STATUS_INIT = 0;
var STATUS_START = -1;
var STATUS_MOVE = -2;
var STATUS_END = -3;
var STATUS_CANCEL = -4;
//正数用于gourp的进度

var EVENT = {
  // 离散事件
  tap: {
    type: TYPE_MONENT,
    on: ON_FINGER
  },
  longtap: {
    type: TYPE_MONENT,
    on: ON_FINGER
  },

  //连续事件
  swipe: {
    type: TYPE_CONTINUOUS,
    on: ON_FINGER
  },
  pinch: {
    type: TYPE_CONTINUOUS,
    on: ON_FINGER
  },
  rotate: {
    type: TYPE_CONTINUOUS,
    on: ON_FINGER
  },
  //finger事件的自定义组合
  group: {
    type: TYPE_UNKNOW,
    on: ON_FINGER
  },

  //相对dom来说
  focus: {
    type: TYPE_MONENT,
    on: ON_DOM
  },
  blur: {
    type: TYPE_MONENT,
    on: ON_DOM
  },
  enter: {
    type: TYPE_MONENT,
    on: ON_DOM
  },
  leave: {
    type: TYPE_MONENT,
    on: ON_DOM
  },
  over: {
    type: TYPE_CONTINUOUS,
    on: ON_DOM
  },

  //对事件的继续分化事件
  groupstart: {
    type: TYPE_MONENT,
    on: ON_EVENT
  },
  groupend: {
    type: TYPE_MONENT,
    on: ON_EVENT
  },
  bubblestart: {
    type: TYPE_MONENT,
    on: ON_EVENT
  },
  bubbleend: {
    type: TYPE_MONENT,
    on: ON_EVENT
  }
};

var STATUS_STRINGS = {
  '0': 'init',
  '-1': 'start',
  '-2': 'move',
  '-3': 'end',
  '-4': 'cancel'
};

var STRING_STATUS = {};

Object.keys(STATUS_STRINGS).forEach(function (code) {
  STRING_STATUS[STATUS_STRINGS[code]] = parseInt(code);
});

function STATUS_TO_STRING(code) {
  if (STATUS_STRINGS[code]) return STATUS_STRINGS[code];
  if (parseInt(code) > 0) return 'during_group';

  return undefined;
}

function STRING_TO_STATUS(string) {
  return STRING_STATUS[string];
}

exports.EVENT = EVENT;
exports.STATUS_INIT = STATUS_INIT;
exports.STATUS_START = STATUS_START;
exports.STATUS_MOVE = STATUS_MOVE;
exports.STATUS_END = STATUS_END;
exports.STATUS_CANCEL = STATUS_CANCEL;
exports.ON_FINGER = ON_FINGER;
exports.ON_DOM = ON_DOM;
exports.ON_EVENT = ON_EVENT;
exports.TYPE_UNKNOW = TYPE_UNKNOW;
exports.TYPE_CONTINUOUS = TYPE_CONTINUOUS;
exports.TYPE_MONENT = TYPE_MONENT;
exports.DEFAULT_LONGTAP_THRESHOLD = DEFAULT_LONGTAP_THRESHOLD;
exports.DEFAULT_TAP_FINGER = DEFAULT_TAP_FINGER;
exports.STATUS_TO_STRING = STATUS_TO_STRING;
exports.STRING_TO_STATUS = STRING_TO_STATUS;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.make_flat_base = make_flat_base;
exports.make_flat_group = make_flat_group;
exports.get_base_id = get_base_id;
exports.get_group_Id = get_group_Id;
exports.get_type_id = get_type_id;
exports.last_arr = last_arr;

var _define = __webpack_require__(0);

function make_flat_base(config) {
  var repeat = config.repeat || 1;
  var result = [];

  for (var i = 0; i < repeat; i++) {
    result.push(Object.assign({}, config));
  }

  return result;
}

function make_flat_group(config) {
  if (config.group === undefined || config.group instanceof Array === false) {
    return make_flat_base(config);
  }

  var result = [];

  if (config.type !== 'group') return make_flat_base(config);

  config.group.forEach(function (baseconfig) {
    if (baseconfig.type === 'group') make_flat_group(baseconfig).forEach(function (item) {
      result.push(item);
    });else make_flat_base(baseconfig).forEach(function (item) {
      result.push(item);
    });
  });

  return result;
}

function get_base_id(config) {
  var type = _define.EVENT[config.type].type;
  var opts = [{
    key: 'finger',
    value: config.finger
  }];
  var opts_string = [];
  var when = '';

  opts.push();

  if (type === _define.TYPE_CONTINUOUS) {
    opts.push({
      key: 'startWith',
      value: config.startWith
    });
    opts.push({
      key: 'endWith',
      value: config.endWith
    });
  }

  if (config.type === 'longtap') {
    opts.push({
      key: 'longtapThreshold',
      value: config.longtapThreshold
    });
  }

  if (config.when !== undefined) {
    when = get_base_id(config.when);
  }

  opts.forEach(function (opt) {
    opts_string.push(opt.key + '=' + opt.value);
  });

  return config.type + '[' + opts_string.join(',') + ']{' + when + '}';
}

function get_group_Id(config) {
  var opts_string = [];

  config.forEach(function (baseconfig) {
    opts_string.push(get_base_id(baseconfig));
  });

  return opts_string.join(',');
}

function get_type_id(config) {
  var type = config.type;
  if (type === 'longtap') return type + '_' + config.longtapThreshold;

  return type;
}

function last_arr(num, arr) {
  return arr[arr.length - num];
}

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.evt_stack = exports.group_gap_trigger = exports.addEvent = exports.start_bus_bubble = exports.schedule = undefined;

var _tool = __webpack_require__(1);

var _eventController = __webpack_require__(4);

var _eventController2 = _interopRequireDefault(_eventController);

var _scheduleController = __webpack_require__(5);

var _scheduleController2 = _interopRequireDefault(_scheduleController);

var _timerController = __webpack_require__(6);

var _timerController2 = _interopRequireDefault(_timerController);

var _idGenerator = __webpack_require__(7);

var _idGenerator2 = _interopRequireDefault(_idGenerator);

var _define = __webpack_require__(0);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function addEvent($dom) {
  var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var type = config.type;

  if (type === undefined || _define.EVENT[type] === undefined) throw '请配置事件的type,或者检查拼写正确';

  var on_which = _define.EVENT[type].on;

  //初始化dom里面的储存结构
  if ($dom.__event === undefined) {
    var _list;

    $dom.__event = {
      list: (_list = {}, _defineProperty(_list, _define.ON_DOM, {}), _defineProperty(_list, _define.ON_EVENT, {}), _defineProperty(_list, _define.ON_FINGER, {}), _list),
      IDGenerator: new _idGenerator2.default()
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
    if (config.longtapThreshold === undefined) config.longtapThreshold = _define.DEFAULT_LONGTAP_THRESHOLD;
  }

  if (config.when) {
    if (config.when.longtapThreshold === undefined && config.when.type === 'longtap') {
      config.when.longtapThreshold = _define.DEFAULT_LONGTAP_THRESHOLD;
    }

    if (config.when.status === undefined) {
      config.when.status = _define.STATUS_END;
    } else if (config.when.status instanceof String) {
      config.when.status = (0, _define.STRING_TO_STATUS)(config.when.status);
    } else if (config.when.status instanceof Array) {
      if (config.when.status.length === 0) {
        config.when.status = _define.STATUS_END;
      } else {
        config.when.status = config.when.status.map(_define.STRING_TO_STATUS);
      }
    }
  }

  if (type === 'tap') {
    if (config.finger === undefined) config.finger = _define.DEFAULT_TAP_FINGER;
  }

  //添加事件配置
  if (_define.EVENT[type].on === _define.ON_FINGER) {
    //finger需要打扁
    group = (0, _tool.make_flat_group)(config);

    //基事件需要被转化为单个的group
    _info = {
      id: newId,
      $dom: $dom,
      config: config,
      group: group,
      groupId: (0, _tool.get_group_Id)(group)
    };
    list[on_which][newId] = _info;
  } else {
    // dom/event的事件储存到树状结构
    if (list[on_which][type] === undefined) list[on_which][type] = {};

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
  return new _eventController2.default(_info);
}

var schedule = new _scheduleController2.default();
var triggerlist; // []
var dom_involved; // [] order from bubble start to end
var bubble_started = false;
var last_dom_involved;
var group_progress = 0;
var max_group_len = 0;
var actived_finger_num = 0;
// var bubbleend_task = [];
var group_gap_stack = []; //储存groupid因为还有更长的group而已延迟触发的end事件
var timer = new _timerController2.default(schedule, start_bus_bubble);
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
    var grouplist = $dom.__event.list[_define.ON_FINGER];

    for (var id in grouplist) {
      var info = grouplist[id];
      if (info.groupId === groupId) {
        var group = schedule.group[groupId];
        var listener = info.config[(0, _define.STATUS_TO_STRING)(group.status)];

        if (info.config.disable !== true) {
          listener instanceof Function && listener.call($dom, evt);

          // start补一帧move, TYPE_CONTINUOUS的事件
          _define.EVENT[group.group[group_progress].type].type === _define.TYPE_CONTINUOUS && group.status === _define.STATUS_START && info.config.move instanceof Function && info.config.move.call($dom, evt);
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
    schedule.group[groupId].status = _define.STATUS_CANCEL;
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
  // if(group_progress !== 0) debugger;

  //生成schedule
  dom_involved.forEach(function ($dom) {
    var groups = $dom.__event.list[_define.ON_FINGER];
    var base;

    if (group_progress === 0) {
      for (var id in groups) {
        schedule.write_group(groups[id]);
      }
    }

    //根据目前group的进度去初始化
    for (var _id in schedule.group) {
      if (schedule.group[_id].group.length > group_progress) {
        base = schedule.group[_id].group[group_progress];
        //基事件使用type->的映射就可以了,细微的状态更新方便
        schedule.write_base(base);
        base.when !== undefined && schedule.write_base(base.when);
      }
    }

    //初始化完毕

    // 触发bubbulestart
  });
}

function groupend(evt) {
  // debugger;
  // gourp commit
  schedule.commit_to_group(group_progress);
  // 设置延迟groupgap的timer

  group_progress = group_progress === max_group_len ? 0 : group_progress + 1;

  if (group_progress !== 0) {
    timer.start('group_gap');
  }
}

function group_gap_trigger() {
  start_bus_bubble({
    type: 'group_gap'
  }, function () {}, function () {}, function () {
    // debugger;
    triggerlist = group_gap_stack;
    group_gap_stack = []; //虽然js内置的堆栈的操作,但是在代码的语义上面欠缺
  });
}

//工具函数, 不过不太适合拆分到tool里面
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
  var longer_groups = [];

  // 找出max_group_len
  if (schedule.updated_base.length !== 0) {
    for (var groupId in schedule.group) {
      group = schedule.group[groupId];
      if (group.status === group_progress || group.status === _define.STATUS_START || group.status === _define.STATUS_MOVE) {
        tmp_len = group.group.length - 1;

        if (tmp_len > max_group_len) max_group_len = tmp_len;

        if (tmp_len > group_progress) longer_groups.push(group);

        if (schedule.updated_base.includes((0, _tool.get_type_id)((0, _tool.last_arr)(1, group.group)))) groupid_in_process.push(groupId);
      }
    }
  }

  // 更新triggerList,问题,在进度的状态不一定是这次bubble里修改的
  groupid_in_process.forEach(function (groupId) {
    group = schedule.group[groupId];

    // 同步base的状态到group里面
    if (group.status === group.group.length - 1 || group.status === _define.STATUS_START || group.status === _define.STATUS_MOVE) {
      base_config = schedule.get_base_config_of_groupId(groupId);
      base = schedule.get_base_of_groupId(groupId);

      if (base.status === _define.STATUS_INIT) return;

      // 需要处理when, startWith, endWith, finger
      if (
      // startWith
      base.status === _define.STATUS_START && base_config.startWith !== undefined && base_config.startWith !== base.startWith ||
      // endWith
      base.status === _define.STATUS_END && base_config.endWith !== undefined && base_config.endWith !== base.endWith ||
      // when
      base_config.when instanceof Object && test_when(base_config.when) || base_config.when instanceof Array && base_config.when.every(test_when)) {

        if (status === _define.STATUS_START || status === _define.STATUS_MOVE) {
          group.status = _define.STATUS_CANCEL;
        }
      } else {
        group.status = base.status;
      }

      if (base_config.finger !== undefined && base_config.finger === get_current_finger(base, base_config, evt) || //longtap的自定义触发引用需要更换
      base_config.finger === undefined) {
        // if (group.status === STATUS_END) debugger;
        // 需要查看是否有更长的group, 是否还有机会触发
        if (group_progress < max_group_len && group.status === _define.STATUS_END) {
          // 把这次的触发压到堆栈里面去
          // debugger;
          if (longer_groups.some(function (group) {
            // 相当于是提前检查一下了, 的确感觉会比较慢的感觉, 唉
            var base_status = schedule.base[(0, _tool.get_type_id)(group.group[group_progress])].status;

            return base_status === _define.STATUS_START || base_status === _define.STATUS_MOVE || base_status === _define.STATUS_END;
          })) {
            group_gap_stack.push(groupId);
            return;
          }
        }

        triggerlist.push(groupId);
      }
    }
  });
}

function test_when(when) {
  var base = schedule.base[(0, _tool.get_type_id)(when)];
  return when.status instanceof Number && base.status !== when.status || when.status instanceof Array && when.status.includes(base.status) === false || when.startWith !== undefined && when.startWith !== base.startWith || when.endWith !== undefined && when.endWith !== base.endWith;
}

function get_current_finger(base, base_config, evt) {
  switch (base_config.type) {
    case 'tap':

      switch (base.status) {
        case _define.STATUS_START:
          return (0, _tool.last_arr)(1, evt_stack.start).touches.length;
        case _define.STATUS_END:
          return (0, _tool.last_arr)(1, evt_stack.start).touches.length;
        case _define.STATUS_CANCEL:
          return (0, _tool.last_arr)(1, evt_stack.start).touches.length;
      }

      break;
    case 'longtap':

      switch (base.status) {
        case _define.STATUS_START:
          return (0, _tool.last_arr)(1, evt_stack.start).touches.length;
        case _define.STATUS_END:
          return (0, _tool.last_arr)(1, evt_stack.start).touches.length;
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
      start_bus_bubble((0, _tool.last_arr)(2, evt_stack.start), function () {
        // start patch
        schedule.set_base('tap', _define.STATUS_CANCEL);
        schedule.set_base('longtap', _define.STATUS_CANCEL);
      }, function () {
        // end patch
        schedule.set_base('longtap', _define.STATUS_INIT);
        schedule.set_base('tap', _define.STATUS_INIT);
      });
    }

    // 更新tap status->start, 这个是使用现有的tap的longtapThreshold来区别的所以是没有
    // 这一层是源触发的bus
    schedule.set_base('tap', _define.STATUS_START);
  }

  //longtap 的16ms的定时器
  timer.start('longtap_debounce');
}

function touchmove(evt) {
  // debugger;
  schedule.set_base('tap', _define.STATUS_CANCEL);
  schedule.set_base('longtap', _define.STATUS_CANCEL);
  schedule.set_base('swipe', _define.STATUS_MOVE);
  schedule.set_base('swipe', _define.STATUS_START);
  timer.stop('longtap');
  // 将会在start里面补一帧的move

  if (evt.touches.length > 1) {
    schedule.set_base('pinch', _define.STATUS_MOVE);
    schedule.set_base('pinch', _define.STATUS_START);
    schedule.set_base('rotate', _define.STATUS_MOVE);
    schedule.set_base('rotate', _define.STATUS_START);
  }
}

function touchend(evt) {
  if (evt.touches.length === 0) {
    schedule.set_base('tap', _define.STATUS_END);
    schedule.set_base('swipe', _define.STATUS_END);
  }
  schedule.set_base('longtap', _define.STATUS_CANCEL);
  timer.stop('longtap_debounce');
}

function touchcancel(evt) {
  // 目前还不是很清楚touchcancel的触发时机, MDN也就简单说创建了太多的触控点, 会触发,但是还是不清楚
  console.log(evt);
}

function group_gap(evt) {}

exports.default = addEvent;
exports.schedule = schedule;
exports.start_bus_bubble = start_bus_bubble;
exports.addEvent = addEvent;
exports.group_gap_trigger = group_gap_trigger;
exports.evt_stack = evt_stack;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _index = __webpack_require__(2);

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

document.addEventListener("DOMContentLoaded", function () {
  var $box = document.querySelector('#box');

  var swipeCtrl = (0, _index2.default)($box, {
    type: 'swipe',

    start: function start() {
      console.log('swipe start');
    },
    move: function move() {
      console.log('swipe move');
    },
    end: function end() {
      console.log('swipe end');
    },
    cancel: function cancel() {
      console.log('swipe cancel');
    }
  });

  swipeCtrl.removeEvent();

  (0, _index2.default)($box, {
    type: 'swipe',
    when: {
      type: 'longtap',
      status: ['cancel', 'init'],
      longtapThreshold: 1000 /*ms*/
    },

    start: function start() {
      console.log('swipe start');
    },
    move: function move() {
      console.log('swipe move');
    },
    end: function end() {
      console.log('swipe end');
    },
    cancel: function cancel() {
      console.log('swipe cancel');
    }
  });

  (0, _index2.default)($box, {
    type: 'tap',
    repeat: 3,

    start: function start() {
      console.log('tap start');
    },
    move: function move() {
      console.log('tap move');
    },
    end: function end() {
      console.log('tap end');
    },
    cancel: function cancel() {
      console.log('tap cancel');
    }
  });

  (0, _index2.default)($box, {
    type: 'longtap',

    start: function start() {
      console.log('longtap start');
    },
    move: function move() {
      console.log('longtap move');
    },
    end: function end() {
      console.log('longtap end');
    },
    cancel: function cancel() {
      console.log('longtap cancel');
    }
  });

  swipeCtrl.removeEvent();
});

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _tool = __webpack_require__(1);

var _index = __webpack_require__(2);

var _define = __webpack_require__(0);

function EventController(info) {
  this.info = info;
}

EventController.prototype.enable = function () {
  //不需要同步到group
  this.info.config.disable = false;
};

EventController.prototype.disable = function () {
  this.info.config.disable = true;
};

EventController.prototype.set = function (key, value) {
  var need_to_sync_key = ['finger', 'startWith', 'endWith', 'group', 'repeat'];
  this.info.config[key] = value;

  //同步更新group
  if (need_to_sync_key.indexOf(key) > -1) {
    this.info.group = (0, _tool.make_flat_group)(this.info.config);
    this.info.groupId = (0, _index._get_group_Id)(this.info.group);
  }
};

EventController.prototype.removeEvent = function () {
  var id = this.info.id;
  var type = this.info.config.type;
  var on_which = _define.EVENT[type].on;
  var $dom = this.info.$dom;

  if (on_which === _define.ON_FINGER) delete $dom.__event.list[on_which][id];else delete $dom.__event.list[on_which][type][id];
};

exports.default = EventController;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _define = __webpack_require__(0);

var _tool = __webpack_require__(1);

function ScheduleController() {
  this.base = {};
  this.group = {};
  this.updated_base = [];
}

ScheduleController.prototype.set_base = function (type, set_status) {
  var status;
  if (this.base[type] !== undefined) {
    status = this.base[type].status;

    // 设置init
    if (set_status === _define.STATUS_INIT && status !== _define.STATUS_END) {
      this.base[type].status = _define.STATUS_INIT;
      return;
    }

    if (
    // 设置start
    set_status === _define.STATUS_START && status === _define.STATUS_INIT ||
    // 设置move
    set_status === _define.STATUS_MOVE && (status === _define.STATUS_START || status === _define.STATUS_MOVE) ||
    // 设置end
    set_status === _define.STATUS_END && (status === _define.STATUS_START || status === _define.STATUS_MOVE) ||
    // 设置cancel
    set_status === _define.STATUS_CANCEL && (status === _define.STATUS_START || status === _define.STATUS_MOVE)) {
      this.base[type].status = set_status;
      this.updated_base.push(type);
    }
  } else if (type === 'longtap') {
    //longtap仅仅允许做start/cancel的操作了, 不会包含longtap_debounce, 因为不是基事件来的

    for (var id in this.base) {
      status = this.base[id].status;

      if (id.indexOf('longtap') === 0) {
        if (status === _define.STATUS_INIT && set_status === _define.STATUS_CANCEL || status === _define.STATUS_END && set_status === _define.STATUS_CANCEL || status === _define.STATUS_INIT && set_status === _define.STATUS_END) return;

        this.base[id].status = set_status;
        this.updated_base.push(id);
      }
    }
  }
};

ScheduleController.prototype.commit_to_group = function (current_process) {
  for (var gourpid in this.group) {
    var group = this.group[gourpid];

    if (group.status === current_process && this.base[(0, _tool.get_type_id)(group.group[current_process])].status === _define.STATUS_END) {
      group.status++;
    }
  }
};

ScheduleController.prototype.empty_base = function () {
  this.base = {};
};

ScheduleController.prototype.empty_group = function () {
  this.group = {};
};

ScheduleController.prototype.write_base = function (config) {
  var type = config.type;

  //特殊处理longtap
  if (type === 'longtap') {
    if (this.base[type + '_' + config.longtapThreshold] === undefined) {
      this.base[type + '_' + config.longtapThreshold] = {
        status: _define.STATUS_INIT,
        threshold: config.longtapThreshold
      };
    }
  } else if (this.base[type] === undefined) {
    this.base[type] = {
      status: _define.STATUS_INIT
    };
  }

  if (_define.EVENT[type].type === _define.TYPE_CONTINUOUS) {
    this.base[type].startWith = undefined;
    this.base[type].endWith = undefined;
  }
};

ScheduleController.prototype.write_group = function (config) {
  if (this.group[config.groupId] === undefined) this.group[config.groupId] = {
    status: _define.STATUS_INIT,
    group: config.group
  };
};

ScheduleController.prototype.set_longtap = function (status) {
  for (var name in this.base) {
    if (name.indexOf('longtap') === 0) {
      this.base[name].status = status;
    }
  }
};

ScheduleController.prototype.get_base_of_groupId = function (groupId) {
  return this.base[(0, _tool.get_type_id)(this.get_base_config_of_groupId(groupId))];
};

ScheduleController.prototype.get_base_config_of_groupId = function (groupId) {
  var group = this.group[groupId];

  if (group.status >= 0) {
    return group.group[group.status];
  } else {
    return group.group[group.group.length - 1];
  }
};

ScheduleController.prototype.empty_updated_base = function () {
  this.updated_base = [];
};

exports.default = ScheduleController;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _define = __webpack_require__(0);

var _index = __webpack_require__(2);

var _tool = __webpack_require__(1);

function TimerController() {
  //储存引用
  // this.longtap_debounce = null;
  this.list = {};
}

TimerController.prototype.stop = function (name) {
  if (this.list[name] !== undefined) {
    clearTimeout(this.list[name]);
    this.list[name] = undefined;
  } else if (name === 'longtap') {

    for (var id in this.list) {
      if (id.indexOf(name) === 0 && this.list[id] !== undefined) {
        clearTimeout(this.list[id]);
        this.list[id] = undefined;
      }
    }
  }
};

TimerController.prototype.start = function (name, delay) {
  var _callback;
  var _delay;
  var self = this;

  function _warp_callback(func) {
    _callback = function _callback() {
      func();
      self.list[name] = undefined;
    };
  }

  //一些预设的timer定义,一些执行流的定义不应该嵌套到其他的执行流当中的
  if (name === 'longtap_debounce') {
    _delay = delay || 350;
    _warp_callback(function () {
      var longtap_ids = [];

      for (var base_name in _index.schedule.base) {
        if (base_name.indexOf('longtap') === 0) {
          longtap_ids.push(base_name);
        }
      }

      if (longtap_ids.length !== 0) {
        // debugger;
        (0, _index.start_bus_bubble)({
          type: 'longtap',
          touches: (0, _tool.last_arr)(1, _index.evt_stack.start).touches
        }, function () {
          _index.schedule.set_base('longtap', _define.STATUS_START);
        });
      }

      // 设置longtap end timer
      longtap_ids.forEach(function (longtap_id) {
        self.start(longtap_id, _index.schedule.base[longtap_id].threshold);
      });
    });
  } else if (name.indexOf('longtap') === 0) {
    _delay = delay;
    _warp_callback(function () {
      (0, _index.start_bus_bubble)({
        type: 'longtap',
        touches: (0, _tool.last_arr)(1, _index.evt_stack.start).touches
      }, function () {
        _index.schedule.set_base(name, _define.STATUS_END);
        _index.schedule.set_base('tap', _define.STATUS_CANCEL);
      });
    });
  } else if (name === 'group_gap') {
    _delay = 250;
    _warp_callback(_index.group_gap_trigger);
  }

  return this.list[name] = setTimeout(_callback, _delay);
};

exports.default = TimerController;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

function IDGenerator() {
  this.id = 0;
}

IDGenerator.prototype.new = function () {
  return this.id++;
};

exports.default = IDGenerator;

/***/ })
/******/ ]);