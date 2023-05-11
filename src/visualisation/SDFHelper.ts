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