from __future__ import annotations
import base64, hmac, hashlib, http.client, html, json, mimetypes, os, secrets, sqlite3, time
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit, parse_qs, quote

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = Path(os.getenv('DATA_DIR','/data'))
TEAM_DB = DATA_DIR / 'team.sqlite3'
PORT = int(os.getenv('PORT','8080'))
STAGING = os.getenv('STAGING_MODE','1').strip().lower() in {'1','true','yes','on'}
ADMIN_USER = os.getenv('ADMIN_USER','admin').strip().lower()
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD','')
SESSION_SECRET = os.getenv('STAGING_SESSION_SECRET','')
EDNA_INVITE_TOKEN = os.getenv('EDNA_INVITE_TOKEN','')
SESSION_TTL = 12 * 60 * 60
INVITE_TTL = 7 * 24 * 60 * 60
MANAGER_ROLES = {'owner','vice_president'}

UPSTREAMS = {
    '/app': ('127.0.0.1', 8790),
    '/contrata': ('127.0.0.1', 8792),
    '/nexo': ('127.0.0.1', 8793),
    '/sinal': ('127.0.0.1', 8794),
    '/kit': ('127.0.0.1', 8787),
}
KIT_BACKEND = ('/health','/ready','/ecosystem/','/claim/','/access/','/admin/','/webhook/','/test/')
HOP = {'connection','keep-alive','proxy-authenticate','proxy-authorization','te','trailers','transfer-encoding','upgrade'}

def now() -> int:
    return int(time.time())

def esc(v) -> str:
    return html.escape(str(v or ''), quote=True)

def db():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    c = sqlite3.connect(TEAM_DB, timeout=10)
    c.row_factory = sqlite3.Row
    c.execute('PRAGMA journal_mode=WAL')
    return c

def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    rounds = 210000
    out = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, rounds)
    return f'pbkdf2_sha256$' + str(rounds) + '$' + _b64url(salt) + '$' + _b64url(out)

def verify_password(password: str, stored: str) -> bool:
    try:
        alg, rounds, salt, digest = stored.split('$',3)
        if alg != 'pbkdf2_sha256': return False
        out = hashlib.pbkdf2_hmac('sha256', password.encode(), _unb64url(salt), int(rounds))
        return hmac.compare_digest(_b64url(out), digest)
    except Exception:
        return False

def token_hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()

def init_team():
    with db() as c:
        c.executescript('''
        CREATE TABLE IF NOT EXISTS users(
          username TEXT PRIMARY KEY,
          display_name TEXT NOT NULL,
          role TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          active INTEGER NOT NULL DEFAULT 1,
          created_at INTEGER NOT NULL,
          last_login_at INTEGER
        );
        CREATE TABLE IF NOT EXISTS invites(
          token_hash TEXT PRIMARY KEY,
          username TEXT NOT NULL,
          display_name TEXT NOT NULL,
          role TEXT NOT NULL,
          expires_at INTEGER NOT NULL,
          used_at INTEGER,
          created_by TEXT NOT NULL,
          created_at INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS audit(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ts INTEGER NOT NULL,
          username TEXT,
          event TEXT NOT NULL,
          detail TEXT
        );
        ''')
        r = c.execute('SELECT 1 FROM users WHERE username=?',(ADMIN_USER,)).fetchone()
        if not r and ADMIN_PASSWORD:
            c.execute('INSERT INTO users(username,display_name,role,password_hash,active,created_at) VALUES(?,?,?,?,1,?)',
                      (ADMIN_USER,'Marcelo','owner',hash_password(ADMIN_PASSWORD),now()))
            c.execute('INSERT INTO audit(ts,username,event,detail) VALUES(?,?,?,?)',
                      (now(),ADMIN_USER,'team.bootstrap','Owner account created'))
        if EDNA_INVITE_TOKEN:
            th = token_hash(EDNA_INVITE_TOKEN)
            user = c.execute('SELECT 1 FROM users WHERE username=?',('edna',)).fetchone()
            inv = c.execute('SELECT 1 FROM invites WHERE token_hash=?',(th,)).fetchone()
            if not user and not inv:
                c.execute('INSERT INTO invites(token_hash,username,display_name,role,expires_at,created_by,created_at) VALUES(?,?,?,?,?,?,?)',
                          (th,'edna','Edna','vice_president',now()+INVITE_TTL,ADMIN_USER,now()))

