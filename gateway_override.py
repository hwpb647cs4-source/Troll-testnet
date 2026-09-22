from __future__ import annotations
import base64, hmac, hashlib, http.client, json, mimetypes, os, time
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit, parse_qs, quote

ROOT = Path(__file__).resolve().parents[1]
PORT = int(os.getenv('PORT','8080'))
STAGING = os.getenv('STAGING_MODE','1').strip().lower() in {'1','true','yes','on'}
ADMIN_USER = os.getenv('ADMIN_USER','admin')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD','')
SESSION_SECRET = os.getenv('STAGING_SESSION_SECRET','')
SESSION_TTL = 12 * 60 * 60

UPSTREAMS = {
    '/app': ('127.0.0.1', 8790),
    '/contrata': ('127.0.0.1', 8792),
    '/nexo': ('127.0.0.1', 8793),
    '/sinal': ('127.0.0.1', 8794),
    '/kit': ('127.0.0.1', 8787),
}
KIT_BACKEND = ('/health','/ready','/ecosystem/','/claim/','/access/','/admin/','/webhook/','/test/')
HOP = {'connection','keep-alive','proxy-authenticate','proxy-authorization','te','trailers','transfer-encoding','upgrade'}

def _safe_file(base: Path, rel: str):
    base = base.resolve()
    target = (base / rel.lstrip('/')).resolve()
    try: target.relative_to(base)
    except ValueError: return None
    return target

def _b64url(b: bytes) -> str:
    return base64.urlsafe_b64encode(b).decode().rstrip('=')

def _unb64url(s: str) -> bytes:
    return base64.urlsafe_b64decode(s + '=' * (-len(s) % 4))

def _make_session(user: str) -> str:
    exp = str(int(time.time()) + SESSION_TTL)
    payload = f'{user}|{exp}'.encode()
    sig = hmac.new(SESSION_SECRET.encode(), payload, hashlib.sha256).hexdigest().encode()
    return _b64url(payload + b'.' + sig)

def _check_session(token: str) -> bool:
    if not SESSION_SECRET or not token: return False
    try:
        raw = _unb64url(token)
        payload, sig = raw.rsplit(b'.', 1)
        expected = hmac.new(SESSION_SECRET.encode(), payload, hashlib.sha256).hexdigest().encode()
        if not hmac.compare_digest(sig, expected): return False
        user, exp = payload.decode().rsplit('|', 1)
        return hmac.compare_digest(user, ADMIN_USER) and int(exp) >= int(time.time())
    except Exception:
        return False

