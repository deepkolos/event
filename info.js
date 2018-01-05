
// 我感觉有很大的依赖问题啊,唉....
// 后面需要学习设计模式, 看看别人是怎样去做拆分的
// 没想到api的设计如此纠结...

function Info () {
  // event
  this.type        = String; // 触发事件名字
  this.srcEvent    = Event;  // bus事件

  // general
  this.timeStamp   = Number;
  this.orthocenter = Object;
  this.pointers    = Object;
  this.snapshot    = Object; // 用于访问其他状态的数据

  // 这样的结构, 表明是提供对当前事件周期之前的的数据的获取, 所以问题是当前事件仅仅提供当前事件的相关信息
  // 至于储存结构, 由使用层去做?

  this.velocity = {
    x:          Number, // x分量的px/ms
    y:          Number, // y分量的px/ms
    distance:   Number, //  向量的px/ms
    angle:      Number,
    scale:      Number, // 多值切换时候会有问题,需要避免一下
  };

  this.direction = {
    refLast: {
      swipe:    String,
      pinch:    String,
      rotate:   String
    },

    // 语义的妥协
    refStart: {
      swipe:    String,
      pinch:    String,
      rotate:   String,
      over:     String
    }
  };

  // swipe   相对于start的touchmove, 当前时刻相对于start时刻重心的向量的
  this.offsetX    = Number; // x分量
  this.offsetY    = Number; // y分量
  this.distance   = Number; // 向量的模
  // ratate
  this.angle      = Number; // 单位弧度, 计算规则是当前各点到重心的弧度值的平均值,当没有重心的情况会有bug
  // pinch
  this.scale      = Number; // 与初始distance的百分比
}

export default Info;