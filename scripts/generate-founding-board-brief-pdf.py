#!/usr/bin/env python3
"""Generate the V1.4 founding-board preparation brief (production).

Visual system: approved C3 inner-page system — Warm White / Navy / Gold /
Highlight Gold / Pale Gold, straight lines, gold numbers and whitespace.
P02–P13 use the approved Inner Page Visual System (single source of shared
components below). P13 additionally carries the official contact channels
statement. Run from the repository root.
"""

from __future__ import annotations

import math
import os
from pathlib import Path

from reportlab.graphics import renderPDF
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Drawing
from reportlab.lib.colors import Color, HexColor
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = Path(
    os.environ.get(
        "FOUNDING_PDF_OUTPUT",
        str(ROOT / "output" / "pdf" / "civic-orderism-founding-board-brief-2026-final.pdf"),
    )
)
LOGO = ROOT / "quartz" / "static" / "logo.png"

PAGE_W, PAGE_H = A4
M = 53
CONTENT_W = PAGE_W - M * 2

# --- Approved C3 visual system palette (single source for the whole document) ---
WARM = HexColor("#FFFDF8")
NAVY = HexColor("#172033")
GOLD = HexColor("#D9A514")
GOLD_HI = HexColor("#F0C84B")
GOLD_PALE = HexColor("#F6E9BD")
MUTED = HexColor("#747B87")
MUTED_LIGHT = HexColor("#8D949E")
CONTACT_GRAY = HexColor("#959DA7")
RULE = HexColor("#D8D6CF")
WHITE = HexColor("#FFFFFF")

FONT_LIGHT = "CO-Heiti-Light"
FONT_MEDIUM = "CO-Heiti-Medium"
FONT_EN = "CO-Arial"
FONT_EN_BOLD = "CO-Arial-Bold"


def register_fonts() -> None:
    pdfmetrics.registerFont(
        TTFont(FONT_LIGHT, "/System/Library/Fonts/STHeiti Light.ttc", subfontIndex=0)
    )
    pdfmetrics.registerFont(
        TTFont(FONT_MEDIUM, "/System/Library/Fonts/STHeiti Medium.ttc", subfontIndex=0)
    )
    pdfmetrics.registerFont(
        TTFont(FONT_EN, "/System/Library/Fonts/Supplemental/Arial.ttf")
    )
    pdfmetrics.registerFont(
        TTFont(FONT_EN_BOLD, "/System/Library/Fonts/Supplemental/Arial Bold.ttf")
    )


def width(text: str, font: str, size: float) -> float:
    return pdfmetrics.stringWidth(text, font, size)


def wrap_text(text: str, font: str, size: float, max_width: float) -> list[str]:
    lines: list[str] = []
    current = ""
    closing = "，。；：！？、）】》”’"
    for char in text:
        if char == "\n":
            lines.append(current.rstrip())
            current = ""
            continue
        trial = current + char
        if not current or width(trial, font, size) <= max_width or char in closing:
            current = trial
        else:
            lines.append(current.rstrip())
            current = char.lstrip()
    if current:
        lines.append(current.rstrip())
    return lines


# --------------------------------------------------------------------------- #
# Low-level shared helpers
# --------------------------------------------------------------------------- #
def paragraph(
    c: canvas.Canvas,
    text: str,
    x: float,
    y: float,
    max_width: float,
    *,
    font: str = FONT_LIGHT,
    size: float = 9.5,
    leading: float = 17,
    color: Color = MUTED,
    max_lines: int | None = None,
) -> float:
    lines = wrap_text(text, font, size, max_width)
    if max_lines is not None:
        lines = lines[:max_lines]
    c.setFillColor(color)
    c.setFont(font, size)
    for line in lines:
        c.drawString(x, y, line)
        y -= leading
    return y


def tracked_text(
    c: canvas.Canvas,
    text: str,
    x: float,
    y: float,
    *,
    font: str,
    size: float,
    color: Color,
    char_space: float = 0.55,
) -> None:
    text_object = c.beginText()
    text_object.setTextOrigin(x, y)
    text_object.setFont(font, size)
    text_object.setFillColor(color)
    text_object.setCharSpace(char_space)
    text_object.textOut(text)
    c.drawText(text_object)


def draw_link(c: canvas.Canvas, value: str, url: str, x: float, y: float, *, size: float) -> None:
    c.setFillColor(NAVY)
    c.setFont(FONT_EN, size)
    c.drawString(x, y, value)
    c.linkURL(url, (x, y - 2, x + width(value, FONT_EN, size), y + size + 2), relative=0)


def draw_section_eyebrow(c: canvas.Canvas, english: str, chinese: str, x: float, y: float, *, color: Color = GOLD) -> None:
    """Section eyebrow component: tracked English micro-label + '· 中文' label."""
    tracked_text(c, english, x, y, font=FONT_EN_BOLD, size=6.4, color=color, char_space=0.5)
    en_width = width(english, FONT_EN_BOLD, 6.4) + max(0, len(english) - 1) * 0.5
    c.setFillColor(color)
    c.setFont(FONT_MEDIUM, 6.5)
    c.drawString(x + en_width + 8, y, f"·  {chinese}")


def draw_page_header(c: canvas.Canvas, english: str, chinese: str, title: str, *, title_size: float = 23) -> None:
    """Page header component: warm background, brand line, eyebrow and title."""
    c.setFillColor(WARM)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)

    c.setFillColor(NAVY)
    c.setFont(FONT_MEDIUM, 7.6)
    c.drawString(M, PAGE_H - 30, "公民秩序主义")
    tracked_text(
        c,
        "CIVIC ORDERISM",
        PAGE_W - M - 77,
        PAGE_H - 30,
        font=FONT_EN_BOLD,
        size=5.5,
        color=MUTED,
        char_space=0.85,
    )

    draw_section_eyebrow(c, english, chinese, M, PAGE_H - 84)
    c.setFillColor(NAVY)
    c.setFont(FONT_MEDIUM, title_size)
    c.drawString(M, PAGE_H - 132, title)


