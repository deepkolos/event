

export function addEvent($dom, type, config){

  //初始化dom里面的储存结构
  if($dom.__event === undefined){
    $dom.__event = {

    };

    $dom.addEventListener('touchstart', _touchstart, false);
    $dom.addEventListener('touchmove', _touchmove, false);
    $dom.addEventListener('touchend', _touchend, false);
    $dom.addEventListener('touchcancel', _touchcancel, false);
  }

  //添加事件配置

}

// 内部实现

var _schedule = {
  base: null,
  group: null
};
var _triggerlist;
var _bubble_started = false;
var _dom_involved;// [], order from bubble start to end
var _last_dom_involved;

function _touchstart (evt){
  _triggerbubble(this, evt);
}

function _touchmove(evt){
  _triggerbubble(this, evt);
}

function _touchend(evt){
  _triggerbubble(this, evt);
}

function _touchcancel(evt){
  _triggerbubble(this, evt);
}

function _bubblestart(evt){
  //尝试去触发groupstart
  if(evt.touches.length === 1 && evt.type === 'touchstart'){
    _groupstart(evt);
  }

  //事件发生源,生成triggerlist


}

function _bubbleend(evt){
  //尝试去触发groupsend
  if(evt.touches.length === 1 && evt.type === 'touchend'){
    _groupend(evt);
  }
}

function _groupstart(evt){
  //初始化这次group涉及涉及的dom
  _dom_involved = [];
  evt.path.forEach(function($dom){
    if($dom.__event !== undefined){
      _dom_involved.push($dom);
    }
  });
  _last_dom_involved = _dom_involved[_dom_involved.length-1];

  //生成schedule
  _dom_involved.forEach(function($dom){

  });
}

function _groupend(evt){

}

function _triggerbubble($nowDom, evt){
  if(_bubble_started === false){
    _bubble_started = true;
    _bubblestart(evt);
  }
  if(_bubble_started === true && $nowDom === _last_dom_involved){
    _bubble_started = false;
    _bubbleend(evt);
  }
}