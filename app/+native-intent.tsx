export function redirectSystemPath({
  path,
  initial,
}: {
  path: string;
  initial: boolean;
}) {
  if (path && path.includes('oauthredirect')) {
    return '/';
  }
  return path;
}
