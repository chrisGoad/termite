(function () {
var lib = tu;



lib.TDict.prototype.selector = function (child) {
  var dict = this.dict;
  for (var k in dict) {
    var v = dict[k];
    if (v === child) {
      return {"dictElement":k};
    } 
  }
}



lib.TArray.prototype.selector = function (child) {
  var a = this.array;
  for (var i=0;i<a.length;i++) {
    var v = a[i];
    if (v === child) {
      return {"arrayElement":i};
    } 
  }
}



lib.Application.prototype.selector = function (child) {
  var args = this.args;
  for (var i=0;i<args.length;i++) {
    if (args[i] ==  child) {
      return {"appArg":i};
    }
  }
}


lib.Let.prototype.selector = function (child) {
  if (this.vars ==child) {
    return "letVars";
  } else if (this.body == child) {
    return "letBody";
  }
}



lib.Term.prototype.path = function () {
  var pr = this.parent;
  if (!pr) {
    return [];
  }
  var pth = pr.path();
  var sl = pr.selector(this);
  pth.push(sl);
  return pth;
}


lib.Constant.prototype.selectStep = function (sel) {
  return "Cannot select from constant";
}

lib.TDict.prototype.selectStep = function (sel) {
  var ds = sel.dictElement;
  if (ds == undefined) return "expected selDict";
  var dct = this.dict;
  var rs = dct[ds];
  if (!rs) return "could not select dict element "+ds;
  return rs;
}



lib.TArray.prototype.selectStep = function (sel) {
  var ds = sel.arrayElement;
  if (ds == undefined) return "expected selArray";
  var a = this.array;
  var rs = a[ds];
  if (!rs) return "could not select array element "+ds;
  return rs;
}

lib.Application.prototype.selectStep = function (sel) {
  var idx = sel.appArg;
  if (idx == undefined) return "expected selArg";
  var args = this.args;
  var rs = args[idx];
  if (!rs) return "could not select argument  "+idx;
  return rs;
}


lib.Let.prototype.selectStep = function (sel) {
  if (sel == "letVars") {
    return this.vars;
  } else if (sel == "letBody") {
    return this.body;
  } else {
    return "Unexpected selector";
  }
}


lib.Term.prototype.select = function (path) {
  var rs = this;
  for (var i=0;i<path.length;i++) {
    var sel = path[i];
    rs = rs.selectStep(sel);
    if (typeof rs == "string") return rs;
  }
  return rs;
}


})();
