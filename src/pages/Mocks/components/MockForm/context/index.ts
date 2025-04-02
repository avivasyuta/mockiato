import { createFormContext } from '@mantine/form';
import { TMock } from '~/types';

export const [MockFormProvider, useMockFormContext, useMockForm] = createFormContext<TMock>();