def draw_footer(c: canvas.Canvas, page_no: int) -> None:
    """Footer component: rule, site line and page number (low visual weight)."""
    c.setStrokeColor(RULE)
    c.setLineWidth(0.55)
    c.line(M, 38, PAGE_W - M, 38)
    c.setFillColor(MUTED)
    c.setFont(FONT_EN, 6.2)
    c.drawString(M, 23, "Civic Orderism · civicorderism.com")
    c.drawRightString(PAGE_W - M, 23, f"{page_no} / 15")


def begin_page(c: canvas.Canvas, page_no: int, english: str, chinese: str, title: str, *, title_size: float = 23) -> float:
    draw_page_header(c, english, chinese, title, title_size=title_size)
    draw_footer(c, page_no)
    return PAGE_H - 182

# --------------------------------------------------------------------------- #
# Shared visual-system components
# --------------------------------------------------------------------------- #
def draw_core_statement(
    c: canvas.Canvas,
    text: str,
    x: float,
    y: float,
    max_width: float,
    *,
    size: float = 15,
    leading: float = 22,
    line_height: float | None = None,
) -> float:
    """Core Statement component: gold vertical bar + navy judgement sentence."""
    lines = wrap_text(text, FONT_MEDIUM, size, max_width - 26)
    height = line_height or max(38, len(lines) * leading + 8)
    c.setFillColor(GOLD)
    c.rect(x, y - height + 5, 3.1, height, fill=1, stroke=0)
    c.setFillColor(NAVY)
    c.setFont(FONT_MEDIUM, size)
    text_y = y - 6
    for line in lines:
        c.drawString(x + 15, text_y, line)
        text_y -= leading
    return y - height


def short_statement(c: canvas.Canvas, text: str, x: float, y: float, max_width: float, *, size: float = 13.2) -> float:
    """Short gold line + navy statement (bottom emphasis, CORE STATEMENT family)."""
    c.setStrokeColor(GOLD)
    c.setLineWidth(2.1)
    c.line(x, y, x + 62, y)
    return paragraph(c, text, x, y - 27, max_width, font=FONT_MEDIUM, size=size, leading=19, color=NAVY)


def draw_structure_number(
    c: canvas.Canvas,
    number: str,
    title: str,
    body: str,
    x: float,
    y: float,
    *,
    number_size: float,
    number_x: float,
    number_y: float,
    title_x: float,
    title_y: float,
    title_size: float,
    body_x: float,
    body_y: float,
    body_width: float,
    body_size: float,
    body_leading: float,
    body_max_lines: int,
    body_color: Color = MUTED,
) -> None:
    """Shared 'gold number + navy title + muted body' unit for structure layouts."""
    c.setFillColor(GOLD)
    c.setFont(FONT_EN_BOLD, number_size)
    c.drawString(number_x, number_y, number)
    c.setFillColor(NAVY)
    c.setFont(FONT_MEDIUM, title_size)
    c.drawString(title_x, title_y, title)
    paragraph(
        c,
        body,
        body_x,
        body_y,
        body_width,
        size=body_size,
        leading=body_leading,
        color=body_color,
        max_lines=body_max_lines,
    )


def numbered_columns(
    c: canvas.Canvas,
    items: list[tuple[str, str, str]],
    x: float,
    y: float,
    width_total: float,
    *,
    top_gold: bool = True,
    body_size: float = 7.2,
) -> float:
    """STRUCTURE COLUMN layout: gold header rule + open grid columns."""
    count = len(items)
    col_w = width_total / count
    c.setStrokeColor(GOLD if top_gold else RULE)
    c.setLineWidth(1.25 if top_gold else 0.55)
    c.line(x, y, x + width_total, y)
    for index, (number, title, body) in enumerate(items):
        cx = x + index * col_w
        if index:
            c.setStrokeColor(RULE)
            c.setLineWidth(0.55)
            c.line(cx, y - 18, cx, y - 128)
        draw_structure_number(
            c,
            number,
            title,
            body,
            cx,
            y,
            number_size=18,
            number_x=cx + 7,
            number_y=y - 35,
            title_x=cx + 7,
            title_y=y - 58,
            title_size=10.5,
            body_x=cx + 7,
            body_y=y - 80,
            body_width=col_w - 14,
            body_size=body_size,
            body_leading=11.5,
            body_max_lines=4,
        )
    return y - 145


def numbered_rows(
    c: canvas.Canvas,
    items: list[tuple[str, str, str]],
    x: float,
    y: float,
    width_total: float,
    *,
    row_height: float = 68,
    title_size: float = 11,
    body_size: float = 8.2,
) -> float:
    """STRUCTURE ROW layout: ruled rows with left gold number."""
    for number, title, body in items:
        c.setStrokeColor(RULE)
        c.setLineWidth(0.55)
        c.line(x, y, x + width_total, y)
        draw_structure_number(
            c,
            number,
            title,
            body,
            x,
            y,
            number_size=17,
            number_x=x,
            number_y=y - 31,
            title_x=x + 52,
            title_y=y - 27,
            title_size=title_size,
            body_x=x + 205,
            body_y=y - 27,
            body_width=width_total - 205,
            body_size=body_size,
            body_leading=12.5,
            body_max_lines=3,
        )
        y -= row_height
    return y


def two_column_rows(
    c: canvas.Canvas,
    left: list[tuple[str, str, str]],
    right: list[tuple[str, str, str]],
    y: float,
    *,
    row_height: float = 78,
    body_size: float = 7.6,
    body_leading: float = 11.4,
) -> float:
    """Two open-grid columns of ruled rows (ACTION / boundary pages)."""
    gap = 28
    col_w = (CONTENT_W - gap) / 2
    max_rows = max(len(left), len(right))
    for column, rows in enumerate((left, right)):
        x = M + column * (col_w + gap)
        yy = y
        for number, title, body in rows:
            c.setStrokeColor(RULE)
            c.setLineWidth(0.55)
            c.line(x, yy, x + col_w, yy)
            draw_structure_number(
                c,
                number,
                title,
                body,
                x,
                yy,
                number_size=13,
                number_x=x,
                number_y=yy - 27,
                title_x=x + 42,
                title_y=yy - 25,
                title_size=10.3,
                body_x=x + 42,
                body_y=yy - 45,
                body_width=col_w - 42,
                body_size=body_size,
                body_leading=body_leading,
                body_max_lines=3,
            )
            yy -= row_height
    return y - max_rows * row_height

