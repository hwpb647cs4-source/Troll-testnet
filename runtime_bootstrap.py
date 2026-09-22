"""Load a hash-pinned private runtime at startup, not during Docker build.

Only release-cache files and the container's /app directory are written here.
Business databases, accounts and Railway settings are never altered by this module.
A healthy persistent cache avoids dependence on an expiring download link on restart.
"""
from __future__ import annotations
import hashlib
import os
from pathlib import Path, PurePosixPath
import shutil
import stat
import sys
import tempfile
import urllib.request
from urllib.parse import urlsplit
import zipfile

SHA256 = '1e8298d2d428d41ca0f7f23601afdf2458d30ca770af6af3e235e7ba39d08578'
MAX_DOWNLOAD = 8 * 1024 * 1024
MAX_EXPANDED = 32 * 1024 * 1024
ZIP_ROOT = 'mei_growth_railway_runtime'
REQUIRED = ('railway/launcher.py', 'railway/gateway.py', 'portal/index.html',
            'apps/growthos/engine/server.py', 'apps/kitvende/server/app.py',
            'apps/contratalens/engine/server.py', 'apps/nexomei/engine/server.py',
            'apps/sinalmei/engine/server.py')


def verified(path: Path, expected: str = SHA256) -> bool:
    if path.is_symlink() or not path.is_file():
        return False
    if not 0 < path.stat().st_size <= MAX_DOWNLOAD:
        return False
    return hashlib.sha256(path.read_bytes()).hexdigest() == expected


def acquire(cache: Path, source_url: str, expected: str = SHA256) -> Path:
    """Accept only an approved source URL, and only bytes matching a pinned hash."""
    if cache.is_symlink():
        raise RuntimeError('Runtime cache must not be a symbolic link')
    cache.mkdir(mode=0o700, parents=True, exist_ok=True)
    target = cache / (expected + '.zip')
    if verified(target, expected):
        print('runtime cache: verified', flush=True)
        return target
    parts = urlsplit(source_url)
    if parts.scheme != 'https' or parts.hostname != 'at.adobe.com' or parts.username or parts.password or parts.fragment:
        raise RuntimeError('A fresh approved runtime source is required; no business data was changed')
    fd, tmpname = tempfile.mkstemp(prefix='runtime-', suffix='.partial', dir=cache)
    tmp = Path(tmpname)
    try:
        total = 0
        with os.fdopen(fd, 'wb') as dst:
            # Do not include the source URL, HTTP exception or response body in logs.
            try:
                with urllib.request.urlopen(source_url, timeout=45) as src:
                    while True:
                        chunk = src.read(65536)
                        if not chunk:
                            break
                        total += len(chunk)
                        if total > MAX_DOWNLOAD:
                            raise RuntimeError('Runtime download too large')
                        dst.write(chunk)
            except Exception:
                raise RuntimeError('Runtime source unavailable; refresh the private source URL') from None
            dst.flush()
            os.fsync(dst.fileno())
        if not verified(tmp, expected):
            raise RuntimeError('Runtime integrity check failed')
        os.chmod(tmp, 0o600)
        os.replace(tmp, target)
        print('runtime cache: created and verified', flush=True)
        return target
    finally:
        tmp.unlink(missing_ok=True)


def extract_verified(archive: Path, destination: Path, expected: str = SHA256) -> None:
    if not verified(archive, expected):
        raise RuntimeError('Runtime integrity check failed before extraction')
    with zipfile.ZipFile(archive) as z:
        infos = z.infolist()
        if len(infos) > 2000 or sum(x.file_size for x in infos) > MAX_EXPANDED:
            raise RuntimeError('Runtime archive exceeds limits')
        names = set()
        validated = []
        for info in infos:
            parts = PurePosixPath(info.filename).parts
            mode = (info.external_attr >> 16) & 0o170000
            if (not parts or parts[0] != ZIP_ROOT or '..' in parts or '\\' in info.filename
                    or info.filename.startswith('/') or info.filename in names
                    or mode not in (0, stat.S_IFREG, stat.S_IFDIR)):
                raise RuntimeError('Unsafe runtime archive member')
            names.add(info.filename)
            if len(parts) > 1:
                validated.append((info, Path(*parts[1:])))
        if any(ZIP_ROOT + '/' + name not in names for name in REQUIRED):
            raise RuntimeError('Runtime archive is incomplete')
        if z.testzip() is not None:
            raise RuntimeError('Runtime archive CRC check failed')
        destination.mkdir(parents=True, exist_ok=True)
        root = destination.resolve()
        for info, rel in validated:
            out = destination / rel
            if not out.resolve().is_relative_to(root):
                raise RuntimeError('Unsafe extraction path')
            if info.is_dir():
                out.mkdir(parents=True, exist_ok=True)
            else:
                out.parent.mkdir(parents=True, exist_ok=True)
                with z.open(info) as source, out.open('wb') as target:
                    shutil.copyfileobj(source, target)
                os.chmod(out, 0o644)


def main():
    data = Path(os.getenv('DATA_DIR', '/data'))
    source = os.environ.pop('MEI_RUNTIME_SOURCE_URL', '')
    cache = data / '.mei-release-cache'
    if not cache.resolve().is_relative_to(data.resolve()):
        raise RuntimeError('Runtime cache is outside data volume')
    archive = acquire(cache, source)
    app = Path('/app')
    extract_verified(archive, app)
    overrides = Path('/opt/mei-release')
    shutil.copy2(overrides / 'gateway_override.py', app / 'railway/gateway_base.py')
    shutil.copy2(overrides / 'sales_preview.py', app / 'railway/gateway.py')
    (app / 'sales_public').mkdir(exist_ok=True)
    shutil.copy2(overrides / 'index.html', app / 'sales_public/index.html')
    if os.geteuid() == 0:
        uid, gid = int(os.getenv('APP_UID', '10001')), int(os.getenv('APP_GID', '10001'))
        for root, dirs, files in os.walk(app):
            os.chown(root, uid, gid)
            for name in files:
                os.chown(Path(root) / name, uid, gid)
    print('runtime: pinned source ready; starting existing launcher', flush=True)
    os.chdir(app)
    os.execv(sys.executable, [sys.executable, str(app / 'railway/launcher.py')])


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        # Constant messages only. Never reveal URLs, tokens or credentials.
        print('Runtime initialization failed: ' + str(exc), file=sys.stderr, flush=True)
        raise SystemExit(1)
