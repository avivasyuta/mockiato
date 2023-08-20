export const isObject = (variable: unknown) => typeof variable === 'object'
        && variable !== null
        && Object.prototype.toString.call(variable) === '[object Object]'
        && Object.getPrototypeOf(variable) === Object.prototype;
