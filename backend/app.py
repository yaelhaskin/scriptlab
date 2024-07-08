import logging
import os
import secrets
import string
from flask import Flask, jsonify, request
from flask_cors import CORS
import hashlib
from flask_jwt_extended import (JWTManager, create_access_token, create_refresh_token, jwt_required,
                                get_jwt_identity, get_csrf_token)
import json

from tenacity import retry, wait_fixed, retry_if_result
import asyncio
from datetime import timedelta
import concurrent.futures
import gitlab

import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

PERMISSION_MAPPING = {
    'guest': gitlab.const.GUEST_ACCESS,
    'reporter': gitlab.const.REPORTER_ACCESS,
    'developer': gitlab.const.DEVELOPER_ACCESS,
    'maintainer': gitlab.const.MAINTAINER_ACCESS,
    'owner': gitlab.const.OWNER_ACCESS
}

EXPONSE_HEADERS = ["access_token", "refresh_token"]
ORIGINS = ["https://scriptlab.dev.bsmch.net", "https://scriptlab.test.bsmch.net", "https://scriptlab.bsmch.net"]

app = Flask(__name__)

stream_handler = logging.StreamHandler()
app.logger.addHandler(stream_handler)
app.logger.setLevel(logging.INFO)

CORS(app, supports_credentials=True, origins=ORIGINS, expose_headers=EXPONSE_HEADERS)

GITLAB_URL =  os.environ["GITLAB_URL"]
PRIVATE_TOKEN = os.environ["GITLAB_PRIVATE_TOKEN"]
FLASK_APP_SECRET_KEY = os.environ["FLASK_APP_SECRET_KEY"]

SCRIPTLAB_USERNAME = os.environ["SCRIPTLAB_USERNAME"]
SCRIPTLAB_PASSWORD = hashlib.sha256(os.environ["SCRIPTLAB_PASSWORD"].encode("utf-8")).hexdigest()

app.config["SECRET_KEY"] = FLASK_APP_SECRET_KEY

app.config["JWT_COOKIE_SECURE"] = True
app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
app.config["JWT_CSRF_IN_COOKIES"] = True
app.config["JWT_COOKIE_CSRF_PROTECT"] = True

app.config["JWT_ACCESS_COOKIE_PATH"] = "/api"
app.config["JWT_REFRESH_COOKIE_PATH"] = "/api/refresh"

app.config["JWT_COOKIE_SAMESITE"] = "None"
app.config["JWT_COOKIE_HTTPONLY"] = True

app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=1)

PROTECTED_PROJECT_GROUPS = os.environ["PROTECTED_PROJECT_GROUPS"].split(", ")
PRIVILEGED_USER_GROUPS = os.environ["PRIVILEGED_USER_GROUPS"].split(", ")
COMMANDER_USER_GROUPS = os.environ["COMMANDER_USER_GROUPS"].split(", ")

gitlab_conn = gitlab.Gitlab(GITLAB_URL, private_token=PRIVATE_TOKEN,
                            api_version=4, ssl_verify=False)

print("getting protected users...")
PRIVILEGED_USERS = list(set([user.username for group in PRIVILEGED_USER_GROUPS for user in gitlab_conn.groups.get(group).members.list(get_all=True)])) + [user.username for user in gitlab_conn.users.list(get_all=True) if not user.username[0] == "u"]
COMMANDER_USERS = list(set([user.username for group in COMMANDER_USER_GROUPS for user in gitlab_conn.groups.get(group).members.list(get_all=True)])) + [user.username for user in gitlab_conn.users.list(get_all=True) if not user.username[0] == "u"]
jwt = JWTManager(app)

@app.route("/api/login", methods=["POST"])
def token_auth():
  username = request.json.get("username")
  password = request.json.get("password")

  id = "1"
  if username == SCRIPTLAB_USERNAME and password == SCRIPTLAB_PASSWORD:
    access_token = create_access_token(identity=id)
    refresh_token = create_refresh_token(identity=id)
    response = jsonify({"login": True})

    response.headers["access_token"] = access_token
    response.headers["refresh_token"] = refresh_token

    return response, 200
  return "password or username are incorrect", 401

@app.route("/api/refresh", methods=["GET"])
@jwt_required(refresh=True)
def refresh():
  identity = get_jwt_identity()
  access_token = create_access_token(identity=identity)

  response = jsonify({"refresh": True})
  response.headers["access_token"] = access_token

  return response, 200

