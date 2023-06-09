export class Hash {
    private spacing: number
    private tableSize: number
    private cellStart: Int32Array
    private cellEntries: Int32Array
    public queryIds: Int32Array
    public querySize: number

    constructor(spacing: number, maxNumObjects: number) {
        this.spacing = spacing
        this.tableSize = 2 * maxNumObjects
        this.cellStart = new Int32Array(this.tableSize + 1)
        this.cellEntries = new Int32Array(maxNumObjects)
        this.queryIds = new Int32Array(maxNumObjects)
        this.querySize = 0
    }

    hashCoords(xi: number, yi: number, zi: number) {
        const h = (xi * 92837111) ^ (yi * 689287499) ^ (zi * 283923481); // fantasy function
        //const h = (xi * 73856093) ^ (yi * 19349663) ^ (zi * 83492791); // fantasy function
        return Math.abs(h) % this.tableSize;
    }

    intCoords(coord: number) {
        return Math.floor(coord / this.spacing)
    }

    hashPos(pos: Float32Array, nr: number) {
        return this.hashCoords(
            this.intCoords(pos[3 * nr]),
            this.intCoords(pos[3 * nr + 1]),
            this.intCoords(pos[3 * nr + 2])
        )
    }

    create(pos: Float32Array, numElements: number) {
        numElements = numElements ?? pos.length / 3
        const numObjects = Math.min(numElements, this.cellEntries.length)

        // determine cell sizes
        this.cellStart.fill(0)
        this.cellEntries.fill(0)
        for (let i = 0; i < numObjects; i++) {
            const h = this.hashPos(pos, i)
            this.cellStart[h]++
        }

        // determine cells starts
        let start = 0
        for (let i = 0; i < this.tableSize; i++) {
            start += this.cellStart[i]
            this.cellStart[i] = start
        }
        this.cellStart[this.tableSize] = start // guard

        // fill in objects ids
        for (let i = 0; i < numObjects; i++) {
            const h = this.hashPos(pos, i)
            this.cellStart[h]--
            this.cellEntries[this.cellStart[h]] = i
        }
    }

    query(pos: Float32Array, nr: number, maxDist: number) {
        const x0 = this.intCoords(pos[3 * nr] - maxDist)
        const y0 = this.intCoords(pos[3 * nr + 1] - maxDist)
        const z0 = this.intCoords(pos[3 * nr + 2] - maxDist)
        const x1 = this.intCoords(pos[3 * nr] + maxDist)
        const y1 = this.intCoords(pos[3 * nr + 1] + maxDist)
        const z1 = this.intCoords(pos[3 * nr + 2] + maxDist)
        this.querySize = 0

        for (let xi = x0; xi <= x1; xi++) {
            for (let yi = y0; yi <= y1; yi++) {
                for (let zi = z0; zi <= z1; zi++) {
                    const h = this.hashCoords(xi, yi, zi)
                    const start = this.cellStart[h]
                    const end = this.cellStart[h + 1]
                    for (let i = start; i < end; i++) {
                        this.queryIds[this.querySize] = this.cellEntries[i]
                        this.querySize++
                    }
                }
            }
        }
    }
}