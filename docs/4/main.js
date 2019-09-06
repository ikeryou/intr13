

_renderer = undefined;

_mainScene = undefined;
_mainCamera = undefined;

_maskScene = undefined;
_maskTg = undefined;

_baseScene = undefined;
_baseTg = undefined;

_maskMesh = [];
_baseMesh = [];

_dest = undefined;

// 背景色
_bgColor = 0x0000000;

_mouse = {x:0, y:0};

_cnt = 0;


// 初期設定
init();
function init() {

  var sw = $(window).width();
  var sh = window.innerHeight;

  // レンダラー
  _renderer = new THREE.WebGLRenderer({
    canvas : $('.mv').get(0),
    alpha : true,
    antialias : false,
    stencil : false,
    powerPreference : 'low-power'
  })
  _renderer.autoClear = true;

  // メインシーン
  _mainScene = new THREE.Scene();

  // メインカメラ
  _mainCamera = new THREE.PerspectiveCamera(80, 1, 0.1, 50000);

  // マスク用のシーン作成
  setupMask();

  // ベースとなるシーン作成
  setupBase();

  // 描画部分
  _dest = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(1, 1),
    new THREE.ShaderMaterial({
      vertexShader:document.getElementById("vBasic").textContent,
      fragmentShader:document.getElementById("fBasic").textContent,
      transparent:true,
      uniforms:{
        tDiffuse:{value:_baseTg.texture},
        tMask:{value:_maskTg.texture},
        color:{value:new THREE.Vector3()}
      }
    })
  );
  _mainScene.add(_dest);

  _mouse.x = window.innerWidth * 0.5;
  _mouse.y = window.innerHeight * 0.5;

  if(!isMobile.any) {
    $(window).on('mousemove', _eMouseMove);
  }

  update();
}


function _eMouseMove(e) {
  _mouse.x = e.clientX;
  _mouse.y = e.clientY;
}



