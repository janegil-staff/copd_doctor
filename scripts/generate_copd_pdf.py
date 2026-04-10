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


# ─── Radar ────────────────────────────────────────────────────────────────────
def make_radar(labels, datasets, colors, legends, px=280, fills=None, legend_upper_right=False):
    from PIL import Image as PILImage
    import io as _io

    N = len(labels)
    ang   = np.linspace(0, 2*np.pi, N, endpoint=False).tolist()
    ang_c = ang + ang[:1]

    dpi   = 150
    sz_in = (px * 2) / dpi
    fig   = plt.figure(figsize=(sz_in, sz_in))
    fig.patch.set_color("white")

    margin = 0.18
    ax = fig.add_axes([margin, margin, 1-2*margin, 1-2*margin], polar=True)
    ax.set_facecolor("white")
    ax.set_theta_offset(np.pi/2); ax.set_theta_direction(-1)
    ax.set_ylim(0, 5)
    ax.set_yticks([1, 2, 3, 4, 5])
    ax.set_yticklabels(["1","2","3","4","5"], size=7, color="#888", fontweight="bold")
    ax.set_xticks(ang)
    ax.set_xticklabels(labels, size=6.5, color="#333")
    ax.grid(color="#cccccc", linestyle="-", linewidth=0.5, alpha=0.6)
    ax.spines["polar"].set_color("#aaaaaa")

    for vals, col, lbl in zip(datasets, colors, legends):
        v = list(vals) + [vals[0]]
        ax.plot(ang_c, v, color=col, linewidth=2.2, label=lbl, zorder=3)

    if legend_upper_right:
        ax.legend(loc="upper left", bbox_to_anchor=(1.00, 1.12),
                  ncol=1, fontsize=8, frameon=True,
                  framealpha=0.95, edgecolor="#cccccc",
                  handlelength=2.0, handletextpad=0.6,
                  markerscale=2.0)
    else:
        ax.legend(loc="lower center", bbox_to_anchor=(0.5, -0.22),
                  ncol=min(len(legends), 3), fontsize=8, frameon=False,
                  handlelength=2.0, handletextpad=0.6,
                  markerscale=2.0)

    raw = _io.BytesIO()
    plt.savefig(raw, format="png", dpi=dpi,
                transparent=False, facecolor="white")
    plt.close(fig)
    raw.seek(0)

    rendered = PILImage.open(raw).convert("RGB")
    rw, rh = rendered.size
    side = min(rw, rh)
    left = (rw - side) // 2
    top  = (rh - side) // 2
    cropped = rendered.crop((left, top, left+side, top+side))
    cropped = cropped.resize((px, px), PILImage.LANCZOS)

    buf = _io.BytesIO()
    cropped.save(buf, format="PNG")
    buf.seek(0)
    return buf


# ─── BMI image ────────────────────────────────────────────────────────────────
def bmi_image_path(script_dir, bmi, gender):
    """
    Returns path to the correct body image based on BMI and gender.
    Folder: <script_dir>/male/ or <script_dir>/female/
    Files:  1.png (BMI<18.5), 2.png (18.5-25), 3.png (25-30), 4.png (>30)
    """
    if bmi < 18.5:
        n = 1
    elif bmi < 25:
        n = 2
    elif bmi < 30:
        n = 3
    else:
        n = 4
    folder = "female" if str(gender).lower() == "female" else "male"
    return os.path.join(script_dir, folder, f"{n}.png")


