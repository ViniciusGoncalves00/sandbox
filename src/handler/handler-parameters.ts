import { Color, CylinderGeometry, ConeGeometry, Mesh, MeshBasicMaterial, Object3D, Vector3, DoubleSide, PlaneGeometry, EdgesGeometry, LineSegments, LineBasicMaterial } from "three";

export interface HandlerObject {
    worldRightTranslate: Object3D;
    worldUpwardTranslate: Object3D;
    worldForwardTranslate: Object3D;
    localRightTranslate: Object3D;
    localUpwardTranslate: Object3D;
    localForwardTranslate: Object3D;
}

export interface HandlerParameters {
    handler: HandlerObject;
}

export const DEFAULT_HANDLER_PARAMETERS: Required<HandlerParameters> = {
    handler: {
        worldRightTranslate: createDirectionHandler("worldRightTranslate", new Color("red")).rotateZ(-Math.PI / 2).translateY(0.25 / 2),
        worldUpwardTranslate: createDirectionHandler("worldUpwardTranslate", new Color("green")).translateY(0.25 / 2),
        worldForwardTranslate: createDirectionHandler("worldForwardTranslate", new Color("blue")).rotateX(Math.PI / 2).translateY(0.25 / 2),

        localRightTranslate: createDirectionHandler("localRightTranslate", new Color("cyan")).rotateZ(-Math.PI / 2).translateY(0.25 / 2),
        localUpwardTranslate: createDirectionHandler("localUpwardTranslate", new Color("magenta")).translateY(0.25 / 2),
        localForwardTranslate: createDirectionHandler("localForwardTranslate", new Color("yellow")).rotateX(Math.PI / 2).translateY(0.25 / 2),
    }
};

function createDirectionHandler(
    name: string,
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
            depthWrite: false
        })
    );

    const square = new Mesh(plane, planeMaterial);
    square.add(outline);

    // body.userData = { isHandler: true, handleType: name };
    // head.userData = { isHandler: true, handleType: name };
    // square.userData = { isHandler: true, handleType: name };

    group.add(body, head, square);

    return group;
}
