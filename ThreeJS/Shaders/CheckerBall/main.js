import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';

function createText( text, font, x, y, z ) {

  const textGeometry = new THREE.TextGeometry( text, {
    font: font,
    size: 0.5,
    height: 0.1
  } );

  const textMaterial = new THREE.MeshBasicMaterial( { color: 0xE0E000 } );
  const textMesh = new THREE.Mesh( textGeometry, textMaterial );

  textMesh.position.set( x, y, z );

  return textMesh;
}

const _VS = `
  varying vec3 v_Normal;
  varying vec3 v_position;
  varying vec2 v_uv;

  void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  v_Normal = normal;
  v_position = position;
  v_uv = uv;
}
`;

const _FS = `
  varying vec2 v_uv;

  void main() {
    float xx = v_uv.x * 100.0;
    float yy = v_uv.y * 100.0;
    float size = 8.0;
    bool xIsOdd = mod(floor(xx / size), 2.0) > 0.0;
    bool yIsOdd = mod(floor(yy / size), 2.0) > 0.0;
    if (xIsOdd)
      if (yIsOdd)
        gl_FragColor = vec4(1.0, 0.0, 0.0, 0.0); // R, G, B, Alpha
      else
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0); // R, G, B, Alpha
    else
      if (yIsOdd)
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0); // R, G, B, Alpha
      else
        gl_FragColor = vec4(1.0, 0.0, 0.0, 0.0); // R, G, B, Alpha
}
`;

const _FS1 = `
  varying vec3 v_Normal; 
  varying vec3 v_position;

  void main() {
    float xWhole = floor(v_position.x * 100.0);
    float yWhole = floor(v_position.y * 100.0);
    float zWhole = floor(v_position.z * 100.0);
    if ( mod(yWhole,40.0) > 20.0 && mod(zWhole,40.0) > 20.0)
      gl_FragColor = vec4(v_Normal , 1.0); // R, G, B, Alpha
    else
      gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0); // R, G, B, Alpha
}
`;

  //gl_FragColor = vec4(v_Normal , 1.0); // R, G, B, Alpha
  //gl_FragColor = vec4((v_Normal + 1.0) / 2.0, 1.0); // R, G, B, Alpha
  //gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // R, G, B, Alpha


  class BasicWorldDemo {
  constructor() {
    this._Initialize();
  }


    // Helper function to create text geometry
    
  _Initialize() {
    this._threejs = new THREE.WebGLRenderer({
      antialias: true,
    });
    this._threejs.shadowMap.enabled = true;
    this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;
    //this._threejs.setPixelRatio(window.devicePixelRatio);
    this._threejs.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(this._threejs.domElement);

    window.addEventListener('resize', () => {
      this._OnWindowResize();
    }, false);


    //=== CAMERA ===
    const fov = 60;
    const aspect = 1920 / 1080;
    const near = 1.0;
    const far = 1000.0;
    this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this._camera.position.set(10, 7,15); // x=left to right, y=down to up, z=toward, away

    const controls = new OrbitControls(
      this._camera, this._threejs.domElement);
    controls.target.set(0, 0, 0);
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.PAN,
      RIGHT: THREE.MOUSE.ROTATE
    };
    controls.update();


    //=== SCENE ===
    this._scene = new THREE.Scene();


    //=== SCENE: LIGHT ===
    let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    light.position.set(20, 50, 10);
    light.target.position.set(0, 0, 0);
    light.castShadow = true;
    light.shadow.bias = -0.001;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 500.0;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 500.0;
    light.shadow.camera.left = 100;
    light.shadow.camera.right = -100;
    light.shadow.camera.top = 100;
    light.shadow.camera.bottom = -100;
    this._scene.add(light);
    
    light = new THREE.AmbientLight(0x101010);
    this._scene.add(light);


    //=== SCENE: PLANE ===
    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 20, 5, 5), // x is in and out of screen, y is left right, x,y divisions
        new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
          }));
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
   this._scene.add(plane);

    //=== SCENE: AXES ===
    // Create axes helpers
    const axesHelper = new THREE.AxesHelper( 2 );  // x=Red, y=Green, z=Blue
    this._scene.add( axesHelper );

    // Create axis labels
    const fontLoader = new THREE.FontLoader();
    fontLoader.load( 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', ( font ) => {

      const xLabel = createText('X', font, 2, 0, 0);
      const yLabel = createText('Y', font, 0, 2, 0);
      const zLabel = createText('Z', font, 0, 0, 2);

      this._scene.add( xLabel );
      this._scene.add( yLabel );
      this._scene.add( zLabel );
    } );


    // //=== SCENE: BOX1 ===
    // const box = new THREE.Mesh(
    //   new THREE.BoxGeometry(15, 5, 5), // x/width is left right, y/height is up, z/depth into the screen
    //   new THREE.MeshStandardMaterial({
    //       color: 0xFFFFFF,
    //   }));
    // box.position.set(0, 5, 0);
    // box.castShadow = true;
    // box.receiveShadow = true;
    // this._scene.add(box);

    // //=== SCENE: BOX2 ===
    // const box2 = new THREE.Mesh(
    //   new THREE.BoxGeometry(5, 5, 5), // x/width is left right, y/height is up, z/depth into the screen
    //   new THREE.MeshStandardMaterial({
    //       color: 0x0000FF,
    //   }));
    // box2.position.set(-5, 12, 0);
    // box2.castShadow = true;
    // box2.receiveShadow = true;
    // this._scene.add(box2);

//=== SCENE: BALL 1 ===
const s1 = new THREE.Mesh(
  new THREE.SphereGeometry(2, 32,32),
  new THREE.MeshStandardMaterial({color: 0xFFFFFF})
);
s1.position.set(-5,5,0);
s1.castShadow = true;
this._scene.add(s1);


//=== SCENE: BALL 2 ===
const s2 = new THREE.Mesh(
  new THREE.SphereGeometry(2, 32,32),
  new THREE.ShaderMaterial(
    {
      uniforms: {
        //resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
      },
      vertexShader: _VS,
      fragmentShader: _FS
    })
);
s2.position.set(+5,5,0);
s2.castShadow = true;
this._scene.add(s2);

    this._RAF();
  }

  _OnWindowResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this._threejs.setSize(window.innerWidth, window.innerHeight);
  }

  _RAF() {
    requestAnimationFrame(() => {
      this._threejs.render(this._scene, this._camera);
      this._RAF();
    });
  }
}


let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
  _APP = new BasicWorldDemo();
});
