import { useMutation } from '@tanstack/react-query';
import { cloneProjects } from '../../../requests.ts';

export const cloneProjectsMutation = () => useMutation({ mutationFn: cloneProjects })

