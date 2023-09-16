declare function fetch<T = never>(
  url: string,
  init?: RequestInit,
): Promise<Response<T>>;

type RequestInit = {
  headers?: Record<string, string>;
  body?: Blob | string;
  method?: string;
};

type Response<T> = {
  status: number;
  text(): Promise<string>;
  json(): Promise<T>;
  blob(): Promise<Blob>;
  arrayBuffer(): Promise<Buffer>;
};
