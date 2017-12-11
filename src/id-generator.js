
function IDGenerator(){
  this.id = 0;
}

IDGenerator.prototype.new = function(){
  return this.id++;
};

export default IDGenerator;