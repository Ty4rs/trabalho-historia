import * as THREE from '../../node_modules/three/build/three.module.js';
import { GLTFLoader } from '../../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from '../../node_modules/three/examples/jsm/controls/OrbitControls.js';


// Configuração da cena, câmera e renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.1;
document.body.appendChild(renderer.domElement);

// Carregar o ambiente map (mapa de ambiente)
const textureLoader = new THREE.TextureLoader();
textureLoader.load('/public/texture/map.jpg', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping; // Configura para reflexão equiretangular
    texture.encoding = THREE.sRGBEncoding; // Corrige o encoding
    scene.environment = texture; // Aplica o ambiente globalmente
    scene.background = texture; // Aplica o ambiente como fundo da cena
});

// Carregar o modelo GLTF
const loader = new GLTFLoader();
loader.load(
    '/public/model/astronalta3.glb',
    function (gltf) {
        const model = gltf.scene;
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;

                // Configurar reflexões somente nos materiais existentes
                if (child.material && child.material.isMeshStandardMaterial) {
                    child.material.envMap = scene.environment; // Adiciona reflexões do ambiente
                    child.material.needsUpdate = true; // Atualiza o material para aplicar envMap
                }
            }
        });
        scene.add(model);

        // Posicionar a câmera
        camera.position.set(10, 10, 5);
        camera.lookAt(0, 1, 0);

        // Adicionar luzes
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Luz ambiente
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5); // Luz direcional
        directionalLight.position.set(5, 10, 7);
        directionalLight.castShadow = true;

        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.bias = -0.01;
        scene.add(directionalLight);
    },
    undefined,
    function (error) {
        console.error(error);
    }
);

// Inicializar controles orbitais
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI / 2;

// Função de animação
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();
