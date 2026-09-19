# TROLL NFT 2.0 — V48 Global Accessibility

V48 starts the international and accessibility layer without changing protocol semantics.

## Languages
Initial product vocabulary:
- English
- Brazilian Portuguese
- Spanish

English remains the fallback when a translation is unavailable.

## Translation rule
Evidence labels keep exactly the same machine meaning in every language. Translation changes presentation, never the evidence class.

For example:
- `LIVE_ONCHAIN_BALANCE`
- `REGULATED_ENTITLEMENT`
- `HISTORICAL_PROOF`
- `REFERENCE_ONLY`

remain canonical IDs regardless of language.

## Accessibility
Interfaces should provide:
- page language;
- semantic headings;
- descriptive button labels;
- alt text for meaningful images;
- live-region status messages;
- keyboard/touch accessibility;
- readable contrast;
- reduced-motion behavior;
- no autoplay dependence;
- financial-like state communicated by text, not color alone.

## Numbers and dates
Numbers/dates are localized for display while raw blockchain values remain unchanged.

## Claims
Translations must preserve V42 Claims Integrity. A translated sentence cannot strengthen a claim beyond its evidence.

## Mobile
The same vocabulary is intended for the phone/iPad command center and Passport.

V48 adds no Solidity, wallet connection, signing or transactions.
