import { useMutation } from '@tanstack/react-query';
import { addPermissions } from '../../../requests.ts';

export const permissionsMutation = () => useMutation({ mutationFn: addPermissions })