@app.route("/api/check", methods=["GET"])
@jwt_required()
def check():
  return "Logged in", 200

@app.route("/api/groups", methods=["GET"])
@jwt_required()
def get_groups():
  try:
    response = jsonify([{"group_path": group.full_path, "group_id": group.id} for group in gitlab_conn.groups.list(get_all=True) if not any(group.full_path.lower().startswith(protected_group.lower()) for protected_group in PROTECTED_PROJECT_GROUPS)])
    return response, 200

  except gitlab.exceptions.GitlabGetError as e:
    return f"An error has occured while fetching the groups: {e}", 400

@app.route("/api/users", methods=["GET"])
@jwt_required()
def get_users():
    try:
        users = request.args.get("users", default= "all", type = str)
        if users == "commanders":
            response = jsonify([{"user_name": user.name, "user_id": user.id, "username": user.username} for user in gitlab_conn.users.list(get_all=True) if (user.username in COMMANDER_USERS or user.username in PRIVILEGED_USERS)])
        elif users == "students":
            response = jsonify([{"user_name": user.name, "user_id": user.id, "username": user.username} for user in gitlab_conn.users.list(get_all=True) if not (user.username in PRIVILEGED_USERS or user.username in COMMANDER_USERS)])
        elif users == "all":
            response = jsonify([{"user_name": user.name, "user_id": user.id, "username": user.username} for user in gitlab_conn.users.list(get_all=True) if not (user.username in PRIVILEGED_USERS)])
        else:
            return "Bad Request.", 400
        return response, 200

    except gitlab.exceptions.GitlabGetError as e:
        return f"An error has occured while fetching users: {e}", 400

@app.route("/api/group_projects", methods=["POST"])
@jwt_required()
def get_group_projects():
  try:
    groups = [gitlab_conn.groups.get(group) for group in request.json.get("group_ids")]
    response = jsonify([{"project": project.name, "project_id": project.id} for projects in [group.projects.list(get_all=True) for group in groups if not group.full_path.lower() in PROTECTED_PROJECT_GROUPS] for project in projects])

    return response

  except gitlab.exceptions.GitlabGetError as e:
    return f"An error has occured while fetching the projects: {e}", 400

@app.route("/api/user_projects", methods=["POST"])
@jwt_required()
def get_user_projects():
  try:
    users = [gitlab_conn.users.get(user) for user in request.json.get("user_ids")]
    response = jsonify([{"project": project.name, "project_id": project.id} for projects in [user.projects.list(get_all=True) for user in users if not user.username in PRIVILEGED_USERS] for project in projects])

    return response

  except gitlab.exceptions.GitlabGetError as e:
    if e.response_code == 404:
       error_message, response_code = "User not found", 404
    else:
       error_message, response_code = e, 400
    return f"An error has occured while fetching the projects: {error_message}", response_code

@app.route("/api/projects", methods=["POST"])
@jwt_required()
def create_projects():
  projects = request.json.get("projects")

  with concurrent.futures.ThreadPoolExecutor() as executor:
      # call create_project for each project in project_list.
      create_project_results = list(executor.map(lambda project: create_project(
                                                  project["namespace"],
                                                  project["project"]),
                                            projects))
  response = jsonify([{"Project": result[0], "Result": result[1]} for result in create_project_results])
  
  return response, 200

@app.route("/api/clone", methods=["POST"])
@jwt_required()
async def clone_projects():
    project = request.json.get('project')
    clone_paths = request.json.get('clone_paths')
    if not any(clone_path.startswith(protected_group.lower()) for protected_group in PROTECTED_PROJECT_GROUPS for clone_path in clone_paths):
        project_export = await create_export(project)
        export_path = project_export[1]
        if not project_export[0]:
            if os.path.exists(export_path):
                os.remove(export_path)
            return jsonify({"Project": export_path, "Result": project_export[2]}), 400

        clone_project_results = await asyncio.gather(*(clone_export(export_path, path) for path in clone_paths))

        os.remove(export_path)

        response = jsonify([{"Project": result[0], "Result": result[1]} for result in clone_project_results])
    else:
        response = jsonify({"Project": project, "Result": "Failure: Tried to clone to protected group"})
        return response, 403
    return response, 200
   
