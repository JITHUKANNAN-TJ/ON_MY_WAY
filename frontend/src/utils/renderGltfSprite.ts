import { Scene, WebGLRenderer, DirectionalLight, AmbientLight, OrthographicCamera, Box3, Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const spriteCache = new Map<string, string>();

export async function renderGltfSprite(url: string, size = 64): Promise<string | null> {
  if (spriteCache.has(url)) return spriteCache.get(url)!;

  const canvas = document.createElement("canvas");
  canvas.width = size * 2;
  canvas.height = size * 2;

  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  camera.position.set(2, 1.5, 2.5);
  camera.lookAt(0, 0, 0);

  const ambient = new AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const dirLight = new DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(3, 5, 4);
  scene.add(dirLight);

  const fillLight = new DirectionalLight(0xffffff, 0.4);
  fillLight.position.set(-3, 2, -2);
  scene.add(fillLight);

  try {
    const loader = new GLTFLoader();
    const gltf = await new Promise<any>((resolve, reject) => {
      loader.load(url, resolve, undefined, reject);
    });
    scene.add(gltf.scene);

    const box = new Box3().setFromObject(gltf.scene);
    const center = box.getCenter(new Vector3());
    const size3 = box.getSize(new Vector3());
    const maxDim = Math.max(size3.x, size3.y, size3.z);
    const dist = maxDim * 2;
    camera.position.set(dist * 0.8, dist * 0.6, dist);
    camera.lookAt(center.x, center.y, center.z);
    camera.zoom = 0.8;
    camera.updateProjectionMatrix();

    renderer.render(scene, camera);
    const dataUrl = canvas.toDataURL("image/png");
    spriteCache.set(url, dataUrl);

    renderer.dispose();
    return dataUrl;
  } catch {
    renderer.dispose();
    return null;
  }
}
