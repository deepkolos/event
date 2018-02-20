## 一个事件库

> 事件分类方式

0. 作用于dom/finger/event
1. 离散/连续事件

```json
[{
  "dom": [
    "over",
    "focus",
    "blur"
  ],
  "event": [
    "bubbleEvent",
    "groupEvent"
  ],
  "finger": {
    "base": [
      "tap",
      "longtap",
      "swipe",
      "pinch",
      "rotate"
    ],
    "group": [
      "doubletap"
      "base finger combinations..."
    ]
  }
}]
```

一些定义目前在api.js里头,后面再整理