@app.route("/api/user_assignment", methods=["POST"])
@jwt_required()
def assign_users():
  projects = request.json.get("projects")
  namespace = request.json.get("namespace")

  with concurrent.futures.ThreadPoolExecutor() as executor:
    add_permission_to_user_results = list(executor.map(lambda project:
                                                  list(map(lambda user: add_permission_to_project(
                                                          f'{namespace}/{project["project"]}',
                                                          project["permission"],
                                                          user),
                                                      project["users"])),
                                                  projects))

  response = jsonify([{"project": result[0], "username": result[1], "result": result[2]} for project in [result for result in add_permission_to_user_results] for result in project])

  return response, 200

@app.route("/api/projects", methods=["DELETE"])
@jwt_required()
def delete_projects():
   projects = request.json.get("projects")
   with concurrent.futures.ThreadPoolExecutor() as executor:
      delete_projects_results = list(executor.map(lambda project: delete_project(f"{project['namespace']}/{project['project']}"), projects))

   response = jsonify([{"Project": result[0], "Result": result[1]} for result in delete_projects_results])

   return response, 200

@app.route("/api/issues", methods=["POST"])
@jwt_required()
def create_issues():
   issues = request.json.get("issues")
   projects = request.json.get("projects")

   with concurrent.futures.ThreadPoolExecutor() as executor:
      create_issues_results = list(executor.map(lambda project: [create_issue_in_project(project, issue) for issue in issues], projects))
      
   response = jsonify([{"Project": project_id, "Result": result} for issue in create_issues_results for project_id, result in issue])

   return response, 200

@app.route("/api/password_reset", methods=["POST"])
@jwt_required()
def reset_passwords():
    users = request.json.get("users")
    with concurrent.futures.ThreadPoolExecutor() as executor:
        reset_pasword_results = list(executor.map(lambda user: reset_user_password(user), users))
    response = jsonify([{"User": result[0], "Result": result[1], "Password": result[2]} for result in reset_pasword_results])

    return response, 200

@retry(wait=wait_fixed(2), retry=retry_if_result(lambda x: x is None))
def create_project(namespace, project_name):
    """
    Creates project in gitlab.

    Parameters
    ----------
    namespace: str, required
        namespace to create project in.
    project_name: str, required
        name of project to create.
    ----------

    Returns
    -------
    If the project is created successfully:
        tuple: (str: project_name, str: "Success")
    If the function encountered an exception:
        tuple: (str: project_name, str: "Failure", error_message)
    -------
    """
    try:
        # Get group id.
        group = gitlab_conn.groups.get(namespace)

        if not any(group.full_path.lower().startswith(protected_group.lower()) for protected_group in PROTECTED_PROJECT_GROUPS):
            # Create the project.
            gitlab_conn.projects.create(
                {'name': project_name,
                'namespace_id': group.id,
                'default_branch': 'main',
                'initialize_with_readme': True}
            )
            # Return success statement.
            return (f"{namespace}/{project_name}", "Success")
        else:
            return (f"{namespace}/{project_name}", "Protected Group")

    except (gitlab.exceptions.GitlabCreateError, gitlab.exceptions.GitlabGetError) as e:
        # This means a project under that name already exists.
        if isinstance(e, gitlab.exceptions.GitlabCreateError) and e.response_code == 400:
            error_message = f"Project name {project_name} is already taken!"

        # This means a the namespace was not found.
        elif isinstance(e, gitlab.exceptions.GitlabGetError) and e.response_code == 404:
            # Common user error. Namespaces must use forward slashes (/) and not blackslashes (\). Terminates program.
            if "\\" in namespace:
                error_message = r"Please use / instead of \ in group name."
            # Namespace does not exist. Terminates program.
            error_message = f"Namespace {namespace} not found."
        # Timeout error.
        elif e.response_code in [502, 504]:
            return None
        # Fallback error.
        else:
            error_message = e

        # Return failure statement.
        return (f"{namespace}/{project_name}", f"Failure: {error_message}")

