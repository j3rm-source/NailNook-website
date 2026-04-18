#!/usr/bin/env python3
"""
Generate a premium mockup website for a prospect in the buildinamsterdam.com style.
Reads prospect JSON from stdin, outputs a self-contained HTML file.

Key design elements from buildinamsterdam.com:
- 50/50 split-screen hero: image collage left, large text right
- Off-white (#F2EFE6) background throughout — NO dark hero
- Very large condensed uppercase headings (80-100px)
- Serif italic subtitles (Cormorant Garamond)
- Simple bordered buttons
- Terracotta gold circle accent
- Editorial grid layouts below the fold
"""

import os
import sys
import json
import re
import urllib.request
import urllib.parse
from html import escape
from dotenv import load_dotenv

load_dotenv()

UNSPLASH_KEY = os.getenv("UNSPLASH_ACCESS_KEY", "")


def slugify(text):
    return re.sub(r'[^a-z0-9]+', '_', text.lower()).strip('_')


def fetch_unsplash_images(query, count=3):
    if not UNSPLASH_KEY:
        return []
    try:
        params = urllib.parse.urlencode({
            'query': query,
            'per_page': count,
            'orientation': 'landscape',
            'content_filter': 'high',
        })
        url = f"https://api.unsplash.com/search/photos?{params}"
        req = urllib.request.Request(url, headers={
            'Authorization': f'Client-ID {UNSPLASH_KEY}',
            'Accept-Version': 'v1',
        })
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
            return [
                {
                    'url': r['urls']['regular'],
                    'alt': r.get('alt_description', query),
                    'credit': r['user']['name'],
                }
                for r in data.get('results', [])[:count]
            ]
    except Exception as e:
        print(f"Warning: Unsplash fetch failed ({query}): {e}", file=sys.stderr)
        return []


def fetch_varied_images(industry, keywords_str, city='', services=None):
    """Fetch images using multiple targeted queries so each section looks distinct."""
    kw_list = [k.strip() for k in keywords_str.split(',') if k.strip()] if keywords_str else []
    services = services or []

    queries = []
    queries.append(f"{industry} office interior modern")
    queries.append(f"{industry} professional at work")
    queries.append(f"{industry} team patients")
    queries.append(f"{industry} friendly welcoming")
    queries.append(f"{kw_list[0] if kw_list else industry} close up detail")
    for svc in services[:4]:
        queries.append(f"{svc} {industry}")
    if city:
        queries.append(f"{city} cityscape")
    else:
        queries.append(f"{industry} modern building exterior")
    while len(queries) < 10:
        queries.append(f"{industry} professional")

    images = []
    seen_urls = set()
    for q in queries:
        results = fetch_unsplash_images(q, count=2)
        for r in results:
            if r['url'] not in seen_urls:
                seen_urls.add(r['url'])
                images.append(r)
                break
        if len(images) >= 10:
            break

    return images


def get_fallback_images(industry, keywords_str, city=''):
    """Generate varied picsum placeholder URLs with different dimensions per section."""
    import hashlib
    kw_list = [k.strip() for k in keywords_str.split(',') if k.strip()] if keywords_str else ['business']

    seed_sources = [
        f"{industry}-hero-main",
        f"{industry}-hero-secondary",
        f"{kw_list[0]}-hero-tertiary",
        f"{industry}-about-primary",
        f"{kw_list[1] if len(kw_list) > 1 else industry}-about-inset",
    ]
    for i, kw in enumerate(kw_list[:4]):
        seed_sources.append(f"{kw}-service-{i}")
    seed_sources.append(f"{city or industry}-wide-break")
    seed_sources.append(f"{industry}-extra-1")
    seed_sources.append(f"{industry}-extra-2")

    dims = [
        (1400, 800),
        (800, 1000),
        (800, 600),
        (900, 1200),
        (1000, 750),
        (800, 600),
        (800, 600),
        (800, 600),
        (1600, 700),
        (800, 600),
        (800, 600),
    ]

    images = []
    for i, seed_src in enumerate(seed_sources):
        seed = hashlib.md5(seed_src.encode()).hexdigest()[:10]
        w, h = dims[i] if i < len(dims) else (800, 600)
        images.append({
            'url': f'https://picsum.photos/seed/{seed}/{w}/{h}',
            'alt': seed_src.split('-')[0].title(),
            'credit': 'Lorem Picsum',
        })

    return images


def parse_services(keywords_str):
    if not keywords_str:
        return []
    raw = [s.strip().title() for s in keywords_str.split(',') if s.strip()]
    seen = set()
    services = []
    for s in raw:
        if s.lower() not in seen:
            seen.add(s.lower())
            services.append(s)
    return services[:8]


