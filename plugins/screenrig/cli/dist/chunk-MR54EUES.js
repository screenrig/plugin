import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);

// dist/provisioning-url.js
function isPlayerScreenPath(pathname, publicId) {
  const id = encodeURIComponent(publicId);
  return pathname === "/s/".concat(id) || pathname === "/player/s/".concat(id);
}
function validateProvisioningUrls(value) {
  let publicUrl;
  let provisioningUrl;
  try {
    publicUrl = new URL(value.public_url);
    provisioningUrl = new URL(value.provisioning_url);
  } catch {
    return { withheld: "The response's public_url or provisioning_url is not a valid URL." };
  }
  const localHttp = publicUrl.protocol === "http:" && (publicUrl.hostname === "localhost" || publicUrl.hostname === "127.0.0.1" || publicUrl.hostname.endsWith(".localhost"));
  if (publicUrl.protocol !== "https:" && !localHttp)
    return { withheld: "public_url is not HTTPS." };
  if (publicUrl.username || publicUrl.password || publicUrl.search || publicUrl.hash)
    return { withheld: "public_url carries credentials, a query or a fragment." };
  if (!isPlayerScreenPath(publicUrl.pathname, value.screen.public_id))
    return { withheld: "public_url does not name this screen's Player path (/s/PUBLIC_ID)." };
  if (provisioningUrl.origin !== publicUrl.origin || provisioningUrl.pathname !== publicUrl.pathname)
    return { withheld: "provisioning_url does not point at the same Player page as public_url." };
  if (provisioningUrl.username || provisioningUrl.password || provisioningUrl.search || !/^#provision=[A-Za-z0-9_-]{43}$/.test(provisioningUrl.hash)) {
    return { withheld: "provisioning_url carries its secret outside the #provision= fragment." };
  }
  return { publicUrl: publicUrl.href, provisioningUrl: provisioningUrl.href };
}

export {
  isPlayerScreenPath,
  validateProvisioningUrls
};
