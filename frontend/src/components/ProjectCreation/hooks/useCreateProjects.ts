import { useMutation } from '@tanstack/react-query';
import { createProjects } from '../../../requests.ts';

export const createProjectsMutation = () => useMutation({ mutationFn: createProjects })

