
// ---------------------------------------
// minからmaxまでランダム
// ----------------------------------------
function random(min, max) {
  return Math.random() * (max - min) + min;
}

// ----------------------------------------
// minからmaxまでランダム int
// ----------------------------------------
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ----------------------------------------
// minからmaxまでランダム 半分の確率で-をつける
// ----------------------------------------
function random2(min, max) {
  var val = Math.random() * (max - min) + min;
  if(Math.random() > 0.5) {
    val *= -1;
  }
  return val;
}

// ----------------------------------------
// -valからvalまでランダム
// ----------------------------------------
function range(val) {
  return random(-val, val);
}

// ----------------------------------------
// 配列の中ランダム
// ----------------------------------------
function randomArr(arr) {
  return arr[randomInt(0, arr.length - 1)]
}

// 1 / rangeの確率でtrueを取得
// -----------------------------------
// @range : 2以上の分母(int)
// return : true or false(boolean)
// -----------------------------------
function hit(range) {
  return (randomInt(0, range - 1) == 0)
}

// ----------------------------------------
// 度からラジアンに変換
// @val : 度
// ----------------------------------------
function radian(val) {
  return val * Math.PI / 180;
}

// ----------------------------------------
// ラジアンから度に変換
// @val : ラジアン
// ----------------------------------------
function degree(val) {
  return val * 180 / Math.PI;
}


// ----------------------------------------
// 範囲変換
// @val     : 変換したい値
// @toMin   : 変換後の最小値
// @toMax   : 変換後の最大値
// @fromMin : 変換前の最小値
// @fromMax : 変換前の最大値
// ----------------------------------------
function map(val, toMin, toMax, fromMin, fromMax) {
  if(val <= fromMin) {
    return toMin;
  }
  if(val >= fromMax) {
    return toMax;
  }
  p = (toMax - toMin) / (fromMax - fromMin);
  return ((val - fromMin) * p) + toMin;
}
