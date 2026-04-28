#!/usr/bin/env python3
"""
Generate a professional web design + retainer client contract as an HTML file.
Usage: python3 skills/create-proposal/scripts/create_google_doc_contract.py

Output: .tmp/client_contract.html
  - Open in Chrome → Print → Save as PDF to send to client
  - Fill in all red [PLACEHOLDER] fields before sending
"""

import os


def generate_contract_content():
    """Return the contract section text. Fill in placeholders before sending to client."""
    return {
        "scope_website": (
            "Jeremy Nelson ('Service Provider') will design and develop a custom, responsive website "
            "for [SALON NAME] ('Client'). The website will be mobile-first, cross-browser compatible, "
            "and include up to [NUMBER OF PAGES] pages as agreed upon in writing prior to the start of work. "
            "The scope includes design mockups, front-end development, basic SEO setup, and integration of "
            "an online booking widget. Any features or pages beyond this agreed scope are subject to a separate "
            "written change order and additional fees."
        ),
        "scope_retainer": (
            "Beginning on the website launch date, Jeremy Nelson will provide ongoing monthly maintenance "
            "and support services to [SALON NAME] for a fixed monthly fee of $[RETAINER PRICE]. "
            "Retainer services include: minor content updates (text, images, pricing), performance and "
            "uptime monitoring, security updates, monthly backup, and up to [RETAINER HOURS] hours of "
            "support per month. Requests exceeding the included hours will be billed at $[HOURLY RATE]/hr "
            "with prior written approval from the Client."
        ),
        "deliverables_website": (
            "- Custom website design (up to [NUMBER OF PAGES] pages)\n"
            "- Mobile-responsive, cross-browser compatible build\n"
            "- Online booking widget integration\n"
            "- Basic on-page SEO setup (meta titles, descriptions, alt tags)\n"
            "- Contact form with email notifications\n"
            "- Google Analytics or equivalent tracking setup\n"
            "- 30-day post-launch bug-fix support (defects only, no new features)"
        ),
        "deliverables_retainer": (
            "- Up to [RETAINER HOURS] hours of content updates per month\n"
            "- Monthly website backup\n"
            "- Security patch and plugin/dependency updates\n"
            "- Uptime monitoring with email alerts\n"
            "- Monthly performance report (page speed, uptime summary)\n"
            "- Priority email support (response within 1 business day)"
        ),
        "payment_terms": (
            "Website Build: A non-refundable deposit of 50% ($[DEPOSIT AMOUNT]) is due before work begins. "
            "The remaining 50% ($[FINAL PAYMENT AMOUNT]) is due upon website launch and Client approval, "
            "before transfer of any login credentials or source files. "
            "Monthly Retainer: $[RETAINER PRICE] is due on the 1st of each month via invoice. "
            "Invoices unpaid after a 15-day grace period accrue a late fee of 1.5% per month on the outstanding balance. "
            "All payments are in USD. Accepted methods: bank transfer, credit card, or as otherwise agreed in writing."
        ),
        "timeline": (
            "The Service Provider will deliver the completed website within [TIMELINE WEEKS] weeks of "
            "receiving the signed agreement and deposit payment. This timeline assumes timely receipt of "
            "all Client-provided materials (logo, photos, copy, brand guidelines) within 5 business days "
            "of project kickoff. Delays caused by late Client feedback or material delivery will extend "
            "the timeline proportionally at no additional charge to the Client. The monthly retainer "
            "begins automatically on the website launch date."
        ),
        "revisions": (
            "The website build includes [NUMBER OF REVISIONS] rounds of revisions. A revision round is "
            "defined as a consolidated list of changes submitted by the Client in a single message after "
            "reviewing a delivered milestone. Additional revision rounds beyond the included amount are "
            "billed at $[HOURLY RATE] per hour, in 1-hour increments, invoiced before work begins. "
            "Revisions requested after the final website approval and launch are considered new work "
            "and are billed at the same hourly rate, or may be included in the monthly retainer "
            "subject to the hours limit."
        ),
        "intellectual_property": (
            "Upon receipt of full and final payment for the website build, all intellectual property "
            "rights in the completed website — including design files, code, and content created by "
            "the Service Provider specifically for this project — transfer to [SALON NAME]. "
            "The Service Provider retains the right to display the completed work in a professional "
            "portfolio and to use it for self-promotional purposes unless the Client requests otherwise "
            "in writing. Third-party assets (stock photography, fonts, plugins) are subject to their "
            "respective licenses, which the Client is responsible for maintaining independently."
        ),
        "confidentiality": (
            "Both parties agree to keep confidential any proprietary business information, trade secrets, "
            "pricing, client lists, or other non-public information received from the other party during "
            "the course of this agreement. Neither party will disclose such information to any third party "
            "without prior written consent, except as required by law. This obligation survives the "
            "termination of this agreement for a period of two (2) years."
        ),
        "termination": (
            "Either party may terminate the monthly retainer with 30 days' written notice delivered via email. "
            "The Client remains responsible for all retainer fees accrued up to the termination date. "
            "The website build deposit is non-refundable once work has commenced. If the Client terminates "
            "the build project mid-engagement, the Client owes payment for all work completed through the "
            "termination date, calculated at $[HOURLY RATE]/hr for hours logged, minus the deposit already paid. "
            "If this amount is less than the deposit, no refund is issued. The Service Provider may terminate "
            "this agreement immediately for non-payment outstanding more than 30 days."
        ),
        "liability": (
            "The Service Provider's total cumulative liability under this agreement shall not exceed the "
            "total fees paid by the Client in the three (3) months immediately preceding the claim. "
            "In no event shall either party be liable for indirect, incidental, special, consequential, "
            "or punitive damages, including lost profits or lost data, even if advised of the possibility "
            "of such damages. The Service Provider is not responsible for downtime, data loss, or security "
            "breaches caused by third-party hosting providers, plugins, or services outside the Service "
            "Provider's direct control."
        ),
        "governing_law": (
            "This agreement is governed by and construed in accordance with the laws of the State of [STATE], "
            "without regard to its conflict of law principles. Any dispute arising under this agreement that "
            "cannot be resolved informally within 30 days shall be submitted to binding arbitration in [STATE] "
            "under the rules of the American Arbitration Association before either party initiates litigation. "
            "The prevailing party in any dispute is entitled to recover reasonable attorney's fees and costs."
        ),
        "entire_agreement": (
            "This agreement constitutes the entire understanding between the parties with respect to its "
            "subject matter and supersedes all prior negotiations, representations, warranties, and "
            "understandings, whether oral or written. No modification, amendment, or waiver of any "
            "provision of this agreement is effective unless made in writing and signed by both parties. "
            "If any provision of this agreement is found to be unenforceable, the remaining provisions "
            "continue in full force and effect."
        ),
    }


