


var geom  = {};
//image geometry in that funky coordinate system with upper left at 0,0

(function () {
  var lib = geom;
 
  lib.Point = function (x,y) {
    this.x = x;
    this.y = y;
  }
  
  lib.Point.prototype.times = function (z) {
    return new lib.Point(z*this.x,z*this.y);
  }
  
  
  lib.Point.prototype.timesX = function (z) {
    return new lib.Point(z*this.x,this.y);
  }
  
  // divisor might be a point
  lib.Point.prototype.divideBy = function (z) {
    var x = this.x;
    var y = this.y;
    if (!z) debugger;
    if (typeof z == "number") {
      return new lib.Point(x/z,y/z);
    }
    return new lib.Point(x/(z.x),y/(z.y));
  }
  
  
  
  lib.Point.prototype.plus = function (p) {
    return new lib.Point(this.x + p.x,this.y + p.y);
  }
  
  
  lib.Point.prototype.minus = function (p) {
    if (typeof p == "undefined") {
      return new lib.Point(-this.x,-this.y);
    }
    return new lib.Point(this.x - p.x,this.y - p.y);
  }
  
  lib.Point.prototype.clone = function () {
    return new lib.Point(this.x,this.y);
  }
  
  lib.Point.prototype.externalize = function () {
    return {x:this.x,y:this.y}
  }
  
  lib.internalizePoint = function (p) {
    return new lib.Point(p.x,p.y);
  }
  
  
  lib.Bounds = function (min,max) {
    this.min = min;
    this.max = max;
  }
  
  lib.Bounds.prototype.intersect = function (b) {
    var min = Math.max(this.min,b.min);
    var max = Math.min(this.max,b.max);
    if (min >= max) return null;
    return new lib.Bounds(min,max);
  }
  
  lib.Rect = function (corner,extent) {
    this.corner = corner;
    this.extent = extent;
  }
  
  lib.Rect.prototype.times = function (s) {
    return new lib.Rect(this.corner.times(s),this.extent.times(s));
  }
  
  lib.Rect.prototype.applyPointOperation = function (f) {
    var ul = this.corner;
    var lr = this.lowerRight();
    var vul = f(ul);
    var vlr = f(lr);
    return lib.newRectFromCorners(vul,vlr);
  }


  // for firebug debuggery
  lib.Rect.prototype.tostring= function () {
    var c = this.corner;
    var ex = this.extent;
    return "[rect ("+Math.floor(c.x)+","+Math.floor(c.y)+")("+Math.floor(ex.x)+","+Math.floor(ex.y)+")]"
  }
  
  
  lib.internalizeRect = function (r) {
    return new lib.Rect(lib.internalizePoint(r.corner),lib.internalizePoint(r.extent));
  }
  
  lib.Rect.prototype.externalize = function () {
    return {corner:this.corner.externalize(),extent:this.extent.externalize()};
  }
  
  lib.Rect.prototype.clone = function () {
    return new lib.Rect(this.corner,this.extent);
  }
 
    
  lib.Rect.prototype.maxX = function () {
    return this.corner.x + this.extent.x;
  }


  lib.Rect.prototype.maxY = function () {
    return this.corner.y + this.extent.y;
  }

  lib.Rect.prototype.scale = function (s) {
    return new lib.Rect(this.corner.times(s),this.extent.times(s));
  }
  
  
  lib.Rect.prototype.center = function () {
    var c = this.corner;
    var ext = this.extent;
    var cntx = c.x + 0.5 * ext.x;
    var cnty = c.y + 0.5 * ext.y;
    return new lib.Point(cntx,cnty);
  }

  lib.Rect.prototype.lowerRight = function () {
    return this.corner.plus(this.extent);
  }

  lib.Rect.prototype.yBounds = function () {
    return new lib.Bounds(this.corner.y,this.corner.y + this.extent.y);
  }  
  
  
  lib.Rect.prototype.xBounds = function () {
    return new lib.Bounds(this.corner.x,this.corner.x + this.extent.x);
  }  
  
  lib.newRectFromBounds = function (xb,yb) {
    var c = new lib.Point(xb.min,yb.min);
    var xt = new lib.Point(xb.max-xb.min,yb.max-yb.min);
    return new lib.Rect(c,xt);
  }
  
  lib.newRectFromCorners = function (ur,ll) {
    var xt = ll.minus(ur);
    return new lib.Rect(ur,xt);
  }
  
  
  lib.Rect.prototype.intersect = function (rc) {
    var xb = this.xBounds().intersect(rc.xBounds());
    if (!xb) return null;
    var yb = this.yBounds().intersect(rc.yBounds());
    if (!yb) return null;
    return lib.newRectFromBounds(xb,yb);
  }
  
  lib.Linear1 = function (sc,tr) {  // a linear transformation x*sc + tr
    this.scale = sc;
    this.translate = tr;
  }
  
  lib.Linear2 = function (x,y) { //separately in x and y
    this.x = x;
    this.y = y;
  }
  
  lib.Linear1.prototype.inverse = function (x) {
    var sc = this.scale;
    var isc = 1.0/sc;
    var tr = this.translate;
    return new lib.Linear1(isc,-tr*isc);
  }
  
  lib.Linear2.prototype.inverse = function (f) {
    return new lib.Linear2(this.x.inverse(),this.y.inverse());
  }
  
  lib.Linear2.prototype.apply = function (p) {
    var lx = this.x;
    var ly = this.y;
    var scx = lx.scale;
    var scy = ly.scale;
    var tx = lx.translate;
    var ty = ly.translate;
    var rx = tx + scx * p.x;
    var ry = ty + scy * p.y;
    return new lib.Point(rx,ry);
  }
  
  lib.LinearFromBoundsPair = function (b0,b1) { // scale and translate to map b0 to b1
    var sc = (b1.max - b1.min)/(b0.max-b0.min);
    var tr = b1.max - b0.max * sc;
    return new lib.Linear1(sc,tr);
  }
  
  
  // the TS that maps  r0 to  r1
  lib.RectToRect = function (r0,r1) {
    var c0 = r0.corner;
    var c1 = r1.corner;
    var xt0 = r0.extent;
    var xt1 = r1.extent;
    var tr = c1.diff(c0);
    var sc = new lib.Point((xt1.x)/(xt0.x),(xt1.y)/(xt0.y));
    return new lib.TS(tr,sc);
    
  }
  
  lib.Grid =  function (rows,corner,extent) {
    this.rows = rows; // an array of arrays
    this.rowCount = rows.length;
    this.colCount = rows[0].length;
    var xInc = extent.x/(this.rowCount - 1);
    var yInc = extent.y/(this.colCount - 1);
    this.corner = corner;
    this.extent = extent;
    this.cellDim = new lib.Point(xInc,yInc);
  }
     // find the cell that contains this point - and return  a pair cell,withinCell, where
     // cell is xidx,yidx of the  upper left corner (using graphics Y down convention)
     // and withinCell  is x,y where 0 is left end or top, and  1 is right end, or bottom

 
  lib.Grid.prototype.inCell = function (p) {
    var rc = p.minus(this.corner);
    var cellDim = this.cellDim;
    var xidx = Math.floor(rc.x/cellDim.x);
    var yidx = Math.floor(rc.y/cellDim.y);
    var cell = new lib.Point(xidx,yidx);
    var cellDim = this.cellDim;
    var relcell = p.minus(p,new lib.Point(xidx * cellDim.x,yidx * cellDim.y));
    var normalizedRelcell = relcell.divideBy(cellDim);
    return {cell:cell,withinCell:normalizedRelcell};
  }
  
  lib.Grid.prototype.valueAtGridPoint = function (p) { // p = xidx,yidx
    var rows = this.rows;
    var row = rows[p.y];
    return row[p.x];
  }
  
  lib.Grid.prototype.valueAtPoint = function (p) {
    var cin = this.inCell(p);
    var c = cin.cell;
    var incell = cin.withinCell;
    var vp0 = this.valueAtGridPoint(c);
    var vp1 = this.valueAtGridPoint(new lib.Point(c.x+1,c.y));
    var vp2 = this.valueAtGridPoint(new lib.Point(c.x,c.y+1));
    var vp3 = this.valueAtGridPoint(new lib.Point(c.x+1,c.y+1));
    // bilinear first interpolate between vp0 and vp1, and vp2, vp3
    // then between these values.
    var incx = incell.x;
    var incy = incell.y;
    var topI = vp0 * (1-incx) + vp1 * incx;
    var bottomI = vp2 * (1-incx) + vp1 * incx;
    var rs = topI * (1-incy) + bottomI  * incy;
    return rs;
  }
    
    
  //1d
  lib.Grid1 =  function (values,lb,ub) {
    this.values = values; 
    this.count = values.length;
    this.increment = (ub-lb)/(this.count - 1);
    this.lb = lb;
    this.ub = ub;
  
  }
     // find the cell that contains this point - and return  a pair cell,withinCell, where
     // cell is xidx,yidx of the  upper left corner (using graphics Y down convention)
     // and withinCell  is x,y where 0 is left end or top, and  1 is right end, or bottom

 
  lib.Grid1.prototype.inCell = function (x) {
    var lb = this.lb;
    var r = x-lb;
    var inc = this.increment
    var idx = Math.floor(r/inc);
  
    var relcell = (r - idx*inc)/inc;
    return {cell:idx,withinCell:relcell};
  }
  
  
  lib.Grid1.prototype.valueAt = function (x) {
    var cin = this.inCell(x);
    var idx = cin.cell;
    var incell = cin.withinCell;
    var values = this.values;
    var v0 = values[idx];
    var v1 = values[idx+1];
    var rs = v1 * incell + v0 * (1-incell);
    
    return rs;
  }
    
  
  
  
  lib.scaleRect = function (rect,corner,scale) {
    var nex = rect.extent.times(scale);
    var rs = new lib.Rect(corner,nex);
    return rs;
  }
  
  
    
  
  
  lib.scaleRectX = function (rect,corner,scale) {
    var nex = rect.extent.timesX(scale);
    var rs = new lib.Rect(corner,nex);
    return rs;
  }
  
  // takes [[x0,y0],[x1,y1],[x2,y2] ...] and turns it into an array of points
    
  lib.arrayToPoints  = function (a) {
    var rs = [];
    for (var i=0;i<a.length;i++) {
      var cv = a[i];
      rs.push(new lib.Point(cv[0],cv[1]));
    }
    return rs;
  }
    

// piecewise linear function; given by a series of points sorted in x
lib.PWL = function (points) {
  this.points = points;
  this.bounds = this.computeBounds()
}

lib.PWL.prototype.computeMaxX = function () {
  var mxx = undefined;
  var points = this.points;
  var ln = points.length;
  for (var i=0;i<ln;i++) {
    var cp = points[i];
    var cx = cp.x;
    if (mxx === undefined) {
      mxx = cx;
    } else {
      mxx = Math.max(mxx,cx);
    }
  }
  this.cMaxX = mxx;
}

lib.PWL.prototype.computeMinX = function () {
  var mnx = undefined;
  var points = this.points;
  var ln = points.length;
  for (var i=0;i<ln;i++) {
    var cp = points[i];
    var cx = cp.x;
    if (mnx === undefined) {
      mnx = cx;
    } else {
      mnx = Math.min(mnx,cx);
    }
  }
  this.cMinX = mnx;
  return mnx;
}

lib.PWL.prototype.computeBounds = function () {
  this.computeMinX();
  this.computeMaxX();
  this.xbounds = new geom.Bounds(this.minX,this.maxX);
}

lib.PWL.prototype.maxX = function () {
  if (this.cMaxX === undefined) {
    return this.computeMaxX();
  } else {
    return this.cMaxX;
  }
}


lib.PWL.prototype.minX = function () {
  if (this.cMinX === undefined) {
    return this.computeMinX();
  } else {
    return this.cMinX;
  }
}


lib.PWL.prototype.value = function (x) {
  // binary search someday
  var mnx = this.minX();
  var mxx = this.maxX();
  if ((x < mnx) || (x > mxx)) return undefined;
  var pnts = this.points;
  var e0 = pnts[0];
  var e1 = pnts[1];
  var idx = 1;
  while (true) {
    if (x <= e1.x) {
      return e0.y + (e1.y - e0.y)*((x - e0.x)/(e1.x - e0.x));
    }
    idx++;
    e0 = e1;
    e1 = pnts[idx];
  }
}

lib.arrayToPWL = function (a) {
  return new lib.PWL(lib.arrayToPoints(a));
}
    

  

})();

