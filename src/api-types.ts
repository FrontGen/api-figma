import type {
  Vector,
  FrameOffset,
  Component,
  Style,
  Node,
  FrameInfo,
  PageInfo,
  ContainingStateGroup,
  StyleType,
  ComponentSet,
  DOCUMENT,
} from "./ast-types";

/** A comment or reply left by a user */
export interface Comment {
  /** Unique identifier for comment */
  id: string;
  /** The position of the comment. Either the absolute coordinates on the canvas or a relative offset within a frame */
  client_meta: Vector | FrameOffset;
  /** The file in which the comment lives */
  file_key: string;
  /** If present, the id of the comment to which this is the reply */
  parent_id: string;
  /** The user who left the comment */
  user: User;
  /** The UTC ISO 8601 time at which the comment was left */
  created_at: string;
  /** If set, the UTC ISO 8601 time the comment was resolved */
  resolved_at: string;
  /** Only set for top level comments. The number displayed with the comment in the UI */
  order_id?: number;
  /** Comment message */
  message: string;
}

/** A description of a user */
export interface User {
  /** Unique stable id of the user */
  id: string;
  /** Name of the user */
  handle: string;
  /** URL link to the user's profile image */
  img_url: string;
  /** Email associated with the user's account. This will only be present on the /v1/me endpoint */
  email?: string;
}

/** A version of a file */
export interface Version {
  /** Unique identifier for version */
  id: string;
  /** The UTC ISO 8601 time at which the version was created */
  created_at: string;
  /** The label given to the version in the editor */
  label: string;
  /** The description of the version as entered in the editor */
  description: string;
  /** The user that created the version */
  user: User;
}

/** A Project can be identified by both the Project name, and the ProjectID. */
export interface Project {
  /** The ID of the project */
  id: number;
  /** The name of the project */
  name: string;
}

export interface BaseFile {
  key: string;
  name: string;
  thumbnail_url: string;
  last_modified: string;
}

export interface ProjectFile extends BaseFile {
  branches?: BaseFile[];
}

/** An arrangement of published UI elements that can be instantiated across figma files */
export interface ComponentMetadata {
  /** The unique identifier of the component */
  key: string;
  /** The unique identifier of the figma file which contains the component */
  file_key: string;
  /** Id of the component node within the figma file */
  node_id: string;
  /** URL link to the component's thumbnail image */
  thumbnail_url: string;
  /** The name of the component */
  name: string;
  /** The description of the component as entered in the editor */
  description: string;
  /** The UTC ISO 8601 time at which the component was created */
  created_at: string;
  /** The UTC ISO 8601 time at which the component was updated */
  updated_at: string;
  /** The user who last updated the component */
  user: User;
  /** Data on component's containing frame, if component resides within a frame, plus the optional "containingStateGroup" if is a variant of a component_set */
  containing_frame?: FrameInfo & {
    containingStateGroup?: ContainingStateGroup;
  };
  /** Data on component's containing page, if component resides in a multi-page file */
  containing_page?: PageInfo;
}

/** A node containing a set of variants of a component */
export interface ComponentSetMetadata {
  /** The unique identifier of the component set */
  key: string;
  /** The unique identifier of the figma file which contains the component set */
  file_key: string;
  /** Id of the component set node within the figma file */
  node_id: string;
  /** URL link to the component set's thumbnail image */
  thumbnail_url: string;
  /** The name of the component set */
  name: string;
  /** The description of the component set as entered in the editor */
  description: string;
  /** The UTC ISO 8601 time at which the component set was created */
  created_at: string;
  /** The UTC ISO 8601 time at which the component set was updated */
  updated_at: string;
  /** The user who last updated the component set */
  user: User;
  /** Data on component set's containing frame, if component resides within a frame */
  containing_frame?: FrameInfo;
  /** Data on component set's containing page, if component resides in a multi-page file */
  containing_page?: PageInfo;
}

