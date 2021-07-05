export function parseCookieHeader(header: string): {
  [index: string]: string | undefined;
} {
  const cookies = header.split(';');
  const parsedHeader: { [index: string]: string } = {};
  cookies.forEach((cookie) => {
    const [name, value] = cookie.trim().split('=');
    parsedHeader[name] = decodeURIComponent(value);
  });
  return parsedHeader;
}