@retry(wait=wait_fixed(2), retry=retry_if_result(lambda x: x is None))
def add_permission_to_project(project, permission, username):
    """
    Adds permissions to an existing gitlab project.

    Parameters
    ----------
    project: str, required
        Name of the project to add the user to.
    permission: str, required
        Name of the permission to add to the user.
    username: str, required
        Username to add permission to.
    ----------
    Return:
    -------
    If a user is added successfully:
        tuple: (str: project, str: username, str: "Success")
    If the function encountered an exception:
        tuple: (str: "project", str: "username", str: "Failure", error_message)
    -------
    """
    try:
        # Check if username is not empty.
        if username:
            # Get project object.
            project_to_assign_permissions = gitlab_conn.projects.get(project)
            if not any(project_to_assign_permissions.namespace['full_path'].lower().startswith(protected_group.lower()) for protected_group in PROTECTED_PROJECT_GROUPS):
                # Get user_id.
                user_id = gitlab_conn.users.list(search=username, get_all=True)[0].id

                # Create new member.
                project_to_assign_permissions.members.create(
                    {'user_id': user_id,
                    'access_level': PERMISSION_MAPPING[permission]})
                # Return success statement.
                return (project, username, "Success")
            else:
                return (project, username, "Protected Project")
        else:
            # Return failure statement.
            return (project, "empty_username", "Username empty")

    except (gitlab.exceptions.GitlabCreateError, gitlab.exceptions.GitlabGetError, IndexError) as e:
        # This means the username is already a member of the project
        if isinstance(e, gitlab.exceptions.GitlabCreateError) and e.response_code == 409:
            error_message = f"{username} is already a member of project {project}."

        # This means the project was not found.
        elif isinstance(e, gitlab.exceptions.GitlabGetError) and e.response_code == 404:
            error_message = f"Project {project} not found."

        # This can mean a couple of different errors.
        elif isinstance(e, gitlab.exceptions.GitlabCreateError) and e.response_code == 400:
            error_message = e

        # This means the username was not found.
        elif isinstance(e, IndexError):
            error_message = f"Username {username} not found while trying to add to user to {project}."
        elif e.response_code in [502, 504]:
            return None
        # Fallback error.
        else:
            error_message = e

        # Return failure statement.
        return (project, username, f"Failure: {error_message}")

@retry(wait=wait_fixed(2), retry=retry_if_result(lambda x: x is None))
def create_issue_in_project(project, issue_attributes):
    """
    Creates an issue in an existing project.

    Parameters
    ----------
    project: str, required
        Name of the project to craete issue in.
    issue_attributes: dict, required
        Dictionary of issue attributes
    ----------
    Return:
    -------
    If the issue is created successfully:
        tuple: (Bool: True, str: issue_attributes['title'], str: project)
    If an exception rose:
        tuple: (Bool: False, str: error_message)
    -------
    """
    try:
        # Get project object.
        project_to_issue = gitlab_conn.projects.get(project)
        if not any(project_to_issue.namespace['full_path'].lower().startswith(protected_group.lower()) for protected_group in PROTECTED_PROJECT_GROUPS):
            # Create issue in project.
            project_to_issue.issues.create(issue_attributes)
            # Return success statement.
            return (project, f"Created issue: {issue_attributes['title']}")
        else:
            return (project, "Protected Project.")

    except (gitlab.exceptions.GitlabGetError, gitlab.exceptions.GitlabCreateError) as e:
        if isinstance(e, gitlab.exceptions.GitlabGetError) and e.response_code == 404:
            # Common user error. Namespaces must use forward slashes (/) and not blackslashes (\).
            if "\\" in project:
                error_message = r"Please use / instead of \ in project name."
            # This means the project was not found.
            error_message = f"Project {project} not found."

        # This means there was an issue with the issue attributes. Usually means something is invalid in the JSON.
        elif isinstance(e, gitlab.exceptions.GitlabCreateError):
            error_message = f"Issue creation failed. Check your JSON file for valid structure.\n {e}"

        # Fallback error.
        else:
            error_message = e

        # Return failure statement.
        return (project, f"Failure: {error_message}")

