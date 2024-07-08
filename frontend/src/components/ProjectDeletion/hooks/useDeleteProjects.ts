import { useMutation } from '@tanstack/react-query';
import { deleteProjects } from '../../../requests.ts';

export const deleteProjectsMutation = () => useMutation({ mutationFn: deleteProjects })

