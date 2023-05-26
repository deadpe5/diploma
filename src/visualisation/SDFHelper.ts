import {
    dir1,
    dir2,
    dir3,
    dir4,
    eps1,
    eps2,
    eps3,
    eps4,
} from "@/constants";
import { TmpVectors, Vector3 } from "@babylonjs/core";

export class SDFHelper {

    public static SDPlane(p: Vector3, n: Vector3, h: number) {
        return Vector3.Dot(p, n) + h
    }

    public static SDBox(p: Vector3, b: Vector3) {
        const q = TmpVectors.Vector3[0]
        q.copyFromFloats(Math.abs(p.x), Math.abs(p.y), Math.abs(p.z))
        q.subtractInPlace(b)

        const tmp = Math.min(Math.max(q.x, q.y, q.z), 0)
        q.maximizeInPlaceFromFloats(0, 0, 0)

        return q.length() + tmp
    }

    public static SDSphere(p: Vector3, s: number) {
        return p.length() - s
    }

    static SDVerticalCylinder(p: Vector3, r: number, h: number) {
        const dx = Math.abs(Math.sqrt(p.x * p.x + p.z * p.z)) - r;
        const dy = Math.abs(p.y) - h / 2;
        const dx2 = Math.max(dx, 0);
        const dy2 = Math.max(dy, 0);
        return (Math.min(Math.max(dx, dy), 0.0) + Math.sqrt(dx2 * dx2 + dy2 * dy2));
    }

    // TODO: replace `shape: any`
    public static ComputeSDFNormal(pos: Vector3, shape: any, normal: Vector3) {
        const posTemp = TmpVectors.Vector3[5]
        const dir = TmpVectors.Vector3[6]
        normal.copyFromFloats(0, 0, 0)
        
        posTemp.copyFrom(pos)
        dir.copyFrom(dir1)
        normal.addInPlace(dir.scaleInPlace(shape.sdEvaluate(posTemp.addInPlace(eps1), ...shape.params)));
        
        posTemp.copyFrom(pos);
        dir.copyFrom(dir2);
        normal.addInPlace(dir.scaleInPlace(shape.sdEvaluate(posTemp.addInPlace(eps2), ...shape.params)));
        
        posTemp.copyFrom(pos);
        dir.copyFrom(dir3);
        normal.addInPlace(dir.scaleInPlace(shape.sdEvaluate(posTemp.addInPlace(eps3), ...shape.params)));
        
        posTemp.copyFrom(pos);
        dir.copyFrom(dir4);
        normal.addInPlace(dir.scaleInPlace(shape.sdEvaluate(posTemp.addInPlace(eps4), ...shape.params)));
        
        Vector3.TransformNormalToRef(normal, shape.transf, normal);
        normal.normalize();
    }
}