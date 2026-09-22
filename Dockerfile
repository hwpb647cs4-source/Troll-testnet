FROM python:3.13-slim@sha256:8d9d0b8bcf6506481eae4907c18f5e3e7902e629f5f6d684f9e7c32e85e3ddf0
WORKDIR /app
COPY runtime_bootstrap.py gateway_override.py sales_preview.py /opt/mei-release/
COPY sales_public/index.html /opt/mei-release/index.html
RUN python -m py_compile /opt/mei-release/runtime_bootstrap.py /opt/mei-release/gateway_override.py /opt/mei-release/sales_preview.py \
 && groupadd -g 10001 app \
 && useradd -u 10001 -g 10001 -M -s /usr/sbin/nologin app \
 && mkdir -p /data \
 && chown 10001:10001 /app /data
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 DATA_DIR=/data APP_UID=10001 APP_GID=10001
EXPOSE 8080
CMD ["python", "/opt/mei-release/runtime_bootstrap.py"]
