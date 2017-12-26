import { 
  EVENT,
  STATUS,
  START_END_WITH,
  TYPE_CONTINUOUS,
  DEFAULT_LONGTAP_THRESHOLD
} from './define';

export function make_flat_base(config) {
  var repeat = config.repeat || 1;
  var result = [];

  init_start_end_with(config);
  config.type_id = get_type_id(config);

  for (var i = 0; i < repeat; i++) {
    result.push(Object.assign({}, config));
  }

  return result;
}

export function make_flat_group(config) {
  if (config.group === undefined || config.group instanceof Array === false) {
    return make_flat_base(config);
  }

  var result = [];

  if (config.type !== 'group')
    return make_flat_base(config);

  config.group.forEach(function (baseconfig) {
    if (baseconfig.type === 'group')
      make_flat_group(baseconfig).forEach(function (item) {
        result.push(item);
      });
    else
      make_flat_base(baseconfig).forEach(function (item) {
        result.push(item);
      });
  });

  return result;
}

export function get_base_id(config) {
  var type = EVENT[config.type].type;
  var opts = [
    {
      key: 'finger',
      value: config.finger
    }
  ];
  var opts_string = [];
  var when = '';

  opts.push();

  if (type === TYPE_CONTINUOUS) {
    opts.push({
      key: 'startWith',
      value: config.startWith
    });
    opts.push({
      key: 'endWith',
      value: config.endWith
    });
  }

  if (config.type === 'longtap') {
    opts.push({
      key: 'longtapThreshold',
      value: config.longtapThreshold
    });
  }

  if (config.when !== undefined) {
    when = get_base_id(config.when);
  }

  opts.forEach(function (opt) {
    opts_string.push(`${opt.key}=${opt.value}`);
  });

  return `${config.type}[${opts_string.join(',')}]{${when}}`;
}

export function get_group_Id(config) {
  var opts_string = [];

  config.forEach(function (baseconfig) {
    opts_string.push(get_base_id(baseconfig));
  });

  return opts_string.join(',');
}

export function get_type_id(config) {
  var type = config.type;
  if (type === 'longtap')
    return type + '_' + config.longtapThreshold;

  return type;
}

export function last_arr(num, arr) {
  return arr[arr.length - num];
}

// 感觉有使用ts的需求了,type
export function Type(){
  var config = arguments;

  if (config[0] instanceof Object) {
    config = config[0];
  }

  Object.keys(config).forEach(function(code){
    code = parseInt(code);
    this[code] = config[code];
    this[config[code]] = code;
  }.bind(this));
}

export function config_equal (current, setting) {
  if (setting instanceof Array) {
    return setting.includes(current);
  } else if(setting instanceof Object === false) {
    return current === setting;
  }
}

function init_start_end_with_helper (type, config) {
  var result   = [];
  var evt_type = config.type;
  var _with    = config[type];

  if (_with instanceof String) {
    result = explode_with_string(_with, evt_type);
  } else if (_with instanceof Array) {
    _with.forEach(function(string){
      explode_with_string(string, evt_type)
        .forEach(result.push.bind(result));
    });
  }

  if (result.length !== 0)
    config[type] = result;
}

function explode_with_string (string, evt_type){
  var _      = START_END_WITH[evt_type];
  var result = [_[string]];

  if (evt_type === 'swipe') {
    switch (string) {
    case 'any':
      result = [_.left, _.right, _.up, _.down];
      break;
    case 'horizontal':
      result = [_.left, _.right];
      break;
    case 'vertical':
      result = [_.up, _.down];
      break;
    }
  }
  
  return result;
}

export function init_start_end_with (config){
  // 只有连续事件才有
  if(EVENT[config.type].type === TYPE_CONTINUOUS) {
    init_start_end_with_helper('endWith', config);
    init_start_end_with_helper('startWith', config);
  }
}

export function init_when (config){
  if (config.when) {
    var evt_when_status = config.when.status;

    if (
      config.when.longtapThreshold === undefined && 
      config.when.type === 'longtap'
    ) {
      config.when.longtapThreshold = DEFAULT_LONGTAP_THRESHOLD;
    }

    if(evt_when_status === undefined){
      config.when.status = STATUS.end;

    } else if (evt_when_status instanceof String) {
      config.when.status = STATUS[config.when.status];

    } else if(evt_when_status instanceof Array) {
      if (evt_when_status.length === 0) {
        config.when.status = STATUS.end;
      } else {
        config.when.status = evt_when_status.map(function(string){
          return STATUS[string];
        });
      }
    }
  }
}

export function clean_arr (arr) {
  for (var i = 0, len = arr.length; i < len; i++) {
    delete arr[i];
  }
}