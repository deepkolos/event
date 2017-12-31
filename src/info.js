
// 我感觉有很大的依赖问题啊,唉....
// 后面需要学习设计模式, 看看别人是怎样去做拆分的

function Info () {
  /* workflow
    0. 复制一些属性, 注意引用被刷走的情况
    1. 生成数据咯
  */

  // event
  this.target =       HTMLElement;
  this.type =         String; // 触发事件名字
  this.eventType =    String; // 事件类型, 从EVENT的定义信息
  this.srcEvent =     Event;
  this.touches =      Array;  // 提供raw信息源
  // 感觉需要个config的链接, TBD

  // general
  this.deltaTime =    Number; // 定义为该事件的start -> end的时间戳差值
  this.orthocenter =  Object; // 当前时刻的重心

  // instant 相对于上一个touchmove的事件而言
  this.velocity = {
    x:          Number, // x分量的px/ms
    y:          Number, // y分量的px/ms
    distance:   Number, //  向量的px/ms
    angle:      Number,
    scale:      Number,
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
    direction:  String, // 感觉的确不应该使用string来作为状态的标识
  };

  // ratate
  this.rotate = {
    angle:      Number, // 单位弧度, 计算规则是当前各点到重心的弧度值的平均值,当没有重心的情况会有bug
    startWith:  String, // 开始时的方向
    endWith:    String, // 结束时的方向
    direction:  String,
  };
  
  // pinch
  this.pinch = {
    scale:      Number, // 同distance
    startWith:  String, // 开始时的方向
    endWith:    String, // 结束时的方向
    direction:  String,
  };

  // longtap TBD
  this.longtap = {
    threshold:  Number, // 单位ms
  };
}

export default Info;