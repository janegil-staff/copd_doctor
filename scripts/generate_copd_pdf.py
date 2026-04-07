#!/usr/bin/env python3
"""
COPD Summary PDF - closely matching reference layout
"""
import json, sys, io, calendar, os
from datetime import date, datetime
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.lib.colors import HexColor, white, black, Color
from reportlab.pdfgen import canvas as rl_canvas

W, H = A4
ML = 15*mm; MR = 15*mm; MT = 12*mm
PW = W - ML - MR

TEAL      = HexColor("#2a7d6f")
TEAL_MED  = HexColor("#3d8c7a")
CAL_BROWN = HexColor("#7a5c3a")  # warm brown for calendar headers
TEAL_PALE = HexColor("#e6f2ef")
DARK      = HexColor("#1a1a1a")
MID       = HexColor("#4a4a4a")
GREY      = HexColor("#888888")
LGREY     = HexColor("#cccccc")
RULE      = HexColor("#dddddd")
RED_V     = HexColor("#d32f2f")
GREEN_V   = HexColor("#388e3c")
RED_BMI   = HexColor("#e53935")
EXAC_RED  = HexColor("#cc2222")

MONTHS = ["January","February","March","April","May","June",
          "July","August","September","October","November","December"]

# ─── Radar ───────────────────────────────────────────────────────────────────
def make_radar(labels, datasets, colors, legends, px=280):
    N = len(labels)
    ang = np.linspace(0, 2*np.pi, N, endpoint=False).tolist()
    ang_c = ang + ang[:1]

    fig, ax = plt.subplots(figsize=(px/96, px/96), subplot_kw=dict(polar=True))
    fig.patch.set_color("white"); ax.set_facecolor("white")
    ax.set_theta_offset(np.pi/2); ax.set_theta_direction(-1)
    ax.set_ylim(0,5)
    ax.set_yticks([1,2,3,4,5])
    ax.set_yticklabels(["1","2","3","4","5"], size=4.5, color="#aaa")
    ax.set_xticks(ang)
    ax.set_xticklabels(labels, size=6, color="#333")
    ax.grid(color="#bbb", linestyle="--", linewidth=0.4, alpha=0.8)
    ax.spines["polar"].set_color("#bbb")

    for vals, col, lbl in zip(datasets, colors, legends):
        v = list(vals) + [vals[0]]
        ax.plot(ang_c, v, color=col, linewidth=1.2, label=lbl)

    ax.legend(loc="lower center", bbox_to_anchor=(0.5,-0.28),
              ncol=len(legends), fontsize=5, frameon=False,
              handlelength=1.2, handletextpad=0.4)
    buf = io.BytesIO()
    plt.savefig(buf, format="png", dpi=150, bbox_inches="tight",
                transparent=False, facecolor="white", pad_inches=0.04)
    plt.close(fig); buf.seek(0)
    return buf

