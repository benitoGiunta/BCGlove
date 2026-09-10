#!/usr/bin/env python3
"""
Génère les trois maquettes .dc.html de la refonte de l'écran d'accueil.

Toutes les valeurs viennent de src/styles/tokens.css et des *.module.css du
projet — aucune n'est arrondie ni réinventée. Les maquettes ne pouvant pas
importer le CSS de l'app, elles le recopient en styles en ligne.

Cible : 393 × 852, l'iPhone 15 Pro — le plus petit des deux appareils réels
(le 16 Pro offre 402 × 874). Ce qui tient ici tient sur les deux.

    python3 build.py
"""

W, H = 393, 852
SAFE_TOP = 59          # barre d'état iOS sur 15 Pro — laissée VIDE, jamais dessinée
SAFE_BOTTOM = 34

SERIF = "'Cormorant Garamond', Georgia, serif"
SANS = 'Nunito, system-ui, sans-serif'

HEAD = '''<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;1,400&family=Nunito:wght@600;700&display=swap" rel="stylesheet">
  <style>
    html, body { margin: 0; padding: 0; }
    *, *::before, *::after { box-sizing: border-box; }
    body { background: #faf3ef; -webkit-font-smoothing: antialiased; }
    a { color: #9c5560; } a:hover { color: #7e434d; }
  </style>
</helmet>
'''

TAIL = '''</x-dc>
<script data-dc-script data-props='{"$preview":{"width":393,"height":852}}'>
class Component extends DCLogic {}
</script>
</body>
</html>
'''

WASHES = f'''  <div aria-hidden="true" style="position: absolute; inset: 0; overflow: hidden; pointer-events: none">
    <div style="position: absolute; top: -90px; left: -70px; width: 300px; height: 280px; border-radius: 50% 46% 54% 50%; background: #d9a7a6; opacity: 0.07; filter: blur(28px)"></div>
    <div style="position: absolute; top: 300px; right: -110px; width: 280px; height: 300px; border-radius: 52% 48% 44% 56%; background: #9c5560; opacity: 0.055; filter: blur(32px)"></div>
    <div style="position: absolute; bottom: -110px; left: -40px; width: 340px; height: 260px; border-radius: 48% 52% 56% 44%; background: #c98f86; opacity: 0.06; filter: blur(34px)"></div>
  </div>
'''


def screen(pad_top, body, middle_grows=True):
    grow = 'flex: 1; justify-content: center;' if middle_grows else ''
    return (
        f'<div style="position: relative; width: {W}px; height: {H}px; overflow: hidden; '
        f'background: #faf3ef; color: #4a3439; font-family: {SANS}; display: flex; '
        f'flex-direction: column; padding: {pad_top}px 26px {SAFE_BOTTOM + 14}px">\n'
        + WASHES
        + '  <div style="position: relative; width: 100%; flex: 1; display: flex; flex-direction: column; min-height: 0">\n'
        + body
        + '  </div>\n</div>\n'
    )


def emblem(size):
    return (f'<img src="nous.png" alt="" aria-hidden="true" '
            f'style="display: block; width: {size}px; height: auto">')


def title(text):
    return (f'<div style="font-family: {SERIF}; font-weight: 400; font-size: 17px; '
            f'letter-spacing: 0.16em; text-transform: uppercase; color: #74545a; '
            f'white-space: nowrap">{text}</div>')


def monogram(pad='0'):
    return (f'<div style="font-family: {SERIF}; font-size: 14px; letter-spacing: 0.34em; '
            f'color: #a8848a; padding: {pad}; white-space: nowrap">BCG&nbsp;&#9825;</div>')