class H(BaseHTTPRequestHandler):
    server_version = 'MEIGrowthGateway/1.1'
    def log_message(self, fmt, *args):
        print(f'{self.address_string()} - {fmt % args}', flush=True)

    def _security(self):
        self.send_header('X-Content-Type-Options','nosniff')
        self.send_header('X-Frame-Options','DENY')
        self.send_header('Referrer-Policy','strict-origin-when-cross-origin')
        self.send_header('Permissions-Policy','camera=(), microphone=(), geolocation=()')
        if STAGING: self.send_header('X-Robots-Tag','noindex, nofollow, noarchive')

    def _auth_ok(self):
        if not ADMIN_PASSWORD: return False
        v = self.headers.get('Authorization','')
        if not v.lower().startswith('basic '): return False
        try:
            raw = base64.b64decode(v.split(' ',1)[1], validate=True).decode('utf-8')
            user, pwd = raw.split(':',1)
        except Exception:
            return False
        return hmac.compare_digest(user, ADMIN_USER) and hmac.compare_digest(pwd, ADMIN_PASSWORD)

    def _cookie_ok(self):
        cookie = self.headers.get('Cookie','')
        for part in cookie.split(';'):
            k, sep, v = part.strip().partition('=')
            if sep and k == 'mei_session':
                return _check_session(v)
        return False

    def _authenticated(self):
        return self._cookie_ok() or self._auth_ok()

    def _needs_auth(self, path: str):
        if path in ('/health','/ready','/login','/logout'): return False
        if STAGING: return True
        if path == '/app' or path.startswith('/app/'): return True
        if path == '/contrata' or path.startswith('/contrata/'): return True
        if path == '/nexo' or path.startswith('/nexo/'): return True
        if path.startswith('/sinal/api/signals'): return True
        if path.startswith('/kit/admin/'): return True
        return False

    def _login_html(self, error='', next_path='/'):
        err = f'<div class="err">{error}</div>' if error else ''
        nxt = next_path if next_path.startswith('/') and not next_path.startswith('//') else '/'
        return f'''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>MEI Growth — Staging</title><style>
*{{box-sizing:border-box}} body{{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#0f1117;color:#f7f8fa;min-height:100vh;display:grid;place-items:center;padding:24px}}
.card{{width:min(420px,100%);background:#171a22;border:1px solid #2a2f3b;border-radius:24px;padding:30px;box-shadow:0 20px 60px #0008}}
h1{{margin:0 0 8px;font-size:28px}} p{{color:#aeb6c6;margin:0 0 24px;line-height:1.45}}
label{{display:block;margin:14px 0 7px;font-weight:700}} input{{width:100%;font-size:17px;padding:14px 15px;border-radius:12px;border:1px solid #343a49;background:#0f1117;color:#fff}}
button{{width:100%;margin-top:20px;padding:14px;border:0;border-radius:12px;font-size:17px;font-weight:800;background:#35c56f;color:#07120b}}
.badge{{display:inline-block;font-size:12px;font-weight:800;padding:6px 9px;border-radius:999px;background:#26352c;color:#80eca8;margin-bottom:18px}}
.err{{background:#3a1e24;color:#ffb8c4;padding:10px 12px;border-radius:10px;margin-bottom:12px}}
small{{display:block;color:#7f899b;margin-top:16px;line-height:1.4}}
</style></head><body><form class="card" method="post" action="/login">
<div class="badge">STAGING PROTEGIDO</div><h1>MEI Growth</h1><p>Entre para abrir o ambiente de teste.</p>{err}
<input type="hidden" name="next" value="{nxt}">
<label>Usuário</label><input name="username" autocomplete="username" autocapitalize="none" required>
<label>Senha</label><input name="password" type="password" autocomplete="current-password" required>
<button type="submit">Entrar</button><small>Pagamentos reais continuam desligados neste ambiente.</small>
</form></body></html>'''.encode()

    def _show_login(self, error='', next_path='/'):
        body = self._login_html(error, next_path)
        self.send_response(200 if not error else 401)
        self._security()
        self.send_header('Content-Type','text/html; charset=utf-8')
        self.send_header('Cache-Control','no-store')
        self.send_header('Content-Length',str(len(body)))
        self.end_headers()
        if self.command != 'HEAD': self.wfile.write(body)

    def _handle_login(self):
        if self.command == 'GET':
            q = parse_qs(urlsplit(self.path).query)
            return self._show_login(next_path=(q.get('next',['/'])[0] or '/'))
        if self.command != 'POST':
            self.send_error(405); return
        try: n = int(self.headers.get('Content-Length','0') or 0)
        except: n = 0
        form = parse_qs(self.rfile.read(n).decode('utf-8','replace'))
        user = form.get('username',[''])[0]
        pwd = form.get('password',[''])[0]
        nxt = form.get('next',['/'])[0] or '/'
        if not (hmac.compare_digest(user, ADMIN_USER) and hmac.compare_digest(pwd, ADMIN_PASSWORD)):
            return self._show_login('Usuário ou senha incorretos.', nxt)
        token = _make_session(user)
        self.send_response(303)
        self._security()
        self.send_header('Set-Cookie', f'mei_session={token}; Path=/; Max-Age={SESSION_TTL}; HttpOnly; Secure; SameSite=Lax')
        self.send_header('Location', nxt if nxt.startswith('/') and not nxt.startswith('//') else '/')
        self.send_header('Content-Length','0')
        self.end_headers()

    def _handle_logout(self):
        self.send_response(303); self._security()
        self.send_header('Set-Cookie','mei_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax')
        self.send_header('Location','/login')
        self.send_header('Content-Length','0'); self.end_headers()

    def _guard(self):
        path = urlsplit(self.path).path
        if self._needs_auth(path) and not self._authenticated():
            if self.command in ('GET','HEAD'):
                target = quote(self.path if self.path.startswith('/') else '/', safe='/?=&%')
                self.send_response(303); self._security(); self.send_header('Location',f'/login?next={target}'); self.send_header('Content-Length','0'); self.end_headers()
            else:
                body=b'Authentication required'
                self.send_response(401); self._security(); self.send_header('Content-Type','text/plain; charset=utf-8'); self.send_header('Content-Length',str(len(body))); self.end_headers(); self.wfile.write(body)
            return False
        return True

    def _redirect(self, target):
        self.send_response(308); self._security(); self.send_header('Location',target); self.send_header('Content-Length','0'); self.end_headers()

    def _serve_file(self, base: Path, rel: str):
        if not rel or rel.endswith('/'): rel += 'index.html'
        p=_safe_file(base,rel)
        if not p or not p.is_file(): return False
        data=p.read_bytes(); ctype=mimetypes.guess_type(p.name)[0] or 'application/octet-stream'
        self.send_response(200); self._security(); self.send_header('Content-Type',ctype + ('; charset=utf-8' if ctype.startswith('text/') else ''))
        self.send_header('Content-Length',str(len(data))); self.send_header('Cache-Control','no-store' if STAGING else 'public, max-age=300'); self.end_headers()
        if self.command!='HEAD': self.wfile.write(data)
        return True

    def _proxy(self, prefix: str, upstream):
        split=urlsplit(self.path)
        path=split.path[len(prefix):] or '/'
        if split.query: path += '?' + split.query
        try: n=int(self.headers.get('Content-Length','0') or 0)
        except: n=0
        body=self.rfile.read(n) if n>0 else None
        headers={}
        for k,v in self.headers.items():
            if k.lower() in HOP or k.lower() in {'host','content-length','authorization','cookie'}: continue
            headers[k]=v
        if body is not None: headers['Content-Length']=str(len(body))
        headers['Host']=f'{upstream[0]}:{upstream[1]}'
        headers['X-Forwarded-Host']=self.headers.get('Host','')
        headers['X-Forwarded-Proto']=self.headers.get('X-Forwarded-Proto','https')
        conn=http.client.HTTPConnection(upstream[0],upstream[1],timeout=30)
        try:
            conn.request(self.command,path,body=body,headers=headers)
            r=conn.getresponse(); data=r.read()
            self.send_response(r.status,r.reason); self._security()
            for k,v in r.getheaders():
                if k.lower() in HOP or k.lower() in {'server','date','content-length'}: continue
                self.send_header(k,v)
            self.send_header('Content-Length',str(len(data))); self.end_headers()
            if self.command!='HEAD': self.wfile.write(data)
        except Exception:
            data=b'Upstream unavailable'; self.send_response(502); self._security(); self.send_header('Content-Type','text/plain'); self.send_header('Content-Length',str(len(data))); self.end_headers(); self.wfile.write(data)
        finally: conn.close()

    def _dispatch(self):
        path=urlsplit(self.path).path
        if path == '/login': return self._handle_login()
        if path == '/logout': return self._handle_logout()
        if not self._guard(): return
        split=urlsplit(self.path); path=split.path
        if path=='/health':
            statuses={}
            for name,(host,port) in UPSTREAMS.items():
                try:
                    c=http.client.HTTPConnection(host,port,timeout=1); c.request('GET','/health'); r=c.getresponse(); r.read(); statuses[name.lstrip('/')]=r.status==200; c.close()
                except Exception: statuses[name.lstrip('/')]=False
            ok=all(statuses.values())
            data=json.dumps({'ok':ok,'version':'railway-1.1','staging':STAGING,'services':statuses}).encode()
            self.send_response(200 if ok else 503); self._security(); self.send_header('Content-Type','application/json'); self.send_header('Content-Length',str(len(data))); self.end_headers(); self.wfile.write(data); return
        if path=='/ready':
            data=json.dumps({'ready':True,'staging':STAGING,'commerce_enabled':False,'government_submission_enabled':False}).encode()
            self.send_response(200); self._security(); self.send_header('Content-Type','application/json'); self.send_header('Content-Length',str(len(data))); self.end_headers(); self.wfile.write(data); return
        for prefix in ('/app','/contrata','/nexo','/sinal','/kit'):
            if path==prefix: return self._redirect(prefix+'/')
        if path.startswith('/kit/'):
            stripped=path[len('/kit'):]
            if any(stripped==x or stripped.startswith(x) for x in KIT_BACKEND): return self._proxy('/kit',UPSTREAMS['/kit'])
            if self.command not in ('GET','HEAD'): return self._proxy('/kit',UPSTREAMS['/kit'])
            if self._serve_file(ROOT/'apps/kitvende/public_site', stripped): return
            self.send_error(404); return
        for prefix in ('/app','/contrata','/nexo','/sinal'):
            if path.startswith(prefix+'/'): return self._proxy(prefix,UPSTREAMS[prefix])
        if self.command in ('GET','HEAD'):
            rel=path.lstrip('/') or 'index.html'
            if self._serve_file(ROOT/'portal',rel): return
        self.send_error(404)

    do_GET=_dispatch
    do_POST=_dispatch
    do_OPTIONS=_dispatch
    do_HEAD=_dispatch

def main():
    print(f'MEI Growth Railway gateway on 0.0.0.0:{PORT} staging={STAGING}',flush=True)
    ThreadingHTTPServer(('0.0.0.0',PORT),H).serve_forever()

if __name__=='__main__': main()