@retry(wait=wait_fixed(2), retry=retry_if_result(lambda x: x is None))
async def create_export(project):
    try:
        if not os.path.exists("/app/tmp"):
           os.makedirs("/app/tmp")

        project = gitlab_conn.projects.get(project)
        if not any(project.namespace['full_path'].lower().startswith(protected_group.lower()) for protected_group in PROTECTED_PROJECT_GROUPS):
            export_path = f"/app/tmp/{project.name.replace(' / ', '_')}.tgz"

            export = project.exports.create()

            export.refresh()
            while not export.export_status == 'finished':
                await asyncio.sleep(0.1)
                export.refresh()
            with open(export_path, 'wb') as f:
                export.download(streamed=True, action=f.write)
        
            return (True, export_path, "Success")
        else:
            return(False, project, "Protected Project")
    except (gitlab.exceptions.GitlabCreateError, gitlab.exceptions.GitlabGetError) as e:
        if isinstance(e, gitlab.exceptions.GitlabGetError) and e.response_code == 404:
            error_message = f"Project {project} not found."
        elif isinstance(e, gitlab.exceptions.GitlabCreateError) and e.response_code == 400:
           error_message = e
        elif e.response_code in [502, 504]:
            return None
        else:
           error_message = e
        return (False, project, f"Failure: {error_message}")

@retry(wait=wait_fixed(2), retry=retry_if_result(lambda x: x is None))
async def clone_export(export, clone_path):
    try:
        project_name = clone_path.split('/')[-1]
        if not any(clone_path.startswith(protected_group.lower()) for protected_group in PROTECTED_PROJECT_GROUPS):
            with open(export, 'rb') as f:
                output = gitlab_conn.projects.import_project(
                    f,
                    path=project_name,
                    name=project_name,
                    namespace="/".join(clone_path.split('/')[:-1])
                )

            project_import = gitlab_conn.projects.get(output['id'], lazy=True).imports.get()

            while project_import.import_status != 'finished':
                await asyncio.sleep(1)
                project_import.refresh()

            return (project_name, "Success")
        else:
            return (project_name, "Protected Group")
    except (gitlab.exceptions.GitlabImportError, Exception) as e:
        if isinstance(e, gitlab.exceptions.GitlabImportError) and e.response_code == 400:
            error_message = f"Invalid namespace: {e}"
        elif isinstance(e, gitlab.exceptions.GitlabImportError) and e.response_code == 404:
           error_message = "Namespace not found."
        elif e.response_code in [502, 504]:
            return None
        else:
            error_message = f"An error has occured {e}" 

        return clone_path, f"Failure: {error_message}"

@retry(wait=wait_fixed(2), retry=retry_if_result(lambda x: x is None))
def delete_project(project):
    try:
        # Get project
        project_for_deletion = gitlab_conn.projects.get(project)
        # Delete project
        if not any(project_for_deletion.namespace['full_path'].lower().startswith(protected_group.lower()) for protected_group in PROTECTED_PROJECT_GROUPS):
            gitlab_conn.projects.delete(project_for_deletion.id)

            return (project, "Success.")
        else:
            return (project, "Protected Project.")
    except gitlab.exceptions.GitlabGetError as e:
        # Project must be referred to with / instead of \
        if isinstance(e, gitlab.exceptions.GitlabGetError) and e.response_code == 404:
            if "\\" in project:
                error_message = r"Failure: Please use / instead of \ in project name."
            else:
                error_message = f"Failure: Project not found."
        elif isinstance(e, gitlab.exceptions.GitlabDeleteError):
            error_message = e
        elif e.response_code in [502, 504]:
            return None
        return (project, e)

@retry(wait=wait_fixed(2), retry=retry_if_result(lambda x: x is None))
def reset_user_password(username):
    try:
        user = gitlab_conn.users.list(search = username, list_all=True)[0]
        if not user.username in PRIVILEGED_USERS:

            new_password = generate_rand_password()

            user.password = new_password
            user.password_confirmation = new_password

            user.save()

            return username, "Password reset successfully.", new_password
        else:
            return username, "User is protected.", "No reset"

    except (gitlab.exceptions.GitlabGetError, gitlab.exceptions.GitlabUpdateError) as e:
        if isinstance(e, gitlab.exceptions.GitlabGetError):
            error_message = f"Failed to get user {username}"
        elif isinstance(e, gitlab.exceptions.GitlabUpdateError):
            error_message = f"Failed to reset password with error: {e}"
        else:
            error_message = f"An error has occured: {e}"
        return username, error_message, "No reset"

def generate_rand_password():
   characters = string.ascii_letters + string.digits + string.punctuation
   password = ''.join(secrets.choice(characters) for _ in range(32))

   return password

if __name__ == "__main__":
  app.run(host="0.0.0.0")
