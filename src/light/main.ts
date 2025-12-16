import { RollerCoasterGeometry } from "three/examples/jsm/Addons.js";
import { camera, canvas, scene } from "../common/default";
import { Box3, BoxGeometry, Color, EllipseCurve, Mesh, MeshPhongMaterial, SpotLight, Vector3 } from "three";
import { SelectionContext } from "../common/selection-context";
import { Selector } from "../common/selector";
import { Handler } from "../handler/handler";

const box = new BoxGeometry(1, 1, 1);
const material = new MeshPhongMaterial()
const cube = new Mesh(box, material);
scene.add(cube)

const lightRed = new SpotLight(new Color("red"));
lightRed.position.set(1, 0, 0);
lightRed.lookAt(0, 0, 1);
const lightBlue = new SpotLight(new Color("blue"));
lightBlue.position.set(-1, 0, 0);
lightBlue.lookAt(0, 0, 1);
camera.add(lightRed);
camera.add(lightBlue);

const selectionContext = new SelectionContext(canvas, camera, [cube]);
const selector = new Selector(selectionContext);
const handler = new Handler(scene, selector);

handler.afterTransformate.push(() => {
    if(!selector.current) return;
});

selector.onSelectCallbacks.push(() => handler.handle(selector.current));
selector.onDeselectCallbacks.push(() => handler.handle(selector.current));

window.addEventListener("keydown", (event) => {
    const key = event.key;
    const delta = 0.1;

    switch (key) {
        case "w":
            camera.translateZ(-delta);
            break;
        case "a":
            camera.translateX(-delta);
            break;
        case "s":
            camera.translateZ(delta);
            break;
        case "d":
            camera.translateX(delta);
            break;
        default:
            break;
    }
})