def draw_bmi_figure(c, x, y, w, h, script_dir, bmi, gender):
    """Draw the single BMI body image, right-aligned in the header."""
    img_path = bmi_image_path(script_dir, bmi, gender)
    if os.path.exists(img_path):
        c.drawImage(img_path, x, y, width=w, height=h,
                    preserveAspectRatio=True, anchor="c", mask="auto")


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

    smk = data.get("smoking") or {}; sv = smk.get("smoking", 0); py = smk.get("frequency", 0)
    if sv == 1:
        smoke_str = t(tr, "pdfExSmoker", py=py)
    elif sv == 2:
        smoke_str = t(tr, "pdfCurrentSmoker")
    else:
        smoke_str = t(tr, "pdfNonSmoker")

    vp = data.get("vaping") or {}; vv = vp.get("vaping", 0) if isinstance(vp, dict) else 0
    if vv == 1:
        vape_str = t(tr, "pdfExVaper")
    elif vv == 2:
        vape_str = t(tr, "pdfCurrentVaper")
    else:
        vape_str = t(tr, "pdfNonVaper")

    asthma_diagnosed = data.get("asthma", False)
    asthma_str = t(tr, "pdfAsthmaDiagnosed") if asthma_diagnosed else t(tr, "pdfAsthmaNotDiagnosed")

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

    gad_f = ["feelingNervous","noWorryingControl","worrying","troubleRelaxing",
             "restless","easilyAnnoyed","afraid"]
    phq_f = ["noPleasureDoingThings","depressed","stayingAsleep","noEnergy",
             "noAppetite","selfPity","troubleConcentration","slowMovingSpeeking","suicidal"]

    gad_history = data.get("gad7History") or []
    if not gad_history and data.get("latestGad7"):
        gad_history = [data["latestGad7"]]
    gad_history = sorted(gad_history, key=lambda x: x.get("date",""))

    phq_history = data.get("phq9History") or []
    if not phq_history and data.get("latestPhq9"):
        phq_history = [data["latestPhq9"]]
    phq_history = sorted(phq_history, key=lambda x: x.get("date",""))

    def entry_vals(entry, fields):
        if not isinstance(entry, dict): return [0]*len(fields)
        return [entry.get(f, 0) for f in fields]

    def best_entry(history, fields):
        valid = [e for e in history if isinstance(e, dict)]
        if not valid: return {}
        return min(valid, key=lambda e: sum(e.get(f,0) for f in fields))

    def worst_entry(history, fields):
        valid = [e for e in history if isinstance(e, dict)]
        if not valid: return {}
        return max(valid, key=lambda e: sum(e.get(f,0) for f in fields))

    gad        = gad_history[-1] if gad_history else {}
    gad_vals   = entry_vals(gad, gad_f)
    gad_total  = sum(gad_vals)
    gad_best   = entry_vals(best_entry(gad_history, gad_f),  gad_f)
    gad_worst  = entry_vals(worst_entry(gad_history, gad_f), gad_f)

    phq        = phq_history[-1] if phq_history else {}
    phq_vals   = entry_vals(phq, phq_f)
    phq_total  = sum(phq_vals)
    phq_best   = entry_vals(best_entry(phq_history, phq_f),  phq_f)
    phq_worst  = entry_vals(worst_entry(phq_history, phq_f), phq_f)

    return dict(
        records=records, exac_dates=exac_dates,
        n_mod=n_mod, n_ser=n_ser, total_exac=n_mod+n_ser,
        weight=weight, height=height, bmi=bmi, age=data.get("age", 0),
        gender=data.get("gender", "male"),
        smoke_str=smoke_str, vape_str=vape_str, asthma_str=asthma_str, pa_str=pa_str,
        copd_confirmed=data.get("copdDiagnosed", False),
        alpha1_tested=(data.get("latestAlpha1") or {}).get("alpha1Tested", False),
        vacc_flu=vacc.get("flue", False),    vacc_covid=vacc.get("covid", False),
        vacc_pneu=vacc.get("pneumococ", False), vacc_rs=vacc.get("rs", False),
        vacc_pert=vacc.get("pertussis", False),
        user_meds=data.get("userMedicines", []), med_lookup=med_lookup, satisf=satisf,
        med_training={
            entry["medicineId"]: entry
            for entry in (data.get("latestMedicineTraining") or {}).get("medicines", [])
        },
        gad_vals=gad_vals, gad_total=gad_total, gad_best=gad_best, gad_worst=gad_worst,
        phq_vals=phq_vals, phq_total=phq_total, phq_best=phq_best, phq_worst=phq_worst,
        cat_score=last_r.get("cat8", 0),
        cat_best=cv(best_r), cat_worst=cv(worst_r), cat_last=cv(last_r),
        _gad_history_len=len(gad_history),
        _phq_history_len=len(phq_history),
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

    # BMI figure — single image from male/ or female/ folder
    fig_sz = 210
    draw_bmi_figure(c,
                    x=W - MR - fig_sz,
                    y=y - fig_sz + 30,
                    w=fig_sz, h=fig_sz,
                    script_dir=_script_dir,
                    bmi=d["bmi"],
                    gender=d["gender"])

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
    c.drawString(ML, y, f"{t(tr, 'pdfSmokingStatus')}: {d['smoke_str']}"); y -= 14
    c.drawString(ML, y, f"{t(tr, 'pdfVapingStatus')}: {d['vape_str']}"); y -= 14
    c.drawString(ML, y, f"{t(tr, 'pdfAsthmaStatus')}: {d['asthma_str']}"); y -= 21
    c.drawString(ML, y, f"{t(tr, 'pdfPhysicalActivity')}: {d['pa_str']}"); y -= 14

    # ════════════════════════════════════════════════════════════════
    # SECTION 3 – Exacerbation banner
    # ════════════════════════════════════════════════════════════════
    total = d["total_exac"]; hosp = d["n_ser"]
    c.setFillColor(TEAL_PALE)
    c.roundRect(ML, y-15, PW, 17, 3, fill=1, stroke=0)
    c.setFillColor(DARK); c.setFont("Helvetica-Bold", 10)
    c.drawString(ML+6, y-10, t(tr, 'pdfSymptomsPast12'))
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
    cat_best_vis  = [max(v, 0.5) for v in d["cat_best"]]
    cat_worst_vis = [max(v, 0.5) for v in d["cat_worst"]]
    cat_last_vis  = [max(v, 0.5) for v in d["cat_last"]]
    buf = make_radar(cat_labels,
                     [cat_best_vis, cat_last_vis, cat_worst_vis],
                     ["#388e3c", "#f5820a", "#e74c3c"],
                     [t(tr,"pdfCatBestLevel"), t(tr,"pdfCatLastWeek"), t(tr,"pdfCatWorstLevel")],
                     px=int(rad_sz*2.4),
                     fills=[0.08, 0.22, 0.15])
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
    # SECTION 4b – Exacerbation calendars
    # ════════════════════════════════════════════════════════════════
    hosp_word = t(tr, "pdfHospitalization") if hosp == 1 else t(tr, "pdfHospitalizations")
    exac_label = (
        f"{t(tr, 'pdfExacerbationsPast12')}:  {d['total_exac']}"
        f"  ({hosp} {hosp_word})"
    )
    c.setFillColor(TEAL_PALE)
    c.roundRect(ML, y-15, PW, 17, 3, fill=1, stroke=0)
    c.setFillColor(DARK); c.setFont("Helvetica-Bold", 10)
    c.drawString(ML+6, y-10, exac_label)
    y -= 21

    EXAC_SERIOUS  = HexColor("#e87070")
    EXAC_MODERATE = HexColor("#f5c97a")
    day_exac = {}
    for r in d["records"]:
        rec_date = datetime.strptime(r["date"], "%Y-%m-%d").date()
        dow  = rec_date.weekday()
        mon  = rec_date - timedelta(days=dow)
        col_exac = None
        if r.get("seriousExacerbations"):
            col_exac = EXAC_SERIOUS
        elif r.get("moderateExacerbations"):
            col_exac = EXAC_MODERATE
        if col_exac:
            for offset in range(7):
                day_exac[(mon + timedelta(days=offset)).isoformat()] = col_exac

    ECAL_W = PW; ECAL_H = 210
    ecw = ECAL_W / COLS; ech = ECAL_H / ROWS
    exac_top = y

    for idx, (yr, mo) in enumerate(months_list):
        col = idx % COLS; row = idx // COLS
        cx  = ML + col * ecw; cy = exac_top - row * ech
        iw  = ecw - 2; dcw = iw / 7

        c.setFillColor(CAL_BROWN)
        c.rect(cx, cy-11, iw, 11, fill=1, stroke=0)
        c.setFillColor(white); c.setFont("Helvetica-Bold", 6)
        c.drawCentredString(cx+iw/2, cy-8.5, MONTHS[mo-1])

        c.setFont("Helvetica", 4.5); c.setFillColor(HexColor("#555"))
        for di, dl in enumerate(WEEKDAYS):
            c.drawCentredString(cx+di*dcw+dcw/2, cy-18, dl)

        c.setFillColor(HexColor("#ede0cc"))
        c.rect(cx, cy-ech+2, iw, ech-13, fill=1, stroke=0)
        c.setStrokeColor(HexColor("#c8b89a")); c.setLineWidth(0.3)
        c.rect(cx, cy-ech+2, iw, ech-2, fill=0, stroke=1)

        erow_fills = {}; tmp_ry = cy-27
        first_dow_e, ndays_e = calendar.monthrange(yr, mo)
        tmp_dc = first_dow_e
        for day in range(1, ndays_e+1):
            dstr = f"{yr}-{mo:02d}-{day:02d}"
            fc_e = day_exac.get(dstr)
            if fc_e:
                if tmp_ry not in erow_fills:
                    erow_fills[tmp_ry] = fc_e
                else:
                    if fc_e == EXAC_SERIOUS:
                        erow_fills[tmp_ry] = EXAC_SERIOUS
            tmp_dc += 1
            if tmp_dc == 7: tmp_dc = 0; tmp_ry -= 8

        for row_y, fc_e in erow_fills.items():
            c.setFillColor(fc_e)
            c.rect(cx+0.5, row_y-2, iw-1, 8.5, fill=1, stroke=0)

        ry = cy-27; dc = first_dow_e
        for day in range(1, ndays_e+1):
            dx = cx + dc*dcw + dcw/2
            c.setFillColor(DARK); c.setFont("Helvetica", 4.6)
            c.drawCentredString(dx, ry, str(day))
            dc += 1
            if dc == 7: dc = 0; ry -= 8

    legend_y = exac_top - ECAL_H - 8
    dot_r = 4
    for lbl, col_l in [
        (t(tr, "pdfExacModerate"), EXAC_MODERATE),
        (t(tr, "pdfExacSerious"),  EXAC_SERIOUS),
    ]:
        c.setFillColor(col_l)
        c.circle(ML + 6, legend_y + 3, dot_r, fill=1, stroke=0)
        c.setFillColor(DARK); c.setFont("Helvetica", 7)
        c.drawString(ML + 14, legend_y, lbl)
        legend_y -= 13

    y = legend_y - 10

    # ════════════════════════════════════════════════════════════════
    # SECTION 5 – Medication | Satisfaction | Vaccinations
    # ════════════════════════════════════════════════════════════════
    VACC_W = 110; vacc_x = W-MR-VACC_W; section_top = y

    c.setFillColor(DARK); c.setFont("Helvetica-Bold", 9)
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

    TRAIN_FLAGS = [
        "generalPractitioner", "pharmacy", "homeCareNurse",
        "rehabilitationCenter", "hospitalLungSpecialist", "trainingVideo",
    ]
    NO_TRAINING_BG  = HexColor("#fdecea")
    NO_TRAINING_STR = HexColor("#e53935")
    ROW_W = vacc_x - ML - 8
    MED_ROW_H  = 32
    PAGE_FLOOR = MT + 60

    med_y = y - 20
    med_on_page2 = False

    if not d["user_meds"]:
        c.setFont("Helvetica", 8); c.setFillColor(MID)
        c.drawString(ML, med_y, t(tr, "pdfNoneRegistered"))
        med_y -= 14
    else:
        for um in d["user_meds"]:
            mid_id   = um.get("medicineId")
            name     = (um.get("medicine") or {}).get("name") or d["med_lookup"].get(mid_id, "Unknown")
            sat_val  = d["satisf"].get(mid_id, 0)
            sat_lbl  = SAT.get(sat_val, "")
            training = d["med_training"].get(mid_id, {})
            has_training = any(training.get(flag, False) for flag in TRAIN_FLAGS)

            if med_y < PAGE_FLOOR:
                c.showPage()
                med_y = H - MT
                med_on_page2 = True
                c.setFillColor(DARK); c.setFont("Helvetica-Bold", 9)
                c.drawString(ML,     med_y, t(tr, "pdfMedicationHeader"))
                c.drawString(ML+95,  med_y, t(tr, "pdfSatisfactionHeader"))
                med_y -= 20

            c.setFillColor(DARK); c.setFont("Helvetica", 8)
            c.drawString(ML, med_y, name.capitalize())

            if not has_training:
                c.setFillColor(NO_TRAINING_BG)
                c.setStrokeColor(NO_TRAINING_STR)
                c.setLineWidth(0.5)
                c.circle(ML+107, med_y - 8 + 9, 13, fill=1, stroke=1)

            draw_dice(c, ML+98, med_y - 8, max(1,min(6,sat_val)), size=18)
            c.setFillColor(DARK); c.setFont("Helvetica-Bold", 9)
            c.drawString(ML+124, med_y - 4, sat_lbl)
            med_y -= MED_ROW_H

    # ════════════════════════════════════════════════════════════════
    # SECTION 6 – GAD-7 + PHQ-9
    # ════════════════════════════════════════════════════════════════
    gad_zone_w = vacc_x - ML - 8
    each_w     = (gad_zone_w - 8) / 2
    RADAR_PX   = int(each_w * 2.8)

    section6_h = 14 + each_w + 70 + 16

    if med_on_page2:
        gad_y = med_y - 8
    else:
        gad_y = min(section_top, med_y - 8)

    if gad_y - section6_h < MT:
        c.showPage()
        gad_y = H - MT

    c.setFillColor(DARK); c.setFont("Helvetica-Bold", 8)
    c.drawString(ML,           gad_y - 12, t(tr, "pdfGad7Title"))
    c.drawString(ML+each_w+8, gad_y - 12, t(tr, "pdfPhq9Title"))

    gad_radar_y = gad_y - 16

    gad_labels = [
        t(tr,"pdfGad7Nervousness"), t(tr,"pdfGad7Slim"), t(tr,"pdfGad7Restlessness"),
        t(tr,"pdfGad7Irritability"), t(tr,"pdfGad7Catastrophic"),
        t(tr,"pdfGad7Worrying"), t(tr,"pdfGad7Afraid"),
    ]
    gad_vals7 = (d["gad_vals"]+[0]*7)[:7]
    gad_has_history = d["_gad_history_len"] > 1
    if gad_has_history:
        gad_best_vis  = [max(v, 0.5) for v in (d["gad_best"]+[0]*7)[:7]]
        gad_worst_vis = [max(v, 0.5) for v in (d["gad_worst"]+[0]*7)[:7]]
        gad_last_vis  = [max(v, 0.5) for v in gad_vals7]
        gad_datasets  = [gad_best_vis, gad_last_vis, gad_worst_vis]
        gad_colors    = ["#388e3c", "#f5820a", "#e74c3c"]
        gad_legends   = [t(tr,"pdfGad7BestLevel"), t(tr,"pdfGad7LastWeek"), t(tr,"pdfGad7WorstLevel")]
    else:
        gad_last_vis  = [max(v, 0.5) for v in gad_vals7]
        gad_datasets  = [[0.5]*7, gad_last_vis, [5]*7]
        gad_colors    = ["#388e3c", "#f5820a", "#e74c3c"]
        gad_legends   = [t(tr,"pdfGad7BestLevel"), t(tr,"pdfGad7LastWeek"), t(tr,"pdfGad7WorstLevel")]

    gbuf = make_radar(gad_labels, gad_datasets, gad_colors, gad_legends,
                      px=RADAR_PX, legend_upper_right=True)
    c.drawImage(ImageReader(gbuf), ML, gad_radar_y-each_w, width=each_w, height=each_w)

    phq_labels = [
        t(tr,"pdfPhq9Interest"), t(tr,"pdfPhq9Depressed"), t(tr,"pdfPhq9Sleep"),
        t(tr,"pdfPhq9Energy"),   t(tr,"pdfPhq9Appetite"),  t(tr,"pdfPhq9SelfEsteem"),
        t(tr,"pdfPhq9Concentration"), t(tr,"pdfPhq9Movement"), t(tr,"pdfPhq9Suicidal"),
    ]
    phq_vals9       = (d["phq_vals"]+[0]*9)[:9]
    phq_has_history = d["_phq_history_len"] > 1
    if phq_has_history:
        phq_best_vis  = [max(v, 0.5) for v in (d["phq_best"]+[0]*9)[:9]]
        phq_worst_vis = [max(v, 0.5) for v in (d["phq_worst"]+[0]*9)[:9]]
        phq_last_vis  = [max(v, 0.5) for v in phq_vals9]
        phq_datasets  = [phq_best_vis, phq_last_vis, phq_worst_vis]
        phq_colors    = ["#388e3c", "#f5820a", "#e74c3c"]
        phq_legends   = [t(tr,"pdfGad7BestLevel"), t(tr,"pdfGad7LastWeek"), t(tr,"pdfGad7WorstLevel")]
    else:
        phq_last_vis  = [max(v, 0.5) for v in phq_vals9]
        phq_datasets  = [[0.5]*9, phq_last_vis, [3]*9]
        phq_colors    = ["#388e3c", "#f5820a", "#e74c3c"]
        phq_legends   = [t(tr,"pdfGad7BestLevel"), t(tr,"pdfGad7LastWeek"), t(tr,"pdfGad7WorstLevel")]

    pbuf = make_radar(phq_labels, phq_datasets, phq_colors, phq_legends,
                      px=RADAR_PX, legend_upper_right=True)
    c.drawImage(ImageReader(pbuf), ML+each_w+8, gad_radar_y-each_w, width=each_w, height=each_w)

    score_y = gad_radar_y - each_w - 14
    ROW_H2 = 10; NUM_W = 52; FONT_H = 6

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