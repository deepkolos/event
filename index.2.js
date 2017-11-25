import { Function } from "core-js/library/web/timers";


const TYPES = [
  // 离散事件
  'tap',
  'longtap',
  'doubletap',//alias tap.repeat: 2
  
  //连续事件
  'press',
  'swipe',
  'pinch',
  'rotate',

  //相对dom来说
  'focus',
  'blur',
  'over', //连续
];

const LONGTAP_TIME = 700;
const PRESS_DELAY = 35;

/*
  context = {
    timer: {}
    events: {},
    schedule: {}
  }
*/

let hasMoved = false;
let activeEvent = null;

let timer = {
  list: {},
  start: function(type, $dom){
    switch (type){
      
    case 'longtap':
      timer['longtap'] = setTimeout(function(){
        triggerLongtap($dom);
        timer['longtap'] = undefined;
      }, LONGTAP_TIME);
      break;
    }
  },
  stop: function(type){
    if(timer[type] !== undefined){
      clearTimeout(timer[type]);
      timer[type] = undefined;
    }
  }
};

let schedule = {
  list: {},
  group: [],
  set: function(type, value){
    if(this.list[type]){
      this.list[type].status = value;
      this.destorySnapshoot(this.list[type].snapshoot);
      this.list[type].snapshoot = this.takeSnapshoot();
    }else if(value === 'init'){
      this.list[type] = {
        status: 'init'
      };
    }
  },
  get: function(type){
    return this.list[type].status;
  },
  initGroup: function(){
    var needInit = true;
    
    //判断是否需要做初始化
    this.group.forEach(function(item){
      if(item.status > 0 )
        needInit = false;
    });

    if(needInit){
      //遍历path

    }
  },
  takeSnapshoot: function(){
    return {
      activeEvent: activeEvent
    };
  },
  destorySnapshoot: function(snapshoot){
    snapshoot && snapshoot.forEach(function(item, key){
      delete snapshoot[key];
    });
  },
};

// 对外可用方法
export function addEvent (type, $dom, config={}){

  if(typeof type === 'string' && !~TYPES.indexOf(type)){
    throw '[addEvent]type非法,请检查是否拼错了~';
  }

  if($dom instanceof HTMLElement === false){
    throw '[addEvent]$dom不是HTMLElement,请检查节点是都获取失败了~';
  }

  if(config instanceof Object === false){
    throw '[addEvent]config有误';
  }

  let context = initContext($dom);
  registerBaseEvent($dom);

  // 解析config,生成runtimeConfig

  if(type === 'doubletap'){
    type = 'tap';
    config.repeat = 2;
  }

  // 初始化type结构
  if(context.events[type] !== undefined)
    context.events[type] = [];

  context.events[type].push(config);
}

export function destory ($dom){
  $dom.removeEventListener('touchstart', touchStart, false);
  $dom.removeEventListener('touchmove', touchMove, false);
  $dom.removeEventListener('touchend', touchEnd, false);
  $dom.removeEventListener('touchcancel', touchCancel, false);

  destoryContext($dom);
}


// 内部使用方法

function initContext($dom){
  if($dom.__event === undefined)
    $dom.__event = {
      events: {}
    };
  
  return $dom.__event;
}

function getContext($dom){
  return $dom.__event; 
}

function destoryContext($dom){
  $dom.__event = null; 
}





function registerBaseEvent($dom){
  let context = getContext($dom);

  if(context.installed === true)
    return;

  $dom.addEventListener('touchstart', touchStart, false);
  $dom.addEventListener('touchmove', touchMove, false);
  $dom.addEventListener('touchend', touchEnd, false);
  $dom.addEventListener('touchcancel', touchCancel, false);
  context.installed = true;
  context = null;
}


function touchStart(evt){
  activeEvent = evt;

  let context = getContext(this);

  timer.start('longtap');
  schedule.set('tap', 'init');
  schedule.set('longtap', 'init');
}

function touchMove(evt){
  activeEvent = evt;

  let context = getContext(this);

  hasMoved = true;
  timer.start('longtap', this);
}

function touchEnd(evt){
  activeEvent = evt;

  let context = getContext(this);
  
  //tap
  triggerTap(this, evt);
  
}

function touchCancel(evt){
  activeEvent = evt;
}




function triggerTap($dom){
  let context = getContext($dom);
  let listeners = context.events;

  if(hasMoved === false && schedule.get('longtap') !== 'end'){
    if(listeners.length > 0)
      schedule.set('tap', 'end');

    timer.stop('longtap');
    schedule.set('longtap', 'cancel');

    listeners.forEach(function(listener){
      if(listener instanceof Function){
        listener.call($dom);
      }else if(listener instanceof Object && listener.processor instanceof Function){
        
        listener.processor.call($dom);
      }
    });
  }
}

function triggerLongtap($dom){
  let context = getContext($dom);
  let listeners = context.events;
  
  if(listeners.longtap.length > 0){
    schedule.set('longtap', 'end');
  }
}