def counter_card(digit=52, lead=23, clock=21, pad_y=30, pad_b=26, lead_gap=22, clock_gap=24):
    def unit(value, label):
        return (
            '<div style="display: flex; flex-direction: column; align-items: center; min-width: 74px">'
            f'<div style="font-size: {digit}px; font-weight: 600; line-height: 1; letter-spacing: -0.02em; '
            f'color: #4a3439; font-variant-numeric: tabular-nums">{value}</div>'
            '<div style="margin-top: 9px; font-size: 10px; font-weight: 700; letter-spacing: 0.17em; '
            f'text-transform: uppercase; color: #74545a">{label}</div>'
            '</div>')
    sep = '<span style="padding-bottom: 16px; font-size: 34px; line-height: 1; color: #d3afb1">·</span>'

    def cg(value, u):
        return ('<span style="display: inline-flex; align-items: baseline">'
                f'<span style="font-size: {clock}px; font-weight: 600; color: #6b4a50; '
                f'letter-spacing: 0.01em; font-variant-numeric: tabular-nums">{value}</span>'
                f'<span style="margin-left: 3px; font-size: 11px; font-weight: 700; '
                f'letter-spacing: 0.12em; color: #74545a">{u}</span></span>')
    dot = '<span style="font-size: 15px; color: #d3afb1">·</span>'
    return (
        f'    <div style="background: #fdf8f5; border: 1px solid rgba(156, 85, 96, 0.09); '
        f'border-radius: 30px; padding: {pad_y}px 20px {pad_b}px; '
        f'box-shadow: 0 26px 44px -22px rgba(74, 52, 57, 0.22), 0 3px 10px -6px rgba(74, 52, 57, 0.1)">\n'
        f'      <p style="margin: 0 0 {lead_gap}px; font-family: {SERIF}; font-style: italic; '
        f'font-size: {lead}px; line-height: 1.2; text-align: center; color: #6b4a50">Je t\'aime depuis</p>\n'
        f'      <div style="display: flex; align-items: flex-end; justify-content: center; gap: 6px">'
        f'{unit("1", "an")}{sep}{unit("1", "mois")}{sep}{unit("29", "jours")}</div>\n'
        f'      <div style="display: flex; align-items: baseline; justify-content: center; gap: 10px; '
        f'margin-top: {clock_gap}px; padding-top: 18px; border-top: 1px solid rgba(156, 85, 96, 0.1)">'
        f'{cg("05", "h")}{dot}{cg("37", "min")}{dot}{cg("29", "s")}</div>\n'
        '    </div>\n')


HEART = ('<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" '
         'focusable="false"><path d="M12 20.4c-.3 0-.6-.1-.8-.3C7 16.4 3.2 13 3.2 9.2 '
         '3.2 6.4 5.4 4.2 8.1 4.2c1.5 0 2.9.7 3.9 1.9 1-1.2 2.4-1.9 3.9-1.9 2.7 0 4.9 2.2 '
         '4.9 5 0 3.8-3.8 7.2-8 10.9-.2.2-.5.3-.8.3z"/></svg>')


def ask_button(full_width=True):
    # `white-space: nowrap` par précaution : le libellé fait 187 px en Nunito
    # pour 273 px disponibles, mais la police de repli est plus large et le
    # faisait passer à deux lignes le temps que Nunito se charge.
    style = ('min-height: 56px; border: 0; border-radius: 28px; background: #9c5560; '
             f'color: #fdf6f2; font-family: {SANS}; font-size: 18px; font-weight: 600; '
             'letter-spacing: 0.01em; box-shadow: 0 14px 26px -14px rgba(156, 85, 96, 0.62); '
             'display: flex; align-items: center; justify-content: center; white-space: nowrap')
    style += '; width: 100%' if full_width else '; flex: 1; padding: 0 14px'
    return f'<div style="{style}">Est-ce que tu m\'aimes&nbsp;?</div>'


def heart_button():
    return ('<div style="flex: none; width: 56px; height: 56px; border-radius: 50%; '
            'background: #fdf8f5; border: 1px solid rgba(156, 85, 96, 0.28); color: #9c5560; '
            'display: flex; align-items: center; justify-content: center; '
            f'box-shadow: 0 10px 20px -12px rgba(74, 52, 57, 0.28)">{HEART}</div>')


