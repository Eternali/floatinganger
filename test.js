let scene, camera, renderer, loadingManager;
let clock;
let ambientLight, light;
let player, mesh;
let crate, crateTexture, crateNormalMap, crateBumpMap;


// holds mesh bodies for all structures in the actual scene
let meshes = {};

function init () {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(90, 1000/600, 0.1, 1000);
    camera.position.set(20, 20, 20);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    clock = new THREE.Clock();

    mesh = new THREE.Mesh(
        new THREE.BoxGeometry(1,1,1),
        new THREE.MeshPhongMaterial({ color: 0xff7575, wireframe: false })
    );
    mesh.position.y += 2;
    mesh.receiveShadow = true;
    mesh.castShadow = true;

    meshFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(20,20, 10,10),
        new THREE.MeshPhongMaterial({ color: 0x757575 })
    );
    meshFloor.rotation.x -= Math.PI / 2;
    meshFloor.receiveShadow = true;

    ambientLight = new THREE.AmbientLight(0xffffff, 0.4);

    light = new THREE.PointLight(0xffffff, 1.1, 28);
    light.position.set(-3,6,-3);
    light.castShadow = true;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 25;

    scene.add(mesh);
    scene.add(meshFloor);
    scene.add(ambientLight);
    scene.add(light);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(800, 600);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;

    document.body.appendChild(renderer.domElement);

    animate();
}


function animate () {
    requestAnimationFrame(animate);

    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.02;

    renderer.render(scene, camera);
}

window.onload = init;
