export type PostToken = { value: string; kind: "text" | "mention" | "tag" };

export function tokenizePostBody(body: string): PostToken[] {
  return body.split(/([@#][a-zA-Z0-9_.-]+)/g).filter(Boolean).map((value) => ({
    value,
    kind: value.startsWith("@") ? "mention" : value.startsWith("#") ? "tag" : "text",
  }));
}
