import { toQueryParams } from "./utils";
import { Api } from "./api-types";
import { API_DOMAIN, API_VER } from "./config";

export const createApi = (
  params: ({ personalAccessToken: string } | { oAuthToken: string }) & {
    fileKey: string;
  },
): Api => {
  const fileKey = params.fileKey;
  const headers: Record<string, string> =
    "oAuthToken" in params
      ? { Authorization: `Bearer ${params.oAuthToken}` }
      : { "X-Figma-Token": params.personalAccessToken };

  const api = (url: string, request?: RequestInit & { params?: unknown }) =>
    fetch(`${API_DOMAIN}/${API_VER}/` + url + toQueryParams(request?.params), {
      headers: { ...request?.headers, ...headers },
      ...request,
    }).then((res) => res.json());

  return {
    getUserMe: () => api(`me`),
    getStyle: (key) => api(`styles/${key}`),
    getImageFills: () => api(`files/${fileKey}/images`),
    getComments: () => api(`files/${fileKey}/comments`),
    getVersions: () => api(`files/${fileKey}/versions`),
    getTeamProjects: (teamId) => api(`teams/${teamId}/projects`),
    getComponent: (key) => api(`components/${key}`),
    getComponentSet: (key) => api(`component_sets/${key}`),
    getFileComponents: () => api(`files/${fileKey}/components`),
    getFileStyles: (file_key) => api(`files/${file_key}/styles`),
    getFile: (params) => api(`files/${fileKey}`, { params }),
    getFileNodes: (params) => api(`files/${fileKey}/nodes`, { params }),
    getImage: (params) => {
      const ids = [...params.ids];
      const idsArray = [];
      while (ids.length > 0) {
        idsArray.push(ids.splice(0, 50));
      }
      const images =  Promise.all(
        idsArray.map((ids) =>
          api(`images/${fileKey}`, { params: { ...params, ids } }),
        ),
      );

      return images.then((res) => {
        const images = res.map((el) => el.images);
        return images.reduce((acc, el) => ({ ...acc, ...el, images: {...acc.images, ...el.images} }), {});
      });
    },
    getProjectFiles: ({ project_id, ...params }) =>
      api(`projects/${project_id}/files`, { params }),
    getTeamComponents: ({ team_id, ...params }) =>
      api(`teams/${team_id}/components`, { params }),
    getTeamComponentSets: ({ team_id, ...params }) =>
      api(`teams/${team_id}/component_sets`, { params }),
    getFileComponentSets: () => api(`files/${fileKey}/component_sets`),
    getTeamStyles: ({ team_id, ...params }) =>
      api(`teams/${team_id}/styles`, { params }),
    deleteComments: ({ commentId }) =>
      api(`files/${fileKey}/comments/${commentId}`, { method: "DELETE" }),
    postComments: (body) =>
      api(`files/${fileKey}/comments`, {
        body: JSON.stringify(body),
        method: "POST",
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
  fetch(
    `https://www.figma.com/api/oauth/token` +
      toQueryParams({
        client_id,
        client_secret,
        redirect_uri,
        code,
        grant_type,
      }),
    { method: "POST" },
  ).then((res) => res.json() as never);
