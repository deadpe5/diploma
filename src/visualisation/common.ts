export function isValidFloat(value: string, minValue: number = 0): boolean {
    const number = Number(value)
    return !isNaN(number) && (number > minValue)
}

export function isValidInt(value: string, minValue: number = 0): boolean {
    const number = Number(value)
    return !isNaN(number) && (number > minValue) && Number.isInteger(number)
}