def draw_short_three_line_motif(c: canvas.Canvas, x: float, y: float) -> None:
    """Short three-line motif (secondary, P08). Reduced ~20% from the approved P08."""
    lines = [
        (GOLD_PALE, 1.4, 0),
        (GOLD_HI, 0.9, 6),
        (GOLD, 0.5, 12),
    ]
    for color, line_width, offset in lines:
        c.setStrokeColor(color)
        c.setLineWidth(line_width)
        c.line(x + offset, y, x + 22 + offset, y + 40)


draw_three_line_motif = draw_short_three_line_motif  # backward-compatible alias


def draw_full_three_line_motif(c: canvas.Canvas) -> None:
    """Full three-line motif (PATH, P12): three parallel gold lines upward-forward."""
    for color, line_width, offset in ((GOLD_PALE, 3.8, 0), (GOLD_HI, 2.4, 11), (GOLD, 1.45, 21)):
        c.setStrokeColor(color)
        c.setLineWidth(line_width)
        c.line(110 + offset, 247, 451 + offset, 710)


def draw_path_page(c: canvas.Canvas) -> None:
    """PATH page component (P12): full three-line motif + forward stages."""
    begin_page(c, 13, "DEVELOPMENT PATH", "发展路径", "发展路径")
    draw_full_three_line_motif(c)

    stages = [
        ("01", "公共表达", 104, 278),
        ("02", "组织筹备", 180, 376),
        ("03", "法人与董事会建立", 255, 474),
        ("04", "合规运行", 334, 570),
        ("05", "稳定机构关系", 410, 660),
    ]
    for number, title, x, y in stages:
        if number == "02":
            tracked_text(c, "CURRENT STAGE", x, y + 28, font=FONT_EN_BOLD, size=5.3, color=GOLD, char_space=0.55)
        c.setFillColor(GOLD)
        c.setFont(FONT_EN_BOLD, 17)
        c.drawString(x, y, number)
        c.setFillColor(NAVY)
        c.setFont(FONT_MEDIUM, 9.2)
        lines = wrap_text(title, FONT_MEDIUM, 9.2, 105)
        for line_index, line in enumerate(lines[:2]):
            c.drawString(x, y - 20 - line_index * 13, line)

    draw_core_statement(c, "当前任务，是完成从公共项目到正式组织的制度转换。", M, 175, CONTENT_W, size=13.4)
    c.showPage()


def draw_public(c: canvas.Canvas, label: str, value: str, url: str, x: float, y: float, *, last: bool = False) -> float:
    """Public dissemination channel: muted label + linked handle on one line."""
    c.setFillColor(MUTED)
    c.setFont(FONT_MEDIUM, 6.4)
    c.drawString(x, y, label)
    x += width(label, FONT_MEDIUM, 6.4) + 6
    draw_link(c, value, url, x, y, size=6.4)
    x += width(value, FONT_EN, 6.4)
    if not last:
        c.setFillColor(MUTED)
        c.setFont(FONT_EN, 6.4)
        c.drawString(x + 5, y, "·")
        return x + 16
    return x


def page_15(c: canvas.Canvas) -> None:
    """P15 · OFFICIAL CONTACT — 正式联系方式与现阶段边界（收尾页，frozen preview）。"""
    y = begin_page(c, 15, "OFFICIAL CONTACT", "正式联系方式", "正式联系方式与现阶段边界", title_size=22)

    boundary = [
        "公民秩序主义当前以官方网站和官方邮箱作为正式联系渠道。",
        "涉及首届董事会筹备、法人设立、组织治理、机构联系及其他需要持续跟进的正式事务，优先通过主联系邮箱联系。",
        "公民秩序主义现阶段不建立公开群组、聊天群或非正式社群，也不通过群聊组织事务。",
        "现阶段不开展募款、捐款征集、会员费收取或其他资金募集活动。",
        "X 与 YouTube 主要用于公共发布与信息传播，不作为正式组织授权、治理或人员身份确认的依据。",
        "任何涉及组织身份、代表权限、正式合作或持续参与的事项，均以官方网站、正式邮箱及后续明确的书面授权为准。",
    ]
    for line in boundary:
        y = paragraph(c, line, M, y, 468, size=9, leading=18, color=MUTED)
    y -= 18

    # 收口 Core Statement（短金线 + 深蓝判断句）
    c.setStrokeColor(GOLD)
    c.setLineWidth(2.1)
    c.line(M, y, M + 62, y)
    y = paragraph(
        c,
        "现阶段，公民秩序主义只接受身份、职责和授权明确的正式参与，不通过群组、募款或非正式协作扩大组织活动。",
        M,
        y - 27,
        CONTENT_W,
        font=FONT_MEDIUM,
        size=13,
        leading=22,
        color=NAVY,
    )
    y -= 30

    # 正式联系渠道 — 主联系邮箱为第一入口
    official = [
        ("主联系邮箱", "civicorderism@gmail.com", "mailto:civicorderism@gmail.com"),
        ("官方网站", "civicorderism.com", "https://civicorderism.com/"),
        ("董事会筹备页面", "civicorderism.com/preparation", "https://civicorderism.com/preparation"),
        ("备用联系邮箱", "citizenorder@proton.me", "mailto:citizenorder@proton.me"),
    ]
    cy = y
    for i, (label, value, url) in enumerate(official):
        if i == 0:
            c.setFillColor(NAVY)
            c.setFont(FONT_MEDIUM, 7.0)
        else:
            c.setFillColor(MUTED)
            c.setFont(FONT_LIGHT, 6.6)
        c.drawString(M, cy, label)
        draw_link(c, value, url, M + 104, cy, size=7.0 if i == 0 else 6.6)
        cy -= 17

    # 公共传播渠道 — 明显轻于正式联系渠道
    c.setFillColor(MUTED)
    c.setFont(FONT_LIGHT, 6.4)
    c.drawString(M, cy, "公共发布渠道")
    x = M + 104
    x = draw_public(c, "X 官方账号", "@CivicOrderism", "https://x.com/CivicOrderism", x, cy)
    draw_public(c, "YouTube 官方频道", "Civic Orderism", "https://www.youtube.com/@CivicOrderism", x, cy, last=True)

    # QR（筹备页）+ label + metadata — 紧贴内容块下方
    qr = QrCodeWidget("https://civicorderism.com/preparation")
    bounds = qr.getBounds()
    qr_anchor = y
    qr_size = 56
    drawing = Drawing(
        qr_size,
        qr_size,
        transform=[qr_size / (bounds[2] - bounds[0]), 0, 0, qr_size / (bounds[3] - bounds[1]), 0, 0],
    )
    drawing.add(qr)
    renderPDF.draw(drawing, c, PAGE_W - M - qr_size, qr_anchor - 70)
    c.setFillColor(MUTED)
    c.setFont(FONT_EN, 5.4)
    c.drawRightString(PAGE_W - M, qr_anchor - 84, "civicorderism.com/preparation")
    c.drawString(M, qr_anchor - 84, "Version 1.4 · 2026")
    c.drawString(M + 100, qr_anchor - 84, "Document ID · CO-2026-002 · FOUNDING STAGE")
    c.showPage()

