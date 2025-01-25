import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

//=== RENDERER ===
const w = window.innerWidth;
const h = window.innerHeight;
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

//== CAMERA ===
const fov = 75; // in degrees. 5 would be very narrow, 175 would be very wide
const aspect = w / h; // aspect ratio
const near = 0.1; // anything closer than this will not be rendered
const far = 1000; // anything further than this will not be rendered
const camera = new THREE.PerspectiveCamera(fov, w / h, 0.1, 1000);
camera.position.z = 2; // move the camera back a bit so we can see the scene

//=== SCENE ===
const scene = new THREE.Scene();

const cubeTextureLoader = new THREE.CubeTextureLoader();

// https://polyhaven.com/a/rostock_laag// 
// https://matheowis.github.io/HDRI-to-CubeMap/


const environmentMap = cubeTextureLoader.load([
  'Airport/px.png',
  'Airport/nx.png',
  'Airport/py.png',
  'Airport/ny.png',
  'Airport/pz.png',
  'Airport/nz.png'
]);

// For scene background
scene.background = environmentMap;

// For scene environment (affects reflections)
scene.environment = environmentMap;

// For individual materials
//material.envMap = environmentMap;


const plasticMaterial = new THREE.MeshPhongMaterial({color: 0xffffff });
const chromeMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  metalness: 1,
  roughness: 0.1,
  envMap: environmentMap,
  envMapIntensity: 1
});

// Load and add STL file to the scene
  const loader = new STLLoader();
  loader.load(
    'StudyCadCam0618.stl',
    (geometry) => { 
      const mesh = new THREE.Mesh(geometry, chromeMaterial);
      mesh.scale.set(0.01,0.01,0.01); // Scale down if the model is too large
      mesh.position.set(0, 0, 0); // Position the model in the
      mesh.rotateY( -Math.PI / 4 ); // Rotate the model to face the camera
      mesh.rotateX( -Math.PI / 3 ); // Rotate the model to face the camera

      const xAxis = new THREE.Vector3(1, 0, 0);
      const yAxis = new THREE.Vector3(0, 1, 0);
      //mesh.rotateOnWorldAxis(yAxis, Math.PI / 4);
      //mesh.rotateOnWorldAxis(xAxis, -Math.PI / 4);

      scene.add(mesh);
      console.log("STL added to scene.");
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    (error) => {
      console.log(error);
    }
  );
  
//== LIGHT ===
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x000000); // White on top, black on bottom
hemiLight.position.set(20, 20, 20);
scene.add(hemiLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

// Set up camera position and controls
camera.position.z = 3;
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

renderer.render(scene, camera);

//=== ANIMATION ===
function animate(t=0) {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

