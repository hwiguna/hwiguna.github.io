// This is a tutorial by Robot Bobby.
// https://www.youtube.com/watch?v=XPhAR1YdD6o

import * as THREE from 'three';

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
const far = 10; // anything further than this will not be rendered
const camera = new THREE.PerspectiveCamera(fov, w / h, 0.1, 1000);
camera.position.z = 2; // move the camera back a bit so we can see the scene

//=== SCENE ===
const scene = new THREE.Scene();

//== ICOSAHEDRON: GEOMETRY ===
const geo = new THREE.IcosahedronGeometry(1.0, 2); // size and detail

//== ICOSAHEDRON: FLAT SHADING MESH ===
// MeshStandardMaterial interacts with lights (MeshBasicMaterial does not)
const mat = new THREE.MeshStandardMaterial({
    color: 0x00ffff,
    flatShading: true
}); 
const ballMesh = new THREE.Mesh(geo, mat);
scene.add(ballMesh);

//== ICOSAHEDRON: WIREFRAME MESH ===
const wireMat = new THREE.MeshBasicMaterial({
    color: 0xffffff, 
    wireframe: true
});
const wireMesh = new THREE.Mesh(geo, wireMat);
wireMesh.scale.setScalar(1.001); // slightly larger than the flat shading mesh to avoid flickering due to z-fighting
//scene.add(wireMesh); // This independently adds the wireframe mesh to the scene
ballMesh.add(wireMesh); // This adds the wireframe mesh as a child of the flat shading mesh

//== LIGHT ===
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x000000); // White on top, black on bottom
scene.add(hemiLight);

//=== ANIMATION ===
function animate(t=0) {
    requestAnimationFrame(animate);
    ballMesh.rotation.x += 0.01;
    ballMesh.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();

