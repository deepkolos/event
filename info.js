
// 我感觉有很大的依赖问题啊,唉....
// 后面需要学习设计模式, 看看别人是怎样去做拆分的

function Info () {
  // event
  this.type =         String; // 触发事件名字
  this.srcEvent =     Event;  // bus事件
  this.pointers =     Array;  // 提供raw信息源
  this.status =       String; // 当前状态

  // general
  this.timeStamp =    Number;
  this.orthocenter =  Object; // 当前时刻的重心

  // instant 相对于上一个touchmove的事件而言
  this.velocity = {
    x:          Number, // x分量的px/ms
    y:          Number, // y分量的px/ms
    distance:   Number, //  向量的px/ms
    angle:      Number,
    scale:      Number, // 多值切换时候会有问题,需要避免一下
  };

  this.instant = {
    direction: {
      swipe:    String,
      pinch:    String,
      rotate:   String
    }
  };

  // swipe   相对于start的touchmove, 当前时刻相对于start时刻重心的向量的
  this.swipe = {
    x:          Number, // x分量
    y:          Number, // y分量
    distance:   Number, // 向量的模
    startWith:  String, // 开始时的方向
    endWith:    String, // 结束时的方向
    direction:  String, //   目前的方向
  };

  // ratate
  this.rotate = {
    angle:      Number, // 单位弧度, 计算规则是当前各点到重心的弧度值的平均值,当没有重心的情况会有bug
    startWith:  String, // 开始时的方向
    endWith:    String, // 结束时的方向
    direction:  String, //   目前的方向
  };

  // pinch
  this.pinch = {
    scale:      Number, // 同distance
    startWith:  String, // 开始时的方向
    endWith:    String, // 结束时的方向
    direction:  String, //   目前的方向
  };

  // over
  this.over = {
    startWith:  String, // inside, outside(left, top, right, buttom)
    endWith:    String, // inside, outside(left, top, right, buttom)
  };
}

export default Info;