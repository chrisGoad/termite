(function () {
var lib = tu;


/* the predecessor of a term is either a term at the previous stage, or an operation. In the former case, the predessor is a path to
  be interpreted relative to the previous term. null or undefined means derived from the term at the same path.In the latter, it is the operation itself.  */


lib.Term.prototype.root = function () {
  var pr = this.parent;
  var rs = this;
  while (pr) {
    rs = pr;
    pr = pr.parent;
  }
  return rs;
}




lib.TFun.prototype.apply = function (args,alreadyChecked) {
  var fn = this.func;
  if (!alreadyChecked) {
    var ck = this.checkInputs;
    var ckv = ck.apply(null,args); // a string describing the problem might be return
    if (ckv == true) {
      return fn.apply(null,args);
    }
    return ckv;
  }
  return fn.apply(null,args);
}




lib.TFun.prototype.check = function (args) {
    var ck = this.checkInputs;
    return ck.apply(null,args); // a string describing the problem might be return
}


lib.Let.prototype.evalStep = function () {
  var body = this.body;
  var vars = this.vars;
  var thisHere = this;
  var resolveVar = function (trm) {
    if (trm.kind == lib.Variable) {
      var bnd = trm.binder;
      if (bnd === thisHere) {
        var nm = trm.name;
        var vvd = vars.dict;
        var varv = vvd[nm];
        if (varv != undefined) return varv.deepCopy();
        
      }
    }
    return trm;
  };
  var rs =  body.mapr(resolveVar);
  return rs;
}


lib.Variable.prototype.findBinder = function () {
  // find the Let that binds this variable
  var cn = this.parent;
  var nm = this.name;
  while (cn) {
    if (cn.kind == lib.Let) {
      vars = cn.vars;
      var vd = vars.dict;
      if (vd[nm] != undefined) {
        this.binder = cn;
        return cn;
      }
    }
    cn = cn.parent;
  }
}

// apply only at top level
lib.Term.prototype.findBinders = function () {
  var f = function (x) {
    if (x.kind == lib.Variable) {
      x.findBinder();
    }
  }
  this.map(f);
}

lib.Variable.prototype.value = function () {
  var b = this.binder;
  if (b) {
    var bv = b.vars;
    var d = bv.dict;
    var nm = this.name;
    return d[nm];
  }
}



lib.Constant.prototype.constantValue = function () {
  return this.value;
}


lib.isTerm = function (x) {
  if (!x) return false;
  var tp = typeof x;
  if (tp == "object") {
    return (x.constructor == lib.Term)
  }
  return false;
}





lib.TDict.prototype.constantValue = function () {
  var dict = this.dict;
  var rs = {}
  for (var k in dict) {
    var cv = dict[k];
    rs[k] = cv.constantValue()
    
  }
  rs.predecessor = this;
  return rs;
}


lib.TArray.prototype.constantValue = function () {
  var a = this.array;
  var rs = [];
  for (var i=0;i<a.length;i++) {
    var cv = a[i];
    rs.push(cv.constantValue());
    
  }
  return rs;
}


lib.Application.prototype.constantValue = function () {
  var op = this.op;
  var cnst = op.theConstructor; // these always take one argument
  var a = this.args[0];
  var av = a.constantValue();
  var rs = new cnst(av);
  rs.predecessor = this;
  return rs;
}




lib.Application.prototype.check = function () {
  return this.op.check(this.args);
}



lib.Application.prototype.apply = function (alreadyChecked) {
  if (!alreadyChecked) {
    var ck = this.check();
    if (ck!=true) return ck;
  }
  return this.op.apply(this.args);
}


lib.Application.prototype.evalStep = lib.Application.prototype.apply;


lib.replace = function (nv) {
  var rs = new lib.Modification();
  rs.kind = "replace";
  rs.newValue = nv;
  return rs;
}

lib.ApplyMod = function () {
  var rs = new lib.Modification();
  rs.kind = "apply";
  return rs;
}




lib.ApplyOp = function (path) {
   return new lib.Op(path,new lib.ApplyMod());
}

lib.ExpandMod = function () {
  var rs = new lib.Modification();
  rs.kind = "expand";
  return rs;
}

lib.ExpandOp = function (path) {
   return new lib.Op(path,new lib.ExpandMod());
}


lib.Let.prototype.evalOp = function () {
  var path = this.path();
  return lib.ExpandOp(path);
}



lib.Application.prototype.evalOp = function () {
  var path = this.path();
  return lib.ApplyOp(path);
}




lib.Term.prototype.applyModification  = function (mod,fromOp) {
  if (mod.kind == "replace") {
    var nv = new lib.Constant(mod.newValue);
    nv.predecessor = fromOp;
    return this.replaceToRoot(nv);
  }
  lib.error("Cannot apply modification to this kind of term");
}

lib.Application.prototype.applyModification = function (mod) {
  if (mod.kind == "apply") {
    var ev = this.evalStep();
    if (typeof ev == "string") {
      return ev;
    } else {
      return this.replaceToRoot(ev);
    }
  }
  return lib.Term.prototype.applyModification.call(this,mod);
}

lib.Let.prototype.applyModification = function (mod) {
  if (mod.kind == "expand") {
    return this.replaceToRoot(this.evalStep());
  }
  return lib.Term.prototype.applyModification.call(this,mod);
}



// assumes that lib.stages is current up to the specified stageN, and that lib.ops is complete; stages after stageN are recomputed

lib.execOpsFromStage = function (stageN) {
  var cst = lib.stages[stageN];
  var ln = lib.stages.length;
  for (var i=stageN+1;i<ln;i++) {
    var cjq = lib.stages[i].containerJQ;
    if (cjq) cjq.remove();
  }
  lib.stages.length = stageN + 1;
  var ops = lib.ops;
  
  for (var i=stageN;i<ops.length;i++) {
    var op = ops[i];
    op.opNum = i;
    var nst = cst.applyOp(ops[i]);
    if (typeof nst == "string") {
      nst = cst.deepCopy();
      op.failed = true;
    }
    nst.stage = i+1;
    lib.stages.push(nst);
    cst = nst;
  }  
}
lib.execOps = function (initTerm,ops) {
  var ln = ops.length;
  lib.stages.push(initTerm);
  initTerm.findBinders();
  initTerm.stage = 0;
  var ct = initTerm;
  lib.ops = ops;
  lib.execOpsFromStage(0);
  return;
  for (var i=0;i<ops.length;i++) {
    var op = ops[i];
    op.opNum = i;
    var nt = ct.applyOp(op);
    nt.stage = i+1;
    lib.stages.push(nt);
    ct = nt;
  }
}





// recurse in evaluation order, looking for the first term that satisfies fn; null if not found. 
lib.Constant.prototype.evalTarget = function () {
  return null;
}


lib.Variable.prototype.evalTarget = function () {
  return null;
}

lib.Let.prototype.evalTarget = function () {
  var vrs = this.vars;
  var rs = vrs.evalTarget();
  if (!rs) {
    return this;
  }
}


lib.Application.prototype.evalTarget = function () {
  if (this.check() == true) {
    return this; // if this can be evaulated, go ahead, even if subterms could be evalutated first.
  }
  var args = this.args;
  for (var i=0;i<args.length;i++) {
    var ca = args[i];
    var et = ca.evalTarget();
    if (et) return et;
  }
  return null;
}



lib.TArray.prototype.evalTarget = function () {
  var els = this.array;
  for (var i=0;i<els.length;i++) {
    var cel = els[i];
    var et = cel.evalTarget();
    if (et) return et;
  }
  return null;
}




lib.TDict.prototype.evalTarget = function () {
  var d = this.dict;
  for (var k in d) {
    var cv = d[k];
    var et = cv.evalTarget();
    if (et) return et;
  }
  return null;
}


// evaluate the term this, assumed to be a subterm of the last stage
lib.Term.prototype.stageEvalStep = function () {
  var et = this.evalTarget();
  if (!et) return null; // done
  var tpath =this.path();
  var rt = this.root();
  var st = rt.stage;
  var op = et.evalOp();
  lib.ops.splice(st,0,op);
  var nt = rt.applyOp(op);
  nt.stage = st+1;
  lib.stages.splice(st+1,0,nt);
  return nt.select(tpath); // the updated/evaluated variant of the term this.
}


// evaluates the current term as far as possible
lib.Term.prototype.stageEval = function () {
  var ct = this;
  while(true) {
    ct = ct.stageEvalStep();
    if (!ct) return;
  }
}

lib.pathValue = undefined;


lib.setPathValue = function () {
  var lt = lib.stages[lib.stages.length-1];
  if (lt.isConstant) {
    var rs = lt.constantValue();
  } else {
    rs = undefined;
  }
  lib.pathValue = rs;
  return rs;

}

lib.Term.prototype.computePredecessor = function () {
  var p = this.predecessor;
  if (p) return p;
  var rt = this.root();
  var stg = rt.stage;
  var pth = this.path();
  if (stg == 0) return undefined;
  var pstg = lib.stages[stg-1];
  var rs = pstg.select(pth);
  if (typeof rs == "string") {
    var op = lib.ops[stg-1];
    lib.error(op);
    return undefined;
  }
  return rs;
}
// follow the term back to its source
lib.Term.prototype.trace = function () {
  var rs = [this];
  var ct = this;
  while (true) {
    
    ct = ct.computePredecessor();
    if (!ct) return rs;
    if (ct.constructor==lib.Op) {
      rs.push(ct);
      return rs;
    }
    //ct.highlight("purple"); // for debugging
    rs.push(ct);
  }
}
  
  
  

})();
