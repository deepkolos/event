import { setTimeout, Object } from "core-js/library/web/timers";
import { clearTimeout } from "timers";


const TYPES = [
  // 离散事件
  'tap',
  'doubletap',
  
  //连续事件
  'swipe',
  'pinch',
  'rotate',
  'longtap',

  //相对dom来说
  'focus',
  'blur',
  'over', //连续
  'enter',
  'leave'
];

const LONGTAP_TIME = 700;
const LONGTAP_DELAY = 35;
const GROUP_GAP = 200;

/*
  context = {
    timer: {}
    events: {},
    schedule: {}
  }
*/

// 对外可用方法
export function addEvent (type, $dom, config={}){

  if(typeof type === 'string' && !~TYPES.indexOf(type)){
    throw 'type非法,请检查是否拼错了~';
  }

  if($dom instanceof HTMLElement === false){
    throw '$dom不是HTMLElement,请检查节点是都获取失败了~';
  }

  initContext($dom);
  registerBaseEvent($dom);

  config;
  // 解析config,生成runtimeConfig
  
}

export function destory ($dom){
  $dom.removeEventListener('touchstart', touchStart, false);
  $dom.removeEventListener('touchmove', touchMove, false);
  $dom.removeEventListener('touchend', touchEnd, false);
  $dom.removeEventListener('touchcancel', touchCancel, false);

  reset();
  destoryContext($dom);
}


// 内部使用方法

//在一个毛国过程中各各dom可以公用的数据

let startTime = null;
let endTime = null;
let isMoved = false;

let startTouches = null;
let moveTouches = null;
let endTouches = null;

function initContext($dom){
  if($dom.__event === undefined)
    $dom.__event = {};

  if($dom.__event.events === undefined)
    $dom.__event.events = {};
}

function getContext($dom){
  return $dom.__event; 
}

function destoryContext($dom){
  $dom.__event = null; 
}

function reset(){

}

function now (){
  return +new Date().getTime();
}

function copyTouches(touches){
  let _touches = [], i, len;

  for(i=0, len = touches.length; i < len; i++){
    _touches.push({
      x: touches[i].clientX,
      y: touches[i].clientY
    });
  }
  return _touches;
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

function startTimer(type, $dom){
  let context = getContext($dom);

  if(context.timer === undefined)
    context.timer = {};
  
  let timer = context.timer;

  switch(type){

  case 'longtapDelay': 
    timer[type] = setTimeout(function(){
      if(isMoved === false){
        trigger('longtap', 'start', $dom);
        startTimer('longtap', $dom);
      }
      cancelTimer(type, $dom);
    }, LONGTAP_DELAY);
    break;

  case 'longtap':
    timer[type] = setTimeout(function(){
      if(isMoved === false){
        trigger('longtap', 'end', $dom);
      }
      cancelTimer(type, $dom);
    }, LONGTAP_TIME);
    break;
  }

  timer = null;
  context = null;
}

function cancelTimer(type, $dom){
  let timer = getContext($dom).timer;

  if(timer[type]){
    clearTimeout(timer[type]);
    timer[type] = null;
  }

  timer = null;
}

function initSchedule($dom){
  
}

//统一的事件处理机制函数
function touchStart(evt){
  //状态重置
  isMoved = false;
  startTime = now();
  startTouches = copyTouches(evt.touches);

  let context = getContext(this);
  
  initSchedule($dom);

  //开始生命周期
  //开始longtap的timer
  startTimer('longtapDelay', this);

  //是否是doubletap

  //处理blur,focus

  //处理enter,leave

}

function touchMove(evt){
  isMoved = true;
  
}

function touchEnd(evt){
  
}

function touchCancel(evt){
  
}

function trigger(type, subtype, $dom){
  let context = getContext($dom);
  let listeners = context.events[type];

  if(listeners instanceof Array){
    listeners.forEach(function(listener){
      //检查配置,在这里做有点尴尬的...

      //触发调用
      listener.call($dom);
    });
  }
}