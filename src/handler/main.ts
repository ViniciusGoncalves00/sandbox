import * as THREE from "three";
import { SelectionContext } from "../common/selection-context";
import { Handler } from "./handler";
import { camera, canvas, scene } from "../common/default";
import type { ISelectable } from "../common/interfaces/ISelectable";
import { Selector } from "../common/selector";

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshPhongMaterial();
const mesh0 = new THREE.Mesh(geometry, material);
const mesh1 = mesh0.clone();
const mesh2 = mesh0.clone();
const mesh3 = mesh0.clone();
mesh0.position.set(-2.5, 1, -2.5);
mesh1.position.set(-2.5, 1, +2.5);
mesh2.position.set(+2.5, 1, -2.5);
mesh3.position.set(+2.5, 1, +2.5);
camera.position.set(7, 7, 7);
scene.add(mesh0, mesh1, mesh2, mesh3);

const selectionContext = new SelectionContext(canvas, camera, [mesh0, mesh1, mesh2, mesh3]);
const selector = new Selector(canvas, camera, [mesh0, mesh1, mesh2, mesh3]);
const handler = new Handler(scene, selector);

selector.onAddToSelection.push((object) => handler.handle(object as unknown as ISelectable))
selector.onRemoveFromSelection.push((object) => handler.handle(object as unknown as ISelectable))