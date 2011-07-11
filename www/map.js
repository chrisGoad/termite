(function () {
var lib = tu;



lib.Term.prototype.map = function (fn) {
  fn(this);
}


// map fn in parallel down this and trm.  Do not proceed if structures differ
lib.Term.prototype.map2 = function (trm,fn) {
  fn(this,trm);
}



lib.Let.prototype.map = function (fn) {
  this.vars.map(fn);
  this.body.map(fn);
  fn(this);
}


lib.Let.prototype.map2 = function (trm,fn) {
  if (trm.kind != lib.Let) return;
  this.vars.map(trm.vars,fn);
  this.body.map(trm.body,fn);
  fn(this,trm);
}
// mapr builds a new term by applying fn at each level

lib.Let.prototype.mapr = function (fn) {
  var vrs = this.vars;
  var mvrs = vrs.mapr(fn);
  var rvrs = fn(mvrs);
  var bd = this.body;
  var mbd = bd.mapr(fn);
  var rbd = fn(mbd);
  //if ((rvrs !== vrs) || (rbd !== bd)) {
    return new lib.Let(rvrs,rbd);
  //}
  //return this;
}

lib.Term.prototype.deepCopy = function () {
  var isc = this.isConstant;
  var rs =  this.mapr(function (x) {return x;});
  rs.isConstant = isc;
  return rs;
}




lib.Variable.prototype.map2 = function (trm,fn) {
  if (trm.kind != this.kind) return;
  fn(this,trm);
}

lib.Variable.prototype.mapr = function (fn) {
  var rs = fn(this);
  if (rs == this) return new lib.Variable(this.name);
  return rs;
}


lib.Constant.prototype.map2 = function (trm,fn) {
  if (trm.kind != this.kind) return;
  fn(this,trm);
}

lib.Constant.prototype.mapr = function (fn) {
  var rs = fn(this);
  if (rs == this) return new lib.Constant(this.value,this.type);
  return rs;
}



// applies fn to each subterm
lib.TDict.prototype.map = function (fn) {
  var d = this.dict;
  for (var k in d) {
    var cc = d[k];
    cc.map(fn);
  }
  fn(this);
}


lib.TDict.prototype.map2 = function (trm,fn) {
  if (trm.kind != this.kind) return;
  var d0 = this.dict;
  var d1 = trm.dict;
  for (var k in d0) {
    var v0 = d0[k];
    var v1 = d1[k];
    if (v1) {
      v0.map2(v1,fn);
    }
  }
  fn(this,trm);
}

// rebuilds a term from the return values of fn

lib.TDict.prototype.mapr = function (fn) {
  var d = this.dict;
  var rsd = {};
  var rs = null;
  var isMod = false;
  for (var k in d) {
    var cc = d[k];
    var ccm = cc.mapr(fn);
    var ncc = fn(ccm);
    rsd[k] = ncc;
    //ncc.parent = rsd;
    if (ncc !== cc) isMod = true;
  }
  if (isMod || 1) {
    return new lib.TDict(rsd);
  }
  return this;
}


// applies fn to each subterm
lib.TArray.prototype.map = function (fn) {
  var a = this.array;
  for (var i=0;i<a.length;i++) {
    var cc = a[i];
    cc.map(fn);
  }
  fn(this);
}


lib.TArray.prototype.map2 = function (trm,fn) {
  if (trm.kind != this.kind) return;
  var a0 = this.array;
  var a1 = trm.array;
  for (var i=0;i<a0.length;i++) {
    var v0 = a0[k];
    var v1 = a1[k];
    if (v1) {
      v0.map2(v1,fn);
    } else {
      break;
    }
  }
  fn(this,trm);
}

// rebuilds a term from the return values of fn

lib.TArray.prototype.mapr = function (fn) {
  var a = this.array;
  var rsa = [];
  var rs = null;
  var isMod = false;
  for (var i=0;i<a.length;i++) {
    var cc = a[i];
    var ccm = cc.mapr(fn);
    var ncc = fn(ccm);
    rsa.push(ncc);
    //ncc.parent = rsd;
    if (ncc !== cc) isMod = true;
  }
  if (isMod || 1) {
    return new lib.TArray(rsa);
  }
  return this;
}




lib.Application.prototype.map = function (fn) {
  var a = this.args;
  for (var i=0;i<a.length;i++) {
    var ca = a[i];
    ca.map(fn);
  }
  fn(this);
}


lib.Application.prototype.map2 = function (trm,fn) {
  if (trm.kind != this.kind) return;
  fn(this.op,trm.op);
  var a0 = this.args;
  var a1 = trm.args;
  for (var i=0;i<a0.length;i++) {
    var v0 = a0[i];
    var v1 = a1[i];
    if (v1) {
      v0.map2(v1,fn);
    } else {
      break;
    }
  }
  fn(this,trm);
}


lib.Application.prototype.mapr = function (fn) {
  var a = this.args;
  var rs = null;
  var rsa = [];
  var isMod = false;
  for (var i=0;i<a.length;i++) {
    var ca = a[i];
    // first see if fn does anything, and take that, ow recurse
    var fnca = fn(ca);
    if (fnca !== ca) {
      var car = fnca;
    } else {
      var car = ca.mapr(fn);
    }
    rsa.push(car);
    //car.parent = rsa;
    if (car !== ca) isMod = true;
   
  }
  if (isMod || 1) {
    return  new lib.Application(this.op,rsa);
  }
  return this;
}


// used for repeat - sets the predecessors for each subterm of this to the corresponding element of trm
lib.Term.prototype.deepSetPredecessor = function (trm) {
  var sp = function (t0,t1) {
    t0.predecessor = t1;
  }
  this.map2(trm,sp);
}

})();
