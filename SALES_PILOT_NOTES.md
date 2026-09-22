# MEI Growth — sales pilot 1.4

Scope: a small, read-only sales preview for three KitVende pilot products. No payment provider, email, credential, invitation, financial or production-mode changes.

- `/comecar/`: protected by existing staging login; three intentionally free samples per pilot with browser-only personalization.
- `/lancamento` and `/lancamento.json`: owner-only launch checklist. Configuration presence is not a payment/delivery test.
- `/comecar/checkout`: always blocked. No payment redirect implemented in this preview.
- Existing gateway code and routes are inherited unchanged. This is not an audit or security certification of that gateway.
- Public pilots: Manicure, Confeiteira and Ar-condicionado; proposed R$59.90 one-time per kit. Nine additional kits are prepared offline and remain private pending validation of the first three.
- Complete paid product is NOT in this repository or runtime. Deliver through the configured checkout provider only after buyer access is tested. Do not place private ZIPs on public GitHub/CDN.
- Kiwify native members-area delivery is the proposed first-sale path, not an integration completed in this change.

## Local validation

18 isolated Python HTTP routing/archive tests passed. Authentication in these route tests is represented by a fixture; this is not a full auth integration test.
18 Chromium in-memory DOM checks passed: desktop/mobile personalization, placeholder warnings, no interpreted HTML injection, disabled buy control, no layout overflow; buyer category selection and reset. Environment policy blocked browser navigation, so tests used `set_content`; a physical Safari/iPhone/iPad test and actual file download were not performed.

## Still required

Supplier identity, support, commercial policies; Kiwify product and checkout; private package uploaded to members area; real provider purchase/access/refund validation; security review before public launch. Payments remain disabled.

Source for provider delivery options: https://ajuda.kiwify.com.br/pt-br/article/como-cadastrar-o-seu-produto-1lxh5g7/
