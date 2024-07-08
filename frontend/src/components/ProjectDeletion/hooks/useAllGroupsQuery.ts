import { useQuery } from '@tanstack/react-query'
import { getAllGroups } from '../../../requests.ts';

export const GET_ALL_GROUPS = 'getAllGroups';

export const getAllGroupsQuery = () => {
    return useQuery({queryKey: [GET_ALL_GROUPS], queryFn: getAllGroups})
}