# ─── Human body silhouette ────────────────────────────────────────────────────
def draw_human_silhouette(c, cx, base_y, h, w, col):
    """
    Draw a clean human silhouette matching the reference PDF style.
    cx     = centre x
    base_y = bottom of feet
    h      = total height
    w      = body half-width (torso)
    col    = fill colour
    """
    c.setFillColor(col)

    # Proportions
    hr   = h * 0.11          # head radius
    hcy  = base_y + h - hr   # head centre y
    nw   = w * 0.30          # neck half-width
    nh   = h * 0.06          # neck height
    ny   = hcy - hr          # neck top y

    sh_w = w * 1.05          # shoulder half-width
    hip_w= w * 0.80          # hip half-width
    tor_top = ny - nh
    tor_bot = base_y + h * 0.36
    tor_h   = tor_top - tor_bot

    leg_h = h * 0.34
    leg_w = w * 0.38
    leg_gap = w * 0.08

    arm_len = tor_h * 0.80
    arm_w   = w * 0.22

    # HEAD
    c.circle(cx, hcy, hr, fill=1, stroke=0)

    # NECK
    p = c.beginPath()
    p.moveTo(cx - nw, ny)
    p.lineTo(cx + nw, ny)
    p.lineTo(cx + nw, ny - nh)
    p.lineTo(cx - nw, ny - nh)
    p.close()
    c.drawPath(p, fill=1, stroke=0)

    # TORSO — tapered from shoulders to hips
    p = c.beginPath()
    p.moveTo(cx - sh_w, tor_top)
    p.curveTo(cx - sh_w*1.05, tor_top - tor_h*0.4,
              cx - hip_w*1.05, tor_top - tor_h*0.7,
              cx - hip_w, tor_bot)
    p.lineTo(cx + hip_w, tor_bot)
    p.curveTo(cx + hip_w*1.05, tor_top - tor_h*0.7,
              cx + sh_w*1.05, tor_top - tor_h*0.4,
              cx + sh_w, tor_top)
    p.close()
    c.drawPath(p, fill=1, stroke=0)

    # LEFT ARM — hangs diagonally outward
    arm_top_x = cx - sh_w
    arm_top_y = tor_top - tor_h * 0.05
    arm_bot_x = cx - sh_w - arm_len * 0.25
    arm_bot_y = arm_top_y - arm_len
    p = c.beginPath()
    p.moveTo(arm_top_x - arm_w*0.3, arm_top_y)
    p.curveTo(arm_top_x - arm_w*0.5, arm_top_y - arm_len*0.4,
              arm_bot_x - arm_w*0.5, arm_bot_y + arm_len*0.2,
              arm_bot_x, arm_bot_y)
    p.curveTo(arm_bot_x + arm_w*0.6, arm_bot_y + arm_len*0.1,
              arm_top_x + arm_w*0.6, arm_top_y - arm_len*0.3,
              arm_top_x + arm_w*0.3, arm_top_y)
    p.close()
    c.drawPath(p, fill=1, stroke=0)

    # RIGHT ARM
    arm_top_x = cx + sh_w
    arm_bot_x = cx + sh_w + arm_len * 0.25
    p = c.beginPath()
    p.moveTo(arm_top_x + arm_w*0.3, arm_top_y)
    p.curveTo(arm_top_x + arm_w*0.5, arm_top_y - arm_len*0.4,
              arm_bot_x + arm_w*0.5, arm_bot_y + arm_len*0.2,
              arm_bot_x, arm_bot_y)
    p.curveTo(arm_bot_x - arm_w*0.6, arm_bot_y + arm_len*0.1,
              arm_top_x - arm_w*0.6, arm_top_y - arm_len*0.3,
              arm_top_x - arm_w*0.3, arm_top_y)
    p.close()
    c.drawPath(p, fill=1, stroke=0)

    # LEFT LEG
    lx = cx - leg_gap - leg_w
    p = c.beginPath()
    p.moveTo(cx - leg_gap*0.5, tor_bot)
    p.curveTo(cx - leg_gap*0.5, tor_bot - leg_h*0.2,
              lx + leg_w, tor_bot - leg_h*0.3,
              lx + leg_w*0.9, base_y)
    p.lineTo(lx, base_y)
    p.curveTo(lx, tor_bot - leg_h*0.4,
              cx - leg_gap*1.5, tor_bot - leg_h*0.1,
              cx - leg_gap*1.5, tor_bot)
    p.close()
    c.drawPath(p, fill=1, stroke=0)

    # RIGHT LEG
    lx = cx + leg_gap
    p = c.beginPath()
    p.moveTo(cx + leg_gap*0.5, tor_bot)
    p.curveTo(cx + leg_gap*0.5, tor_bot - leg_h*0.2,
              lx + leg_w*0.0, tor_bot - leg_h*0.3,
              lx + leg_w*0.1, base_y)
    p.lineTo(lx + leg_w, base_y)
    p.curveTo(lx + leg_w, tor_bot - leg_h*0.4,
              cx + leg_gap*1.5, tor_bot - leg_h*0.1,
              cx + leg_gap*1.5, tor_bot)
    p.close()
    c.drawPath(p, fill=1, stroke=0)


