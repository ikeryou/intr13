

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
_bgColor = 0x131521;


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
        tMask:{value:_maskTg.texture}
      }
    })
  );
  _mainScene.add(_dest);

  update();
}



// 毎フレーム実行
window.requestAnimationFrame(update);
function update() {

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
  for(var i = 0; i < _maskMesh.length; i++) {

    var m = _maskMesh[i].mesh;
    var posNoise = _maskMesh[i].posNoise;
    var maskSize = sw * 0.2;
    m.scale.set(maskSize, maskSize, maskSize);
    m.rotation.x += 0.005;
    m.rotation.y -= 0.006;
    m.rotation.z += 0.011;

    m.position.set(sw * posNoise.x, sh * posNoise.y, 0);

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
    m.rotation.x += 0.005 * speedNoise;
    m.rotation.y -= 0.006 * speedNoise;
    m.rotation.z += 0.011 * speedNoise;

    // 位置とサイズ
    var bs = Math.min(sw, sh)
    m.scale.set(bs * scaleNoise, bs * scaleNoise, bs * scaleNoise);
    m.position.set(sw * posXNoise, sh * posYNoise, 0);
  }


  // ベースとなるシーンのレンダリング
  _renderer.setClearColor(_bgColor, 0);
  _baseTg.setSize(sw * window.devicePixelRatio, sh * window.devicePixelRatio);
  _renderer.setRenderTarget(_baseTg, true);
  _renderer.render(_baseScene, _mainCamera, _baseTg);

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

  for(var i = 0; i < 5; i++) {
    var m = new THREE.Mesh(
      new THREE.BoxBufferGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({
        color:randomArr([0xff0000, 0x00ff00, 0x0000ff]),
        transparent:true,
        opacity:0.5
      })
    );
    _maskScene.add(m);
    _maskMesh.push({
      mesh:m,
      posNoise:new THREE.Vector2(range(0.5), range(0.5))
    })
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

  for(var i = 0; i < 50; i++) {

    // この２つのカラーの間
    var colorA = new THREE.Color(0xe84932);
    var colorB = new THREE.Color(0x0a1d6d);

    var mesh = new THREE.Mesh(
      new THREE.BoxBufferGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({
        color:colorA.lerp(colorB, random(0, 1)),
        wireframe:hit(2) // 確率でワイヤー表示
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
