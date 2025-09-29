FROM node:18-alpine

ENV CLOUDSDK_CORE_DISABLE_PROMPTS=1 \
    CLOUDSDK_INSTALL_DIR=/opt/google-cloud-sdk

RUN apk add --no-cache \
    bash \
    curl \
    python3 \
    py3-pip \
    libc6-compat \
    git \
  && pip3 install --no-cache-dir --break-system-packages google-cloud-bigquery

RUN curl -sSL https://sdk.cloud.google.com | bash -s -- --disable-prompts --install-dir "${CLOUDSDK_INSTALL_DIR}" \
  && ln -s "${CLOUDSDK_INSTALL_DIR}/bin/gcloud" /usr/local/bin/gcloud \
  && ln -s "${CLOUDSDK_INSTALL_DIR}/bin/bq" /usr/local/bin/bq

ENV PATH="$CLOUDSDK_INSTALL_DIR/bin:$PATH"

WORKDIR /app

COPY automation/data-pipelines/package*.json ./automation/data-pipelines/
COPY backend/integration-service/package*.json ./backend/integration-service/
COPY backend/common/package*.json ./backend/common/

RUN cd automation/data-pipelines && npm ci \
  && cd /app/backend/integration-service && npm ci \
  && cd /app/backend/common && npm ci

COPY automation/ ./automation/
COPY backend/integration-service/ ./backend/integration-service/
COPY backend/common/ ./backend/common/

COPY automation/scripts/square_bigquery_sync.sh /usr/local/bin/square_bigquery_sync.sh
RUN chmod +x /usr/local/bin/square_bigquery_sync.sh

RUN mkdir -p /var/log

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3005/health || exit 1

CMD ["/bin/bash", "-c", "/usr/local/bin/square_bigquery_sync.sh & node /app/backend/integration-service/src/index.js"]
