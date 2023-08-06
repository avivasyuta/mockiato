type ObjType = Record<string | number | symbol, unknown>

export const isEmpty = (obj: ObjType): boolean => Object.keys(obj).length === 0 && obj.constructor === Object;
