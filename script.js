import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.min.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.128/examples/jsm/loaders/GLTFLoader.js';

let scene, camera, renderer, raycaster, mouse, selectedObject = null;
const label = document.getElementById('label');
const sidePanel = document.getElementById('side-panel');
const panelTitle = document.getElementById('panel-title');
const panelDesc = document.getElementById('panel-desc');

function init() {
    // Create Scene
    scene = new THREE.Scene();

    // Set Up Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Light
    const light = new THREE.AmbientLight(0xffffff, 1);
    scene.add(light);

    // Load 3D Model
    const loader = new GLTFLoader();
    loader.load('assets/Building_Updated.glb', (gltf) => {
        scene.add(gltf.scene);
    });

    // Raycasting (for detecting clicks)
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    window.addEventListener('click', onMouseClick);
    animate();
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Handle Mouse Clicks
function onMouseClick(event) {
    // Convert mouse position to normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Raycasting
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const object = intersects[0].object;

        // Reset previous selection
        if (selectedObject && selectedObject.material) {
            selectedObject.material.emissive.setHex(0x000000);
        }

        // Highlight new object
        selectedObject = object;
        if (selectedObject.material) {
            selectedObject.material.emissive.setHex(0xff0000);
        }

        // Show Label Above Building
        const locationName = object.name || "Unknown Location";
        showLabel(event.clientX, event.clientY, locationName);

        // Show Side Panel
        showSidePanel(locationName);
    } else {
        // Hide label and panel when clicking outside
        label.style.display = 'none';
        sidePanel.style.display = 'none';
    }
}

// Show Floating Label
function showLabel(x, y, text) {
    label.style.left = `${x}px`;
    label.style.top = `${y - 30}px`;
    label.innerText = text;
    label.style.display = 'block';

    setTimeout(() => {
        label.style.display = 'none';
    }, 2000);
}

// Show Side Panel with Information
function showSidePanel(name) {
    panelTitle.innerText = name;
    panelDesc.innerText = `Details about ${name}. Click "Navigate" to go to AR view.`;

    sidePanel.style.display = 'block';

    // Add navigate button without removing panel elements
    let button = document.createElement('button');
    button.innerText = "Navigate";
    button.onclick = () => navigateToAR(name);
    
    // Clear old buttons and add new one
    let existingButton = sidePanel.querySelector('button');
    if (existingButton) {
        existingButton.remove();
    }
    sidePanel.appendChild(button);
}

// Redirect to AR View
function navigateToAR(name) {
    window.location.href = `ar-view.html?location=${encodeURIComponent(name)}`;
}

// Initialize
init();
