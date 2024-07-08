import { useMutation } from '@tanstack/react-query';
import { addOwner } from '../../../requests.ts';

export const ownerMutation = () => useMutation({ mutationFn: addOwner })