def draw_bmi_figures(c, x, y, bmi, cat_score=None):
    """
    4 human silhouettes matching reference PDF exactly.
    Each figure has a distinct colour and width. Active one is full colour, others dimmed.
    """
    def cat_col(score):
        if score is None or score <= 10: return HexColor("#b3d9f2")
        if score <= 20: return HexColor("#a8d5a2")
        if score <= 30: return HexColor("#f5c97a")
        if score <= 35: return HexColor("#f4a07a")
        return HexColor("#e87070")

    # (bmi_label, full_colour, active_check, body_half_w, fig_height, n_dots)
    items = [
        ("<18,5",   HexColor("#e53935"), bmi < 18.5,    4,  28, 1),  # thin, red
        ("18,5-25", HexColor("#2e7d32"), 18.5<=bmi<25,  6,  32, 2),  # normal, dark green, tallest
        ("25-30",   HexColor("#757575"), 25<=bmi<30,    8,  30, 3),  # stocky, grey
        (">30",     HexColor("#1565c0"), bmi>=30,       11, 29, 4),  # wide, blue
    ]

    spacing = 22
    dim     = HexColor("#dddddd")

    for i, (lbl, full_col, active, hw, fh, n_dots) in enumerate(items):
        cx  = x + i * spacing + spacing / 2
        col = full_col if active else dim

        draw_human_silhouette(c, cx, y - fh, fh, hw, col)

        # BMI label
        c.setFillColor(col)
        c.setFont("Helvetica", 3.8)
        c.drawCentredString(cx, y - fh - 5,   "BMI")
        c.drawCentredString(cx, y - fh - 9.5, lbl)

        # Dot indicators
        dot_sp  = 3.5
        start_x = cx - (n_dots - 1) * dot_sp / 2
        for di in range(n_dots):
            c.setFillColor(col)
            c.circle(start_x + di * dot_sp, y - fh - 15, 1.5, fill=1, stroke=0)


# ─── Data processing ──────────────────────────────────────────────────────────
def process(data):
    records = sorted(data.get("records",[]), key=lambda r: r["date"])
    CAT_KEYS = ["cat8Cough","cat8Phlegm","cat8ChestTightness","cat8Breathlessness",
                "cat8Activities","cat8Confidence","cat8Sleep","cat8Energy"]
    def cv(r): return [r.get(k,0) for k in CAT_KEYS]

    best_r  = min(records, key=lambda r: r.get("cat8",99), default={})
    worst_r = max(records, key=lambda r: r.get("cat8",-1), default={})
    last_r  = records[-1] if records else {}

    cutoff = date.today().replace(year=date.today().year-1)
    exac_dates = set(); n_mod=0; n_ser=0
    for r in records:
        d2 = datetime.strptime(r["date"],"%Y-%m-%d").date()
        if r.get("seriousExacerbations"):
            exac_dates.add(r["date"])
            if d2>=cutoff: n_ser+=1
        if r.get("moderateExacerbations"):
            exac_dates.add(r["date"])
            if d2>=cutoff: n_mod+=1

    weights=[r["weight"] for r in records if r.get("weight")]
    weight=weights[-1] if weights else 80
    height=177; bmi=round(weight/(height/100)**2,1)
    dob_year=date.today().year-data.get("age",42)
    dob_str=f"22. oct., {dob_year}"

    smk=data.get("smoking",{}); sv=smk.get("smoking",0); py=smk.get("frequency",0)
    smoke_str=(f"Ex-smoker. Pack-years {py}." if sv==1 else
               "Current smoker." if sv==2 else "Non-smoker.")
    pa_map={1:"< 1 hour/week",2:"1-2 hours/week",3:"2-3 hours/week",
            4:"3-5 hours/week",5:"> 5 hours/week"}
    pa_vals=[r["physicalActivity"] for r in records if r.get("physicalActivity")]
    pa_str=pa_map.get(pa_vals[-1] if pa_vals else 3,"2-3 hours/week")

    vacc=(data.get("vaccinations") or [{}])[-1]
    med_lookup={m["id"]: m["name"] for m in data.get("medicines",[])}
    satisf={ms["medicineId"]: ms["satisfaction"]
            for ms in (data.get("latestMedicineSatisfaction") or {}).get("medicines",[])}

    gad=data.get("latestGad7",{})
    gad_f=["feelingNervous","noWorryingControl","worrying","troubleRelaxing",
           "restless","easilyAnnoyed","afraid"]
    gad_vals=[gad.get(f,0) for f in gad_f]; gad_total=sum(gad_vals)

    phq=data.get("latestPhq9",{})
    phq_f=["noPleasureDoingThings","depressed","stayingAsleep","noEnergy",
           "noAppetite","selfPity","troubleConcentration","slowMovingSpeeking","suicidal"]
    phq_vals=[phq.get(f,0) for f in phq_f]; phq_total=sum(phq_vals)

    return dict(
        records=records, exac_dates=exac_dates,
        n_mod=n_mod, n_ser=n_ser, total_exac=n_mod+n_ser,
        weight=weight, height=height, bmi=bmi, dob_str=dob_str, age=data.get("age", 0),
        smoke_str=smoke_str, pa_str=pa_str,
        copd_confirmed=data.get("copdDiagnosed",False),
        alpha1_tested=data.get("latestAlpha1",{}).get("alpha1Tested",False),
        vacc_flu=vacc.get("flue",False), vacc_covid=vacc.get("covid",False),
        vacc_pneu=vacc.get("pneumococ",False), vacc_rs=vacc.get("rs",False),
        vacc_pert=vacc.get("pertussis",False),
        user_meds=data.get("userMedicines",[]), med_lookup=med_lookup, satisf=satisf,
        gad_vals=gad_vals, gad_total=gad_total,
        phq_vals=phq_vals, phq_total=phq_total,
        cat_score=last_r.get("cat8",0),
        cat_best=cv(best_r), cat_worst=cv(worst_r), cat_last=cv(last_r),
    )

