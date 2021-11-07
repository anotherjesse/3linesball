
import * as THREE from './vendor/three.module.js';
import { VRButton } from './vendor/jsm/webxr/VRButton.js';
import { SimplexNoise } from './vendor/jsm/math/SimplexNoise.js'


import Stats from './vendor/jsm/libs/stats.module.js';

let container, stats;
let camera, scene, raycaster, renderer, parentTransform, sphereInter;

const lineGeometries = [];
const noise = new SimplexNoise()

const pointer = new THREE.Vector2();
let radius = 100,
    theta = 0,
    pointCount = 50,
    lineCount = 50;

init();
animate();


function newLine(count) {
    const lineGeometry = new THREE.BufferGeometry();
    const points = [];

    const point = new THREE.Vector3();

    for (let i = 0; i < count; i++) {


        // point.add(direction);
        points.push(0.0, 0.0, 0.0);

    }

    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));

    const nx = Math.random() * 10,
        ny = Math.random() * 10,
        nz = Math.random() * 10,
        ot = Math.random() * 360

    const positions = lineGeometry.attributes.position.array;
    lineGeometry.updater = (t) => {
        let s = (t || 0) / 1000
        let s2 = Math.sin(s + ot)
        let x = 0, y = 0, z = 0;
        for (let i = 1; i < count; i++) {
            x += (noise.noise4d(7 * nx, ny, nz, s2 + i) - 0.5)
            y += (noise.noise4d(nx, 3 * ny, nz, s2 + i + 1) - 0.5)
            z += (noise.noise4d(nx, ny, 5 * nz, s2 + i + 2) - 0.5)
            positions[i * 3 + 0] = x
            positions[i * 3 + 1] = y
            positions[i * 3 + 2] = z
        }

        lineGeometry.attributes.position.needsUpdate = true; // required after the first render
    }

    return lineGeometry
}

function init() {

    container = document.createElement('div');
    document.body.appendChild(container);

    const info = document.createElement('div');
    info.style.position = 'absolute';
    info.style.top = '10px';
    info.style.width = '100%';
    info.style.textAlign = 'center';
    info.innerHTML = 'experiments in webxr - <a href="https://github.com/anotherjesse/3linesball/">source</a> | based on <a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - interactive lines';
    container.appendChild(info);

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x333333);

    const geometry = new THREE.SphereGeometry(5);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    sphereInter = new THREE.Mesh(geometry, material);
    sphereInter.visible = false;
    scene.add(sphereInter);

    parentTransform = new THREE.Object3D();
    parentTransform.position.x = 0;
    parentTransform.position.y = 0;
    parentTransform.position.z = -20;

    parentTransform.rotation.x = Math.random() * 2 * Math.PI;
    parentTransform.rotation.y = Math.random() * 2 * Math.PI;
    parentTransform.rotation.z = Math.random() * 2 * Math.PI;

    parentTransform.scale.x = Math.random() + 0.5;
    parentTransform.scale.y = Math.random() + 0.5;
    parentTransform.scale.z = Math.random() + 0.5;

    const palette = [0x19647e, 0x28afb0, 0xf4d35e, 0xee964b, 0x683359];

    for (let i = 0; i < lineCount; i++) {

        let object;

        const lineMaterial = new THREE.LineBasicMaterial({ color: palette[Math.floor(Math.random() * palette.length)] }),
            lineGeometry = newLine(pointCount)

        lineGeometries.push(lineGeometry)
        object = new THREE.Line(lineGeometry, lineMaterial);

        object.position.x = Math.random();
        object.position.y = Math.random();
        object.position.z = Math.random();

        object.rotation.x = Math.random() * 2 * Math.PI;
        object.rotation.y = Math.random() * 2 * Math.PI;
        object.rotation.z = Math.random() * 2 * Math.PI;

        parentTransform.add(object);
    }

    scene.add(parentTransform);

    raycaster = new THREE.Raycaster();
    raycaster.params.Line.threshold = 3;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    document.body.appendChild(renderer.domElement);
    document.body.appendChild(VRButton.createButton(renderer));

    container.appendChild(renderer.domElement);

    stats = new Stats();
    container.appendChild(stats.dom);

    document.addEventListener('pointermove', onPointerMove);

    window.addEventListener('resize', onWindowResize);

    camera.position.x = radius * Math.sin(THREE.MathUtils.degToRad(theta));
    camera.position.y = radius * Math.sin(THREE.MathUtils.degToRad(theta));
    camera.position.z = radius * Math.cos(THREE.MathUtils.degToRad(theta));
    camera.lookAt(scene.position);

    camera.updateMatrixWorld();

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function onPointerMove(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;

}

//

function animate(t) {


    render(t);
    stats.update();

}

renderer.setAnimationLoop(animate);


function render(t) {

    for (let lg of lineGeometries) {
        lg.updater(t)
        // console.log(lg)
    }


    // raycaster.setFromCamera(pointer, camera);

    // const intersects = raycaster.intersectObjects(parentTransform.children, true);

    // if (intersects.length > 0) {

    //     sphereInter.visible = true;
    //     sphereInter.position.copy(intersects[0].point);

    // } else {

    // sphereInter.visible = false;

    // }

    renderer.render(scene, camera);

}
