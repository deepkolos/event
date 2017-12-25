import { Type } from  './tool';

const DEFAULT_LONGTAP_THRESHOLD = 700;
const DEFAULT_TAP_FINGER        = 1;

const TYPE_MONENT      = 0;
const TYPE_CONTINUOUS  = 1;
const TYPE_UNKNOW      = 2;

const ON_FINGER  = 0;
const ON_DOM     = 1;
const ON_EVENT   = 2;

const START_END_WITH = {
  swipe:  new Type('up', 'right', 'down', 'left'),
  pinch:  new Type('in', 'out'),
  rotate: new Type('clockwise', 'anticlockwise'),
};

const EVENT_STATUS = new Type({
  [-0]: 'init',
  [-1]: 'start',
  [-2]: 'move',
  [-3]: 'end',
  [-4]: 'cancel'
});
//正数用于gourp的进度

const EVENT = {
  // 离散事件
  tap: {
    type: TYPE_MONENT,
    on:   ON_FINGER
  },
  longtap: {
    type: TYPE_MONENT,
    on:   ON_FINGER
  },

  //连续事件
  swipe: {
    type: TYPE_CONTINUOUS,
    on:   ON_FINGER
  },
  pinch: {
    type: TYPE_CONTINUOUS,
    on:   ON_FINGER
  },
  rotate: {
    type: TYPE_CONTINUOUS,
    on:   ON_FINGER
  },
  //finger事件的自定义组合
  group: {
    type: TYPE_UNKNOW,
    on:   ON_FINGER
  },

  //相对dom来说
  focus: {
    type: TYPE_MONENT,
    on:   ON_DOM
  },
  blur: {
    type: TYPE_MONENT,
    on:   ON_DOM
  },
  enter: {
    type: TYPE_MONENT,
    on:   ON_DOM
  },
  leave: {
    type: TYPE_MONENT,
    on:   ON_DOM
  },
  over: {
    type: TYPE_CONTINUOUS,
    on:   ON_DOM
  },

  //对事件的继续分化事件
  groupstart: {
    type: TYPE_MONENT,
    on:   ON_EVENT
  },
  groupend: {
    type: TYPE_MONENT,
    on:   ON_EVENT
  },
  bubblestart: {
    type: TYPE_MONENT,
    on:   ON_EVENT
  },
  bubbleend: {
    type: TYPE_MONENT,
    on:   ON_EVENT
  }
};

export {
  EVENT,

  ON_FINGER,
  ON_DOM,
  ON_EVENT,

  START_END_WITH,
  EVENT_STATUS,

  TYPE_UNKNOW,
  TYPE_CONTINUOUS,
  TYPE_MONENT,
  DEFAULT_LONGTAP_THRESHOLD,
  DEFAULT_TAP_FINGER
};