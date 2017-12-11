const _DEFAULT_LONGTAP_THRESHOLD = 700;

const _TYPE_MONENT = 0;
const _TYPE_CONTINUOUS = 1;
const _TYPE_UNKNOW = 2;

const _ON_FINGER = 0;
const _ON_DOM = 1;
const _ON_EVENT = 2;

const _STATUS_INIT = 0;
const _STATUS_START = -1;
const _STATUS_MOVE = -2;
const _STATUS_END = -3;
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

export {
  _EVENT,

  _STATUS_INIT,
  _STATUS_START,
  _STATUS_MOVE,
  _STATUS_END,
  _STATUS_CANCEL,

  _ON_FINGER,
  _ON_DOM,
  _ON_EVENT,

  _TYPE_UNKNOW,
  _TYPE_CONTINUOUS,
  _TYPE_MONENT,
  _DEFAULT_LONGTAP_THRESHOLD
};