# --------------------------------------------------------------------------- #
# C3 cover (unchanged approved implementation)
# --------------------------------------------------------------------------- #
def draw_cover(c: canvas.Canvas) -> None:
    # Concept C3 · Forward. Coordinates are mapped from the approved 2480 ×
    # 3508 px design preview so the production PDF remains fully vector-based.
    design_w, design_h = 2480.0, 3508.0
    sx, sy = PAGE_W / design_w, PAGE_H / design_h
    warm = HexColor("#FFFDF8")
    cover_navy = HexColor("#172033")
    cover_gold = HexColor("#D9A514")
    cover_gold_hi = HexColor("#F0C84B")
    cover_gold_pale = HexColor("#F6E9BD")
    cover_muted = HexColor("#747B87")
    cover_meta = HexColor("#C6D0DC")

    def px(value: float) -> float:
        return value * sx

    def py(value: float) -> float:
        return PAGE_H - value * sy

    def polygon(points: list[tuple[float, float]], color: Color) -> None:
        path = c.beginPath()
        first_x, first_y = points[0]
        path.moveTo(px(first_x), py(first_y))
        for point_x, point_y in points[1:]:
            path.lineTo(px(point_x), py(point_y))
        path.close()
        c.setFillColor(color)
        c.drawPath(path, fill=1, stroke=0)

    def tracked_text(
        text: str,
        x: float,
        y: float,
        *,
        font: str,
        size: float,
        color: Color,
        char_space: float,
    ) -> None:
        text_object = c.beginText()
        text_object.setTextOrigin(x, y)
        text_object.setFont(font, size)
        text_object.setFillColor(color)
        text_object.setCharSpace(char_space)
        text_object.textOut(text)
        c.drawText(text_object)

    c.setFillColor(warm)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)

    # One quiet arc balances the three straight lines without competing.
    center_x, center_y = 2320.0, 240.0
    radius_x = radius_y = 740.0
    arc = c.beginPath()
    for index, angle in enumerate(range(78, 177, 2)):
        radians = math.radians(angle)
        point_x = center_x + radius_x * math.cos(radians)
        point_y = center_y + radius_y * math.sin(radians)
        if index == 0:
            arc.moveTo(px(point_x), py(point_y))
        else:
            arc.lineTo(px(point_x), py(point_y))
    c.setStrokeColor(HexColor("#E7CD75"))
    c.setLineWidth(px(5))
    c.drawPath(arc, fill=0, stroke=1)

    # Three straight, parallel gold planes preserve Concept C's single visual
    # language and explicit upward-forward movement.
    polygon([(1220, 2570), (1400, 2635), (2480, 610), (2480, 280)], cover_gold_pale)
    polygon([(1420, 2440), (1525, 2480), (2480, 590), (2480, 395)], cover_gold_hi)
    polygon([(1600, 2310), (1655, 2332), (2480, 810), (2480, 700)], cover_gold)

    # The navy base averages roughly 16% of the page and remains subordinate.
    polygon([(0, 3045), (2480, 2830), (2480, 3508), (0, 3508)], cover_navy)

    # Brand.
    c.setFillColor(cover_navy)
    c.setFont(FONT_MEDIUM, 14)
    c.drawString(px(220), py(262), "公民秩序主义")
    tracked_text(
        "CIVIC ORDERISM",
        px(220),
        py(324),
        font=FONT_EN_BOLD,
        size=6,
        color=cover_muted,
        char_space=0.95,
    )

    # Publication hierarchy.
    tracked_text(
        "FOUNDING BOARD PREPARATION · 2026",
        px(220),
        py(758),
        font=FONT_EN_BOLD,
        size=7,
        color=cover_gold,
        char_space=0.48,
    )
    c.setFillColor(cover_navy)
    c.setFont(FONT_MEDIUM, 35.5)
    c.drawString(px(220), py(970), "北美非营利组织及")
    c.drawString(px(220), py(1170), "首届董事会筹备文件")

    # Mission statement.
    c.setFillColor(cover_gold)
    c.rect(px(220), py(1482), px(14), px(122), fill=1, stroke=0)
    c.setFillColor(cover_navy)
    c.setFont(FONT_MEDIUM, 11.5)
    c.drawString(px(262), py(1421), "为和平政治转轨建立信任、能力与人才。")

    tracked_text(
        "FORWARD · FORMATION · RESPONSIBILITY",
        px(220),
        py(2402),
        font=FONT_EN_BOLD,
        size=6,
        color=cover_navy,
        char_space=0.72,
    )

    # Quiet metadata block inside the navy foundation.
    c.setStrokeColor(HexColor("#536176"))
    c.setLineWidth(px(3))
    c.line(px(220), py(3090), px(2260), py(3090))
    tracked_text(
        "CIVIC ORDERISM · OFFICIAL DOCUMENT SERIES",
        px(220),
        py(3168),
        font=FONT_EN_BOLD,
        size=5.5,
        color=cover_gold_hi,
        char_space=0.48,
    )
    c.setFillColor(cover_meta)
    c.setFont(FONT_EN, 6.5)
    c.drawString(px(220), py(3243), "Version 1.4 · 2026")
    c.drawString(px(220), py(3295), "Document ID · CO-2026-002")
    c.setFillColor(WHITE)
    c.setFont(FONT_EN_BOLD, 6)
    c.drawRightString(px(2260), py(3243), "FOUNDING STAGE")
    c.setFillColor(cover_meta)
    c.setFont(FONT_EN, 6.5)
    c.drawRightString(px(2260), py(3295), "civicorderism.com")
    c.showPage()