def audit(username: str|None, event: str, detail: str=''):
    try:
        with db() as c:
            c.execute('INSERT INTO audit(ts,username,event,detail) VALUES(?,?,?,?)',(now(),username,event,detail[:2000]))
    except Exception as e:
        print('audit error', repr(e), flush=True)

def get_user(username: str):
    with db() as c:
        return c.execute('SELECT username,display_name,role,active,last_login_at FROM users WHERE username=?',(username,)).fetchone()

def authenticate(username: str, password: str):
    username = username.strip().lower()
    with db() as c:
        r = c.execute('SELECT * FROM users WHERE username=? AND active=1',(username,)).fetchone()
        if r and verify_password(password,r['password_hash']):
            c.execute('UPDATE users SET last_login_at=? WHERE username=?',(now(),username))
            return dict(r)
    return None

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
    exp = str(now() + SESSION_TTL)
    payload = f'{user}|{exp}'.encode()
    sig = hmac.new(SESSION_SECRET.encode(), payload, hashlib.sha256).hexdigest().encode()
    return _b64url(payload + b'.' + sig)

def _session_user(token: str):
    if not SESSION_SECRET or not token: return None
    try:
        raw = _unb64url(token)
        payload, sig = raw.rsplit(b'.',1)
        expected = hmac.new(SESSION_SECRET.encode(), payload, hashlib.sha256).hexdigest().encode()
        if not hmac.compare_digest(sig,expected): return None
        user, exp = payload.decode().rsplit('|',1)
        if int(exp) < now(): return None
        r = get_user(user)
        return dict(r) if r and r['active'] else None
    except Exception:
        return None

