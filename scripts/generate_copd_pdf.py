#!/usr/bin/env python3
"""
COPD Summary PDF - fully translated, zero hardcoded strings.
Usage: python3 generate_copd_pdf.py <input.json> <output.pdf> [icon_path] [lang] [translations_dir]
"""
import json, sys, io, calendar, os
from datetime import date, datetime, timedelta
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.lib.colors import HexColor, white
from reportlab.pdfgen import canvas as rl_canvas

W, H = A4
ML = 15*mm; MR = 15*mm; MT = 12*mm
PW = W - ML - MR

TEAL      = HexColor("#2a7d6f")
CAL_BROWN = HexColor("#c8b89a")
TEAL_PALE = HexColor("#e6f2ef")
DARK      = HexColor("#1a1a1a")
MID       = HexColor("#4a4a4a")
RULE      = HexColor("#dddddd")
RED_V     = HexColor("#d32f2f")
GREEN_V   = HexColor("#388e3c")


# ─── Translations ─────────────────────────────────────────────────────────────
def load_translations(lang, translations_dir):
    path = os.path.join(translations_dir, f"{lang}.json")
    if not os.path.exists(path):
        path = os.path.join(translations_dir, "en.json")
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}


def t(translations, key, **kwargs):
    """Get a translation string, optionally formatting with kwargs."""
    val = translations.get(key, key)
    if kwargs:
        try:
            val = val.format(**kwargs)
        except (KeyError, ValueError):
            pass
    return val


# ─── CAT score colour ─────────────────────────────────────────────────────────
def cat_color(score):
    if score is None: return None
    if score <= 10:  return HexColor("#a8d5a2")
    if score <= 20:  return HexColor("#f5c97a")
    if score <= 30:  return HexColor("#f4a07a")
    return HexColor("#e87070")


# ─── Radar ───────────────────────────────────────────────────────────────────
def make_radar(labels, datasets, colors, legends, px=280):
    N = len(labels)
    ang = np.linspace(0, 2*np.pi, N, endpoint=False).tolist()
    ang_c = ang + ang[:1]

    fig, ax = plt.subplots(figsize=(px/96, px/96), subplot_kw=dict(polar=True))
    fig.patch.set_color("white"); ax.set_facecolor("white")
    ax.set_theta_offset(np.pi/2); ax.set_theta_direction(-1)
    ax.set_ylim(0, 5)
    ax.set_yticks([1, 2, 3, 4, 5])
    ax.set_yticklabels(["1","2","3","4","5"], size=4.5, color="#aaa")
    ax.set_xticks(ang)
    ax.set_xticklabels(labels, size=6, color="#333")
    ax.grid(color="#bbb", linestyle="--", linewidth=0.4, alpha=0.8)
    ax.spines["polar"].set_color("#bbb")

    for vals, col, lbl in zip(datasets, colors, legends):
        v = list(vals) + [vals[0]]
        ax.plot(ang_c, v, color=col, linewidth=1.2, label=lbl)

    ax.legend(loc="lower center", bbox_to_anchor=(0.5, -0.28),
              ncol=len(legends), fontsize=5, frameon=False,
              handlelength=1.2, handletextpad=0.4)
    buf = io.BytesIO()
    plt.savefig(buf, format="png", dpi=150, bbox_inches="tight",
                transparent=False, facecolor="white", pad_inches=0.04)
    plt.close(fig); buf.seek(0)
    return buf


