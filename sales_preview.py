"""Read-only sales pilot layered over the existing MEI Growth staging gateway.

No checkout, credential change, invitation change, payment or customer collection.
Deploy only to the existing staging branch. Paid product content is never bundled.
"""
from __future__ import annotations
import html
import json
import os
from pathlib import Path
import runpy
from urllib.parse import urlsplit

VERSION = 'sales-pilot-1.3'
PRODUCT = {
    'id': 'manicure_essencial_v1',
    'name': 'KitVende Essencial — Manicure',
    'price_cents_proposed': 5990,
    'messages': 24,
    'optional_ai_prompts': 10,
    'implementation_days': 7,
    'billing': 'one_time',
    'delivery_plan': 'Kiwify native members area; not configured',
}


def read_json(path: Path) -> dict:
    try:
        value = json.loads(path.read_text(encoding='utf-8'))
        return value if isinstance(value, dict) else {}
    except (OSError, ValueError):
        return {}


def launch_report(root: Path) -> dict:
    """Configuration presence is not evidence of a payment or delivery test."""
    cfg = root / 'apps' / 'kitvende' / 'config'
    site = read_json(cfg / 'site.json')
    adapter = read_json(cfg / 'provider_adapter.json')
    mapping = adapter.get('product_id_to_slug', {})
    mapping_count = len(mapping) if isinstance(mapping, dict) else 0
    links = read_json(cfg / 'checkout_urls.json')
    configured = sum(isinstance(v, str) and v.startswith('https://') for v in links.values())
    return {
        'version': VERSION, 'sales_ready': False, 'commerce_enabled': False,
        'checkout_redirect_enabled': False, 'product': PRODUCT,
        'configuration_observed': {
            'supplier_name_present': bool(str(site.get('legal_name') or '').strip()),
            'support_email_present': bool(str(site.get('support_email') or '').strip()),
            'existing_catalog_mappings': mapping_count,
            'existing_catalog_https_links': configured,
        },
        'pilot': {
            'public_sample_messages': 3,
            'private_package_on_server': False,
            'payment_provider_setup_verified': False,
            'buyer_delivery_verified': False,
            'refund_flow_verified': False,
        },
        'remaining': [
            'Finalizar identificação do fornecedor, suporte e políticas comerciais.',
            'Cadastrar o produto piloto na Kiwify e conferir preço e link de checkout.',
            'Enviar o pacote privado à área de membros; testar acesso como compradora.',
            'Validar compra, entrega e procedimento de reembolso antes de liberar vendas.',
            'Revisar segurança e acesso do ambiente antes da abertura pública.',
        ],
        'note': 'Este relatório não confirma vendas, conformidade jurídica ou auditoria de segurança.',
    }


def readme_html(report: dict) -> str:
    e = html.escape
    conf = report['configuration_observed']
    state = lambda x: 'Presente na configuração (não validado)' if x else 'Pendente'
    rows = ''.join('<tr><th>'+e(k)+'</th><td>'+e(v)+'</td></tr>' for k,v in [
        ('Fornecedor', state(conf['supplier_name_present'])),
        ('Suporte', state(conf['support_email_present'])),
        ('Produto piloto na Kiwify', 'Não verificado'),
        ('Entrega à compradora', 'Não testada no provedor'),
        ('Reembolso', 'Não testado no provedor'),
        ('Cobrança nesta prévia', 'Desligada'),
    ])
    tasks = ''.join('<li>'+e(x)+'</li>' for x in report['remaining'])
    return f'''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Lançamento — MEI Growth</title><style>
body{{font:16px/1.6 system-ui;margin:0;background:#f6f7f2;color:#20362c}}main{{max-width:850px;margin:auto;padding:30px 22px}}.card{{background:white;border:1px solid #dce4db;border-radius:14px;padding:24px;margin:18px 0}}a{{color:#245c42}}table{{width:100%;border-collapse:collapse}}th,td{{text-align:left;border-bottom:1px solid #dce4db;padding:12px 6px}}th{{width:38%}}h1{{line-height:1.15}}li{{margin:8px 0}}small{{color:#5b6e63}}
</style></head><body><main><a href="/comecar/">← Ver prévia comercial</a><h1>Um produto para a primeira venda.</h1><p>Painel interno. Não há compras liberadas.</p><section class="card"><h2>{e(PRODUCT['name'])}</h2><p>Preço proposto: <strong>R$ 59,90</strong> · Pagamento único.</p><p>24 mensagens, personalizador offline, 10 prompts opcionais, plano de sete dias e guia de uso. Os demais módulos do MEI Growth não estão incluídos.</p><table>{rows}</table></section><section class="card"><h2>O que falta</h2><ol>{tasks}</ol><p>Para reduzir a operação inicial, a entrega planejada é pela própria área de membros da Kiwify. O pacote pago deve ser enviado ao provedor, nunca a uma página ou repositório público.</p></section><section class="card"><h2>Texto para cadastro do produto</h2><p>Kit digital para manicures e nail designers organizarem primeiro contato, orçamento, confirmação, reagendamento, pós-atendimento e retorno. Inclui 24 mensagens editáveis, personalizador HTML offline, arquivos de texto, 10 prompts opcionais de IA e plano de sete dias. Não inclui disparos automáticos, conta de IA ou CRM hospedado. Não garante clientes, renda ou agenda cheia.</p></section><small>{e(report['note'])} · {VERSION}</small></main></body></html>'''


