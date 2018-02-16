
export function dom (str, container = 'div') {
  var $container = document.createElement(container);
  $container.innerHTML = str;
  return $container.children;
}

