#!/bin/sh
# Generates config.js with runtime environment variables

cat <<EOF > /usr/share/nginx/html/config.js
(function(window) {
  window.APP_CONFIG = {
    apiUrl: "${API_URL:-http://localhost:3000}",
    environment: "${ENVIRONMENT:-development}"
  };
})(window);
EOF

echo "✅ Generated config.js with API_URL=${API_URL:-http://localhost:3000}"
