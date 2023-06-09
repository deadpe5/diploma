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

export interface IParticleData {
    mass: number, // 0
    density: number, // 1
    pressure: number, // 2
    accelX: number, // 3
    accelY: number, // 4
    accelZ: number // 5
}

export interface ISphereMetadata {
    radius: number
}

export interface ICylinderMetadata {
    radius: number,
    height: number,
    segments: number
}

export enum fileTypes {
    STL = '.stl',
    OBJ = '.obj',
    glTF = '.gltf'
}

export enum changableFluidParams {
    particleSize = 'particleSize',
    smoothingRadius = 'smoothingRadius',
    densityReference = 'densityReference',
    pressureConstant = 'pressureConstant',
    maxVelocity = 'maxVelocity'
} 
