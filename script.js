import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.128/examples/jsm/loaders/GLTFLoader.js';
import { XRButton } from 'https://cdn.jsdelivr.net/npm/three@0.128/examples/jsm/webxr/XRButton.js';

// Initialize the Three.js Scene, Camera, and Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Enable WebXR for AR
renderer.xr.enabled = true;
document.body.appendChild(XRButton.createButton(renderer));

// Load 3D Campus Model (GLTF file)
const loader = new GLTFLoader();
loader.load('./assets/Building_Updated.glb', function(gltf) {
    // Once the 3D model is loaded, add it to the scene
    scene.add(gltf.scene);
}, undefined, function(error) {
    console.error('Error loading 3D model:', error);
});

// Default User Position
let userX = 0, userY = 1, userZ = 0;

// Destination Coordinates (Replace with real ones or adjust as needed)
const destinations = {
    "Library": { x: 5, y: 1, z: -3 },
    "Cafeteria": { x: 10, y: 1, z: -5 },
    "Laboratory": { x: -2, y: 1, z: -8 }
};

// Create Dropdown Menu for Selecting Destination
const selectElement = document.createElement("select");
selectElement.style.position = "absolute";
selectElement.style.top = "10px";
selectElement.style.left = "10px";
selectElement.style.zIndex = "1000";
document.body.appendChild(selectElement);

// Populate the Dropdown with Destination Options
for (const key in destinations) {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = key;
    selectElement.appendChild(option);
}

// Function to Update Path Based on Selected Destination
function updatePath(destination) {
    // Remove old path and destination marker (if any)
    scene.children.forEach(child => {
        if (child.name === "pathCurve" || child.name === "destinationMarker") {
            scene.remove(child);
        }
    });

    const dest = destinations[destination];
    
    // Draw the path to the selected destination
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
    
    // Add Destination Marker (Red Sphere)
    const destinationMarker = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    destinationMarker.position.set(dest.x, dest.y, dest.z);
    destinationMarker.name = "destinationMarker";
    scene.add(destinationMarker);
}

// Listen for the Destination Selection Change
selectElement.addEventListener("change", (event) => {
    updatePath(event.target.value);
});

// Set Initial Path
updatePath(selectElement.value);

// Set Initial Camera Position (optional, this may be handled by A-Frame)
camera.position.set(0, 5, 10);

// Animation Loop for Rendering the Scene
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// Get User's Location (if needed for your AR functionality)
navigator.geolocation.getCurrentPosition(position => {
    console.log("User Location:", position.coords.latitude, position.coords.longitude);
}, error => {
    console.error("Geolocation error:", error);
});