export interface StyleMetadata {
  /** The unique identifier of the style */
  key: string;
  /** The unique identifier of the file which contains the style */
  file_key: string;
  /** Id of the style node within the figma file */
  node_id: string;
  /** The type of style */
  style_type: StyleType;
  /** URL link to the style's thumbnail image */
  thumbnail_url: string;
  /** Name of the style */
  name: string;
  /** The description of the style as entered by the publisher */
  description: string;
  /** The UTC ISO 8601 time at which the component set was created */
  created_at: string;
  /** The UTC ISO 8601 time at which the style was updated */
  updated_at: string;
  /** The user who last updated the style */
  sort_position: string;
  /** A user specified order number by which the style can be sorted */
  user: User;
}

// -----------------------------------------------------------------

// FIGMA FILES
// -----------------------------------------------------------------

export interface GetFileParams {
  /** A specific version ID to get. Omitting this will get the current version of the file */
  version?: string;
  /** If specified, only a subset of the document will be returned corresponding to the nodes listed, their children, and everything between the root node and the listed nodes */
  ids?: string[];
  /** Positive integer representing how deep into the document tree to traverse. For example, setting this to 1 returns only Pages, setting it to 2 returns Pages and all top level objects on each page. Not setting this parameter returns all nodes */
  depth?: number;
  /** Set to "paths" to export vector data */
  geometry?: "paths";
  /** A comma separated list of plugin IDs and/or the string "shared". Any data present in the document written by those plugins will be included in the result in the `pluginData` and `sharedPluginData` properties. */
  plugin_data?: string;
  /** Set to returns branch metadata for the requested file */
  branch_data?: boolean;
}
export interface GetFileResult {
  name: string;
  role: string;
  lastModified: string;
  editorType: string;
  thumbnailUrl: string;
  version: string;
  document: DOCUMENT;
  components: { [nodeId: string]: Component };
  componentSets: { [nodeId: string]: ComponentSet };
  schemaVersion: number;
  styles: { [styleName: string]: Style };
  mainFileKey?: string;
  branches?: ProjectFile[];
}

export interface GetFileNodesParams {
  /** list of node IDs to retrieve and convert */
  ids: string[];
  /** A specific version ID to get. Omitting this will get the current version of the file */
  version?: string;
  /** Positive integer representing how deep into the document tree to traverse. For example, setting this to 1 returns only Pages, setting it to 2 returns Pages and all top level objects on each page. Not setting this parameter returns all nodes */
  depth?: number;
  /** Set to "paths" to export vector data */
  geometry?: "paths";
  /** A comma separated list of plugin IDs and/or the string "shared". Any data present in the document written by those plugins will be included in the result in the `pluginData` and `sharedPluginData` properties. */
  plugin_data?: string;
}

export interface FileNode {
  document: Node;
  components: { [nodeId: string]: Component };
  componentSets: {
    [nodeId: string]: ComponentSet;
  };
  schemaVersion: number;
  styles: { [styleName: string]: Style };
}

/** The `name`, `lastModified`, `thumbnailUrl`, and `version` attributes are all metadata of the specified file. */
export interface GetFileNodesResult {
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  version: string;
  err?: string;
  nodes: {
    [nodeId: string]: FileNode | null;
  };
}

export interface GetImageParams {
  /** list of node IDs to render */
  ids: string[];
  /** A number between 0.01 and 4, the image scaling factor */
  scale?: number;
  /** A string enum for the image output format */
  format: "jpg" | "png" | "svg" | "pdf";
  /** Whether to include id attributes for all SVG elements. `Default: false` */
  svg_include_id?: boolean;
  /** Whether to simplify inside/outside strokes and use stroke attribute if possible instead of <mask>. `Default: true` */
  svg_simplify_stroke?: boolean;
  /** Use the full dimensions of the node regardless of whether or not it is cropped or the space around it is empty. Use this to export text nodes without cropping. `Default: false` */
  use_absolute_bounds?: boolean;
  /** A specific version ID to get. Omitting this will get the current version of the file */
  version?: string;
}

export interface GetImageResult {
  err?: string;
  /** { nodeId -> rendered image url } */
  images: { [nodeId: string]: string | null };
  status?: number;
}

export interface GetImageFillsResult {
  err: string | boolean;
  meta: { images: { [imageRef: string]: string } };
  status: number;
}

// COMMENTS
// -----------------------------------------------------------------

export interface GetCommentsResult {
  comments: Comment[];
}

