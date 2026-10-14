---
target: carrossel Itapoá
total_score: 13
max_score: 20
na_heuristics: 3,5,7,9,10
p0_count: 0
p1_count: 2
target_identity: "file:/home/user/mkt/b3g-carrosseis/conteudo/carrosseis/itapoa-cidade-de-predios/instagram"
timestamp: 2026-10-14T14-34-36Z
slug: osseis-itapoa-cidade-de-predios-instagram-7e4f8bba
---
⚠️ DEGRADED: single-context (sub-agents not spawned: harness reserves sub-agents for explicit user request)

Target: Itapoá carousel, 5 Instagram slides (1080x1350). Mode: Persuade.

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 3 | No in-design position cue; Instagram dots cover it |
| 2 | Match system / real world | 3 | "1º tri", "Estim. 2026" abbreviations |
| 3 | User control | n/a | static carousel |
| 4 | Consistency | 2 | Hero numbers at 190/170/164-180px; logo + "B3G EMPREENDIMENTOS" text both on slides 1 and 5 |
| 5 | Error prevention | n/a | static |
| 6 | Recognition | 3 | source and topic labels present on every slide |
| 7 | Flexibility | n/a | static |
| 8 | Aesthetic/minimalist | 2 | 6-line paragraphs at 40px on every content slide |
| 9 | Error recovery | n/a | static |
| 10 | Help/docs | n/a | static |
| Total | | 13/20 (65%) | Acceptable |

Priority issues
- [P1] Text density: 5-6 line paragraphs on slides 2-5; reference style uses 2-3 line statements. Fix: one statement per slide, rest to caption. (/impeccable distill)
- [P1] Small low-contrast labels: top labels 20px, footer 18px at 55% opacity; detector: 3.8:1 on white (slide 3), 3.6:1 on gold (slide 4). Fix: 24-26px, opacity >= 75%. (/impeccable typeset)
- [P2] Inconsistent hero-number scale and unit placement. Fix: one size (170px), unit always below. (/impeccable layout)
- [P2] Cover carries 5 text layers; footer duplicates logo. Fix: drop footer on cover and slide 5. (/impeccable distill)
- [P3] CTA lacks the @handle. (/impeccable clarify)

Detector: 9 warnings: 5x overused-font (Arial; false positive, mandated by brandbook), 4x low-contrast (slides 3 and 4, valid). Photo slides not measurable by detector.