def bubble(text, mine, size=19):
    """Bulle de message.

    Les DEUX POINTS de la maquette d'origine sont conservés et MIROITÉS : en bas
    à gauche pour un message reçu, en bas à droite pour un message envoyé. Je les
    avais retirés de l'allure `thread` de l'historique, où trente bulles à la
    suite en font du bruit — sur l'écran d'accueil, où il n'y en a que deux, ce
    sont eux qui font lire la direction avant même la couleur.

    Reçu : rose plein. Envoyé : blanc bordé. Les points prennent la couleur de
    leur bulle."""
    if mine:
        fill = '#fdf8f5'
        skin = f'background: {fill}; border: 1px solid rgba(156, 85, 96, 0.16)'
        align = 'flex-end'
        # Miroir des positions d'origine (left 4 / left -3).
        t_big = 'right: 4px; bottom: 2px'
        t_small = 'right: -3px; bottom: -4px'
    else:
        fill = '#f2d8d5'
        skin = f'background: {fill}'
        align = 'flex-start'
        t_big = 'left: 4px; bottom: 2px'
        t_small = 'left: -3px; bottom: -4px'

    def tail(size_px, pos):
        return (f'<span aria-hidden="true" style="position: absolute; {pos}; '
                f'width: {size_px}px; height: {size_px}px; border-radius: 50%; '
                f'background: {fill}"></span>')

    return (f'      <div style="display: flex; justify-content: {align}">\n'
            '        <div style="position: relative; max-width: 86%; padding-bottom: 13px">\n'
            f'          <div style="{skin}; border-radius: 22px; padding: 12px 16px; '
            f'font-family: {SERIF}; font-size: {size}px; line-height: 1.35; color: #4a3439; '
            f'text-wrap: pretty">{text}</div>\n'
            f'          {tail(9, t_big)}{tail(5, t_small)}\n'
            '        </div>\n      </div>\n')


def stamp(text, align='flex-start'):
    return (f'      <div style="display: flex; justify-content: {align}; padding: 0 6px">'
            f'<span style="font-size: 11.5px; font-weight: 600; letter-spacing: 0.05em; '
            f'color: #7a555c">{text}</span></div>\n')


def proof_counter(compact=False):
    """Le compteur du backlog V2-3 : UN nombre, la somme des réponses reçues et
    des cœurs reçus. Même registre typographique que la ligne h · min · s de la
    carte, pour qu'il se lise comme une mesure et non comme un score."""
    mt = 12 if compact else 16
    return (f'    <div style="margin-top: {mt}px; display: flex; align-items: baseline; '
            'justify-content: center; gap: 7px">'
            '<span style="font-size: 21px; font-weight: 600; color: #6b4a50; '
            'letter-spacing: 0.01em; font-variant-numeric: tabular-nums">47</span>'
            '<span style="font-size: 10px; font-weight: 700; letter-spacing: 0.17em; '
            'text-transform: uppercase; color: #74545a">fois qu\'on me l\'a dit</span>'
            '</div>\n')


def signature(name):
    return (f'    <div style="margin-top: 10px; text-align: center; font-family: {SERIF}; '
            f'font-style: italic; font-size: 15px; color: #7a555c">— {name}</div>\n')


def links(with_monogram=False):
    def link(t):
        return ('<span style="min-height: 44px; display: inline-flex; align-items: center; '
                'padding: 0 12px; font-size: 11.5px; font-weight: 600; letter-spacing: 0.05em; '
                f'color: #7a555c">{t}</span>')
    dot = '<span style="font-size: 13px; color: #d3afb1">·</span>'
    inner = link('Écrire un mot') + dot + link('Voir tout')
    if with_monogram:
        inner = monogram('0 10px') + dot + inner
    return ('    <div style="display: flex; align-items: center; justify-content: center; '
            f'margin-top: 2px">{inner}</div>\n')


def messages_block(proof_here=False):
    """Les deux derniers messages. `margin-top: auto` fait de l'espace qui les
    sépare des boutons le PLUS GRAND de l'écran, par construction — plus grand
    que celui entre les boutons et le compteur, comme demandé."""
    return (
        '      <div style="margin-top: auto; display: flex; flex-direction: column; gap: 6px">\n'
        + bubble("J'ai besoin de toi fort", mine=False, size=20)
        + bubble('Toujours. Même quand je réponds tard.', mine=True)
        + stamp("à l'instant", align='flex-end')
        + '      </div>\n'
        + (proof_counter(compact=True) if proof_here else '')
    )


def buttons_row():
    return ('      <div style="display: flex; align-items: center; gap: 12px">\n'
            f'        {ask_button(full_width=False)}\n'
            f'        {heart_button()}\n'
            '      </div>\n')


