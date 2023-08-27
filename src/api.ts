import axios from "axios";
import { toQueryParams } from "./utils";
import { Api } from "./api-types";
import { API_DOMAIN, API_VER } from "./config";

export const createApi = (
  params:
    | { personalAccessToken: string; oAuthToken?: never }
    | { personalAccessToken?: never; oAuthToken: string },
): Api => {
  const headers = {
    "X-Figma-Token": params.personalAccessToken,
    Authorization: params.oAuthToken ? `Bearer ${params.oAuthToken}` : "",
  };

  const api = axios.create({
    headers,
    baseURL: `${API_DOMAIN}/${API_VER}/`,
    paramsSerializer: (params) => toQueryParams(params),
  });
  api.interceptors.response.use((res) => res.data);

  return {
    getUserMe: () => api.get(`me`),
    getStyle: (key) => api.get(`styles/${key}`),
    getImageFills: (fileKey) => api.get(`files/${fileKey}/images`),
    getComments: (fileKey) => api.get(`files/${fileKey}/comments`),
    getVersions: (fileKey) => api.get(`files/${fileKey}/versions`),
    getTeamProjects: (teamId) => api.get(`teams/${teamId}/projects`),
    getComponent: (key) => api.get(`components/${key}`),
    getComponentSet: (key) => api.get(`component_sets/${key}`),
    getFileComponents: (fileKey) => api.get(`files/${fileKey}/components`),
    getFileStyles: (file_key) => api.get(`files/${file_key}/styles`),
    getFile: ({ fileKey, ...params }) =>
      api.get(`files/${fileKey}`, { params }),
    getFileNodes: ({ fileKey, ...params }) =>
      api.get(`files/${fileKey}/nodes`, { params }),
    getImage: ({ fileKey, ...params }) =>
      api.get(`images/${fileKey}`, { params }),
    getProjectFiles: ({ project_id, ...params }) =>
      api.get(`projects/${project_id}/files`, { params }),
    getTeamComponents: ({ team_id, ...params }) =>
      api.get(`teams/${team_id}/components`, { params }),
    getTeamComponentSets: ({ team_id, ...params }) =>
      api.get(`teams/${team_id}/component_sets`, { params }),
    getFileComponentSets: (file_key) =>
      api.get(`files/${file_key}/component_sets`),
    getTeamStyles: ({ team_id, ...params }) =>
      api.get(`teams/${team_id}/styles`, { params }),
    deleteComments: ({ fileKey, commentId }) =>
      api.delete(`files/${fileKey}/comments/${commentId}`, { data: "" }),
    postComments: ({ fileKey, ...data }) =>
      api.post(`files/${fileKey}/comments`, {
        data,
        headers: { "Content-Type": "application/json" },
      }),
  };
};

export const oAuthLink = (
  client_id: string,
  redirect_uri: string,
  scope: "file_read",
  state: string,
  response_type: "code",
) => {
  const queryParams = toQueryParams({
    client_id,
    redirect_uri,
    scope,
    state,
    response_type,
  });
  return `https://www.figma.com/oauth?${queryParams}`;
};

export const oAuthToken = (
  client_id: string,
  client_secret: string,
  redirect_uri: string,
  code: string,
  grant_type: "authorization_code",
): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> =>
  axios({
    url: `https://www.figma.com/api/oauth/token`,
    method: "POST",
    params: {
      client_id,
      client_secret,
      redirect_uri,
      code,
      grant_type,
    },
  }).then((res) => res.data);
