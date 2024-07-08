import { useQuery } from '@tanstack/react-query'
import { getStudents } from '../../../requests.ts';

export const GET_STUDENTS = 'getStudents';

export const getStudentsQuery = () => {
    return useQuery({queryKey: [GET_STUDENTS], queryFn: getStudents})
}