# ─── Human body silhouette ────────────────────────────────────────────────────
def draw_human_silhouette(c, cx, base_y, h, w, col):
    c.setFillColor(col)
    hr = h*0.11; hcy = base_y+h-hr; nw = w*0.30; nh = h*0.06; ny = hcy-hr
    sh_w = w*1.05; hip_w = w*0.80; tor_top = ny-nh; tor_bot = base_y+h*0.36
    tor_h = tor_top-tor_bot; leg_h = h*0.34; leg_w = w*0.38; leg_gap = w*0.08
    arm_len = tor_h*0.80; arm_w = w*0.22

    c.circle(cx, hcy, hr, fill=1, stroke=0)

    p = c.beginPath()
    p.moveTo(cx-nw, ny); p.lineTo(cx+nw, ny)
    p.lineTo(cx+nw, ny-nh); p.lineTo(cx-nw, ny-nh)
    p.close(); c.drawPath(p, fill=1, stroke=0)

    p = c.beginPath()
    p.moveTo(cx-sh_w, tor_top)
    p.curveTo(cx-sh_w*1.05, tor_top-tor_h*0.4, cx-hip_w*1.05, tor_top-tor_h*0.7, cx-hip_w, tor_bot)
    p.lineTo(cx+hip_w, tor_bot)
    p.curveTo(cx+hip_w*1.05, tor_top-tor_h*0.7, cx+sh_w*1.05, tor_top-tor_h*0.4, cx+sh_w, tor_top)
    p.close(); c.drawPath(p, fill=1, stroke=0)

    arm_top_y = tor_top-tor_h*0.05; arm_bot_y = arm_top_y-arm_len
    for sign in [-1, 1]:
        atx = cx+sign*sh_w; abx = cx+sign*(sh_w+arm_len*0.25)
        p = c.beginPath()
        p.moveTo(atx+sign*arm_w*0.3, arm_top_y)
        p.curveTo(atx+sign*arm_w*0.5, arm_top_y-arm_len*0.4,
                  abx+sign*arm_w*0.5, arm_bot_y+arm_len*0.2, abx, arm_bot_y)
        p.curveTo(abx-sign*arm_w*0.6, arm_bot_y+arm_len*0.1,
                  atx-sign*arm_w*0.6, arm_top_y-arm_len*0.3, atx-sign*arm_w*0.3, arm_top_y)
        p.close(); c.drawPath(p, fill=1, stroke=0)

    lx = cx-leg_gap-leg_w
    p = c.beginPath()
    p.moveTo(cx-leg_gap*0.5, tor_bot)
    p.curveTo(cx-leg_gap*0.5, tor_bot-leg_h*0.2, lx+leg_w, tor_bot-leg_h*0.3, lx+leg_w*0.9, base_y)
    p.lineTo(lx, base_y)
    p.curveTo(lx, tor_bot-leg_h*0.4, cx-leg_gap*1.5, tor_bot-leg_h*0.1, cx-leg_gap*1.5, tor_bot)
    p.close(); c.drawPath(p, fill=1, stroke=0)

    lx = cx+leg_gap
    p = c.beginPath()
    p.moveTo(cx+leg_gap*0.5, tor_bot)
    p.curveTo(cx+leg_gap*0.5, tor_bot-leg_h*0.2, lx, tor_bot-leg_h*0.3, lx+leg_w*0.1, base_y)
    p.lineTo(lx+leg_w, base_y)
    p.curveTo(lx+leg_w, tor_bot-leg_h*0.4, cx+leg_gap*1.5, tor_bot-leg_h*0.1, cx+leg_gap*1.5, tor_bot)
    p.close(); c.drawPath(p, fill=1, stroke=0)


def draw_bmi_figures(c, x, y, bmi, tr):
    items = [
        ("<18,5",   HexColor("#e53935"), bmi < 18.5,   4,  28, 1),
        ("18,5-25", HexColor("#2e7d32"), 18.5<=bmi<25, 6,  32, 2),
        ("25-30",   HexColor("#757575"), 25<=bmi<30,   8,  30, 3),
        (">30",     HexColor("#1565c0"), bmi >= 30,    11, 29, 4),
    ]
    spacing = 22; dim = HexColor("#dddddd")
    for i, (lbl, full_col, active, hw, fh, n_dots) in enumerate(items):
        cx = x+i*spacing+spacing/2; col = full_col if active else dim
        draw_human_silhouette(c, cx, y-fh, fh, hw, col)
        c.setFillColor(col); c.setFont("Helvetica", 3.8)
        c.drawCentredString(cx, y-fh-5,   t(tr, "pdfBmi"))
        c.drawCentredString(cx, y-fh-9.5, lbl)
        dot_sp = 3.5; start_x = cx-(n_dots-1)*dot_sp/2
        for di in range(n_dots):
            c.setFillColor(col)
            c.circle(start_x+di*dot_sp, y-fh-15, 1.5, fill=1, stroke=0)


