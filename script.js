import * as THREE from './libs/three.min.js';
import { GLTFLoader } from './libs/GLTFLoader.js';
import { ARButton } from './libs/ARButton.js';

let camera, scene, renderer;
let controller, reticle;
let model;

init();
animate();

function init() {
  const container = document.createElement('div');
  document.body.appendChild(container);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera();

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  container.appendChild(renderer.domElement);

  document.body.appendChild(ARButton.createButton(renderer, { requiredFeatures: ['hit-test'] }));

  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  light.position.set(0.5, 1, 0.25);
  scene.add(light);

  const loader = new GLTFLoader();
  loader.load('models/watch.glb', gltf => {
    model = gltf.scene;
    model.scale.set(0.02, 0.02, 0.02); // adjust scale
  });

  const geometry = new THREE.RingGeometry(0.05, 0.06, 32).rotateX(-Math.PI / 2);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  reticle = new THREE.Mesh(geometry, material);
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
  scene.add(reticle);

  controller = renderer.xr.getController(0);
  controller.addEventListener('select', () => {
    if (reticle.visible && model) {
      const clone = model.clone();
      clone.position.setFromMatrixPosition(reticle.matrix);
      scene.add(clone);
    }
  });
  scene.add(controller);

  const session = renderer.xr.getSession();
  session?.requestReferenceSpace('viewer').then(refSpace => {
    session.requestHitTestSource({ space: refSpace }).then(source => {
      renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
        if (renderer.xr.isPresenting) {
          const frame = renderer.xr.getFrame();
          const viewerPose = frame.getViewerPose(renderer.xr.getReferenceSpace());
          if (viewerPose) {
            const hitTestResults = frame.getHitTestResults(source);
            if (hitTestResults.length) {
              const hit = hitTestResults[0];
              reticle.visible = true;
              reticle.matrix.fromArray(hit.getPose(renderer.xr.getReferenceSpace()).transform.matrix);
            }
          }
        }
      });
    });
  });
}

function animate() {
  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
}

// Wait for the model-viewer to be ready
document.addEventListener('DOMContentLoaded', () => {
    const modelViewer = document.querySelector('model-viewer');
    
    // Add loading event listener
    modelViewer.addEventListener('load', () => {
        console.log('Model loaded successfully');
    });

    // Add error event listener
    modelViewer.addEventListener('error', (error) => {
        console.error('Error loading model:', error);
    });
});
