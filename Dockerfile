FROM python:3.13-slim
WORKDIR /app
COPY bundle.tar.gz /tmp/bundle.tar.gz
RUN python - <<'PY'
import tarfile
with tarfile.open('/tmp/bundle.tar.gz','r:gz') as t:
    t.extractall('/app', filter='data')
PY
RUN rm -f /tmp/bundle.tar.gz \
 && groupadd -g 10001 app \
 && useradd -u 10001 -g 10001 -M -s /usr/sbin/nologin app \
 && mkdir -p /data \
 && chown -R 10001:10001 /app /data
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 DATA_DIR=/data APP_UID=10001 APP_GID=10001
EXPOSE 8080
CMD ["python","railway/launcher.py"]
