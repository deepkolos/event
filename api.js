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
    status: Number,// 0, -1, -2, -3, -4 分别对应init, start, move, end, cancel
    repeat: 1,//只能为1,不支持group
    when: {}//会被忽略...
  }, //一般是longtap, 也可以做swipe, 有点难描述, 我觉得我应该换位置编写的

  longtapThreshold: Number,//longtap间隔时间,暂定
  startWith: String,//在不同的事件有不同的含义,快照值
  endWith: String,//快照值
  ignoreGroupBlock: Boolean,//名字暂定,控制该事件在有其他group触发的时候是否触发,或者延迟触发, 这层灵活性先不提供了

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


//如果遇到[1] [1,2] 基事件描述1相同, 仅仅阻塞的是end事件
//就是[1]的start,move事件依然会触发的, 至于是触发end, 还是cancel就需要看