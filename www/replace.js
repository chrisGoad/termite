(function () {
var lib = tu;


lib.Application.prototype.replaceChild = function (ch,replacement) {
  var args = this.args;
  var nargs = [];
  for (var i=0;i<args.length;i++) {
    var ca = args[i];
    if (ca === ch) {
      nargs.push(replacement);
    }  else {
      nargs.push(ca.deepCopy());
    }
  }
  return new lib.Application(this.op,nargs);
}

lib.Let.prototype.replaceChild = function (ch,replacement) {
  var vr = this.vars;
  var bd = this.body;
  if (ch  == vr) {
    vr = replacement;
  } else {
    vr = vr.deepCopy();
  }
  if (ch == bd) {
    bd = replacement;
  } else {
    bd = bd.deepCopy();
  }
  return  new lib.Let(vr,bd);
}

lib.TDict.prototype.replaceChild = function (ch,replacement) {
  var dict = this.dict;
  var ndict = {};
  for (var k in dict) {
    var v = dict[k];
    if (v === ch) {
      ndict[k] = replacement;
    } else {
      ndict[k] = v.deepCopy();
    }
  }
  return new lib.TDict(ndict);
}


lib.TArray.prototype.replaceChild = function (ch,replacement) {

  var a = this.array;
  var ln = a.length;
  var na = Array(ln);
  for (var i=0;i<a.length;i++) {
    var v = a[i];
    if (v === ch) {
      na[i] = replacement;
    } else {
      na[i] = v.deepCopy();
    }
  }
  return new lib.TArray(na);
}

lib.Term.prototype.replaceToRoot = function (replacement) {
  var pr = this.parent;
  if (!pr) {
    replacement.findBinders();
    return replacement;
  }
  var npr = pr.replaceChild(this,replacement);
  return pr.replaceToRoot(npr);
}


})();
