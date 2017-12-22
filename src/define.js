const DEFAULT_LONGTAP_THRESHOLD = 700;
const DEFAULT_TAP_FINGER = 1;

const TYPE_MONENT = 0;
const TYPE_CONTINUOUS = 1;
const TYPE_UNKNOW = 2;

const ON_FINGER = 0;
const ON_DOM = 1;
const ON_EVENT = 2;

const STATUS_INIT = 0;
const STATUS_START = -1;
const STATUS_MOVE = -2;
const STATUS_END = -3;
const STATUS_CANCEL = -4;
//正数用于gourp的进度

const EVENT = {
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

const STATUS_STRINGS = {
  '0': 'init',
  '-1': 'start',
  '-2': 'move',
  '-3': 'end',
  '-4': 'cancel'
};

function STATUS_TO_STRING(code){
  if(STATUS_STRINGS[code])
    return STATUS_STRINGS[code];
  if(parseInt(code) > 0)
    return 'during_group';
  
  return undefined;
}

export {
  EVENT,

  STATUS_INIT,
  STATUS_START,
  STATUS_MOVE,
  STATUS_END,
  STATUS_CANCEL,

  ON_FINGER,
  ON_DOM,
  ON_EVENT,

  TYPE_UNKNOW,
  TYPE_CONTINUOUS,
  TYPE_MONENT,
  DEFAULT_LONGTAP_THRESHOLD,
  DEFAULT_TAP_FINGER,

  STATUS_TO_STRING
};