# ─── Check/cross box ─────────────────────────────────────────────────────────
def check_box(c, x, y, ok, sz=10):
    col = GREEN_V if ok else RED_V
    c.setFillColor(col); c.setStrokeColor(col)
    c.roundRect(x, y, sz, sz, 1.5, fill=1, stroke=0)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", sz*0.7)
    c.drawCentredString(x+sz/2, y+sz*0.15, "✓" if ok else "✗")

# ─── Dice face ────────────────────────────────────────────────────────────────
def draw_dice(c, x, y, value, size=20):
    """
    Draw a dice face (1-6) as a rounded square with dots,
    matching the reference PDF satisfaction indicator.
    x, y = bottom-left corner, size = width/height.
    """
    pad  = size * 0.18
    dot_r = size * 0.09
    # dot positions for each face value (normalised 0-1 within inner area)
    POS = {
        1: [(0.5, 0.5)],
        2: [(0.25, 0.75), (0.75, 0.25)],
        3: [(0.25, 0.75), (0.5, 0.5), (0.75, 0.25)],
        4: [(0.25, 0.75), (0.75, 0.75), (0.25, 0.25), (0.75, 0.25)],
        5: [(0.25, 0.75), (0.75, 0.75), (0.5, 0.5), (0.25, 0.25), (0.75, 0.25)],
        6: [(0.25, 0.83), (0.75, 0.83), (0.25, 0.5), (0.75, 0.5), (0.25, 0.17), (0.75, 0.17)],
    }
    # Background colour matches CAT/satisfaction scale
    bg_colors = {
        1: HexColor("#b3d9f2"),  # light blue  (low)
        2: HexColor("#a8d5a2"),  # green       (medium-low)
        3: HexColor("#a8d5a2"),  # green       (medium)
        4: HexColor("#f5c97a"),  # amber       (medium-high)
        5: HexColor("#f4a07a"),  # salmon      (high)
        6: HexColor("#e87070"),  # dark red    (severe)
    }
    bg  = bg_colors.get(max(1, min(6, value)), HexColor("#f0f0f0"))
    # outer rounded box
    c.setFillColor(bg)
    c.setStrokeColor(HexColor("#aaaaaa"))
    c.setLineWidth(0.5)
    c.roundRect(x, y, size, size, size * 0.15, fill=1, stroke=1)
    # dots — white so they show on any colour
    c.setFillColor(white)
    for (nx, ny) in POS.get(max(1, min(6, value)), POS[1]):
        dx = x + pad + nx * (size - 2*pad)
        dy = y + pad + ny * (size - 2*pad)
        c.circle(dx, dy, dot_r, fill=1, stroke=0)