def install(ns: dict, root: Path | None = None):
    """Preserve the current gateway and authentication; add read-only routes."""
    original = ns['H']
    root = Path(root or ns['ROOT'])
    class PilotHandler(original):
        server_version = 'MEIGrowthGateway/1.2+sales1.3'

        def _pilot_send(self, status: int, payload: bytes, content_type: str):
            self.send_response(status)
            self._security()
            self.send_header('Content-Type', content_type)
            self.send_header('Content-Length', str(len(payload)))
            self.send_header('Cache-Control', 'no-store')
            self.send_header('Referrer-Policy', 'no-referrer')
            self.send_header('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'; connect-src 'none'")
            self.end_headers()
            if self.command != 'HEAD':
                self.wfile.write(payload)

        def _pilot_json(self, status: int, value: dict):
            self._pilot_send(status, json.dumps(value, ensure_ascii=False).encode('utf-8'), 'application/json; charset=utf-8')

        def _dispatch(self):
            path = urlsplit(self.path).path
            preview = path in {'/comecar', '/comecar/', '/comecar/index.html'}
            staff = path in {'/lancamento', '/lancamento.json'}
            blocked_checkout = path == '/comecar/checkout'
            if not (preview or staff or blocked_checkout):
                return super()._dispatch()
            user = self._current_user()
            # Fail closed for the staging preview; staff routes stay protected in all modes.
            if (ns.get('STAGING', True) or staff) and not user:
                return self._pilot_send(401, b'<p>Entre no <a href="/login?next=%2Fcomecar%2F">MEI Growth</a> para abrir esta pr\xc3\xa9via.</p>', 'text/html; charset=utf-8')
            if staff and user.get('role') != 'owner':
                return self._pilot_json(403, {'error': 'owner_required'})
            if blocked_checkout:
                return self._pilot_json(503, {'commerce_enabled': False, 'error': 'pilot_not_on_sale'})
            if self.command not in ('GET', 'HEAD'):
                return self._pilot_json(405, {'error': 'read_only_preview'})
            if staff:
                report = launch_report(root)
                if path.endswith('.json'):
                    return self._pilot_json(200, report)
                return self._pilot_send(200, readme_html(report).encode('utf-8'), 'text/html; charset=utf-8')
            try:
                data = (root / 'sales_public' / 'index.html').read_bytes()
            except OSError:
                return self._pilot_json(503, {'error': 'preview_unavailable'})
            return self._pilot_send(200, data, 'text/html; charset=utf-8')

        do_GET = _dispatch
        do_HEAD = _dispatch
        do_POST = _dispatch
        do_OPTIONS = _dispatch

    ns['H'] = PilotHandler
    ns['main'].__globals__['H'] = PilotHandler
    return PilotHandler


def main():
    root = Path(__file__).resolve().parents[1]
    ns = runpy.run_path(str(root / 'railway' / 'gateway_base.py'))
    install(ns, root)
    ns['main']()


if __name__ == '__main__':
    main()
