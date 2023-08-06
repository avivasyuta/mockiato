import { TMock } from '../../types';

export type TMockFormAction = {
    type: 'open' | 'close'
    payload?: TMock
}

export type TMockFormState = {
    isOpened: boolean
    mock?: TMock
}
