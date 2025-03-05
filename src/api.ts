import { toQueryParams } from "./utils";
import { API_DOMAIN, API_VER } from "./config";
import type {
  DeleteCommentsParams,
  DeleteCommentsResult,
  GetCommentsResult,
  GetComponentResult,
  GetComponentSetResult,
  GetFileComponentSetsResult,
  GetFileComponentsResult,
  GetFileNodesParams,
  GetFileNodesResult,
  GetFileParams,
  GetFileResult,
  GetFileStylesResult,
  GetImageFillsResult,
  GetImageParams,
  GetImageResult,
  GetProjectFilesParams,
  GetProjectFilesResult,
  GetStyleResult,
  GetTeamComponentSetsParams,
  GetTeamComponentSetsResult,
  GetTeamComponentsParams,
  GetTeamComponentsResult,
  GetTeamProjectsResult,
  GetTeamStylesParams,
  GetTeamStylesResult,
  GetUserMeResult,
  GetVersionsResult,
  PostCommentParams,
  PostCommentResult,
} from "./api-types.ts";

export const createApi = (
  params: ({ personalAccessToken: string } | { oAuthToken: string }) & {
    fileKey: string;
  },
) => {
  const fileKey = params.fileKey;
  const headers: Record<string, string> =
    "oAuthToken" in params
      ? { Authorization: `Bearer ${params.oAuthToken}` }
      : { "X-Figma-Token": params.personalAccessToken };

  const api = <T>(
    url: string,
    request?: RequestInit & { params?: unknown },
  ): Promise<T> =>
    fetch(`${API_DOMAIN}/${API_VER}/` + url + toQueryParams(request?.params), {
      headers: { ...request?.headers, ...headers },
      ...request,
    }).then(async (res) => {
      const answer = res.json();
      if (res.ok) {
        return answer;
      } else {
        throw new Error(await res.text());
      }
    });

  return {
    getUserMe: () => api<GetUserMeResult>(`me`),
    getStyle: (key: string) => api<GetStyleResult>(`styles/${key}`),
    getImageFills: () => api<GetImageFillsResult>(`files/${fileKey}/images`),
    getComments: () => api<GetCommentsResult>(`files/${fileKey}/comments`),
    getVersions: () => api<GetVersionsResult>(`files/${fileKey}/versions`),
    getTeamProjects: (teamId: string) =>
      api<GetTeamProjectsResult>(`teams/${teamId}/projects`),
    getComponent: (key: string) => api<GetComponentResult>(`components/${key}`),
    getComponentSet: (key: string) =>
      api<GetComponentSetResult>(`component_sets/${key}`),
    getFileComponents: () =>
      api<GetFileComponentsResult>(`files/${fileKey}/components`),
    getFileStyles: (file_key: string) =>
      api<GetFileStylesResult>(`files/${file_key}/styles`),
    getFile: (params: GetFileParams) =>
      api<GetFileResult>(`files/${fileKey}`, { params }),
    getFileNodes: (params: GetFileNodesParams) =>
      api<GetFileNodesResult>(`files/${fileKey}/nodes`, { params }),
    getImage: (params: GetImageParams) => {
      const ids = [...params.ids];
      const idsArray = [];
      while (ids.length > 0) {
        idsArray.push(ids.splice(0, 50));
      }
      const images = Promise.all(
        idsArray.map((ids) =>
          api<GetImageResult>(`images/${fileKey}`, {
            params: { ...params, ids },
          }),
        ),
      );

      return images.then((res) => {
        const images = res
          .map((el) => el.images)
          .reduce((acc, el) => ({ ...acc, ...el }), {});
        return { images };
      });
    },
    getProjectFiles: ({ project_id, ...params }: GetProjectFilesParams) =>
      api<GetProjectFilesResult>(`projects/${project_id}/files`, { params }),
    getTeamComponents: ({ team_id, ...params }: GetTeamComponentsParams) =>
      api<GetTeamComponentsResult>(`teams/${team_id}/components`, { params }),
    getTeamComponentSets: ({
      team_id,
      ...params
    }: GetTeamComponentSetsParams) =>
      api<GetTeamComponentSetsResult>(`teams/${team_id}/component_sets`, {
        params,
      }),
    getFileComponentSets: () =>
      api<GetFileComponentSetsResult>(`files/${fileKey}/component_sets`),
    getTeamStyles: ({ team_id, ...params }: GetTeamStylesParams) =>
      api<GetTeamStylesResult>(`teams/${team_id}/styles`, { params }),
    deleteComments: ({ commentId }: DeleteCommentsParams) =>
      api<DeleteCommentsResult>(`files/${fileKey}/comments/${commentId}`, {
        method: "DELETE",
      }),
    postComments: (body: PostCommentParams) =>
      api<PostCommentResult>(`files/${fileKey}/comments`, {
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