# ---------------------------------------------------------------------------
# 1. Actuel — l'écran d'aujourd'hui, à l'identique
# ---------------------------------------------------------------------------
actuel = (
    '    <header style="text-align: center">\n'
    f'      <div style="display: flex; justify-content: center; margin-bottom: 10px">{emblem(44)}</div>\n'
    f'      {title("Pour Benito")}\n'
    f'      <div style="display: flex; justify-content: center; min-height: 44px; align-items: flex-start; padding-top: 9px">{monogram()}</div>\n'
    '    </header>\n'
    '    <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; padding-bottom: 34px">\n'
    + counter_card()
    + '    </div>\n'
    '    <div>\n'
    f'      {ask_button()}\n'
    '      <div style="min-height: 132px; margin-top: 16px; display: flex; flex-direction: column; align-items: center; gap: 9px">\n'
    '        <div style="position: relative; max-width: 92%; padding-bottom: 13px">\n'
    f'          <div style="background: #f2d8d5; border-radius: 22px; padding: 13px 17px; font-family: {SERIF}; font-size: 21px; line-height: 1.35; color: #4a3439; text-align: center">J\'ai besoin de toi fort</div>\n'
    '          <span aria-hidden="true" style="position: absolute; left: 4px; bottom: 2px; width: 9px; height: 9px; border-radius: 50%; background: #f2d8d5"></span>\n'
    '          <span aria-hidden="true" style="position: absolute; left: -3px; bottom: -4px; width: 5px; height: 5px; border-radius: 50%; background: #f2d8d5"></span>\n'
    '        </div>\n'
    '        <span style="font-size: 11.5px; font-weight: 600; letter-spacing: 0.05em; color: #7a555c">à l\'instant</span>\n'
    '      </div>\n'
    + signature('Charleen')
    + links()
    + '    </div>\n'
)

# ---------------------------------------------------------------------------
# 2. Main — la proposition, compteur sous la carte
# ---------------------------------------------------------------------------
proposition = (
    '    <header style="display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 44px">\n'
    f'      <div style="display: flex; align-items: center; gap: 10px">{emblem(38)}{monogram()}</div>\n'
    f'      {title("Pour Benito")}\n'
    '    </header>\n'
    '    <div style="margin-top: 26px">\n'
    + counter_card()
    + '    </div>\n'
    + proof_counter()
    + '    <div style="margin-top: 26px; display: flex; flex-direction: column; flex: 1; min-height: 0">\n'
    + buttons_row()
    + messages_block()
    + links()
    + '    </div>\n'
)

# ---------------------------------------------------------------------------
# 3. Symetrique — même chose, mais l'écran reste centré
# ---------------------------------------------------------------------------
symetrique = (
    '    <header style="display: flex; align-items: center; justify-content: center; gap: 12px; min-height: 44px">\n'
    f'      {emblem(38)}{title("Pour Benito")}\n'
    '    </header>\n'
    '    <div style="margin-top: 26px">\n'
    + counter_card()
    + '    </div>\n'
    + proof_counter()
    + '    <div style="margin-top: 26px; display: flex; flex-direction: column; flex: 1; min-height: 0">\n'
    + buttons_row()
    + messages_block()
    + links(with_monogram=True)
    + '    </div>\n'
)

# ---------------------------------------------------------------------------
# 4. CompteurBas — même en-tête que Main, mais le compteur descend là où le
#    prénom se trouvait. Deuxième emplacement possible pour V2-3.
# ---------------------------------------------------------------------------
compteur_bas = (
    '    <header style="display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 44px">\n'
    f'      <div style="display: flex; align-items: center; gap: 10px">{emblem(38)}{monogram()}</div>\n'
    f'      {title("Pour Benito")}\n'
    '    </header>\n'
    '    <div style="margin-top: 26px">\n'
    + counter_card()
    + '    </div>\n'
    + '    <div style="margin-top: 26px; display: flex; flex-direction: column; flex: 1; min-height: 0">\n'
    + buttons_row()
    + messages_block(proof_here=True)
    + links()
    + '    </div>\n'
)

for name, pad_top, body in [
    ('Actuel.dc.html', SAFE_TOP + 58, actuel),
    ('Main.dc.html', SAFE_TOP + 22, proposition),
    ('Symetrique.dc.html', SAFE_TOP + 22, symetrique),
    ('CompteurBas.dc.html', SAFE_TOP + 22, compteur_bas),
]:
    open(name, 'w', encoding='utf-8').write(HEAD + screen(pad_top, body) + TAIL)
    print(f'  {name}')