# ─── GENERATE ────────────────────────────────────────────────────────────────
def generate_pdf(data, out_path):
    d = process(data)
    c = rl_canvas.Canvas(out_path, pagesize=A4)
    y = H - MT

    # ════════════════════════════════════════════════════════════════
    # SECTION 1 – Header: logo | name block | body silhouettes
    # ════════════════════════════════════════════════════════════════
    logo_sz = 58
    # Real logo image — look next to the script, then fall back to teal box
    _script_dir = os.path.dirname(os.path.abspath(__file__))
    _logo_path  = os.path.join(_script_dir, "logo.png")
    if os.path.exists(_logo_path):
        c.drawImage(_logo_path, ML, y-logo_sz, width=logo_sz, height=logo_sz,
                    preserveAspectRatio=True, mask="auto")
    else:
        c.setFillColor(TEAL)
        c.roundRect(ML, y-logo_sz, logo_sz, logo_sz, 5, fill=1, stroke=0)
        c.setFillColor(white); c.setFont("Helvetica-Bold", 7)
        c.drawCentredString(ML+logo_sz/2, y-logo_sz/2-2.5, "COPD")

    # Text info
    tx = ML+logo_sz+6; lh=11
    c.setFillColor(DARK); c.setFont("Helvetica", 9)
    c.drawString(tx, y-9,     "Name: _________________________________")
    c.drawString(tx, y-9-lh,  f"Age: {d['age']}")
    c.drawString(tx, y-9-lh*2,f"Weight:  {d['weight']} kg.")
    c.drawString(tx, y-9-lh*3,f"Height:  {d['height']} cm.    BMI: {d['bmi']} kg/m\u00b2")

    # Body silhouettes (right side)
    bmi_x = W - MR - 76
    draw_bmi_figures(c, bmi_x, y-2, d["bmi"], d["cat_score"])

    y -= logo_sz + 7

    # thin rule
    y -= 10

    # ════════════════════════════════════════════════════════════════
    # SECTION 2 – Diagnosis / Smoking / Activity
    # ════════════════════════════════════════════════════════════════
    diag  = "COPD (Confirmed by a physician)" if d["copd_confirmed"] else "COPD (Not confirmed by a physician)"
    alpha = "Performed" if d["alpha1_tested"] else "Not performed."
    c.setFillColor(DARK)
    c.setFont("Helvetica-Bold",9); c.drawString(ML, y, f"Diagnose: {diag}"); y-=14
    c.setFont("Helvetica",9)
    c.drawString(ML, y, f"Alpha-1-antitrypsin deficiency screening: {alpha}"); y-=14
    c.drawString(ML, y, ""); y-=7
    c.drawString(ML, y, f"Smoking status: {d['smoke_str']}"); y-=14
    c.drawString(ML, y, ""); y-=7
    c.drawString(ML, y, f"Physical activity: {d['pa_str']}"); y-=14

    # ════════════════════════════════════════════════════════════════
    # SECTION 3 – Exacerbation banner
    # ════════════════════════════════════════════════════════════════
    total=d["total_exac"]; hosp=d["n_ser"]
    c.setFillColor(TEAL_PALE)
    c.roundRect(ML, y-15, PW, 17, 3, fill=1, stroke=0)
    c.setFillColor(DARK); c.setFont("Helvetica-Bold",10)
    hosp_str=f"{hosp} hospitalization{'s' if hosp!=1 else ''}"
    c.drawString(ML+6, y-10,
        f"Exacerbations past 12 months:  {total}  ({hosp_str})")
    y -= 21

    # ════════════════════════════════════════════════════════════════
    # SECTION 4 – Calendars (left ~75%) + CAT radar (right ~25%)
    # ════════════════════════════════════════════════════════════════
    CAL_H  = 210
    RAD_W  = 118  # pts
    CAL_W  = PW - RAD_W - 5
    cal_top = y

    # ── 4a: 12-month calendars ──
    # Build day->cat8 map: each record's date is Monday of that ISO week;
    # spread the CAT score colour across all 7 days (Mon-Sun) of that week.
    from datetime import timedelta
    def cat_color(score):
        """CAT score -> fill colour (same scale used elsewhere in the app)"""
        if score is None: return None
        if score <= 10:  return HexColor("#b3d9f2")  # light blue  = low
        if score <= 20:  return HexColor("#a8d5a2")  # green       = medium
        if score <= 30:  return HexColor("#f5c97a")  # amber       = high
        if score <= 35:  return HexColor("#f4a07a")  # salmon      = very high
        return HexColor("#e87070")                   # dark red    = severe

    day_cat = {}    # "YYYY-MM-DD" -> cat8 score
    day_med = set() # ISO weeks that had medicine usage: "YYYY-MM-DD" of Monday
    for r in d["records"]:
        rec_date = datetime.strptime(r["date"], "%Y-%m-%d").date()
        dow = rec_date.weekday()          # 0=Mon
        mon = rec_date - timedelta(days=dow)
        for offset in range(7):
            day_cat[(mon + timedelta(days=offset)).isoformat()] = r.get("cat8")
        # Track weeks with medicine usage
        if r.get("medicines"):
            day_med.add(mon.isoformat())  # store Monday of that week

    today = date.today(); exac_dates = d["exac_dates"]
    months=[]
    for i in range(11,-1,-1):
        mo=today.month-i; yr=today.year
        while mo<=0: mo+=12; yr-=1
        months.append((yr,mo))

    COLS=4; ROWS=3
    cw=CAL_W/COLS; ch=CAL_H/ROWS

    for idx,(yr,mo) in enumerate(months):
        col=idx%COLS; row=idx//COLS
        cx=ML+col*cw; cy=cal_top-row*ch
        iw=cw-2

        # month header
        c.setFillColor(CAL_BROWN)
        c.rect(cx, cy-11, iw, 11, fill=1, stroke=0)
        c.setFillColor(white); c.setFont("Helvetica-Bold",6)
        c.drawCentredString(cx+iw/2, cy-8.5, MONTHS[mo-1])

        # weekday headers
        dcw=iw/7
        c.setFont("Helvetica",4.5); c.setFillColor(HexColor("#555"))
        for di,dl in enumerate(["Mo","Tu","We","Th","Fr","Sa","Su"]):
            c.drawCentredString(cx+di*dcw+dcw/2, cy-18, dl)

        # Warm cream cell background matching reference
        c.setFillColor(HexColor("#ede0cc"))
        c.rect(cx, cy-ch+2, iw, ch-13, fill=1, stroke=0)

        # Thin border around whole month cell
        c.setStrokeColor(HexColor("#c8b89a")); c.setLineWidth(0.3)
        c.rect(cx, cy-ch+2, iw, ch-2, fill=0, stroke=1)

        # Draw week rows — first pass: coloured row bands
        first_dow,ndays = calendar.monthrange(yr,mo)
        # Build set of week row_y values that have a CAT colour
        row_fills = {}  # row_y -> (cat_col, has_exac)
        tmp_ry = cy-27; tmp_dc = first_dow
        for day in range(1, ndays+1):
            dstr = f"{yr}-{mo:02d}-{day:02d}"
            fc = cat_color(day_cat.get(dstr))
            exac = dstr in exac_dates
            if fc or exac:
                if tmp_ry not in row_fills:
                    row_fills[tmp_ry] = (fc, exac)
                else:
                    existing_fc, existing_exac = row_fills[tmp_ry]
                    row_fills[tmp_ry] = (fc or existing_fc, exac or existing_exac)
            tmp_dc += 1
            if tmp_dc == 7: tmp_dc = 0; tmp_ry -= 8

        # Paint row backgrounds
        for row_y, (fc, has_exac) in row_fills.items():
            if fc:
                c.setFillColor(fc)
                c.rect(cx+0.5, row_y-2, iw-1, 8.5, fill=1, stroke=0)

        # Second pass: draw day numbers + medicine icons
        ry=cy-27; dc=first_dow
        med_icon_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ico_intensity_medicine.png")
        icon_sz = 5  # pt
        for day in range(1,ndays+1):
            dx=cx+dc*dcw+dcw/2
            dstr=f"{yr}-{mo:02d}-{day:02d}"
            fc = cat_color(day_cat.get(dstr))

            c.setFillColor(DARK)
            c.setFont("Helvetica", 4.6)
            c.drawCentredString(dx, ry, str(day))

            # Medicine icon: show on Sunday (dc==6 before increment) of weeks with medicine
            # dc is current day-of-week (0=Mon). Check if this day's week had medicine.
            rec_date2 = date(yr, mo, day)
            dow2 = rec_date2.weekday()
            mon2 = (rec_date2 - timedelta(days=dow2)).isoformat()
            if dc == 6 and mon2 in day_med and os.path.exists(med_icon_path):
               c.drawImage(med_icon_path,
            dx + 2.5, ry - 0.5,
            width=icon_sz, height=icon_sz,
            preserveAspectRatio=True, mask="auto")


            dc+=1
            if dc==7: dc=0; ry-=8

    # ── 4b: CAT radar (right column) ──
    rx=ML+CAL_W+5; ry_top=cal_top+3
    rad_sz=RAD_W   # square

    cat_labels=["Hoste","Slim","Tetthet\ni brystet","Åndnød",
                "Begrenset\naktivitet","Selvtillit","Søvn","Fatigue"]
    buf=make_radar(cat_labels,
        [d["cat_best"],d["cat_worst"],d["cat_last"]],
        ["#2a7d6f","#cc2222","#2244bb"],
        ["Beste nivå","Verste nivå","Siste uke"],
        px=int(rad_sz*2.4))

    # title above radar
    c.setFillColor(DARK); c.setFont("Helvetica-Bold",7)
    c.drawCentredString(rx+rad_sz/2, ry_top+3, "CAT-skår")
    # draw radar image
    c.drawImage(ImageReader(buf), rx, ry_top-rad_sz, width=rad_sz, height=rad_sz)
    # score below
    c.setFont("Helvetica-Bold",10); c.setFillColor(DARK)
    c.drawCentredString(rx+rad_sz/2, ry_top-rad_sz-13, f"CAT score: {d['cat_score']}/40")
    c.setFont("Helvetica",7.5); c.setFillColor(MID)
    c.drawCentredString(rx+rad_sz/2, ry_top-rad_sz-30, "CAT < 10 - less symptomatic")
    c.drawCentredString(rx+rad_sz/2, ry_top-rad_sz-39, "CAT \u2265 10 - more symptomatic")

    y = cal_top - CAL_H - 5

    # rule
    y -= 10

    # ════════════════════════════════════════════════════════════════
    # SECTION 5 – Medication | Patient satisfaction (left of vacc)
    # ════════════════════════════════════════════════════════════════

    # Right column: vaccinations — fixed width, starts at section top
    VACC_W = 110   # width reserved for vaccinations on the right
    vacc_x = W - MR - VACC_W
    section_top = y   # remember top for GAD/PHQ start

    c.setFillColor(DARK); c.setFont("Helvetica-Bold",9)
    c.drawString(ML, y, "Medication:")
    c.drawString(ML+95, y, "Patient satisfaction:")
    c.drawString(vacc_x, y, "Vaccinations:")

    vacc_list=[("Influenzae",d["vacc_flu"]),("Sars-COV-2 vac",d["vacc_covid"]),
               ("Pneumococcus",d["vacc_pneu"]),("RS-virus",d["vacc_rs"]),
               ("Pertussis",d["vacc_pert"])]
    # Fixed table: label left-aligned, checkbox right-aligned, rule underneath
    ROW_H   = 18
    BOX_SZ  = 10
    COL_W   = VACC_W - 4          # inner table width
    BOX_X   = vacc_x + COL_W - BOX_SZ   # all checkboxes right-aligned here
    vy = y - 20
    for lbl, ok in vacc_list:
        c.setFillColor(DARK); c.setFont("Helvetica", 8.5)
        c.drawString(vacc_x, vy, lbl)
        check_box(c, BOX_X, vy - 1.5, ok, sz=BOX_SZ)
        # rule under each row
        c.setStrokeColor(RULE); c.setLineWidth(0.3)
        c.line(vacc_x, vy - ROW_H + 8, vacc_x + COL_W, vy - ROW_H + 8)
        vy -= ROW_H

    # Medications
    SAT={1:"Very dissatisfied",2:"Dissatisfied",3:"Satisfied",
         4:"Very satisfied",5:"Excellent"}
    med_y = y - 20
    if not d["user_meds"]:
        c.setFont("Helvetica",8); c.setFillColor(MID)
        c.drawString(ML, med_y, "None registered")
    else:
        for um in d["user_meds"]:
            mid_id = um.get("medicineId")
            name   = (um.get("medicine") or {}).get("name") or d["med_lookup"].get(mid_id,"Unknown")
            sat_val = d["satisf"].get(mid_id, 0)
            sat_lbl = SAT.get(sat_val, "")
            c.setFillColor(DARK); c.setFont("Helvetica",8)
            c.drawString(ML, med_y, name.capitalize())

            draw_dice(c, ML+98, med_y-2, max(1, min(6, sat_val)), size=18)
            c.setFillColor(DARK); c.setFont("Helvetica-Bold",9)
            c.drawString(ML+124, med_y+4, sat_lbl)
            med_y -= 28

    # ════════════════════════════════════════════════════════════════
    # SECTION 6 – GAD-7 + PHQ-9 alongside vaccinations
    # Radars start at section_top, constrained to left of vacc column
    # ════════════════════════════════════════════════════════════════
    GAP     = 4
    rad_h   = 80
    gad_zone_w = vacc_x - ML - 8          # available width left of vaccinations
    each_w  = (gad_zone_w - 8) / 2        # split in two

    gad_y = section_top                   # align with "Medication:" header

    # Titles
    c.setFillColor(DARK); c.setFont("Helvetica-Bold", 8)
    c.drawString(ML,              gad_y - 38, "GAD-7 Anxiety")
    c.drawString(ML + each_w + 8, gad_y - 38, "PHQ-9 - Depression")

    gad_radar_y = gad_y - 43   # top of radar images

    # GAD-7 radar
    gad_labels = ["Nervousness","Slim","Restlessness","Irritability",
                  "Catastrophic\nthoughts","Worrying","Afraid"]
    gad_vals7  = (d["gad_vals"] + [0]*7)[:7]
    gbuf = make_radar(gad_labels,
        [[0]*7, [5]*7, gad_vals7],
        ["#2a7d6f","#cc2222","#2244bb"],
        ["Best level","Worst level","Last week"],
        px=int(each_w * 2.2))
    c.drawImage(ImageReader(gbuf), ML, gad_radar_y - each_w,
                width=each_w, height=each_w)

    # PHQ-9 radar
    phq_labels = ["Lite\ninteresse","Nedstemthet","Søvn","Lite\nenergi",
                  "Dårlig\nappetitt","Negativ\nselvfølelse","Konsentr.\nvansker",
                  "Langsomme/\nrastløse\nbeveg.","Selvmords-\ntanker"]
    phq_vals9  = (d["phq_vals"] + [0]*9)[:9]
    pbuf = make_radar(phq_labels,
        [[2]*9, [4]*9, [7]*9, phq_vals9],
        ["#388e3c","#f9a825","#cc2222","#2244bb"],
        ["Lavt (0-4)","Middels (5-9)","Høyt (10-14)","Last week"],
        px=int(each_w * 2.2))
    c.drawImage(ImageReader(pbuf), ML + each_w + 8, gad_radar_y - each_w,
                width=each_w, height=each_w)

    # Score tables below radars — proper table with rules
    score_y = gad_radar_y - each_w - GAP - 10
    ROW_H   = 9      # row height
    NUM_W   = 28     # width of the left (number) column
    FONT_H  = 6      # font size for table rows
    FONT_H_HEAD = 6  # header font size

    def draw_score_table(c, tx, ty, title, score, rows):
        """Draw a score table: score title, then header + data rows with rules."""
        # Score title
        c.setFillColor(DARK); c.setFont("Helvetica-Bold", 7.5)
        c.drawString(tx, ty, title)
        ty -= ROW_H + 1

        for i, (num, text) in enumerate(rows):
            bold = (i == 0)
            c.setFont("Helvetica-Bold" if bold else "Helvetica", FONT_H)
            c.setFillColor(DARK if bold else MID)
            # left col: number range
            c.drawString(tx, ty, num)
            # right col: text description
            c.drawString(tx + NUM_W, ty, text)
            # rule under each row
            c.setStrokeColor(RULE); c.setLineWidth(0.3)
            c.line(tx, ty - 2, tx + each_w - 4, ty - 2)
            ty -= ROW_H
        return ty

    gad_rows = [
        ("Total skår",  "Alvorlighetsgrad"),
        ("0–4",         "Minimal angst"),
        ("5–9",         "Mild angst"),
        ("10–14",       "Moderat angst"),
        ("15–21",       "Alvorlig angst"),
    ]
    phq_rows = [
        ("Totalskåre",  "Alvorlighetsgrad"),
        ("0–4",         "Ingen eller minimal depresjon"),
        ("5–9",         "Mild depresjon"),
        ("10–14",       "Moderat depresjon"),
        ("15–19",       "Moderat alvorlig depresjon"),
        ("20–27",       "Alvorlig depresjon"),
    ]

    draw_score_table(c, ML,              score_y,
                     f"GAD-7 score: {d['gad_total']}", d['gad_total'], gad_rows)
    draw_score_table(c, ML + each_w + 8, score_y,
                     f"PHQ-9 score: {d['phq_total']}", d['phq_total'], phq_rows)

    c.save()
    print(f"✓  {out_path}")

if __name__=="__main__":
    jp=sys.argv[1] if len(sys.argv)>1 else "data.json"
    op=sys.argv[2] if len(sys.argv)>2 else "out.pdf"
    with open(jp) as f: data=json.load(f)
    generate_pdf(data, op)