import { THeader, THeadersProfile } from '../../../../types';

export interface THeaderFormAction {
    type: 'open' | 'close'
    payload?: THeader
}

export interface THeaderFormState {
    isOpen: boolean
    header?: THeader
}

export interface ProfileProps {
    profile: THeadersProfile
    onChange: (profile: THeadersProfile) => void
}
