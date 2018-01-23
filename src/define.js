import { Type } from './tool';

const DEFAULT_LONGTAP_THRESHOLD = 700;
const DEFAULT_TAP_FINGER        = 1;
const TAP_THRESHOLD             = 1.8;
const PRESS_THRESHOLD           = 6;

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
  over:   new Type('inside', 'top', 'right', 'bottom' ,'left')
  // outside(top, right, bottom ,left)
};

const STATUS = new Type({
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
  over: {
    type: TYPE_CONTINUOUS,
    on:   ON_DOM
  },

  //对事件的继续分化事件
  groupEvent: {
    type: TYPE_MONENT,
    on:   ON_EVENT
  },
  bubbleEvent: {
    type: TYPE_MONENT,
    on:   ON_EVENT
  }
};

export {
  EVENT,
  STATUS,

  ON_DOM,
  ON_EVENT,
  ON_FINGER,

  TYPE_UNKNOW,
  TYPE_MONENT,
  TYPE_CONTINUOUS,

  START_END_WITH,

  TAP_THRESHOLD,
  PRESS_THRESHOLD,

  DEFAULT_TAP_FINGER,
  DEFAULT_LONGTAP_THRESHOLD
};