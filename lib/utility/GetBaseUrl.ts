export function GetBaseUrl() {
  return process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_DEPLOY_DOMAIN
    : "http://localhost:3000/";
}
