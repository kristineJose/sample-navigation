import * as THREE from './node_modules/three/build/three.module.js';
import { GLTFLoader } from './node_modules/three/examples/jsm/loaders/GLTFLoader.js';   
import { XRButton } from 'three/examples/jsm/webxr/XRButton.js';

// Initialize Scene, Camera, and Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Enable WebXR
renderer.xr.enabled = true;
document.body.appendChild(XRButton.createButton(renderer));

// Load 3D Campus Model
const loader = new GLTFLoader();
loader.load('./assets/Building_Updated.glb', function (gltf) {
    scene.add(gltf.scene);
}, undefined, function (error) {
    console.error("Error loading 3D model:", error);
});

// User Position (default)
let userX = 0, userY = 1, userZ = 0;

// Destination Options
const destinations = {
    "Library": { x: 5, y: 1, z: -3 },
    "Cafeteria": { x: 10, y: 1, z: -5 },
    "Laboratory": { x: -2, y: 1, z: -8 }
};

// Create Dropdown Menu
const selectElement = document.createElement("select");
selectElement.style.position = "absolute";
selectElement.style.top = "10px";
selectElement.style.left = "10px";
selectElement.style.zIndex = "1000";
document.body.appendChild(selectElement);

// Populate Dropdown
for (const key in destinations) {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = key;
    selectElement.appendChild(option);
}

// Function to Update Path
function updatePath(destination) {
    scene.remove(scene.getObjectByName("pathCurve"));  // Remove old path
    scene.remove(scene.getObjectByName("destinationMarker"));

    const dest = destinations[destination];
    
    // Draw new path
    const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(userX, userY, userZ),
        new THREE.Vector3(dest.x, dest.y, dest.z)
    ]);
    
    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const curveObject = new THREE.Line(geometry, material);
    curveObject.name = "pathCurve";
    scene.add(curveObject);
    
    // Add Destination Marker
    const destinationMarker = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    destinationMarker.position.set(dest.x, dest.y, dest.z);
    destinationMarker.name = "destinationMarker";
    scene.add(destinationMarker);
}

// Listen for Destination Selection
selectElement.addEventListener("change", (event) => {
    updatePath(event.target.value);
});

// Set Initial Path
updatePath(selectElement.value);

// Set Initial Camera Position
camera.position.set(0, 5, 10);

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// Get User Location (Indoor)
navigator.geolocation.getCurrentPosition(position => {
    console.log("User Location:", position.coords.latitude, position.coords.longitude);
}, error => {
    console.error("Geolocation error:", error);
});