def build_tagline(description, company_name):
    if not description:
        return f"Delivering exceptional experiences that inspire confidence and trust."
    sentences = re.split(r'[.!]', description)
    first = sentences[0].strip()
    if len(first) > 140:
        first = first[:137] + '...'
    return first


def generate_html(prospect):
    company = prospect.get('company_name', 'Business Name')
    description = prospect.get('description', '')
    keywords = prospect.get('keywords', '')
    phone = prospect.get('phone', '')
    email = prospect.get('email', '')
    address = prospect.get('address', '')
    city = prospect.get('city', '')
    state = prospect.get('state', '')
    country = prospect.get('country', '')
    industry = prospect.get('industry', '')
    first_name = prospect.get('first_name', '')
    last_name = prospect.get('last_name', '')
    title_role = prospect.get('title', '')

    tagline = build_tagline(description, company)
    services = parse_services(keywords)
    owner = f"{first_name} {last_name}".strip()
    location_parts = [p for p in [city, state, country] if p]
    location = ', '.join(location_parts)

    images = fetch_varied_images(industry, keywords, city, services)
    if len(images) < 8:
        images = get_fallback_images(industry, keywords, city)

    # Split company name into lines for dramatic display
    words = company.upper().split()
    hero_lines = []
    current_line = []
    for word in words:
        current_line.append(word)
        if len(' '.join(current_line)) > 12 or len(current_line) >= 2:
            hero_lines.append(' '.join(current_line))
            current_line = []
    if current_line:
        hero_lines.append(' '.join(current_line))
    hero_heading = '<br>'.join(escape(line) for line in hero_lines)

    services_cards = ''
    if services:
        for i, svc in enumerate(services):
            img_idx = min(i + 3, len(images) - 1)
            services_cards += f'''
                <div class="case-card">
                    <div class="case-image">
                        <img src="{images[img_idx]['url']}" alt="{escape(svc)}">
                    </div>
                    <div class="case-meta">
                        <span class="case-label">{escape(svc)}</span>
                    </div>
                </div>'''

    contact_lines = []
    if address:
        contact_lines.append(('Address', address))
    elif location:
        contact_lines.append(('Location', location))
    if phone:
        contact_lines.append(('Phone', phone))
    if email:
        contact_lines.append(('Email', email))

    contact_html = ''
    for label, value in contact_lines:
        if '@' in value:
            contact_html += f'<div class="contact-row"><span class="contact-label">{escape(label)}</span><a href="mailto:{escape(value)}">{escape(value)}</a></div>'
        elif label == 'Phone':
            contact_html += f'<div class="contact-row"><span class="contact-label">{escape(label)}</span><a href="tel:{escape(value)}">{escape(value)}</a></div>'
        else:
            contact_html += f'<div class="contact-row"><span class="contact-label">{escape(label)}</span><span>{escape(value)}</span></div>'

    owner_credit = ''
    if owner:
        role_str = f'<span class="owner-role">{escape(title_role)}</span>' if title_role else ''
        owner_credit = f'<div class="owner-block"><span class="owner-name">{escape(owner)}</span>{role_str}</div>'

    label_text = escape(industry.upper()) if industry else escape(location.upper()) if location else 'EST.'

    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{escape(company)}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&display=swap" rel="stylesheet">
    <style>
        *, *::before, *::after {{ margin: 0; padding: 0; box-sizing: border-box; }}

        :root {{
            --bg: #F2EFE6;
            --black: #000000;
            --white: #FFFFFF;
            --accent: #C38133;
            --dark: #231F20;
            --grey: #999999;
            --light-border: #DDD9CE;
            --sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
            --serif: 'Cormorant Garamond', 'Georgia', serif;
        }}

        html {{ scroll-behavior: smooth; }}
        body {{ font-family: var(--sans); background: var(--bg); color: var(--black); -webkit-font-smoothing: antialiased; overflow-x: hidden; }}

        /* TOPBAR */
        .topbar {{ position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; justify-content: space-between; align-items: center; padding: 28px 48px; }}
        .topbar-logo {{ font-family: var(--sans); font-weight: 900; font-size: 18px; letter-spacing: 0.06em; color: var(--black); text-decoration: none; }}
        .topbar-label {{ font-family: var(--sans); font-size: 9px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: var(--black); }}

        /* HERO */
        .hero {{ display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; position: relative; }}
        .hero-left {{ position: relative; overflow: hidden; background: var(--dark); }}
        .collage {{ position: absolute; inset: 0; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1.2fr 1fr; gap: 3px; }}
        .collage-img {{ position: relative; overflow: hidden; }}
        .collage-img img {{ width: 100%; height: 100%; object-fit: cover; transition: transform 0.8s cubic-bezier(0.45, 0.02, 0.09, 0.98); }}
        .collage-img:hover img {{ transform: scale(1.05); }}
        .collage-img.main {{ grid-column: 1 / -1; grid-row: 1 / 2; }}
        .hero-right {{ display: flex; flex-direction: column; justify-content: center; padding: 80px 64px; position: relative; }}
        .hero-heading {{ font-family: var(--sans); font-weight: 900; font-size: clamp(56px, 7vw, 110px); line-height: 0.88; letter-spacing: -0.04em; text-transform: uppercase; color: var(--black); margin-bottom: 40px; }}
        .hero-subtitle {{ font-family: var(--serif); font-size: clamp(18px, 1.8vw, 24px); font-weight: 400; font-style: italic; line-height: 1.5; color: var(--black); max-width: 400px; margin-bottom: 52px; }}
        .hero-buttons {{ display: flex; gap: 8px; }}
        .accent-circle {{ position: absolute; bottom: 72px; left: -28px; width: 56px; height: 56px; background: var(--accent); border-radius: 50%; z-index: 10; }}

        /* BUTTONS */
        .btn {{ font-family: var(--sans); font-size: 10px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; padding: 14px 28px; border: 1.5px solid var(--black); background: transparent; color: var(--black); cursor: pointer; text-decoration: none; transition: all 0.35s cubic-bezier(0.45, 0.02, 0.09, 0.98); display: inline-block; }}
        .btn:hover {{ background: var(--black); color: var(--bg); transform: scale(1.03); }}

        /* SHARED */
        .label {{ font-family: var(--sans); font-size: 9px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: var(--grey); margin-bottom: 20px; display: block; }}
        .section-heading {{ font-family: var(--sans); font-weight: 800; font-size: clamp(32px, 4vw, 56px); line-height: 1.0; letter-spacing: -0.03em; text-transform: uppercase; color: var(--black); margin-bottom: 40px; }}
        .body-text {{ font-family: var(--serif); font-size: 18px; font-weight: 400; line-height: 1.7; color: var(--dark); margin-bottom: 24px; }}

        /* ABOUT */
        .about {{ padding: 140px 48px; max-width: 1400px; margin: 0 auto; }}
        .about-layout {{ display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start; }}
        .about-left {{ position: relative; }}
        .about-left .img-main {{ width: 100%; aspect-ratio: 3/4; object-fit: cover; }}
        .about-left .img-inset {{ position: absolute; bottom: -40px; right: -40px; width: 55%; aspect-ratio: 4/3; object-fit: cover; border: 8px solid var(--bg); }}
        .about-right {{ padding-top: 40px; }}
        .owner-block {{ margin-top: 40px; padding-top: 24px; border-top: 1px solid var(--light-border); }}
        .owner-name {{ font-family: var(--sans); font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--black); display: block; margin-bottom: 4px; }}
        .owner-role {{ font-family: var(--sans); font-size: 10px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--grey); display: block; }}

        /* SERVICES */
        .cases {{ padding: 100px 48px 140px; }}
        .cases-header {{ max-width: 1400px; margin: 0 auto 64px; }}
        .cases-scroll {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; max-width: 1400px; margin: 0 auto; }}
        .case-card {{ position: relative; overflow: hidden; cursor: pointer; }}
        .case-image {{ overflow: hidden; }}
        .case-image img {{ width: 100%; aspect-ratio: 4/3; object-fit: cover; transition: transform 0.7s cubic-bezier(0.45, 0.02, 0.09, 0.98); }}
        .case-card:hover .case-image img {{ transform: scale(1.06); }}
        .case-meta {{ padding: 20px 0; }}
        .case-label {{ font-family: var(--sans); font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--dark); }}

        /* WIDE BREAK */
        .wide-image {{ width: 100%; height: 60vh; min-height: 400px; overflow: hidden; }}
        .wide-image img {{ width: 100%; height: 100%; object-fit: cover; }}

        /* CONTACT */
        .contact {{ padding: 140px 48px; max-width: 1400px; margin: 0 auto; }}
        .contact-layout {{ display: grid; grid-template-columns: 1fr 1fr; gap: 80px; }}
        .contact-left .invite-text {{ font-family: var(--serif); font-size: clamp(28px, 3vw, 42px); font-weight: 300; font-style: italic; line-height: 1.35; color: var(--black); margin-bottom: 48px; }}
        .contact-right {{ padding-top: 20px; }}
        .contact-row {{ padding: 20px 0; border-bottom: 1px solid var(--light-border); display: flex; justify-content: space-between; align-items: baseline; }}
        .contact-row:first-child {{ border-top: 1px solid var(--light-border); }}
        .contact-label {{ font-family: var(--sans); font-size: 9px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--grey); }}
        .contact-row span, .contact-row a {{ font-family: var(--sans); font-size: 14px; font-weight: 400; color: var(--dark); text-decoration: none; }}
        .contact-row a:hover {{ color: var(--accent); }}

        /* FOOTER */
        footer {{ padding: 40px 48px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--light-border); max-width: 1400px; margin: 0 auto; }}
        .footer-logo {{ font-family: var(--sans); font-weight: 900; font-size: 14px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dark); }}
        .footer-text {{ font-family: var(--sans); font-size: 10px; font-weight: 400; letter-spacing: 0.08em; color: var(--grey); }}

        /* RESPONSIVE */
        @media (max-width: 900px) {{
            .hero {{ grid-template-columns: 1fr; min-height: auto; }}
            .hero-left {{ min-height: 50vh; }}
            .hero-right {{ padding: 60px 32px; }}
            .hero-heading {{ font-size: 48px; }}
            .about-layout, .contact-layout {{ grid-template-columns: 1fr; gap: 40px; }}
            .about-left .img-inset {{ position: relative; bottom: auto; right: auto; width: 100%; border: none; margin-top: 16px; }}
            .topbar {{ padding: 16px 24px; }}
            .about, .cases, .contact {{ padding: 80px 24px; }}
            footer {{ padding: 32px 24px; }}
        }}
        @media (max-width: 600px) {{
            .cases-scroll {{ grid-template-columns: 1fr; }}
            .hero-buttons {{ flex-direction: column; gap: 8px; }}
        }}
    </style>
