import React, { Dispatch } from 'react';
import { TMockFormAction } from '../../types';

export const MockFormContext = React.createContext<Dispatch<TMockFormAction>>(() => undefined);
