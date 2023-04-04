export interface IBoxOptions {
    height: number,
    width: number,
    depth: number
}

export interface ISphereOptions {
    diameterX: number,
    diameterY: number,
    diameterZ: number,
    segments: number
}

export interface ICylinderOptions {
    diameterTop: number,
    diameterBottom: number,
    height: number,
    segments: number
}

export interface ITorusOptions {
    diameter: number,
    thickness: number,
    segments: number
}