def render_html(content):
    """Render the contract as a print-ready HTML file."""

    def section(number, title, body_text):
        paragraphs = []
        for para in body_text.strip().split("\n"):
            para = para.strip()
            if not para:
                continue
            if para.startswith("-"):
                paragraphs.append(f"<li>{para[1:].strip()}</li>")
            else:
                paragraphs.append(f"<p>{para}</p>")

        # Wrap consecutive <li> items in <ul>
        html = []
        in_list = False
        for tag in paragraphs:
            if tag.startswith("<li>"):
                if not in_list:
                    html.append("<ul>")
                    in_list = True
                html.append(tag)
            else:
                if in_list:
                    html.append("</ul>")
                    in_list = False
                html.append(tag)
        if in_list:
            html.append("</ul>")

        return f"""
        <div class="section">
            <h2>{number}. {title}</h2>
            {"".join(html)}
        </div>"""

    body = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Web Design &amp; Retainer Service Agreement</title>
<style>
  body {{
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 12pt;
    line-height: 1.7;
    color: #1a1a1a;
    max-width: 780px;
    margin: 60px auto;
    padding: 0 40px;
  }}
  h1 {{
    font-size: 16pt;
    text-align: center;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    margin-bottom: 8px;
  }}
  .subtitle {{
    text-align: center;
    font-size: 10pt;
    color: #555;
    margin-bottom: 40px;
  }}
  h2 {{
    font-size: 12pt;
    font-weight: bold;
    margin-top: 28px;
    margin-bottom: 6px;
    border-bottom: 1px solid #ccc;
    padding-bottom: 4px;
  }}
  p {{ margin: 6px 0; }}
  ul {{ margin: 6px 0 6px 24px; padding: 0; }}
  li {{ margin: 3px 0; }}
  .parties-table {{
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
    font-size: 11pt;
  }}
  .parties-table td {{
    padding: 6px 12px;
    vertical-align: top;
    border: 1px solid #ddd;
  }}
  .parties-table td:first-child {{ font-weight: bold; width: 140px; background: #f7f7f7; }}
  .placeholder {{ color: #c0392b; font-weight: bold; }}
  .signature-block {{
    margin-top: 48px;
    display: flex;
    gap: 60px;
  }}
  .sig-col {{ flex: 1; }}
  .sig-line {{
    border-top: 1px solid #333;
    margin-top: 48px;
    margin-bottom: 4px;
  }}
  .sig-label {{ font-size: 10pt; color: #555; }}
  @media print {{
    body {{ margin: 0; padding: 20px; }}
    .section {{ page-break-inside: avoid; }}
  }}
</style>
</head>
<body>

<h1>Web Design &amp; Retainer Service Agreement</h1>
<div class="subtitle">Effective Date: <span class="placeholder">[DATE]</span></div>

<div class="section">
  <h2>1. Parties</h2>
  <table class="parties-table">
    <tr>
      <td>Service Provider</td>
      <td>Jeremy Nelson<br>jeremynelson853@gmail.com</td>
    </tr>
    <tr>
      <td>Client</td>
      <td>
        <span class="placeholder">[CLIENT NAME]</span><br>
        <span class="placeholder">[SALON NAME]</span><br>
        <span class="placeholder">[CLIENT EMAIL]</span>
      </td>
    </tr>
  </table>
</div>

{section("2", "Scope of Work — Website Design &amp; Build", content["scope_website"])}
{section("3", "Scope of Work — Monthly Retainer", content["scope_retainer"])}

<div class="section">
  <h2>4. Deliverables</h2>
  <p><strong>Website Design &amp; Build</strong></p>
  {chr(10).join(f"<li>{l[1:].strip()}</li>" for l in content["deliverables_website"].split(chr(10)) if l.strip().startswith("-"))}
  <br>
  <p><strong>Monthly Retainer</strong></p>
  {chr(10).join(f"<li>{l[1:].strip()}</li>" for l in content["deliverables_retainer"].split(chr(10)) if l.strip().startswith("-"))}
</div>

{section("5", "Payment Terms", content["payment_terms"])}
{section("6", "Timeline", content["timeline"])}
{section("7", "Revisions", content["revisions"])}
{section("8", "Intellectual Property", content["intellectual_property"])}
{section("9", "Confidentiality", content["confidentiality"])}
{section("10", "Termination", content["termination"])}
{section("11", "Limitation of Liability", content["liability"])}
{section("12", "Governing Law", content["governing_law"])}
{section("13", "Entire Agreement", content["entire_agreement"])}

<div class="section">
  <h2>14. Signatures</h2>
  <p>By signing below, both parties agree to be bound by the terms of this agreement.</p>
  <div class="signature-block">
    <div class="sig-col">
      <div class="sig-line"></div>
      <div class="sig-label"><strong>Jeremy Nelson</strong> — Service Provider</div>
      <div class="sig-label">Date: ___________________</div>
    </div>
    <div class="sig-col">
      <div class="sig-line"></div>
      <div class="sig-label"><strong><span class="placeholder">[CLIENT NAME]</span></strong> — <span class="placeholder">[SALON NAME]</span></div>
      <div class="sig-label">Date: ___________________</div>
    </div>
  </div>
</div>

</body>
</html>"""

    return body


def main():
    print("Building contract...")
    content = generate_contract_content()

    os.makedirs(".tmp", exist_ok=True)
    out_path = os.path.abspath(".tmp/client_contract.html")

    with open(out_path, "w", encoding="utf-8") as f:
        f.write(render_html(content))

    print(f"\nContract saved: {out_path}")
    print("\nNext steps:")
    print("  1. Open the file in Chrome")
    print("  2. Fill in all [PLACEHOLDER] fields (shown in red)")
    print("  3. Print -> Save as PDF  (or File > Share to import into Google Docs)")


if __name__ == "__main__":
    main()