# ─── Data processing ──────────────────────────────────────────────────────────
def process(data, tr):
    records = sorted(data.get("records", []), key=lambda r: r["date"])
    CAT_KEYS = ["cat8Cough","cat8Phlegm","cat8ChestTightness","cat8Breathlessness",
                "cat8Activities","cat8Confidence","cat8Sleep","cat8Energy"]
    def cv(r): return [r.get(k, 0) for k in CAT_KEYS]

    best_r  = min(records, key=lambda r: r.get("cat8", 99), default={})
    worst_r = max(records, key=lambda r: r.get("cat8", -1), default={})
    last_r  = records[-1] if records else {}

    cutoff = date.today().replace(year=date.today().year-1)
    exac_dates = set(); n_mod = 0; n_ser = 0
    for r in records:
        d2 = datetime.strptime(r["date"], "%Y-%m-%d").date()
        if r.get("seriousExacerbations"):
            exac_dates.add(r["date"])
            if d2 >= cutoff: n_ser += 1
        if r.get("moderateExacerbations"):
            exac_dates.add(r["date"])
            if d2 >= cutoff: n_mod += 1

    weights = [r["weight"] for r in records if r.get("weight")]
    weight  = weights[-1] if weights else 80
    height  = 177
    bmi     = round(weight/(height/100)**2, 1)

    smk = data.get("smoking", {}); sv = smk.get("smoking", 0); py = smk.get("frequency", 0)
    if sv == 1:
        smoke_str = t(tr, "pdfExSmoker", py=py)
    elif sv == 2:
        smoke_str = t(tr, "pdfCurrentSmoker")
    else:
        smoke_str = t(tr, "pdfNonSmoker")

    pa_map = {
        1: t(tr, "pdfActivityNone"),
        2: t(tr, "pdfActivity1_2"),
        3: t(tr, "pdfActivity2_3"),
        4: t(tr, "pdfActivity3_5"),
        5: t(tr, "pdfActivity5plus"),
    }
    pa_vals = [r["physicalActivity"] for r in records if r.get("physicalActivity")]
    pa_str  = pa_map.get(pa_vals[-1] if pa_vals else 3, t(tr, "pdfActivity2_3"))

    vacc       = (data.get("vaccinations") or [{}])[-1]
    med_lookup = {m["id"]: m["name"] for m in data.get("medicines", [])}
    satisf     = {ms["medicineId"]: ms["satisfaction"]
                  for ms in (data.get("latestMedicineSatisfaction") or {}).get("medicines", [])}

    gad   = data.get("latestGad7", {})
    gad_f = ["feelingNervous","noWorryingControl","worrying","troubleRelaxing",
             "restless","easilyAnnoyed","afraid"]
    gad_vals  = [gad.get(f, 0) for f in gad_f]
    gad_total = sum(gad_vals)

    phq   = data.get("latestPhq9", {})
    phq_f = ["noPleasureDoingThings","depressed","stayingAsleep","noEnergy",
             "noAppetite","selfPity","troubleConcentration","slowMovingSpeeking","suicidal"]
    phq_vals  = [phq.get(f, 0) for f in phq_f]
    phq_total = sum(phq_vals)

    return dict(
        records=records, exac_dates=exac_dates,
        n_mod=n_mod, n_ser=n_ser, total_exac=n_mod+n_ser,
        weight=weight, height=height, bmi=bmi, age=data.get("age", 0),
        smoke_str=smoke_str, pa_str=pa_str,
        copd_confirmed=data.get("copdDiagnosed", False),
        alpha1_tested=data.get("latestAlpha1", {}).get("alpha1Tested", False),
        vacc_flu=vacc.get("flue", False),    vacc_covid=vacc.get("covid", False),
        vacc_pneu=vacc.get("pneumococ", False), vacc_rs=vacc.get("rs", False),
        vacc_pert=vacc.get("pertussis", False),
        user_meds=data.get("userMedicines", []), med_lookup=med_lookup, satisf=satisf,
        gad_vals=gad_vals, gad_total=gad_total,
        phq_vals=phq_vals, phq_total=phq_total,
        cat_score=last_r.get("cat8", 0),
        cat_best=cv(best_r), cat_worst=cv(worst_r), cat_last=cv(last_r),
    )


