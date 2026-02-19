import { Camera, Object3D, Raycaster, Vector2 } from 'three';

export class Selector {
  public enabled: boolean = true;

  public readonly selection: Object3D[] = [];
  private canvas: HTMLCanvasElement;
  private camera: Camera;
  private readonly objects: Object3D[];
  private readonly raycaster: Raycaster;

  // #region Parameters
  public filterVisible: boolean = true;
  public clearSelectionOnSelectNothing: boolean = true;
  // #endregion

  // #region Callbacks
  private trySelectCallback = (event: PointerEvent) => {
    this.trySelect(event);
  };
  public onAddToSelection: ((object: Object3D) => void)[] = [];
  public onRemoveFromSelection: ((object: Object3D) => void)[] = [];
  // #endregion

  public constructor(canvas: HTMLCanvasElement, camera: Camera, objects: Object3D[] = []) {
    this.canvas = canvas;
    this.canvas.addEventListener('pointerdown', this.trySelectCallback);

    this.camera = camera;
    this.objects = objects;

    this.raycaster = new Raycaster();
  }

  public setCanvas(canvas: HTMLCanvasElement): Selector {
    this.canvas.removeEventListener('pointerdown', this.trySelectCallback);
    this.canvas = canvas;
    this.canvas.addEventListener('pointerdown', this.trySelectCallback);
    return this;
  }

  public setCamera(camera: Camera): Selector {
    this.camera = camera;
    return this;
  }

  public setObjects(objects: Object3D[]): Selector {
    this.objects.splice(0);
    this.objects.push(...objects);
    return this;
  }

  public setContext(canvas: HTMLCanvasElement, camera: Camera, objects: Object3D[]): Selector {
    return this.setCanvas(canvas).setCamera(camera).setObjects(objects);
  }

  public addObjects(...objects: Object3D[]): Selector {
    this.objects.push(...objects);
    return this;
  }

  public addToSelection(object: Object3D): Selector {
    if (this.selection.some((object) => object.uuid === object.uuid)) return this;

    this.selection.push(object);
    for (const callback of this.onAddToSelection) callback(object);
    return this;
  }

  public removeFromSelection(object: Object3D): Selector {
    const index = this.selection.findIndex((object) => object.uuid === object.uuid);
    if (index === -1) return this;

    this.selection.push(object);
    for (const callback of this.onRemoveFromSelection) callback(object);
    return this;
  }

  public clearSelection(): Selector {
    this.selection.forEach((object) => this.removeFromSelection(object));
    return this;
  }

  private trySelect(event: PointerEvent): Object3D | null {
    if (!this.enabled || this.objects.length === 0) return null;

    const rect = this.canvas.getBoundingClientRect();
	const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
	const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const coordinates = new Vector2(x, y);
    this.raycaster.setFromCamera(coordinates, this.camera);

    const objs = this.filterVisible ? this.objects.filter((obj) => obj.visible) : this.objects;
    const intersections = this.raycaster.intersectObjects(objs);

    if (intersections.length === 0) {
      if (this.clearSelectionOnSelectNothing) this.clearSelection();
      return null;
    }

    this.addToSelection(intersections[0].object);
    return intersections[0].object;
  }
}