# --------------------------------------------------------------------------- #
# Inner pages (approved Inner Page Visual System)
# --------------------------------------------------------------------------- #
def page_02(c: canvas.Canvas) -> None:
    y = begin_page(c, 2, "DOCUMENT NOTE", "文件说明", "关于本文件")
    y = draw_core_statement(c, "本文件正式启动公民秩序主义北美非营利法人及首届董事会的前期筹备工作。", M, y, CONTENT_W, size=14.5)
    y -= 33
    y = paragraph(
        c,
        "当前首要任务，是完成法人设立与首届董事会筹备，使公民秩序主义第一次具备正式治理、责任承担和机构对接能力。",
        M,
        y,
        425,
        size=10,
        leading=18,
        color=MUTED,
    )
    y -= 40
    draw_section_eyebrow(c, "CURRENT STATUS", "当前状态", M, y)
    y -= 34
    numbered_columns(
        c,
        [
            ("01", "法人", "法人尚未完成注册。"),
            ("02", "董事会", "首届董事会尚未依法产生。"),
            ("03", "文件状态", "本文件为正式公开的筹备文件。"),
        ],
        M,
        y,
        CONTENT_W,
        body_size=8.2,
    )
    c.showPage()


def page_03(c: canvas.Canvas) -> None:
    y = begin_page(c, 3, "WHY NOW", "为什么必须从现在开始", "为什么必须从现在开始")
    y = draw_core_statement(c, "政治信誉、组织能力和人才储备，都无法在政治窗口出现以后临时建立。", M, y, CONTENT_W, size=16)
    y -= 32
    y = paragraph(
        c,
        "一个能够承担公共责任的组织，需要时间形成治理习惯、合作关系和可信记录。\n如果等到现实政治窗口已经出现，再开始寻找人员、建立组织和积累信任，就已经太晚。",
        M,
        y,
        425,
        size=10,
        leading=18,
        color=MUTED,
    )
    y -= 36
    numbered_columns(
        c,
        [
            ("01", "信誉", "需要积累"),
            ("02", "组织", "需要磨合"),
            ("03", "人才", "需要检验"),
            ("04", "信任", "需要时间"),
        ],
        M,
        y,
        CONTENT_W,
        body_size=8,
    )
    short_statement(c, "真正的政治准备，必须发生在政治窗口出现之前。", M, y - 180, CONTENT_W, size=14)
    c.showPage()


def page_04(c: canvas.Canvas) -> None:
    y = begin_page(c, 4, "FORMAL ORGANIZATION", "正式组织", "为什么必须形成正式组织？")
    y = draw_core_statement(c, "个人可以表达观点，只有组织才能承担持续责任。", M, y, CONTENT_W, size=15.5)
    y -= 38
    gap = 36
    col_w = (CONTENT_W - gap) / 2
    columns = [
        (
            "个人表达的边界",
            "个人可以提出判断、形成理论、进行公共表达。\n\n但个人无法长期替代一个组织承担正式承诺、持续责任、组织授权和机构关系。",
        ),
        (
            "组织存在的意义",
            "正式组织能够明确：\n\n谁代表组织，\n谁拥有授权，\n谁承担责任，\n人员变化后既有承诺如何继续。",
        ),
    ]
    # Both peer columns share the same structure header (equal visual weight).
    for index, (title, body) in enumerate(columns):
        x = M + index * (col_w + gap)
        c.setStrokeColor(GOLD)
        c.setLineWidth(1.25)
        c.line(x, y, x + col_w, y)
        c.setFillColor(NAVY)
        c.setFont(FONT_MEDIUM, 14)
        c.drawString(x, y - 37, title)
        paragraph(c, body, x, y - 72, col_w, size=9.3, leading=17, color=MUTED)
    short_statement(c, "只有组织，才能与组织建立稳定的信任与对接关系。", M, y - 260, CONTENT_W, size=14)
    c.showPage()


def page_05(c: canvas.Canvas) -> None:
    y = begin_page(c, 5, "03 · LEGAL ENTITY & FOUNDING BOARD", "法人与董事会", "为什么第一步是法人和首届董事会？", title_size=21)
    y = draw_core_statement(c, "法人解决主体问题，董事会解决治理问题。", M, y, CONTENT_W, size=15.2)
    y -= 28
    y = paragraph(
        c,
        "当组织开始涉及资金、人员、长期协作和对外联系，就不能继续依靠个人临时处理。法人和董事会共同使组织第一次具备责任主体、治理程序和对外代表。",
        M,
        y,
        430,
        size=9.5,
        leading=17,
        color=MUTED,
    )
    y -= 44
    numbered_columns(
        c,
        [
            ("01", "法律", "谁承担法律责任。"),
            ("02", "财务", "资金如何记录、审批和监督。"),
            ("03", "人员", "谁以什么身份参与。"),
            ("04", "授权", "谁可以决定什么、代表什么。"),
            ("05", "对接", "谁可以代表组织与其他机构建立正式联系。"),
        ],
        M,
        y,
        CONTENT_W,
        body_size=6.8,
    )
    short_statement(c, "法人和董事会建立后，组织事务将从个人处理进入正式治理。", M, y - 185, CONTENT_W, size=13.5)
    c.showPage()


