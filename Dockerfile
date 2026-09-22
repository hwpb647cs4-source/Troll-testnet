FROM python:3.13-slim
WORKDIR /app
ARG APP_URL="https://at.adobe.com/JC0QusFZLjs8JWye"
ARG APP_SHA256="1e8298d2d428d41ca0f7f23601afdf2458d30ca770af6af3e235e7ba39d08578"
RUN python - <<'PY'
import hashlib, pathlib, shutil, urllib.request, zipfile
url = "https://at.adobe.com/JC0QusFZLjs8JWye"
expected = "1e8298d2d428d41ca0f7f23601afdf2458d30ca770af6af3e235e7ba39d08578"
zip_path = pathlib.Path("/tmp/mei-growth.zip")
h = hashlib.sha256()
with urllib.request.urlopen(url, timeout=120) as r, zip_path.open("wb") as f:
    while True:
        chunk = r.read(1024 * 1024)
        if not chunk:
            break
        f.write(chunk)
        h.update(chunk)
actual = h.hexdigest()
if actual != expected:
    raise SystemExit(f"SHA256 mismatch: {actual}")
src = pathlib.Path("/tmp/src")
with zipfile.ZipFile(zip_path) as z:
    z.extractall(src)
root = src / "mei_growth_railway_runtime"
if not root.is_dir():
    raise SystemExit("runtime root missing")
dst = pathlib.Path("/app")
for p in root.iterdir():
    target = dst / p.name
    if p.is_dir():
        shutil.copytree(p, target, dirs_exist_ok=True)
    else:
        shutil.copy2(p, target)
PY
COPY gateway_override.py /app/railway/gateway_base.py
COPY sales_preview.py /app/railway/gateway.py
COPY sales_public/index.html /app/sales_public/index.html
RUN python -m py_compile /app/railway/gateway.py /app/railway/gateway_base.py
RUN groupadd -g 10001 app \
 && useradd -u 10001 -g 10001 -M -s /usr/sbin/nologin app \
 && mkdir -p /data \
 && chown -R 10001:10001 /app /data
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 DATA_DIR=/data APP_UID=10001 APP_GID=10001
EXPOSE 8080
CMD ["python","railway/launcher.py"]