# ─── Check/cross box ──────────────────────────────────────────────────────────
def check_box(c, x, y, ok, sz=10):
    col = GREEN_V if ok else RED_V
    c.setFillColor(col); c.setStrokeColor(col)
    c.roundRect(x, y, sz, sz, 1.5, fill=1, stroke=0)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", sz*0.7)
    c.drawCentredString(x+sz/2, y+sz*0.15, "✓" if ok else "✗")


# ─── Dice / satisfaction indicator ───────────────────────────────────────────
def draw_dice(c, x, y, value, size=20):
    pad = size*0.18; dot_r = size*0.09
    POS = {
        1: [(0.5,0.5)],
        2: [(0.25,0.75),(0.75,0.25)],
        3: [(0.25,0.75),(0.5,0.5),(0.75,0.25)],
        4: [(0.25,0.75),(0.75,0.75),(0.25,0.25),(0.75,0.25)],
        5: [(0.25,0.75),(0.75,0.75),(0.5,0.5),(0.25,0.25),(0.75,0.25)],
        6: [(0.25,0.83),(0.75,0.83),(0.25,0.5),(0.75,0.5),(0.25,0.17),(0.75,0.17)],
    }
    bg_colors = {1:HexColor("#a8d5a2"),2:HexColor("#a8d5a2"),3:HexColor("#f5c97a"),
                 4:HexColor("#f4a07a"),5:HexColor("#e87070"),6:HexColor("#e87070")}
    bg = bg_colors.get(max(1,min(6,value)), HexColor("#f0f0f0"))
    c.setFillColor(bg); c.setStrokeColor(HexColor("#aaaaaa")); c.setLineWidth(0.5)
    c.roundRect(x, y, size, size, size*0.15, fill=1, stroke=1)
    c.setFillColor(white)
    for (nx, ny) in POS.get(max(1,min(6,value)), POS[1]):
        dx = x+pad+nx*(size-2*pad); dy = y+pad+ny*(size-2*pad)
        c.circle(dx, dy, dot_r, fill=1, stroke=0)