def page_06(c: canvas.Canvas) -> None:
    y = begin_page(c, 6, "04 · FOUNDING BOARD TASKS", "阶段性任务", "首届董事会的阶段性任务")
    y = numbered_rows(
        c,
        [
            ("01", "完成法人设立", "完成注册、章程及必要治理文件。"),
            ("02", "建立基本治理规则", "明确董事会权限、决策程序和记录要求。"),
            ("03", "建立基础财务制度", "形成账户、审批、记录与监督机制。"),
            ("04", "明确人员与授权关系", "确定董事及未来正式职能人员的身份、职责和权限。"),
            ("05", "建立正式对外代表机制", "明确谁可以代表组织、建立联系并作出组织承诺。"),
        ],
        M,
        y,
        CONTENT_W,
        row_height=72,
    )
    draw_core_statement(
        c,
        "首届董事会不仅承担法人初建与治理任务，也承担早期组织人才的识别、培养与检验。",
        M,
        y - 22,
        CONTENT_W,
        size=13.2,
    )
    c.showPage()


def part_header(c: canvas.Canvas, english: str, chinese: str, y: float) -> None:
    """Part label inside a page (gold micro-label, restrained English)."""
    tracked_text(c, english, M, y, font=FONT_EN_BOLD, size=5.6, color=GOLD, char_space=0.5)
    ew = width(english, FONT_EN_BOLD, 5.6) + max(0, len(english) - 1) * 0.5
    c.setFillColor(GOLD)
    c.setFont(FONT_MEDIUM, 6.0)
    c.drawString(M + ew + 8, y, f"·  {chinese}")


def page_responsibility(c: canvas.Canvas) -> None:
    """P07 · 首届董事会的责任与权利 — responsibility part (frozen preview)."""
    y = begin_page(c, 7, "RESPONSIBILITY & RIGHTS", "责任与权利", "首届董事会的责任与权利", title_size=22)
    y = paragraph(
        c,
        "首届董事会不是荣誉席位，也不是未来政治身份的提前授予。",
        M, y, CONTENT_W,
        font=FONT_MEDIUM, size=10.5, leading=18, color=NAVY,
    )
    y = paragraph(
        c,
        "它首先是一份真实的治理责任，同时也是参与者积累政治能力、公共履历与社会信誉的起点。",
        M, y, CONTENT_W,
        size=9.5, leading=17, color=MUTED,
    )
    y -= 12
    part_header(c, "RESPONSIBILITY", "董事会承担的责任", y)
    y -= 28
    y = numbered_rows(
        c,
        [
            ("01", "建立组织", "参与完成法人设立、董事会建立和基本治理规则形成，使公民秩序主义成为责任主体明确、能够长期运行的正式组织。"),
            ("02", "承担治理", "持续审议重大事项，参与组织决策，并对自己的判断、表决和治理行为承担责任。"),
            ("03", "维护规则", "维护组织的身份、职责和授权边界，持续关注法律、财务、人员与组织运行风险，保证重要事务按照明确程序处理。"),
            ("04", "保持连续", "保证人员变化不会破坏组织运行，使已经形成的规则、授权、记录和责任关系能够长期延续。"),
            ("05", "培养人才", "参与识别、训练和检验早期组织人才，在真实治理中逐步形成能够承担更大公共责任的政治与组织能力。"),
        ],
        M, y, CONTENT_W,
        row_height=68,
    )
    y -= 12
    draw_core_statement(
        c,
        "董事会首先是一套责任机制。成为董事，意味着开始为组织的决定、规则和未来承担真实责任。",
        M, y, CONTENT_W,
        size=13.5,
    )
    c.showPage()


def page_rights(c: canvas.Canvas) -> None:
    """P08 · 董事能够获得的权利 — rights part (frozen preview)."""
    y = begin_page(c, 8, "RESPONSIBILITY & RIGHTS", "责任与权利", "董事能够获得的权利", title_size=22)
    y = paragraph(
        c,
        "公民秩序主义不认为长期政治参与只能依靠奉献和牺牲。",
        M, y, CONTENT_W,
        font=FONT_MEDIUM, size=10.5, leading=18, color=NAVY,
    )
    y = paragraph(
        c,
        "真正承担责任的人，也应当通过长期实践获得与其贡献相匹配的能力、履历、信誉与声望。",
        M, y, CONTENT_W,
        size=9.5, leading=17, color=MUTED,
    )
    y -= 12
    part_header(c, "PUBLIC RECORD", "能力、履历、信誉与声望", y)
    y -= 28
    y = numbered_rows(
        c,
        [
            ("01", "政治实践", "直接参与组织治理、决策、授权和公共事务，在真实环境中学习如何承担政治责任。"),
            ("02", "能力积累", "通过长期处理实际问题，形成议事、决策、协作、组织治理和公共沟通能力。"),
            ("03", "公共履历", "个人承担过什么责任、参与过什么治理、作出过什么判断，应当形成长期、真实、可以验证的公共记录。"),
            ("04", "信誉与声望", "长期贡献应当被记录。能力、责任和实际表现，也应当逐步转化为能够经受社会检验的公共信誉与政治声望。"),
            ("05", "面向未来民选政治的基础", "公民秩序主义推动的，是一种依靠履历、能力、责任和信誉赢得选民信任的政治秩序。首届董事会提供了从今天开始建立这些基础的真实机会。"),
        ],
        M, y, CONTENT_W,
        row_height=68,
    )
    y -= 10
    c.setFillColor(NAVY)
    c.setFont(FONT_MEDIUM, 9.6)
    c.drawString(M, y, "公民秩序主义不预先承诺任何未来职位，也不因为首届董事身份赋予任何人未来的政治位置。")
    y -= 30
    draw_core_statement(
        c,
        "未来的政治位置不能提前分配，未来政治人物的履历必须从今天开始建立。",
        M, y, CONTENT_W,
        size=13.5,
    )
    c.showPage()

