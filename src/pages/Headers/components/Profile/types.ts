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
    headerForm: THeaderFormState
    profile: THeadersProfile
    onChange: (profile: THeadersProfile) => void
    onHeaderEdit: (header: THeader) => void
    onCloseHeaderForm: () => void
}