// 毎フレーム実行
window.requestAnimationFrame(update);
function update() {

  _cnt++;

  if(_cnt % 2 == 0) {
    window.requestAnimationFrame(update);
    return;
  }

  var sw = window.innerWidth;
  var sh = window.innerHeight;

  // カメラ設定
  // ピクセル等倍になるように
  _mainCamera.aspect = sw / sh;
  _mainCamera.updateProjectionMatrix()
  _mainCamera.position.z = sh / Math.tan(_mainCamera.fov * Math.PI / 360) / 2;

  // レンダラーの設定
  _renderer.setPixelRatio(window.devicePixelRatio || 1);
  _renderer.setSize(sw, sh);


  // マスクとなるシーンのアニメーション
  for(var l = 0; l < _maskMesh.length; l++) {
    var arr = _maskMesh[l];
    for(var i = 0; i < arr.length; i++) {
      var m = arr[i].mesh;

      var maskSize = sw * 0.15;
      m.scale.set(maskSize, maskSize, maskSize);

      arr[i].angle += 7;
      var rd = radian(arr[i].angle * 0.5);
      var radius = Math.min(sw, sh) * 0.2;
      var x = Math.sin(rd) * radius;
      var y = Math.cos(rd) * radius;

      m.position.set((sw / arr.length) * i - sw * 0.5, y, 0);
    }
  }


  // マスク用シーンのレンダリング
  _renderer.setClearColor(_bgColor, 0);
  _maskTg.setSize(sw * window.devicePixelRatio, sh * window.devicePixelRatio);
  _renderer.setRenderTarget(_maskTg, true);
  _renderer.render(_maskScene, _mainCamera, _maskTg);


  // ベースとなるシーンのアニメーション
  for(var i = 0; i < _baseMesh.length; i++) {
    var o = _baseMesh[i];
    var m = o.mesh;
    var scaleNoise = o.scaleNoise;
    var posXNoise = o.posXNoise;
    var posYNoise = o.posYNoise;
    var speedNoise = o.speedNoise;

    // くるくる
    // m.rotation.x += 0.005 * speedNoise;
    // m.rotation.y -= 0.006 * speedNoise;
    // m.rotation.z += 0.011 * speedNoise;

    // 位置とサイズ
    var bs = Math.min(sw, sh) * 1.5
    m.scale.set(bs, bs, bs);

    var meshX = map(_mouse.x, -sw * 0.25, sw * 0.25, 0, sw) * -1;
    var meshY = map(_mouse.y, -sh * 0.25, sh * 0.25, 0, sh);
    m.position.x += (meshX - m.position.x) * 0.1;
    m.position.y += (meshY - m.position.y) * 0.1;

    var ry = radian(map(_mouse.x, -20, 20, 0, sw));
    var rx = radian(map(_mouse.y, -20, 20, 0, sh));
    var rz = radian(map(_mouse.x, -20, 20, 0, sw));
    m.rotation.x += (rx - m.rotation.x) * 0.1;
    m.rotation.y += (ry - m.rotation.y) * 0.1;
    m.rotation.z += (rz - m.rotation.z) * 0.1;
  }


  // ベースとなるシーンのレンダリング
  _renderer.setClearColor(_bgColor, 0);
  _baseTg.setSize(sw * window.devicePixelRatio, sh * window.devicePixelRatio);
  _renderer.setRenderTarget(_baseTg, true);
  _renderer.render(_baseScene, _mainCamera, _baseTg);

  var color = _dest.material.uniforms.color.value;
  color.x = map(_mouse.x, 0, 1, 0, sw);
  color.y = map(_mouse.y, 0, 1, 0, sh);
  color.z = map(_mouse.x * _mouse.y, 0, 1, 0, sw * sh);

  // 出力用メッシュを画面サイズに
  _dest.scale.set(sw, sh, 1);

  // レンダリング
  _renderer.setClearColor(_bgColor, 1);
  _renderer.render(_mainScene, _mainCamera);

  window.requestAnimationFrame(update);
}



// マスク用のシーン作成
function setupMask() {

  // マスクシーン
  _maskScene = new THREE.Scene();

  // ↑のレンダリング先
  _maskTg = new THREE.WebGLRenderTarget(16, 16);

  for(var l = 0; l < 2; l++) {
    _maskMesh.push([]);
    var num = 150;
    for(var i = 0; i < num; i++) {

      var rate = map(i, 0, 1, 0, num);
      if(l > 0) {
        rate = map((num - i), 0, 1, 0, num);
      }
      // rate = 0.5
      var color = chroma.scale([0xff0000, 0x00ff00])(rate).hex();

      var m = new THREE.Mesh(
        new THREE.CircleBufferGeometry(0.5, 8),
        new THREE.MeshBasicMaterial({
          color:new THREE.Color(color),
          transparent:true,
          opacity:0.15
        })
      );
      _maskScene.add(m);

      _maskMesh[l].push({
        mesh:m,
        angle:(360 / num) * i + 180 * l
      })
    }

  }

}



// ベースとなるシーン作成
function setupBase() {

  var sw = window.innerWidth;
  var sh = window.innerHeight;

  // ベースとなるシーン
  _baseScene = new THREE.Scene();

  // ↑のレンダリング先
  _baseTg = new THREE.WebGLRenderTarget(16, 16);

  var tex = new THREE.TextureLoader();
  tex.crossOrigin = '*';
  tex = tex.load('./text.png');

  for(var i = 0; i < 1; i++) {

    var mesh = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(1, 1),
      new THREE.MeshBasicMaterial({
        map:tex,
        transparent:true
      })
    );
    _baseScene.add(mesh);

    _baseMesh.push({
      mesh:mesh,
      scaleNoise:random(0.1, 0.2),
      posXNoise:range(0.6),
      posYNoise:range(0.6),
      speedNoise:range(0.6) * 2
    });

  }

}