def page_08(c: canvas.Canvas) -> None:
    y = begin_page(c, 9, "05 · FOUNDING BOARD PARTICIPANTS", "参与者", "什么样的人适合成为首届董事", title_size=22)
    y = paragraph(
        c,
        "公民秩序主义对首届董事的判断，首先不是从职业、学历、资源或者社会身份开始。",
        M,
        y,
        CONTENT_W,
        font=FONT_MEDIUM,
        size=10.4,
        leading=18,
        color=NAVY,
    )
    y -= 24
    y = draw_core_statement(c, "第一标准，是对中国及中国人民怀有坚定而深厚的信念。", M, y, 440, size=15.4)
    draw_three_line_motif(c, PAGE_W - M - 72, y + 26)
    # Inter-module gaps tightened ~10% (approved refinement).
    y -= 20
    c.setFillColor(GOLD)
    c.setFont(FONT_MEDIUM, 7.2)
    c.drawString(M, y, "信念意味着什么")
    y -= 26
    y = paragraph(c, "这种信念不是抽象的民族情绪，也不是简单的政治立场。", M, y, CONTENT_W, font=FONT_MEDIUM, size=10.4, leading=18, color=NAVY)
    y -= 10
    y = paragraph(
        c,
        "它意味着相信中国仍然值得拥有一个更好的未来，相信中国人民有能力生活在一个更有尊严、更有保障、更有预期的社会之中；也意味着愿意为这个目标投入时间、承担责任，并接受这可能是一项漫长而艰难的工作。",
        M,
        y,
        CONTENT_W,
        size=9.4,
        leading=16.2,
        color=MUTED,
    )
    # Inter-module gap tightened ~10% (approved refinement).
    y -= 17
    c.setFillColor(GOLD)
    c.setFont(FONT_MEDIUM, 7.2)
    c.drawString(M, y, "能力可以培养")
    y -= 26
    y = paragraph(
        c,
        "首届董事会当然需要能力。法律、财务、组织治理、公共沟通、研究、技术以及社会资源，都会决定一个组织能够走多远。但在创立阶段，公民秩序主义并不要求每一位董事从加入之初就具备完整的专业能力。",
        M,
        y,
        CONTENT_W,
        size=9.3,
        leading=16,
        color=MUTED,
    )
    short_statement(c, "技术不足可以学习，经验不足可以积累，能力不足可以锻炼。", M, y - 20, CONTENT_W, size=13)
    c.showPage()


def page_09(c: canvas.Canvas) -> None:
    y = begin_page(c, 10, "FOUNDING BOARD STANDARD", "首届董事标准", "信念、品格与责任")
    y = paragraph(
        c,
        "组织本身就应该具有培养人的能力。今天尚不成熟的人，可以在长期共同工作中成长为可靠的组织者、管理者和政治人才。",
        M,
        y,
        CONTENT_W,
        size=9.5,
        leading=16.5,
        color=MUTED,
    )
    y -= 18
    y = paragraph(
        c,
        "首届董事的基本判断包括：信念、品格、责任感、规则意识、学习能力与长期投入意愿。",
        M,
        y,
        CONTENT_W,
        font=FONT_MEDIUM,
        size=10.4,
        leading=18,
        color=NAVY,
    )
    y -= 23
    c.setFillColor(GOLD)
    c.setFont(FONT_MEDIUM, 7.2)
    c.drawString(M, y, "信念无法替代")
    y -= 26
    y = paragraph(c, "但有一样东西很难通过培训获得：", M, y, CONTENT_W, font=FONT_MEDIUM, size=10.2, leading=18, color=NAVY)
    y -= 12
    y = draw_core_statement(c, "一个人是否真正相信中国值得为之付出，是否真正对中国人民怀有责任。", M, y, CONTENT_W, size=13.8)
    y -= 18
    y = paragraph(c, "如果缺少这一点，再优秀的履历、再丰富的资源、再强的专业能力，都无法替代。", M, y, CONTENT_W, size=9.5, leading=16.5, color=MUTED)
    y -= 20
    c.setFillColor(GOLD)
    c.setFont(FONT_MEDIUM, 7.2)
    c.drawString(M, y, "我们寻找什么")
    y -= 25
    y = paragraph(
        c,
        "因此，公民秩序主义寻找的不是一份漂亮的董事履历，也不是几个能够装点组织门面的名字。公民秩序主义寻找的是这样一群人：相信中国仍有未来，相信中国人民值得一个更好的政治秩序；能够保持理性与克制，尊重规则与责任；愿意从一个尚在建立中的组织开始，与其他人共同学习、共同承担、共同成长。",
        M,
        y,
        CONTENT_W,
        size=9.1,
        leading=15.4,
        color=MUTED,
    )
    y -= 17
    y = paragraph(c, "首届董事会不是荣誉席位，也不是政治身份。它首先是一份责任。", M, y, CONTENT_W, font=FONT_MEDIUM, size=11.4, leading=18, color=NAVY)
    y -= 16
    paragraph(
        c,
        "能力决定一个人能够承担多少工作，品格决定一个人如何使用自己的能力，而最根本的信念，决定一个人在困难、漫长和无人喝彩的时候，是否仍然愿意承担这份责任。",
        M,
        y,
        CONTENT_W,
        size=9.2,
        leading=15.7,
        color=MUTED,
    )
    c.showPage()

def page_10(c: canvas.Canvas) -> None:
    y = begin_page(c, 11, "PARTICIPATION BOUNDARIES", "参与边界", "参与边界")
    y = draw_core_statement(c, "先明确身份，再参与事务；先明确授权，再承担职责。", M, y, CONTENT_W, size=14.5)
    y -= 34
    y = numbered_columns(
        c,
        [
            ("01", "身份", "以什么身份参与"),
            ("02", "职责", "负责什么"),
            ("03", "授权", "可以决定什么"),
            ("04", "责任", "向谁负责"),
        ],
        M,
        y,
        CONTENT_W,
        body_size=7.8,
    )
    y -= 20

    # Second numbering group uses Q1/Q2/Q3 so the 01–04 boundary columns and the
    # Q&A rows are not visually confused (P2 fix; body content unchanged).
    c.setStrokeColor(RULE)
    c.setLineWidth(0.55)
    c.line(M, y, PAGE_W - M, y)
    c.setFillColor(GOLD)
    c.setFont(FONT_EN_BOLD, 17)
    c.drawString(M, y - 31, "Q1")
    c.setFillColor(NAVY)
    c.setFont(FONT_MEDIUM, 10)
    c.drawString(M + 52, y - 27, "是否必须接受全部理论？")
    paragraph(
        c,
        "不要求。首届董事不需要对公民秩序主义现有全部理论判断保持一致，但必须认同基本政治方向与组织原则：和平政治转轨、反对暴力与社会撕裂、尊重程序与责任，并对中国及中国人民具有长期责任意识。",
        M + 52,
        y - 51,
        CONTENT_W - 52,
        size=7.45,
        leading=12,
        color=MUTED,
        max_lines=4,
    )
    paragraph(
        c,
        "理论可以存在分歧，基本方向、程序原则与责任底线必须一致。",
        M + 52,
        y - 99,
        CONTENT_W - 52,
        font=FONT_MEDIUM,
        size=8.5,
        leading=14,
        color=NAVY,
    )
    y -= 126
    y = numbered_rows(
        c,
        [
            ("Q2", "是否可以先提供专业协助？", "可以先建立联系，但实际组织事务只由身份、职责和授权明确的人员承担。"),
            ("Q3", "是否要求公开身份？", "依适用法律、登记要求及具体职责确定。"),
        ],
        M,
        y,
        CONTENT_W,
        row_height=72,
        title_size=10,
        body_size=7.5,
    )
    c.showPage()


