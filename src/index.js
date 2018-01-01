import { WebGLRenderer, Scene, PerspectiveCamera, PointLight } from 'three';
import * as THREE from 'three';

import loop from 'raf-loop';
import resize from 'brindille-resize';

import OBJLoader from 'three-obj-loader';
import average from 'analyser-frequency-average';

import OrbitControls from './js/OrbitControls';
import { analyser, freq, bands } from './js/audioFreqs';

OBJLoader(THREE);

/************************* **********************/

var particles;

/* Init renderer and canvas */
const container = document.body;
const renderer = new WebGLRenderer({ antialias: true });
renderer.setClearColor(0x222222);
container.style.overflow = 'hidden';
container.style.margin = 0;
container.appendChild(renderer.domElement);

/* Main scene and camera */
const scene = new Scene();
const camera = new PerspectiveCamera(
  90,
  resize.width / resize.height,
  0.1,
  1000
);

camera.position.set(0, 0, 100);

/* navigate inside scene */

const controls = new OrbitControls(camera, {
  element: renderer.domElement,
  distance: 100,
  phi: Math.PI * 10.5
});

/* Lights */
const ambLight = new THREE.AmbientLight(0x0, 0.75);
scene.add(ambLight);
ambLight.position.x = 50;
ambLight.position.y = 1.5;

const light = new THREE.PointLight(0xffffff, 0.5);
scene.add(light);
light.position.x = 50;
light.position.y = 1.5;

const helper = new THREE.PointLightHelper(light, 0.5);
scene.add(helper);

/* Content of scene */
//model
var loader = new THREE.OBJLoader();
//load a resource
loader.load(
  'src/objects/model.obj',
  // called when resource is loaded
  function(object) {
    const objs = [];

    object.traverse(function(child) {
      if (child instanceof THREE.Mesh) {
        objs.push(child);
      }
    });

    addObj(objs[0]);
  }
);

function addObj(mesh) {
  var xDistance = 30;
  var yDistance = 40;
  var zDistance = 35;

  var xOffset = -40; //initial offset so does not start in middle
  var zOffset = -40;

  particles = new THREE.Object3D();
  scene.add(particles);

  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 3; j++) {
      for (var k = 0; k < 3; k++) {
        const material = new THREE.MeshPhongMaterial({
          color: 0xed368c,
          flatShading: THREE.FlatShading,
          shininess: 100,
          emissive: 0x22121a,
          specular: 0xfffff
        });

        var mesh = new THREE.Mesh(mesh.geometry, material);
        mesh.scale.set(50, 50, 50);
        mesh.position.x = xDistance * i + xOffset;
        mesh.position.y = yDistance * j;
        mesh.position.z = zDistance * k + zOffset;

        mesh.updateMatrix();
        mesh.matrixAutoUpdate = true;
        particles.add(mesh);
      }
    }
  }
}

// create & launch main loop
const engine = loop(render);
engine.start();

//  Manage Resize canvas
resize.addListener(onResize);
function onResize() {
  camera.aspect = resize.width / resize.height;
  camera.updateProjectionMatrix();
  renderer.setSize(resize.width, resize.height);
}

// Render loop
function render() {
  // track navigation in scene
  controls.update();

  // get sound freqs
  const subAvg = average(analyser, freq, bands.sub.from, bands.sub.to);
  const lowAvg = average(analyser, freq, bands.low.from, bands.low.to);
  const midAvg = average(analyser, freq, bands.mid.from, bands.mid.to);
  const highAvg = average(analyser, freq, bands.high.from, bands.high.to);

  for (var i = 0; i < particles.children.length; i++) {
    particles.children[i].rotation.x += midAvg / 5;
    particles.children[i].rotation.x -= highAvg / 5;

    particles.children[i].rotation.y += subAvg / 50;
    particles.children[i].rotation.y -= lowAvg / 50;

    particles.children[i].rotation.z += highAvg / 150;
    particles.children[i].rotation.z -= subAvg / 150;
  }

  for (var j = 0; j < particles.children.length; j = j + 2) {
    particles.children[j].scale.set(150 * midAvg, 150 * midAvg, 150 * midAvg);
  }

  for (var k = 1; k < particles.children.length; k = k + 2) {
    particles.children[k].scale.set(50 * subAvg, 50 * subAvg, 50 * subAvg);
  }

  renderer.render(scene, camera);
}
