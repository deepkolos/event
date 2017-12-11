
function IDGenerator(){
  this._id = 0;
}

IDGenerator.prototype.new = function(){
  return this._id++;
};

export default IDGenerator;