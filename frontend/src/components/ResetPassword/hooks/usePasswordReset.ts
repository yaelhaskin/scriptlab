import { useMutation } from '@tanstack/react-query';
import { resetPassword } from '../../../requests.ts';

export const passwordMutation = () => useMutation({ mutationFn: resetPassword })