class H(BaseHTTPRequestHandler):
    server_version = 'MEIGrowthGateway/1.2'
    def log_message(self, fmt,*args):
        print(f'{self.address_string()} - {fmt % args}',flush=True)

    def _security(self):
        self.send_header('X-Content-Type-Options','nosniff')
        self.send_header('X-Frame-Options','DENY')
        self.send_header('Referrer-Policy','strict-origin-when-cross-origin')
        self.send_header('Permissions-Policy','camera=(), microphone=(), geolocation=()')
        if STAGING: self.send_header('X-Robots-Tag','noindex, nofollow, noarchive')

    def _cookie_user(self):
        cookie=self.headers.get('Cookie','')
        for part in cookie.split(';'):
            k,sep,v=part.strip().partition('=')
            if sep and k=='mei_session': return _session_user(v)
        return None

    def _basic_user(self):
        v=self.headers.get('Authorization','')
        if not v.lower().startswith('basic '): return None
        try:
            raw=base64.b64decode(v.split(' ',1)[1],validate=True).decode()
            u,p=raw.split(':',1)
            return authenticate(u,p)
        except Exception: return None

    def _current_user(self):
        return self._cookie_user() or self._basic_user()

    def _needs_auth(self,path):
        if path in ('/health','/ready','/login','/logout') or path.startswith('/join'): return False
        if STAGING: return True
        return (path=='/app' or path.startswith('/app/') or path=='/contrata' or path.startswith('/contrata/')
                or path=='/nexo' or path.startswith('/nexo/') or path.startswith('/sinal/api/signals')
                or path.startswith('/kit/admin/') or path.startswith('/team'))

    def _page(self,title,body,status=200):
        data=f'''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(title)}</title><style>
*{{box-sizing:border-box}}body{{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#0f1117;color:#f7f8fa;min-height:100vh;padding:24px}}
.wrap{{max-width:900px;margin:auto}}.card{{background:#171a22;border:1px solid #2a2f3b;border-radius:20px;padding:24px;margin:16px 0}}
h1,h2{{margin-top:0}}p,small{{color:#aeb6c6;line-height:1.45}}a{{color:#80eca8}}label{{display:block;margin:12px 0 6px;font-weight:700}}
input,select{{width:100%;font-size:16px;padding:12px;border-radius:10px;border:1px solid #343a49;background:#0f1117;color:#fff}}
button,.btn{{display:inline-block;margin-top:16px;padding:12px 16px;border:0;border-radius:10px;font-size:15px;font-weight:800;background:#35c56f;color:#07120b;text-decoration:none}}
.badge{{display:inline-block;font-size:12px;font-weight:800;padding:6px 9px;border-radius:999px;background:#26352c;color:#80eca8;margin:0 6px 6px 0}}
.err{{background:#3a1e24;color:#ffb8c4;padding:10px 12px;border-radius:10px;margin-bottom:12px}}table{{width:100%;border-collapse:collapse}}td,th{{padding:9px;border-bottom:1px solid #2a2f3b;text-align:left;font-size:14px}}
.grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px}}code{{word-break:break-all;color:#d7e5ff}}
</style></head><body><div class="wrap">{body}</div></body></html>'''.encode()
        self.send_response(status); self._security(); self.send_header('Content-Type','text/html; charset=utf-8'); self.send_header('Cache-Control','no-store')
        self.send_header('Content-Length',str(len(data))); self.end_headers()
        if self.command!='HEAD': self.wfile.write(data)

    def _login_html(self,error='',next_path='/'):
        err=f'<div class="err">{esc(error)}</div>' if error else ''
        nxt=next_path if next_path.startswith('/') and not next_path.startswith('//') else '/'
        return f'''<div class="card" style="max-width:420px;margin:8vh auto"><div class="badge">STAGING PROTEGIDO</div>
<h1>MEI Growth</h1><p>Entre com sua conta individual.</p>{err}
<form method="post" action="/login"><input type="hidden" name="next" value="{esc(nxt)}">
<label>Usuário</label><input name="username" autocomplete="username" autocapitalize="none" required>
<label>Senha</label><input name="password" type="password" autocomplete="current-password" required>
<button type="submit" style="width:100%">Entrar</button></form>
<small>Cada colaborador deve usar sua própria conta.</small></div>'''

    def _handle_login(self):
        if self.command=='GET':
            q=parse_qs(urlsplit(self.path).query); return self._page('MEI Growth — Login',self._login_html(next_path=q.get('next',['/'])[0]))
        if self.command!='POST': return self.send_error(405)
        n=int(self.headers.get('Content-Length','0') or 0); form=parse_qs(self.rfile.read(n).decode('utf-8','replace'))
        username=form.get('username',[''])[0]; password=form.get('password',[''])[0]; nxt=form.get('next',['/'])[0] or '/'
        u=authenticate(username,password)
        if not u:
            audit(username.strip().lower() or None,'auth.failed',self.address_string())
            return self._page('MEI Growth — Login',self._login_html('Usuário ou senha incorretos.',nxt),401)
        audit(u['username'],'auth.login',self.address_string())
        token=_make_session(u['username'])
        self.send_response(303); self._security()
        self.send_header('Set-Cookie',f'mei_session={token}; Path=/; Max-Age={SESSION_TTL}; HttpOnly; Secure; SameSite=Lax')
        self.send_header('Location',nxt if nxt.startswith('/') and not nxt.startswith('//') else '/')
        self.send_header('Content-Length','0'); self.end_headers()

    def _handle_logout(self):
        u=self._current_user()
        if u: audit(u['username'],'auth.logout','')
        self.send_response(303); self._security(); self.send_header('Set-Cookie','mei_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax')
        self.send_header('Location','/login'); self.send_header('Content-Length','0'); self.end_headers()

    def _guard(self):
        path=urlsplit(self.path).path
        u=self._current_user()
        if self._needs_auth(path) and not u:
            if self.command in ('GET','HEAD'):
                target=quote(self.path if self.path.startswith('/') else '/',safe='/?=&%')
                self.send_response(303); self._security(); self.send_header('Location',f'/login?next={target}'); self.send_header('Content-Length','0'); self.end_headers()
            else:
                body=b'Authentication required'; self.send_response(401); self._security(); self.send_header('Content-Length',str(len(body))); self.end_headers(); self.wfile.write(body)
            return None
        return u

    def _manager(self,u):
        return bool(u and u['role'] in MANAGER_ROLES)

    def _handle_join(self):
        q=parse_qs(urlsplit(self.path).query)
        token=(q.get('token',[''])[0] if self.command=='GET' else '')
        if self.command=='POST':
            n=int(self.headers.get('Content-Length','0') or 0); form=parse_qs(self.rfile.read(n).decode('utf-8','replace'))
            token=form.get('token',[''])[0]; pwd=form.get('password',[''])[0]; confirm=form.get('confirm',[''])[0]
            th=token_hash(token)
            with db() as c: inv=c.execute('SELECT * FROM invites WHERE token_hash=?',(th,)).fetchone()
            if not inv or inv['used_at'] or inv['expires_at']<now(): return self._page('Convite inválido','<div class="card"><h1>Convite inválido ou expirado</h1></div>',400)
            if len(pwd)<10 or pwd!=confirm:
                return self._join_page(token,dict(inv),'Use pelo menos 10 caracteres e confirme a mesma senha.')
            with db() as c:
                c.execute('INSERT OR REPLACE INTO users(username,display_name,role,password_hash,active,created_at) VALUES(?,?,?,?,1,?)',
                          (inv['username'],inv['display_name'],inv['role'],hash_password(pwd),now()))
                c.execute('UPDATE invites SET used_at=? WHERE token_hash=?',(now(),th))
            audit(inv['username'],'team.join',f"role={inv['role']}")
            return self._page('Conta criada',f'''<div class="card"><h1>Conta criada ✅</h1><p>Bem-vinda, {esc(inv['display_name'])}.</p><a class="btn" href="/login">Entrar no MEI Growth</a></div>''')
        th=token_hash(token)
        with db() as c: inv=c.execute('SELECT * FROM invites WHERE token_hash=?',(th,)).fetchone()
        if not inv or inv['used_at'] or inv['expires_at']<now(): return self._page('Convite inválido','<div class="card"><h1>Convite inválido ou expirado</h1></div>',400)
        return self._join_page(token,dict(inv))

    def _join_page(self,token,inv,error=''):
        er=f'<div class="err">{esc(error)}</div>' if error else ''
        role='Vice-President' if inv['role']=='vice_president' else inv['role']
        body=f'''<div class="card" style="max-width:480px;margin:6vh auto"><div class="badge">CONVITE DE EQUIPE</div><h1>Olá, {esc(inv['display_name'])}</h1>
<p>Você foi convidada para o MEI Growth como <b>{esc(role)}</b>. Crie sua própria senha.</p>{er}
<form method="post" action="/join"><input type="hidden" name="token" value="{esc(token)}">
<label>Nova senha</label><input name="password" type="password" minlength="10" required>
<label>Confirmar senha</label><input name="confirm" type="password" minlength="10" required>
<button type="submit" style="width:100%">Ativar minha conta</button></form></div>'''
        return self._page('Entrar para a equipe',body)

    def _handle_team(self,u):
        if not self._manager(u): return self._page('Sem acesso','<div class="card"><h1>Sem acesso</h1></div>',403)
        if self.command=='POST' and urlsplit(self.path).path=='/team/invite':
            n=int(self.headers.get('Content-Length','0') or 0); f=parse_qs(self.rfile.read(n).decode('utf-8','replace'))
            username=f.get('username',[''])[0].strip().lower(); display=f.get('display_name',[''])[0].strip(); role=f.get('role',['collaborator'])[0]
            if not username.replace('_','').replace('-','').isalnum() or not display or role not in {'collaborator','vice_president'}:
                return self._page('Convite','<div class="card"><h1>Dados inválidos</h1><a href="/team">Voltar</a></div>',400)
            token=secrets.token_urlsafe(32); th=token_hash(token)
            with db() as c:
                c.execute('DELETE FROM invites WHERE username=? AND used_at IS NULL',(username,))
                c.execute('INSERT INTO invites(token_hash,username,display_name,role,expires_at,created_by,created_at) VALUES(?,?,?,?,?,?,?)',
                          (th,username,display,role,now()+INVITE_TTL,u['username'],now()))
            audit(u['username'],'team.invite',f'{username}:{role}')
            host=self.headers.get('Host','')
            link=f'https://{host}/join?token={token}'
            return self._page('Convite criado',f'''<div class="card"><h1>Convite criado ✅</h1><p>Envie este link apenas para {esc(display)}. Ele expira em 7 dias e funciona uma vez.</p><code>{esc(link)}</code><br><a class="btn" href="/team">Voltar à equipe</a></div>''')
        with db() as c:
            users=c.execute('SELECT username,display_name,role,active,last_login_at FROM users ORDER BY role DESC,display_name').fetchall()
            logs=c.execute('SELECT ts,username,event,detail FROM audit ORDER BY id DESC LIMIT 40').fetchall()
        rows=''.join(f'<tr><td>{esc(x["display_name"])}</td><td>{esc(x["username"])}</td><td>{esc(x["role"])}</td><td>{"Ativo" if x["active"] else "Inativo"}</td></tr>' for x in users)
        logrows=''.join(f'<tr><td>{time.strftime("%m/%d %H:%M",time.localtime(x["ts"]))}</td><td>{esc(x["username"])}</td><td>{esc(x["event"])}</td><td>{esc(x["detail"])}</td></tr>' for x in logs)
        body=f'''<div class="grid"><div class="card"><div class="badge">EQUIPE</div><h1>MEI Growth Team</h1><p>Logado como <b>{esc(u["display_name"])}</b> · {esc(u["role"])}</p>
<a href="/" class="btn">Voltar ao app</a> <a href="/logout" class="btn" style="background:#2a2f3b;color:#fff">Sair</a></div>
<div class="card"><h2>Convidar colaborador</h2><form method="post" action="/team/invite">
<label>Nome</label><input name="display_name" required><label>Usuário</label><input name="username" autocapitalize="none" required>
<label>Função</label><select name="role"><option value="collaborator">Collaborator</option><option value="vice_president">Vice-President</option></select>
<button type="submit">Criar convite</button></form></div></div>
<div class="card"><h2>Pessoas</h2><table><tr><th>Nome</th><th>Usuário</th><th>Função</th><th>Status</th></tr>{rows}</table></div>
<div class="card"><h2>Atividade recente</h2><table><tr><th>Hora</th><th>Pessoa</th><th>Evento</th><th>Detalhe</th></tr>{logrows}</table></div>'''
        return self._page('MEI Growth Team',body)

    def _redirect(self,target):
        self.send_response(308); self._security(); self.send_header('Location',target); self.send_header('Content-Length','0'); self.end_headers()

    def _serve_file(self,base,rel):
        if not rel or rel.endswith('/'): rel+='index.html'
        p=_safe_file(base,rel)
        if not p or not p.is_file(): return False
        data=p.read_bytes(); ctype=mimetypes.guess_type(p.name)[0] or 'application/octet-stream'
        self.send_response(200); self._security(); self.send_header('Content-Type',ctype+('; charset=utf-8' if ctype.startswith('text/') else ''))
        self.send_header('Content-Length',str(len(data))); self.send_header('Cache-Control','no-store' if STAGING else 'public, max-age=300'); self.end_headers()
        if self.command!='HEAD': self.wfile.write(data)
        return True

    def _proxy(self,prefix,upstream,u):
        split=urlsplit(self.path); path=split.path[len(prefix):] or '/'
        if split.query: path+='?'+split.query
        n=int(self.headers.get('Content-Length','0') or 0); body=self.rfile.read(n) if n>0 else None
        headers={}
        for k,v in self.headers.items():
            if k.lower() in HOP or k.lower() in {'host','content-length','authorization','cookie'}: continue
            headers[k]=v
        if body is not None: headers['Content-Length']=str(len(body))
        headers['Host']=f'{upstream[0]}:{upstream[1]}'; headers['X-Forwarded-Host']=self.headers.get('Host',''); headers['X-Forwarded-Proto']='https'
        if u:
            headers['X-MEI-User']=u['username']; headers['X-MEI-Role']=u['role']; headers['X-MEI-Display-Name']=u['display_name']
        conn=http.client.HTTPConnection(upstream[0],upstream[1],timeout=30)
        try:
            conn.request(self.command,path,body=body,headers=headers); r=conn.getresponse(); data=r.read()
            self.send_response(r.status,r.reason); self._security()
            for k,v in r.getheaders():
                if k.lower() in HOP or k.lower() in {'server','date','content-length'}: continue
                self.send_header(k,v)
            self.send_header('Content-Length',str(len(data))); self.end_headers()
            if self.command!='HEAD': self.wfile.write(data)
            if u and self.command not in ('GET','HEAD','OPTIONS'):
                audit(u['username'],'action',f'{self.command} {prefix}{path} -> {r.status}')
        except Exception:
            data=b'Upstream unavailable'; self.send_response(502); self._security(); self.send_header('Content-Length',str(len(data))); self.end_headers(); self.wfile.write(data)
        finally: conn.close()

    def _dispatch(self):
        path=urlsplit(self.path).path
        if path=='/login': return self._handle_login()
        if path=='/logout': return self._handle_logout()
        if path.startswith('/join'): return self._handle_join()
        u=self._guard()
        if self._needs_auth(path) and not u: return
        if path=='/team' or path=='/team/invite': return self._handle_team(u)
        if path=='/health':
            statuses={}
            for name,(host,port) in UPSTREAMS.items():
                try:
                    c=http.client.HTTPConnection(host,port,timeout=1); c.request('GET','/health'); r=c.getresponse(); r.read(); statuses[name.lstrip('/')]=r.status==200; c.close()
                except Exception: statuses[name.lstrip('/')]=False
            ok=all(statuses.values()); data=json.dumps({'ok':ok,'version':'railway-1.2','staging':STAGING,'collaboration':True,'services':statuses}).encode()
            self.send_response(200 if ok else 503); self._security(); self.send_header('Content-Type','application/json'); self.send_header('Content-Length',str(len(data))); self.end_headers(); self.wfile.write(data); return
        if path=='/ready':
            data=json.dumps({'ready':True,'staging':STAGING,'collaboration':True,'commerce_enabled':False,'government_submission_enabled':False}).encode()
            self.send_response(200); self._security(); self.send_header('Content-Type','application/json'); self.send_header('Content-Length',str(len(data))); self.end_headers(); self.wfile.write(data); return
        for prefix in UPSTREAMS:
            if path==prefix: return self._redirect(prefix+'/')
        if path.startswith('/kit/'):
            stripped=path[len('/kit'):]
            if any(stripped==x or stripped.startswith(x) for x in KIT_BACKEND) or self.command not in ('GET','HEAD'): return self._proxy('/kit',UPSTREAMS['/kit'],u)
            if self._serve_file(ROOT/'apps/kitvende/public_site',stripped): return
            return self.send_error(404)
        for prefix in ('/app','/contrata','/nexo','/sinal'):
            if path.startswith(prefix+'/'): return self._proxy(prefix,UPSTREAMS[prefix],u)
        if self.command in ('GET','HEAD'):
            rel=path.lstrip('/') or 'index.html'
            if self._serve_file(ROOT/'portal',rel): return
        self.send_error(404)

    do_GET=_dispatch
    do_POST=_dispatch
    do_OPTIONS=_dispatch
    do_HEAD=_dispatch

def main():
    init_team()
    print(f'MEI Growth Railway gateway 1.2 on 0.0.0.0:{PORT} staging={STAGING} collaboration=True',flush=True)
    ThreadingHTTPServer(('0.0.0.0',PORT),H).serve_forever()

if __name__=='__main__': main()
