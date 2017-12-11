export function make_flat_base(config){
  var repeat = config.repeat || 1;
  var result = [];

  if(repeat !== undefined && repeat > 1){
    for(var i = 0; i < repeat; i++){
      result.push(Object.assign({}, config));
    }
  }
  return result;
}

export function make_flat_group(config){
  if(config.group === undefined || config.group instanceof Array === false)
    return console.log('group配置有误');
  
  var result = [];

  if(config.type !== 'group')
    return make_flat_base(config);
  
  config.group.forEach(function(baseconfig){
    if(baseconfig.type === 'group')
      make_flat_group(baseconfig).forEach(function(item){
        result.push(item);
      });
    else
      make_flat_base(baseconfig).forEach(function(item){
        result.push(item);
      });
  });

  return result;
}