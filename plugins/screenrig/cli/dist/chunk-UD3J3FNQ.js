import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);

// dist/adapters/protocol.js
var AGENT_CAPABILITIES = ["screens", "content", "playlists", "advertising", "reports", "project"];
var DEFAULT_ARCHIVE_LIMITS = {
  application_archive_bytes: 100 * 1024 * 1024,
  application_expanded_bytes: 250 * 1024 * 1024,
  application_file_count: 5e3,
  application_file_bytes: 32 * 1024 * 1024,
  application_path_depth: 16,
  application_path_bytes: 255
};
function limitsFromCapabilities(capabilities) {
  return {
    application_archive_bytes: capabilities.application_compressed_bytes,
    application_expanded_bytes: capabilities.application_expanded_bytes,
    application_file_count: capabilities.application_file_count,
    application_file_bytes: capabilities.application_file_bytes,
    application_path_depth: capabilities.application_path_depth,
    application_path_bytes: capabilities.application_path_bytes
  };
}
var TEMPORARY_PROTOCOL_VERSION = "screenrig.cli.adapter/0";

export {
  AGENT_CAPABILITIES,
  DEFAULT_ARCHIVE_LIMITS,
  limitsFromCapabilities,
  TEMPORARY_PROTOCOL_VERSION
};