# ─── GENERATE ────────────────────────────────────────────────────────────────
def generate_pdf(data, out_path, icon_path=None, lang="en", translations_dir=None):
    _script_dir = os.path.dirname(os.path.abspath(__file__))
    _default_trans_dir = os.path.join(_script_dir, "..", "src", "app", "messages")
    trans_dir = translations_dir or _default_trans_dir

    tr = load_translations(lang, trans_dir)

    # Calendar labels from translation files
    MONTHS   = tr.get("monthNames", ["January","February","March","April","May","June",
                                      "July","August","September","October","November","December"])
    WEEKDAYS = tr.get("days", ["Mo","Tu","We","Th","Fr","Sa","Su"])

    d = process(data, tr)
    c = rl_canvas.Canvas(out_path, pagesize=A4)
    y = H - MT

    _logo_path    = os.path.join(_script_dir, "logo.png")
    med_icon_path = (icon_path if icon_path and os.path.exists(icon_path)
                     else os.path.join(_script_dir, "ico_intensity_medicine.png"))
    ICON_SZ = 5

    # ════════════════════════════════════════════════════════════════
    # SECTION 1 – Header
    # ════════════════════════════════════════════════════════════════
    logo_sz = 58
    if os.path.exists(_logo_path):
        c.drawImage(_logo_path, ML, y-logo_sz, width=logo_sz, height=logo_sz,
                    preserveAspectRatio=True, mask="auto")
    else:
        c.setFillColor(TEAL)
        c.roundRect(ML, y-logo_sz, logo_sz, logo_sz, 5, fill=1, stroke=0)
        c.setFillColor(white); c.setFont("Helvetica-Bold", 7)
        c.drawCentredString(ML+logo_sz/2, y-logo_sz/2-2.5, "COPD")

    tx = ML+logo_sz+6; lh = 11
    c.setFillColor(DARK); c.setFont("Helvetica", 9)
    c.drawString(tx, y-9,        t(tr, "pdfName"))
    c.drawString(tx, y-9-lh,     f"{t(tr, 'pdfAge')}: {d['age']}")
    c.drawString(tx, y-9-lh*2,   f"{t(tr, 'pdfWeight')}:  {d['weight']} kg.")
    c.drawString(tx, y-9-lh*3,   f"{t(tr, 'pdfHeight')}:  {d['height']} cm.    {t(tr, 'pdfBmi')}: {d['bmi']} kg/m\u00b2")

    draw_bmi_figures(c, W-MR-76, y-2, d["bmi"], tr)
    y -= logo_sz + 17

    # ════════════════════════════════════════════════════════════════
    # SECTION 2 – Diagnosis / Smoking / Activity
    # ════════════════════════════════════════════════════════════════
    diag  = t(tr, "pdfCopdConfirmed") if d["copd_confirmed"] else t(tr, "pdfCopdNotConfirmed")
    alpha = t(tr, "pdfAlpha1Performed") if d["alpha1_tested"] else t(tr, "pdfAlpha1NotPerformed")
    c.setFillColor(DARK)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(ML, y, f"{t(tr, 'pdfDiagnose')}: {diag}"); y -= 14
    c.setFont("Helvetica", 9)
    c.drawString(ML, y, f"{t(tr, 'pdfAlpha1Label')}: {alpha}"); y -= 21
    c.drawString(ML, y, f"{t(tr, 'pdfSmokingStatus')}: {d['smoke_str']}"); y -= 21
    c.drawString(ML, y, f"{t(tr, 'pdfPhysicalActivity')}: {d['pa_str']}"); y -= 14

    # ════════════════════════════════════════════════════════════════
    # SECTION 3 – Exacerbation banner
    # ════════════════════════════════════════════════════════════════
    total = d["total_exac"]; hosp = d["n_ser"]
    c.setFillColor(TEAL_PALE)
    c.roundRect(ML, y-15, PW, 17, 3, fill=1, stroke=0)
    c.setFillColor(DARK); c.setFont("Helvetica-Bold", 10)
    hosp_word = t(tr, "pdfHospitalization") if hosp == 1 else t(tr, "pdfHospitalizations")
    c.drawString(ML+6, y-10, f"{t(tr, 'pdfExacerbationsPast12')}:  {total}  ({hosp} {hosp_word})")
    y -= 21

    # ════════════════════════════════════════════════════════════════
    # SECTION 4 – Calendars + CAT radar
    # ════════════════════════════════════════════════════════════════
    CAL_H = 210; RAD_W = 118; CAL_W = PW-RAD_W-5; cal_top = y

    day_cat = {}; day_med = set()
    for r in d["records"]:
        rec_date = datetime.strptime(r["date"], "%Y-%m-%d").date()
        dow = rec_date.weekday(); mon = rec_date-timedelta(days=dow)
        for offset in range(7):
            day_cat[(mon+timedelta(days=offset)).isoformat()] = r.get("cat8")
        if r.get("medicines"):
            day_med.add(mon.isoformat())

    today = date.today(); exac_dates = d["exac_dates"]
    months_list = []
    for i in range(11, -1, -1):
        mo = today.month-i; yr = today.year
        while mo <= 0: mo += 12; yr -= 1
        months_list.append((yr, mo))

    COLS = 4; ROWS = 3; cw = CAL_W/COLS; ch = CAL_H/ROWS

    for idx, (yr, mo) in enumerate(months_list):
        col = idx%COLS; row = idx//COLS
        cx = ML+col*cw; cy = cal_top-row*ch
        iw = cw-2; dcw = iw/7

        c.setFillColor(CAL_BROWN)
        c.rect(cx, cy-11, iw, 11, fill=1, stroke=0)
        c.setFillColor(white); c.setFont("Helvetica-Bold", 6)
        c.drawCentredString(cx+iw/2, cy-8.5, MONTHS[mo-1])

        c.setFont("Helvetica", 4.5); c.setFillColor(HexColor("#555"))
        for di, dl in enumerate(WEEKDAYS):
            c.drawCentredString(cx+di*dcw+dcw/2, cy-18, dl)

        c.setFillColor(HexColor("#ede0cc"))
        c.rect(cx, cy-ch+2, iw, ch-13, fill=1, stroke=0)
        c.setStrokeColor(HexColor("#c8b89a")); c.setLineWidth(0.3)
        c.rect(cx, cy-ch+2, iw, ch-2, fill=0, stroke=1)

        first_dow, ndays = calendar.monthrange(yr, mo)
        row_fills = {}; tmp_ry = cy-27; tmp_dc = first_dow
        for day in range(1, ndays+1):
            dstr = f"{yr}-{mo:02d}-{day:02d}"
            fc = cat_color(day_cat.get(dstr)); exac = dstr in exac_dates
            if fc or exac:
                if tmp_ry not in row_fills: row_fills[tmp_ry] = (fc, exac)
                else:
                    efc, eex = row_fills[tmp_ry]
                    row_fills[tmp_ry] = (fc or efc, exac or eex)
            tmp_dc += 1
            if tmp_dc == 7: tmp_dc = 0; tmp_ry -= 8

        for row_y, (fc, _) in row_fills.items():
            if fc:
                c.setFillColor(fc)
                c.rect(cx+0.5, row_y-2, iw-1, 8.5, fill=1, stroke=0)

        ry = cy-27; dc = first_dow
        for day in range(1, ndays+1):
            dx = cx+dc*dcw+dcw/2
            c.setFillColor(DARK); c.setFont("Helvetica", 4.6)
            c.drawCentredString(dx, ry, str(day))

            rec_date2 = date(yr, mo, day)
            mon2 = (rec_date2-timedelta(days=rec_date2.weekday())).isoformat()
            if dc == 6 and mon2 in day_med and os.path.exists(med_icon_path):
                c.drawImage(med_icon_path, dx+2.5, ry-0.5,
                            width=ICON_SZ, height=ICON_SZ,
                            preserveAspectRatio=True, mask="auto")
            dc += 1
            if dc == 7: dc = 0; ry -= 8

    # CAT radar
    rx = ML+CAL_W+5; ry_top = cal_top+3; rad_sz = RAD_W
    cat_labels = [
        t(tr, "pdfCatCough"), t(tr, "pdfCatPhlegm"), t(tr, "pdfCatChest"),
        t(tr, "pdfCatBreathless"), t(tr, "pdfCatActivities"), t(tr, "pdfCatConfidence"),
        t(tr, "pdfCatSleep"), t(tr, "pdfCatEnergy"),
    ]
    buf = make_radar(cat_labels,
                     [d["cat_best"], d["cat_worst"], d["cat_last"]],
                     ["#2a7d6f","#cc2222","#2244bb"],
                     [t(tr,"pdfCatBestLevel"), t(tr,"pdfCatWorstLevel"), t(tr,"pdfCatLastWeek")],
                     px=int(rad_sz*2.4))
    c.setFillColor(DARK); c.setFont("Helvetica-Bold", 7)
    c.drawCentredString(rx+rad_sz/2, ry_top+3, t(tr, "pdfCatTitle"))
    c.drawImage(ImageReader(buf), rx, ry_top-rad_sz, width=rad_sz, height=rad_sz)
    c.setFont("Helvetica-Bold", 10); c.setFillColor(DARK)
    c.drawCentredString(rx+rad_sz/2, ry_top-rad_sz-13, t(tr, "pdfCatScoreOf40", score=d["cat_score"]))
    c.setFont("Helvetica", 7.5); c.setFillColor(MID)
    c.drawCentredString(rx+rad_sz/2, ry_top-rad_sz-30, t(tr, "pdfCatLow"))
    c.drawCentredString(rx+rad_sz/2, ry_top-rad_sz-39, t(tr, "pdfCatHigh"))

    y = cal_top - CAL_H - 15

    # ════════════════════════════════════════════════════════════════
    # SECTION 5 – Medication | Satisfaction | Vaccinations
    # ════════════════════════════════════════════════════════════════
    VACC_W = 110; vacc_x = W-MR-VACC_W; section_top = y

    c.setFillColor(DARK); c.setFont("Helvetica-Bold", 9)
    c.drawString(ML,      y, t(tr, "pdfMedicationHeader"))
    c.drawString(ML+95,   y, t(tr, "pdfSatisfactionHeader"))
    c.drawString(vacc_x,  y, t(tr, "pdfVaccinationsHeader"))

    vacc_list = [
        ("Influenzae",     d["vacc_flu"]),
        ("Sars-COV-2 vac", d["vacc_covid"]),
        ("Pneumococcus",   d["vacc_pneu"]),
        ("RS-virus",       d["vacc_rs"]),
        ("Pertussis",      d["vacc_pert"]),
    ]
    ROW_H = 18; BOX_SZ = 10; COL_W = VACC_W-4; BOX_X = vacc_x+COL_W-BOX_SZ; vy = y-20
    for lbl, ok in vacc_list:
        c.setFillColor(DARK); c.setFont("Helvetica", 8.5)
        c.drawString(vacc_x, vy, lbl)
        check_box(c, BOX_X, vy-1.5, ok, sz=BOX_SZ)
        c.setStrokeColor(RULE); c.setLineWidth(0.3)
        c.line(vacc_x, vy-ROW_H+8, vacc_x+COL_W, vy-ROW_H+8)
        vy -= ROW_H

    SAT = {
        1: t(tr, "pdfSatVeryDissatisfied"),
        2: t(tr, "pdfSatDissatisfied"),
        3: t(tr, "pdfSatSatisfied"),
        4: t(tr, "pdfSatVerySatisfied"),
        5: t(tr, "pdfSatExcellent"),
    }
    med_y = y-20
    if not d["user_meds"]:
        c.setFont("Helvetica", 8); c.setFillColor(MID)
        c.drawString(ML, med_y, t(tr, "pdfNoneRegistered"))
    else:
        for um in d["user_meds"]:
            mid_id  = um.get("medicineId")
            name    = (um.get("medicine") or {}).get("name") or d["med_lookup"].get(mid_id, "Unknown")
            sat_val = d["satisf"].get(mid_id, 0)
            sat_lbl = SAT.get(sat_val, "")
            c.setFillColor(DARK); c.setFont("Helvetica", 8)
            c.drawString(ML, med_y, name.capitalize())
            draw_dice(c, ML+98, med_y-2, max(1,min(6,sat_val)), size=18)
            c.setFillColor(DARK); c.setFont("Helvetica-Bold", 9)
            c.drawString(ML+124, med_y+4, sat_lbl)
            med_y -= 28

    # ════════════════════════════════════════════════════════════════
    # SECTION 6 – GAD-7 + PHQ-9
    # ════════════════════════════════════════════════════════════════
    gad_zone_w = vacc_x-ML-8; each_w = (gad_zone_w-8)/2; gad_y = section_top

    c.setFillColor(DARK); c.setFont("Helvetica-Bold", 8)
    c.drawString(ML,              gad_y-38, t(tr, "pdfGad7Title"))
    c.drawString(ML+each_w+8,    gad_y-38, t(tr, "pdfPhq9Title"))

    gad_radar_y = gad_y-43

    gad_labels = [
        t(tr,"pdfGad7Nervousness"), t(tr,"pdfGad7Slim"), t(tr,"pdfGad7Restlessness"),
        t(tr,"pdfGad7Irritability"), t(tr,"pdfGad7Catastrophic"),
        t(tr,"pdfGad7Worrying"), t(tr,"pdfGad7Afraid"),
    ]
    gad_vals7 = (d["gad_vals"]+[0]*7)[:7]
    gbuf = make_radar(gad_labels,
                      [[0]*7, [5]*7, gad_vals7],
                      ["#2a7d6f","#cc2222","#2244bb"],
                      [t(tr,"pdfGad7BestLevel"), t(tr,"pdfGad7WorstLevel"), t(tr,"pdfGad7LastWeek")],
                      px=int(each_w*2.2))
    c.drawImage(ImageReader(gbuf), ML, gad_radar_y-each_w, width=each_w, height=each_w)

    phq_labels = [
        t(tr,"pdfPhq9Interest"), t(tr,"pdfPhq9Depressed"), t(tr,"pdfPhq9Sleep"),
        t(tr,"pdfPhq9Energy"),   t(tr,"pdfPhq9Appetite"),  t(tr,"pdfPhq9SelfEsteem"),
        t(tr,"pdfPhq9Concentration"), t(tr,"pdfPhq9Movement"), t(tr,"pdfPhq9Suicidal"),
    ]
    phq_vals9 = (d["phq_vals"]+[0]*9)[:9]
    pbuf = make_radar(phq_labels,
                      [[2]*9, [4]*9, [7]*9, phq_vals9],
                      ["#388e3c","#f9a825","#cc2222","#2244bb"],
                      [t(tr,"pdfPhq9Low"), t(tr,"pdfPhq9Medium"), t(tr,"pdfPhq9High"), t(tr,"pdfGad7LastWeek")],
                      px=int(each_w*2.2))
    c.drawImage(ImageReader(pbuf), ML+each_w+8, gad_radar_y-each_w, width=each_w, height=each_w)

    score_y = gad_radar_y-each_w-14
    ROW_H2 = 10; NUM_W = 38; FONT_H = 6

    def draw_score_table(c, tx, ty, title, rows):
        c.setFillColor(DARK); c.setFont("Helvetica-Bold", 7.5)
        c.drawString(tx, ty, title)
        ty -= ROW_H2+1
        for i, (num, text) in enumerate(rows):
            c.setFont("Helvetica-Bold" if i == 0 else "Helvetica", FONT_H)
            c.setFillColor(DARK if i == 0 else MID)
            c.drawString(tx,        ty, num)
            c.drawString(tx+NUM_W,  ty, text)
            c.setStrokeColor(RULE); c.setLineWidth(0.3)
            c.line(tx, ty-2, tx+each_w-4, ty-2)
            ty -= ROW_H2
        return ty

    gad_rows = [
        (t(tr,"pdfGad7TableHeader"), t(tr,"pdfSeverityHeader")),
        ("0–4",   t(tr, "pdfGad7Minimal")),
        ("5–9",   t(tr, "pdfGad7Mild")),
        ("10–14", t(tr, "pdfGad7Moderate")),
        ("15–21", t(tr, "pdfGad7Severe")),
    ]
    phq_rows = [
        (t(tr,"pdfPhq9TableHeader"), t(tr,"pdfSeverityHeader")),
        ("0–4",   t(tr, "pdfPhq9None")),
        ("5–9",   t(tr, "pdfPhq9Mild")),
        ("10–14", t(tr, "pdfPhq9Moderate")),
        ("15–19", t(tr, "pdfPhq9ModSevere")),
        ("20–27", t(tr, "pdfPhq9Severe")),
    ]

    draw_score_table(c, ML,           score_y, t(tr,"pdfGad7Score", score=d["gad_total"]), gad_rows)
    draw_score_table(c, ML+each_w+8, score_y, t(tr,"pdfPhq9Score", score=d["phq_total"]), phq_rows)

    c.save()
    print(f"✓  {out_path}")


if __name__ == "__main__":
    jp       = sys.argv[1] if len(sys.argv) > 1 else "data.json"
    op       = sys.argv[2] if len(sys.argv) > 2 else "out.pdf"
    icon_arg = sys.argv[3] if len(sys.argv) > 3 else None
    lang_arg = sys.argv[4] if len(sys.argv) > 4 else "en"
    tdir_arg = sys.argv[5] if len(sys.argv) > 5 else None
    with open(jp) as f:
        data = json.load(f)
    generate_pdf(data, op, icon_path=icon_arg, lang=lang_arg, translations_dir=tdir_arg)