</head>
<body>

    <div class="topbar">
        <a href="#" class="topbar-logo">{escape(company[:20] if len(company) > 20 else company)}</a>
        <span class="topbar-label">{label_text}</span>
    </div>

    <section class="hero">
        <div class="hero-left">
            <div class="collage">
                <div class="collage-img main">
                    <img src="{images[0]['url']}" alt="{escape(images[0]['alt'])}">
                </div>
                <div class="collage-img">
                    <img src="{images[1]['url']}" alt="{escape(images[1]['alt'])}">
                </div>
                <div class="collage-img">
                    <img src="{images[2]['url']}" alt="{escape(images[2]['alt'])}">
                </div>
            </div>
        </div>
        <div class="hero-right">
            <span class="label" style="align-self:flex-end; margin-bottom:48px;">{label_text}</span>
            <h1 class="hero-heading">{hero_heading}</h1>
            <p class="hero-subtitle">{escape(tagline)}</p>
            <div class="hero-buttons">
                <a href="#cases" class="btn">Our Services</a>
                <a href="#contact" class="btn">Contact Us</a>
            </div>
            <div class="accent-circle"></div>
        </div>
    </section>

    <section class="about" id="about">
        <div class="about-layout">
            <div class="about-left">
                <img src="{images[3]['url']}" alt="{escape(images[3]['alt'])}" class="img-main">
                <img src="{images[4]['url']}" alt="{escape(images[4]['alt'])}" class="img-inset">
            </div>
            <div class="about-right">
                <span class="label">About</span>
                <h2 class="section-heading">WHO WE ARE</h2>
                <p class="body-text">{escape(description) if description else escape(f'{company} is dedicated to providing exceptional experiences and service to our community.')}</p>
                {owner_credit}
            </div>
        </div>
    </section>

    <section class="cases" id="cases">
        <div class="cases-header">
            <span class="label">Services</span>
            <h2 class="section-heading">WHAT WE DO</h2>
        </div>
        <div class="cases-scroll">
            {services_cards}
        </div>
    </section>

    <div class="wide-image">
        <img src="{images[5]['url']}" alt="{escape(images[5]['alt'])}">
    </div>

    <section class="contact" id="contact">
        <div class="contact-layout">
            <div class="contact-left">
                <span class="label">Contact</span>
                <p class="invite-text">We&rsquo;d love to hear from you. Reach out to start a conversation.</p>
                <a href="mailto:{escape(email)}" class="btn">Get In Touch</a>
            </div>
            <div class="contact-right">
                {contact_html}
            </div>
        </div>
    </section>

    <footer>
        <span class="footer-logo">{escape(company)}</span>
        <span class="footer-text">&copy; 2026 {escape(company)}. All rights reserved.</span>
    </footer>

</body>
</html>'''

    return html


def main():
    try:
        prospect = json.loads(sys.stdin.read())
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON input: {e}", file=sys.stderr)
        sys.exit(1)

    company = prospect.get('company_name', 'business')
    html = generate_html(prospect)

    os.makedirs('.tmp', exist_ok=True)
    output_path = f'.tmp/website_{slugify(company)}.html'
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html)

    print(f"Website generated: {output_path}")


if __name__ == "__main__":
    main()
