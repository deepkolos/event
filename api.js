import { addEvent } from "./index";
import { Number, String } from "core-js/library/web/timers";

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
  disable: Boolean,
  repeat: Number,
  finger: Number,
  when: {//其含义是在一个group内某个事件之后,所以必须是基事件,但是需要支持after的嵌套..不支持,不想增加复杂度了
    type: type,
    finger: Number,
    status: String/Array,// init, start, move, end, cancel
    repeat: 1,//只能为1,不支持group
    when: {}//会被忽略...
  }, //一般是longtap, 也可以做swipe, 有点难描述, 我觉得我应该换位置编写的

  longtapThreshold: Number,//longtap间隔时间,暂定
  startWith: String/Array,//在不同的事件有不同的含义,快照值
  endWith: String/Array,//快照值
  ignoreGroupBlock: Boolean,//名字暂定,控制该事件在有其他group触发的时候是否触发,或者延迟触发, 这层灵活性先不提供了

  //triggerRegister
  start:  _start,
  move:   _move,// 连续事件会触发这个
  end:    _end,//离散事件仅仅支持end和cancel,但是语义不好
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
      startWith: 'left',
      endWith: 'right'
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

  start:  _start,
  move:   _move,
  end:    _end,
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


//如果遇到[1] [1,2] 基事件描述1相同, 仅仅阻塞的是end事件
//就是[1]的start,move事件依然会触发的, 至于是触发end, 还是cancel就需要看group_gap之内,下一个group有没有start

// 参考hammer的Event Object
function listener (info) { /*eslint no-unused-vars:0*/
  info = {
    // general
    deltaTime:    Number, // 定义为该事件的start -> end的时间戳差值
    orthocenter:  Number, // 当前时刻的重心

    // runtime 相对于上一个touchmove
    velocity:     Number, //  向量的px/ms
    velocityX:    Number, // x分量的px/ms
    velocityY:    Number, // y分量的px/ms
    direction:    String, // 感觉的确不应该使用string来作为状态的标识

    // swipe   相对于start的touchmove, 当前时刻相对于start时刻重心的向量的
    swipe: {
      deltaX:     Number, // x分量
      deltaY:     Number, // y分量
      distance:   Number, // 模
      startWith:  String,
      endWith:    String,
    },

    // ratate
    rotate: {
      angle:      Number, // 单位弧度, 计算规则是当前各点到重心的弧度值的平均值,当没有重心的情况会有bug
      startWith:  String,
      endWith:    String,
    },
    
    // pinch
    pinch: {
      scale:      Number, // 同distance
      startWith:  String,
      endWith:    String,
    },

    longtap: {
      threshold:  Number, // 单位ms
    },

    // event
    type:         String, // 触发事件名字
    eventType:    String, // 事件类型, 从EVENT的定义信息
    srcEvent:     Event,
    target:       HTMLElement,
    pointers:     Array,  // 应该是touches, 提供raw信息源
  };
}