def page_11(c: canvas.Canvas) -> None:
    """P12 · 当前阶段 — 阶段定位 / YOU ARE HERE（frozen revision）。"""
    y = begin_page(c, 12, "06 · CURRENT STAGE", "当前阶段", "当前阶段", title_size=22)
    y = paragraph(
        c,
        "公民秩序主义已经完成从政治观点表达向组织建设的转向。",
        M, y, CONTENT_W,
        font=FONT_MEDIUM, size=11.5, leading=20, color=NAVY,
    )
    y -= 34

    # 当前位置 — “正式组织建立阶段”（无卡片、无箭头）
    c.setFillColor(GOLD)
    c.setFont(FONT_MEDIUM, 6.0)
    c.drawString(M, y, "当前位置")
    y -= 32
    c.setFillColor(NAVY)
    c.setFont(FONT_MEDIUM, 15)
    c.drawString(M, y, "正式组织建立阶段")
    y -= 30
    y = paragraph(
        c,
        "以北美非营利法人和首届董事会为起点，建立明确的治理、责任、授权和长期运行基础。",
        M, y, CONTENT_W,
        size=9.5, leading=17, color=MUTED,
    )
    y -= 26

    y = paragraph(
        c,
        "这一阶段的重点不是扩大人员规模，而是先把组织本身建立起来。",
        M, y, CONTENT_W,
        size=9.5, leading=17, color=MUTED,
    )
    y -= 24
    y = paragraph(
        c,
        "完成这一阶段之后，公民秩序主义才具备进一步发展组织能力、培养政治人才和建立长期公共信誉的正式基础。",
        M, y, CONTENT_W,
        size=9.5, leading=17, color=MUTED,
    )
    y -= 30

    # 唯一 Core Statement
    c.setStrokeColor(GOLD)
    c.setLineWidth(2.1)
    c.line(M, y, M + 62, y)
    y = paragraph(
        c,
        "先建立能够承担责任的组织，再扩大组织能够承担的责任。",
        M, y - 27, CONTENT_W,
        font=FONT_MEDIUM, size=13.5, leading=20, color=NAVY,
    )
    c.showPage()


def page_14(c: canvas.Canvas) -> None:
    """P14 · ACTION — 参与首届董事会筹备（单一职责：先回答为什么来 + 01–05）。"""
    y = begin_page(c, 14, "C · FOUNDING BOARD PARTICIPATION", "行动入口", "参与首届董事会筹备", title_size=22)

    draw_section_eyebrow(c, "INITIAL CONTACT", "初次联系可说明", M, y)
    y -= 40
    c.setFillColor(NAVY)
    c.setFont(FONT_MEDIUM, 11.8)
    c.drawString(M, y, "先回答为什么来，再回答会什么。")
    y -= 50

    initial = [
        ("01", "为什么愿意参与首届董事会筹备", "简要说明为什么希望参与，以及如何理解这项工作的意义。"),
        ("02", "所在地区", "当前所在国家、城市或大致地区。"),
        ("03", "专业背景", "职业、专业方向或能够长期贡献的领域。"),
        ("04", "相关经验", "可说明组织治理、法律、财务、研究、传播、技术、公共事务等相关经历。没有相关经历不构成排除条件。"),
        ("05", "可以承担的长期责任", "可以投入的大致时间、希望承担的工作，以及是否愿意长期参与董事会治理。"),
    ]
    c.setStrokeColor(GOLD)
    c.setLineWidth(1.1)
    c.line(M, y, PAGE_W - M, y)
    c.setFillColor(GOLD)
    c.setFont(FONT_EN_BOLD, 16)
    c.drawString(M, y - 32, "01")
    c.setFillColor(NAVY)
    c.setFont(FONT_MEDIUM, 10.6)
    c.drawString(M + 52, y - 27, initial[0][1])
    paragraph(c, initial[0][2], M + 52, y - 47, 360, size=8.3, leading=13, color=MUTED)
    y -= 95

    y = two_column_rows(
        c,
        [initial[1], initial[3]],
        [initial[2], initial[4]],
        y,
        row_height=88,
        body_size=8.3,
        body_leading=13,
    )
    c.showPage()


def build() -> Path:
    register_fonts()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUTPUT), pagesize=A4, pageCompression=1)
    c.setTitle("公民秩序主义北美非营利组织及首届董事会筹备文件")
    c.setSubject("North American Nonprofit & Founding Board Preparation · Version 1.4")
    c.setAuthor("Civic Orderism")
    c.setKeywords("Civic Orderism, 公民秩序主义, nonprofit, founding board, governance, peaceful political transition")

    pages = [
        draw_cover,
        page_02,
        page_03,
        page_04,
        page_05,
        page_06,
        page_responsibility,
        page_rights,
        page_08,
        page_09,
        page_10,
        page_11,
        draw_path_page,
        page_14,
        page_15,
    ]
    for page in pages:
        page(c)
    c.save()
    return OUTPUT


if __name__ == "__main__":
    print(build())
