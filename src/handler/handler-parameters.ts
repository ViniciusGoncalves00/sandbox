import { Color, CylinderGeometry, ConeGeometry, Mesh, MeshBasicMaterial, Object3D, Vector3, DoubleSide, PlaneGeometry, EdgesGeometry, LineSegments, LineBasicMaterial, CircleGeometry } from "three";

export interface HandlerObject {
    worldRightTranslate: Object3D;
    worldUpwardTranslate: Object3D;
    worldForwardTranslate: Object3D;
    localRightTranslate: Object3D;
    localUpwardTranslate: Object3D;
    localForwardTranslate: Object3D;

    worldRightRotate: Object3D;
    worldUpwardRotate: Object3D;
    worldForwardRotate: Object3D;
    localRightRotate: Object3D;
    localUpwardRotate: Object3D;
    localForwardRotate: Object3D;
}

export interface HandlerParameters {
    handler: HandlerObject;
}

export const DEFAULT_HANDLER_PARAMETERS: Required<HandlerParameters> = {
    handler: {
        worldRightTranslate: createDirectionHandler(new Color("red")).rotateZ(-Math.PI / 2).translateY(0.25 / 2),
        worldUpwardTranslate: createDirectionHandler(new Color("green")).translateY(0.25 / 2),
        worldForwardTranslate: createDirectionHandler(new Color("blue")).rotateX(Math.PI / 2).translateY(0.25 / 2),
        localRightTranslate: createDirectionHandler(new Color("cyan")).rotateZ(-Math.PI / 2).translateY(0.25 / 2),
        localUpwardTranslate: createDirectionHandler(new Color("magenta")).translateY(0.25 / 2),
        localForwardTranslate: createDirectionHandler(new Color("yellow")).rotateX(Math.PI / 2).translateY(0.25 / 2),

        worldRightRotate: createRotateHandler(new Color("red")).rotateZ(-Math.PI / 2).translateY(0.25 / 2),
        worldUpwardRotate: createRotateHandler(new Color("green")).translateY(0.25 / 2),
        worldForwardRotate: createRotateHandler(new Color("blue")).rotateX(Math.PI / 2).translateY(0.25 / 2),
        localRightRotate: createRotateHandler(new Color("cyan")).rotateZ(-Math.PI / 2).translateY(0.25 / 2),
        localUpwardRotate: createRotateHandler(new Color("magenta")).translateY(0.25 / 2),
        localForwardRotate: createRotateHandler(new Color("yellow")).rotateX(Math.PI / 2).translateY(0.25 / 2),
    }
};

function createDirectionHandler(
    color: Color,
    bodyLength: number = 1,
    bodyRadius: number = 0.005,
    headLength: number = 0.1,
    headRadius: number = 0.025,
    squareSize: number = 0.25,
): Object3D {
    const group = new Object3D();

    const material = new MeshBasicMaterial({
        color,
        side: DoubleSide,
        depthTest: false,
        depthWrite: false
    });

    const planeMaterial = new MeshBasicMaterial({
        color,
        side: DoubleSide,
        opacity: 0.1,
        transparent: true,
        depthTest: false,
        depthWrite: false
    });

    const body = new Mesh(
        new CylinderGeometry(bodyRadius, bodyRadius, bodyLength),
        material
    );
    body.position.y = bodyLength / 2;

    const head = new Mesh(
        new ConeGeometry(headRadius, headLength),
        material
    );
    head.position.y = bodyLength;

    const plane = new PlaneGeometry(squareSize, squareSize);
    plane.lookAt(new Vector3(0, 1, 0));

    const edges = new EdgesGeometry(plane);
    const outline = new LineSegments(
        edges,
        new LineBasicMaterial({
            color,
            depthTest: false,
            depthWrite: false,
        })
    );

    const square = new Mesh(plane, planeMaterial);
    square.add(outline);

    group.add(body, head, square);

    body.renderOrder = 9999;
    head.renderOrder = 9999;
    square.renderOrder = 9999;
    outline.renderOrder = 9999;

    return group;
}

function createRotateHandler(
    color: Color,
    radius: number = 1,
    segments: number = 36,
): Object3D {
    const group = new Object3D();

    const faceMaterial = new MeshBasicMaterial({
        color,
        side: DoubleSide,
        opacity: 0.02,
        transparent: true,
        depthTest: false,
        depthWrite: false
    });

    const outlineMaterial = new LineBasicMaterial({
        color,
        depthTest: false,
        depthWrite: false,
    })

    const plane = new CircleGeometry(radius, segments);
    plane.lookAt(new Vector3(0, 1, 0));

    const edges = new EdgesGeometry(plane);
    const outline = new LineSegments(edges, outlineMaterial);

    const circle = new Mesh(plane, faceMaterial);
    circle.add(outline);

    group.add(circle);

    circle.renderOrder = 9999;
    outline.renderOrder = 9999;

    return group;
}