import { useMutation } from '@tanstack/react-query';
import { getProjects } from '../../../requests.ts';

export const getProjectsMutation = () => useMutation({ mutationFn: getProjects })