export interface PostCommentParams {
  /** The text contents of the comment to post */
  message: string;
  /** The position of where to place the comment. This can either be an absolute canvas position or the relative position within a frame. */
  client_meta: Vector | FrameOffset;
  /** (Optional) The comment to reply to, if any. This must be a root comment, that is, you cannot reply to a comment that is a reply itself (a reply has a parent_id). */
  comment_id?: string;
}

// This returns the Comment that was successfully posted (see: https://www.figma.com/developers/api#post-comments-endpoint)
export interface PostCommentResult extends Comment {}

export interface DeleteCommentsParams {
  commentId: string;
}

// Nothing is returned from this endpoint (see: https://www.figma.com/developers/api#delete-comments-endpoint)
export interface DeleteCommentsResult {}

// USERS
// -----------------------------------------------------------------

export interface GetUserMeResult extends User {}

// VERSION HISTORY
// -----------------------------------------------------------------

export interface GetVersionsResult {
  versions: Version[];
}

// PROJECTS
// -----------------------------------------------------------------

export interface GetTeamProjectsResult {
  projects: Project[];
}

export interface GetProjectFilesParams {
  project_id: string;
  /** Set to returns branch metadata for the requested file */
  branch_data?: boolean;
}

export interface GetProjectFilesResult {
  files: ProjectFile[];
}

// COMPONENTS AND STYLES
// -----------------------------------------------------------------

export interface GetTeamComponentsParams {
  /** Id of the team to list components from */
  team_id: string;
  /** Number of items in a paged list of results. Defaults to 30. */
  page_size?: number;
  /** Cursor indicating which id after which to start retrieving components for. Exclusive with before. The cursor value is an internally tracked integer that doesn't correspond to any Ids */
  after?: number;
  /** Cursor indicating which id before which to start retrieving components for. Exclusive with after. The cursor value is an internally tracked integer that doesn't correspond to any Ids */
  before?: number;
}

export interface GetTeamComponentsResult {
  status?: number;
  error?: boolean;
  meta?: {
    components: ComponentMetadata[];
    cursor: { [x: string]: number };
  };
}

export interface GetFileComponentsResult {
  status?: number;
  error?: boolean;
  meta?: {
    components: ComponentMetadata[];
  };
}

export interface GetComponentResult {
  status?: number;
  error?: boolean;
  meta?: ComponentMetadata;
}

export interface GetTeamComponentSetsParams {
  /** Id of the team to list component_sets from */
  team_id: string;
  /** Number of items in a paged list of results. Defaults to 30. */
  page_size?: number;
  /** Cursor indicating which id after which to start retrieving components for. Exclusive with before. The cursor value is an internally tracked integer that doesn't correspond to any Ids */
  after?: number;
  /** Cursor indicating which id before which to start retrieving components for. Exclusive with after. The cursor value is an internally tracked integer that doesn't correspond to any Ids */
  before?: number;
}

export interface GetTeamComponentSetsResult {
  component_sets: ComponentSetMetadata[];
  cursor: { [x: string]: number };
}

export interface GetFileComponentSetsResult {
  status?: number;
  error?: boolean;
  meta?: {
    component_sets: ComponentSetMetadata[];
    cursor: { [x: string]: number };
  };
}

export interface GetComponentSetResult {
  status?: number;
  error?: boolean;
  meta?: ComponentSetMetadata;
}

export interface GetTeamStylesParams {
  team_id: string;
  /** Number of items in a paged list of results. Defaults to 30. */
  page_size?: number;
  /** Cursor indicating which id after which to start retrieving components for. Exclusive with before. The cursor value is an internally tracked integer that doesn't correspond to any Ids */
  after?: number;
  /** Cursor indicating which id before which to start retrieving components for. Exclusive with after. The cursor value is an internally tracked integer that doesn't correspond to any Ids */
  before?: number;
}

export interface GetTeamStylesResult {
  status?: number;
  error?: boolean;
  meta?: {
    styles: StyleMetadata[];
    cursor: { [x: string]: number };
  };
}

export interface GetFileStylesResult {
  status?: number;
  error?: boolean;
  meta?: {
    styles: StyleMetadata[];
  };
}

export interface GetStyleResult {
  status?: number;
  error?: boolean;
  meta?: StyleMetadata;
}
