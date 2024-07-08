import GitlabInterceptor from "./utils/GitlabInterceptor"

export const getAllGroups = async () => (await GitlabInterceptor.get("/groups")).data
export const getStudents = async () => (await GitlabInterceptor.get("/users", { params: {users: "students"}})).data
// export const getCommanders = async () => (await GitlabInterceptor.get("/users", , { params: {users: "commanders"}})).data

export const getProjects = async (id: {group_ids: number[]}) => (await GitlabInterceptor.post("/group_projects", id)).data

export const cloneProjects = async (data: { project: string, clone_paths: string[] | undefined }) => 
(await GitlabInterceptor.post('/clone',  {} = data )).data

export const createProjects = async (projects: { project: string, namespace: string }[]) => 
(await GitlabInterceptor.post('/projects', { projects })).data

export const addOwner = async (data: {namespace: string | undefined, projects: { project: string, permission: string, users: (string | undefined)[] }[] }) => 
(await GitlabInterceptor.post('/user_assignment',  {} = data )).data

export const addPermissions = async (data: {namespace: string | undefined, projects: { project: string, permission: string | undefined, users: string[] }[] }) => 
(await GitlabInterceptor.post('/user_assignment',  {} = data )).data

export const deleteProjects = async (projects: { project: string, namespace: string | undefined; }[]) => 
(await GitlabInterceptor.delete('/projects', { data: {projects} })).data

export const resetPassword = async (passwordToReset: (string | undefined)[] ) => 
(await GitlabInterceptor.post('/password_reset', { users: passwordToReset }))