import { addEvent } from "./index";
import { Number, String, Object } from "core-js/library/web/timers";

// API约定样例

var type = [
  'tap',
  'longtap',

  'swipe',
  'pinch',
  'rotate',

  'group'
];

var controller = addEvent(document.createElement('div'), {
  type: type,
  //config
  repeat: Number,
  finger: Number,
  after: {
    type: type,
    config: Object
  }, //一般是longtap

  longtapThreshold: Number,//longtap间隔时间,暂定
  startWidth: String,//在不同的事件有不同的含义,快照值
  endWidth: String,//快照值

  //triggerRegister
  start: _start,
  move: _move,// 连续事件会触发这个
  end: _end,//离散事件仅仅支持end和cancel,但是语义不好
  cancel: _cancal
});

controller.enable();
controller.disable();
controller.removeEvent();
controller.set('key', 'value');

function _start(){
  //这里给出参数定义
}

function _move(){

}

function _end(){

}

function _cancal(){

}

var groupDemo = addEvent(document.createElement('div'), {
  type: 'group',
  
  group: [
    {
      type: 'tap',
      repeat: 2,
      finger: 2
    },{
      type: 'longtap',
      longtapThreshold: 700
    },{
      type: 'swipe',
      startWidth: 'left',
      endWidth: 'right'
    },{
      type: 'group',
      group: [
        {
          type: 'tap',
          repeat: 2,
          finger: 3
        },{
          type: 'longtap',
          longtapThreshold: 700
        }
      ]
    }
  ],

  start: _start,
  move: _move,
  end: _end,
  cancel: _cancal
});

groupDemo.disable();
groupDemo.set('start', function cb(){});
groupDemo.set('group', [
  {
    type: 'tap',
    repeat: 3
  }
]);
groupDemo.enable();
groupDemo.removeEvent();