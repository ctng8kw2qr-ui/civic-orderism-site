#!/usr/bin/env python3
"""Generate the editable V1.4 founding-board preparation brief.

The source deliberately uses ReportLab primitives instead of a slide template so
the document remains a formal publication: typography, rules, grid, spacing and
numbering carry the hierarchy. Run from the repository root.
"""

from __future__ import annotations

import math
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
OUTPUT = ROOT / "output" / "pdf" / "civic-orderism-founding-board-brief-2026-final.pdf"
LOGO = ROOT / "quartz" / "static" / "logo.png"

PAGE_W, PAGE_H = A4
MARGIN_X = 56
CONTENT_W = PAGE_W - MARGIN_X * 2

NAVY = HexColor("#061D33")
NAVY_2 = HexColor("#102A43")
INK = HexColor("#19232E")
BODY = HexColor("#3D4650")
MUTED = HexColor("#727B84")
GOLD = HexColor("#B8944B")
GOLD_LIGHT = HexColor("#D8C28D")
PALE = HexColor("#EEF3F6")
PALE_2 = HexColor("#F7F9FA")
RULE = HexColor("#D8DEE3")
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


def draw_text(
    c: canvas.Canvas,
    text: str,
    x: float,
    y: float,
    max_width: float,
    *,
    font: str = FONT_LIGHT,
    size: float = 10.5,
    leading: float = 18,
    color: Color = BODY,
    max_lines: int | None = None,
) -> float:
    c.setFont(font, size)
    c.setFillColor(color)
    lines = wrap_text(text, font, size, max_width)
    if max_lines is not None:
        lines = lines[:max_lines]
    for line in lines:
        c.drawString(x, y, line)
        y -= leading
    return y


def draw_centered_text(
    c: canvas.Canvas,
    text: str,
    center_x: float,
    y: float,
    max_width: float,
    *,
    font: str,
    size: float,
    leading: float,
    color: Color,
) -> float:
    lines = wrap_text(text, font, size, max_width)
    c.setFont(font, size)
    c.setFillColor(color)
    for line in lines:
        c.drawCentredString(center_x, y, line)
        y -= leading
    return y


def draw_rule(c: canvas.Canvas, y: float, x1: float = MARGIN_X, x2: float | None = None, color: Color = RULE, line_width: float = 0.6) -> None:
    c.setStrokeColor(color)
    c.setLineWidth(line_width)
    c.line(x1, y, x2 if x2 is not None else PAGE_W - MARGIN_X, y)


def draw_grid(c: canvas.Canvas, x: float, y: float, w: float, h: float, step: float = 16) -> None:
    c.saveState()
    c.setStrokeColor(HexColor("#E8EDF0"))
    c.setLineWidth(0.25)
    xx = x
    while xx <= x + w:
        c.line(xx, y, xx, y + h)
        xx += step
    yy = y
    while yy <= y + h:
        c.line(x, yy, x + w, yy)
        yy += step
    c.restoreState()


def draw_header_footer(c: canvas.Canvas, page_no: int, total: int = 13) -> None:
    c.setFillColor(INK)
    c.setFont(FONT_MEDIUM, 7.1)
    c.drawString(MARGIN_X, PAGE_H - 28, "公民秩序主义")
    c.setFillColor(MUTED)
    c.setFont(FONT_EN, 6.8)
    c.drawRightString(PAGE_W - MARGIN_X, PAGE_H - 28, "Civic Orderism")
    draw_rule(c, 31, color=RULE, line_width=0.45)
    c.setFillColor(MUTED)
    c.setFont(FONT_EN, 6.3)
    c.drawString(MARGIN_X, 18, "Civic Orderism · civicorderism.com")
    c.drawRightString(PAGE_W - MARGIN_X, 18, f"{page_no} / {total}")


def draw_eyebrow(c: canvas.Canvas, text: str, x: float, y: float, *, color: Color = GOLD) -> None:
    c.setFillColor(color)
    c.setFont(FONT_MEDIUM, 7.2)
    c.drawString(x, y, text.upper())


def draw_chapter_band(
    c: canvas.Canvas,
    page_no: int,
    number: str,
    english: str,
    title: str,
    question: str,
) -> float:
    c.setFillColor(PALE_2)
    c.rect(0, PAGE_H - 190, PAGE_W, 150, fill=1, stroke=0)
    draw_grid(c, 0, PAGE_H - 190, PAGE_W, 150, 15)
    draw_header_footer(c, page_no)
    c.setFillColor(GOLD)
    c.setFont(FONT_EN_BOLD, 10)
    c.drawString(MARGIN_X, PAGE_H - 89, number)
    c.setFillColor(MUTED)
    c.setFont(FONT_MEDIUM, 7)
    c.drawString(MARGIN_X + 42, PAGE_H - 82, english.upper())
    c.setFillColor(INK)
    c.setFont(FONT_MEDIUM, 20)
    c.drawString(MARGIN_X + 42, PAGE_H - 115, title)
    c.setFillColor(NAVY)
    c.roundRect(MARGIN_X + 42, PAGE_H - 151, 54, 17, 1.5, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont(FONT_MEDIUM, 6.6)
    c.drawCentredString(MARGIN_X + 69, PAGE_H - 145.5, "本章回答")
    draw_text(c, question, MARGIN_X + 108, PAGE_H - 141.5, CONTENT_W - 108, size=8.2, leading=13, color=MUTED)
    return PAGE_H - 222


def draw_section_band(
    c: canvas.Canvas,
    page_no: int,
    number: str,
    english: str,
    title: str,
) -> float:
    c.setFillColor(PALE_2)
    c.rect(0, PAGE_H - 184, PAGE_W, 144, fill=1, stroke=0)
    draw_grid(c, 0, PAGE_H - 184, PAGE_W, 144, 15)
    draw_header_footer(c, page_no)
    c.setFillColor(GOLD)
    c.setFont(FONT_EN_BOLD, 10)
    c.drawString(MARGIN_X, PAGE_H - 92, number)
    c.setFillColor(MUTED)
    c.setFont(FONT_MEDIUM, 7)
    c.drawString(MARGIN_X + 42, PAGE_H - 84, english.upper())
    c.setFillColor(INK)
    c.setFont(FONT_MEDIUM, 20)
    c.drawString(MARGIN_X + 42, PAGE_H - 122, title)
    return PAGE_H - 214


def draw_page_heading(c: canvas.Canvas, page_no: int, english: str, title: str, *, large: bool = False) -> float:
    draw_header_footer(c, page_no)
    draw_eyebrow(c, english, MARGIN_X, PAGE_H - 82)
    size = 25 if large else 20
    leading = 35 if large else 29
    y = draw_text(c, title, MARGIN_X, PAGE_H - 118, CONTENT_W, font=FONT_MEDIUM, size=size, leading=leading, color=INK)
    draw_rule(c, y - 5)
    return y - 34


def draw_callout(c: canvas.Canvas, text: str, x: float, y: float, w: float, *, size: float = 11.5, min_height: float = 58) -> float:
    lines = wrap_text(text, FONT_MEDIUM, size, w - 34)
    h = max(min_height, 28 + len(lines) * (size * 1.65))
    c.setFillColor(PALE)
    c.rect(x, y - h, w, h, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.rect(x, y - h, 3, h, fill=1, stroke=0)
    draw_text(c, text, x + 18, y - 25, w - 34, font=FONT_MEDIUM, size=size, leading=size * 1.65, color=INK)
    return y - h


def draw_numbered_row(
    c: canvas.Canvas,
    number: str,
    title: str,
    body: str,
    x: float,
    y: float,
    w: float,
    *,
    row_h: float = 74,
    body_max_lines: int = 2,
) -> float:
    draw_rule(c, y, x, x + w, RULE, 0.5)
    c.setFillColor(GOLD)
    c.setFont(FONT_EN_BOLD, 7.5)
    c.drawString(x, y - 24, number)
    c.setFillColor(INK)
    c.setFont(FONT_MEDIUM, 12.2)
    c.drawString(x + 38, y - 24, title)
    draw_text(
        c,
        body,
        x + 38,
        y - 45,
        w - 38,
        size=8.6,
        leading=14.2,
        color=BODY,
        max_lines=body_max_lines,
    )
    return y - row_h


def draw_module(
    c: canvas.Canvas,
    number: str,
    title: str,
    body: str,
    x: float,
    y: float,
    w: float,
    h: float,
    *,
    highlighted: bool = False,
    body_size: float = 8.1,
) -> None:
    c.setFillColor(PALE if not highlighted else HexColor("#F6F1E6"))
    c.rect(x, y - h, w, h, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.rect(x, y - h, 2.5, h, fill=1, stroke=0)
    c.setFont(FONT_EN_BOLD, 7)
    c.drawString(x + 15, y - 19, number)
    c.setFillColor(INK)
    c.setFont(FONT_MEDIUM, 11.2)
    c.drawString(x + 15, y - 39, title)
    draw_text(c, body, x + 15, y - 58, w - 30, size=body_size, leading=13.5, color=BODY, max_lines=3)


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


def page_document_note(c: canvas.Canvas) -> None:
    y = draw_page_heading(c, 2, "DOCUMENT NOTE · 文件说明", "关于本文件")
    y = draw_callout(c, "本文件正式启动公民秩序主义北美非营利法人及首届董事会的前期筹备工作。", MARGIN_X, y, CONTENT_W, size=12)
    y -= 32
    y = draw_text(c, "当前首要任务，是完成法人设立与首届董事会筹备，使公民秩序主义第一次具备正式治理、责任承担和机构对接能力。", MARGIN_X, y, CONTENT_W, size=10.4, leading=19, color=BODY)
    y -= 34
    c.setFillColor(MUTED)
    c.setFont(FONT_MEDIUM, 7)
    c.drawString(MARGIN_X, y, "CURRENT STATUS · 当前状态")
    y -= 24
    status = [
        ("01", "法人尚未完成注册。"),
        ("02", "首届董事会尚未依法产生。"),
        ("03", "本文件为正式公开的筹备文件。"),
    ]
    for number, text in status:
        draw_rule(c, y, color=RULE, line_width=0.5)
        c.setFillColor(GOLD)
        c.setFont(FONT_EN_BOLD, 7.2)
        c.drawString(MARGIN_X, y - 25, number)
        c.setFillColor(INK)
        c.setFont(FONT_MEDIUM, 11)
        c.drawString(MARGIN_X + 44, y - 25, text)
        y -= 62
    c.showPage()


def page_contents(c: canvas.Canvas) -> None:
    y = draw_page_heading(c, 3, "CONTENTS · 目录", "内容结构")
    items = [
        ("00", "文件说明", "2"),
        ("01", "当前筹备工作的核心判断", "4"),
        ("02", "为什么需要正式组织", "5"),
        ("03", "为什么必须从现在开始", "6"),
        ("04", "法人、合规与组织对接", "8"),
        ("05", "首届董事会与治理", "11"),
        ("06", "董事会筹备背景与参与原则", "16"),
        ("07", "当前阶段与发展路径", "19"),
        ("C", "参与首届董事会筹备", "21"),
    ]
    for n, title, p in items:
        draw_rule(c, y, color=RULE, line_width=0.45)
        c.setFillColor(GOLD)
        c.setFont(FONT_EN_BOLD, 7.5)
        c.drawString(MARGIN_X, y - 24, n)
        c.setFillColor(INK)
        c.setFont(FONT_MEDIUM, 10.5)
        c.drawString(MARGIN_X + 46, y - 24, title)
        c.setFillColor(MUTED)
        c.setFont(FONT_EN, 7.5)
        c.drawRightString(PAGE_W - MARGIN_X, y - 24, p)
        y -= 52
    c.showPage()


def page_current_preparation(c: canvas.Canvas) -> None:
    y = draw_chapter_band(c, 4, "01", "CURRENT PREPARATION · 当前筹备", "当前筹备工作的核心判断", "公民秩序主义现在正在启动什么工作？")
    c.setFillColor(INK)
    c.setFont(FONT_MEDIUM, 24)
    y = draw_text(c, "从政治判断进入正式组织建设", MARGIN_X, y, CONTENT_W, font=FONT_MEDIUM, size=24, leading=34, color=INK)
    y -= 20
    y = draw_text(c, "公民秩序主义当前推进北美非营利法人及首届董事会筹备，重点是建立法律主体、财务制度、人员责任、治理程序和对外联系机制。", MARGIN_X, y, 420, size=10.6, leading=19, color=BODY)
    y -= 30
    draw_callout(c, "正式文件不等于组织已经正式成立。本文件处于筹备阶段，法人尚未完成注册，首届董事会尚未依法产生。", MARGIN_X, y, CONTENT_W, size=10.8, min_height=74)
    c.showPage()


def page_why_organization(c: canvas.Canvas) -> None:
    y = draw_page_heading(c, 4, "FORMAL ORGANIZATION · 正式组织", "为什么必须形成正式组织？", large=True)
    y = draw_text(c, "个人可以表达观点，只有组织才能承担持续责任。", MARGIN_X, y, CONTENT_W, font=FONT_MEDIUM, size=15, leading=24, color=INK)
    y -= 34
    gap = 34
    col_w = (CONTENT_W - gap) / 2
    columns = [
        (
            "THE LIMITS OF PERSONAL EXPRESSION",
            "个人表达的边界",
            "个人可以提出判断、形成理论、进行公共表达。\n\n但个人无法长期替代一个组织承担正式承诺、持续责任、组织授权和机构关系。",
        ),
        (
            "WHY ORGANIZATION MATTERS",
            "组织存在的意义",
            "正式组织能够明确：\n\n谁代表组织，\n谁拥有授权，\n谁承担责任，\n人员变化后既有承诺如何继续。",
        ),
    ]
    for i, (en, title, body) in enumerate(columns):
        x = MARGIN_X + i * (col_w + gap)
        draw_rule(c, y, x, x + col_w, RULE, 0.55)
        c.setFillColor(MUTED)
        c.setFont(FONT_EN_BOLD, 6.6)
        c.drawString(x, y - 23, en)
        c.setFillColor(INK)
        c.setFont(FONT_MEDIUM, 13)
        c.drawString(x, y - 52, title)
        draw_text(c, body, x, y - 84, col_w, size=9.4, leading=17, color=BODY)
    y -= 255
    draw_callout(c, "只有组织，才能与组织建立稳定的信任与对接关系。", MARGIN_X, y, CONTENT_W, size=13, min_height=70)
    c.showPage()


def page_why_now(c: canvas.Canvas) -> None:
    draw_header_footer(c, 3)
    draw_eyebrow(c, "WHY NOW · 为什么必须从现在开始", MARGIN_X, PAGE_H - 84)
    y = PAGE_H - 132
    y = draw_text(c, "政治信誉、组织能力和人才储备，都无法在政治窗口出现以后临时建立。", MARGIN_X, y, CONTENT_W, font=FONT_MEDIUM, size=22, leading=34, color=INK)
    y -= 24
    y = draw_text(c, "一个能够承担公共责任的组织，需要时间形成治理习惯、合作关系和可信记录。\n如果等到现实政治窗口已经出现，再开始寻找人员、建立组织和积累信任，就已经太晚。", MARGIN_X, y, 430, size=10.3, leading=18.5, color=BODY)
    y -= 42
    items = [
        ("信誉", "需要积累"),
        ("组织", "需要磨合"),
        ("人才", "需要检验"),
        ("信任", "需要时间"),
    ]
    w = CONTENT_W / 4
    for i, (a, b) in enumerate(items):
        x = MARGIN_X + i * w
        c.setFillColor(GOLD)
        c.setFont(FONT_EN_BOLD, 7)
        c.drawCentredString(x + w / 2, y, f"0{i+1}")
        c.setFillColor(INK)
        c.setFont(FONT_MEDIUM, 11)
        c.drawCentredString(x + w / 2, y - 27, a)
        c.setFillColor(MUTED)
        c.setFont(FONT_LIGHT, 8.4)
        c.drawCentredString(x + w / 2, y - 48, b)
        if i < 3:
            c.setStrokeColor(RULE)
            c.setLineWidth(0.5)
            c.line(x + w, y + 8, x + w, y - 58)
    y -= 102
    draw_callout(c, "真正的政治准备，必须发生在政治窗口出现之前。", MARGIN_X, y, CONTENT_W, size=13.2, min_height=70)
    c.showPage()


def page_political_trust(c: canvas.Canvas) -> None:
    y = draw_page_heading(c, 7, "ORGANIZATIONAL RELATIONS · 机构关系", "只有组织，才能与组织建立稳定关系", large=True)
    y = draw_text(c, "个人可以表达立场，但正式机构之间的长期合作需要明确的代表、授权、责任和记录。", MARGIN_X, y, 430, size=10.3, leading=18.5, color=BODY)
    y -= 50
    stages = [
        ("识别", "谁代表组织"),
        ("授权", "谁可以作出承诺"),
        ("联系", "建立正式沟通渠道"),
        ("责任", "明确履行与监督主体"),
        ("延续", "人员变化后关系仍可持续"),
    ]
    line_y = y - 16
    c.setStrokeColor(RULE)
    c.setLineWidth(1)
    c.line(MARGIN_X, line_y, PAGE_W - MARGIN_X, line_y)
    step = CONTENT_W / 4
    for i, (label, detail) in enumerate(stages):
        x = MARGIN_X + i * step
        c.setFillColor(NAVY if i in (0, 4) else GOLD)
        c.circle(x, line_y, 3.2, fill=1, stroke=0)
        c.setFillColor(MUTED)
        c.setFont(FONT_EN_BOLD, 6.5)
        c.drawCentredString(x, line_y + 18, f"0{i+1}")
        c.setFillColor(INK)
        c.setFont(FONT_MEDIUM, 9)
        c.drawCentredString(x, line_y - 27, label)
        draw_centered_text(c, detail, x, line_y - 45, 82, font=FONT_LIGHT, size=6.8, leading=10.5, color=MUTED)
    y = line_y - 105
    draw_callout(c, "对外关系的稳定，首先取决于谁代表组织、谁拥有授权、谁承担责任。", MARGIN_X, y, CONTENT_W, size=10.5, min_height=76)
    c.showPage()


def page_legal_subject(c: canvas.Canvas) -> None:
    y = draw_chapter_band(c, 8, "04", "LEGAL VEHICLE · 法律主体", "为什么需要正式法律主体？", "组织责任为什么必须进入公开、合法、可追溯的现实载体？")
    y = draw_text(c, "北美非营利法人为当前组织建设提供可被识别、可以承担责任并依法运行的现实主体。", MARGIN_X, y, 440, size=10.4, leading=18.5, color=BODY)
    y -= 34
    items = [
        ("01", "法律", "形成可被识别的正式主体。"),
        ("02", "财务", "建立资金、账户、支出和监督边界。"),
        ("03", "人员", "明确参与者身份、授权和责任。"),
        ("04", "组织", "形成治理、档案、决策和连续性。"),
    ]
    gap = 14
    w = (CONTENT_W - gap) / 2
    for i, item in enumerate(items):
        x = MARGIN_X + (i % 2) * (w + gap)
        yy = y - (i // 2) * 108
        draw_module(c, *item, x, yy, w, 92)
    c.showPage()


def page_nonprofit_functions(c: canvas.Canvas) -> None:
    y = draw_page_heading(c, 9, "ORGANIZATIONAL INFRASTRUCTURE · 组织基础设施", "法人承担什么？")
    y = draw_text(c, "法人使共同事务进入明确的账户、授权、记录和责任程序。", MARGIN_X, y, 430, size=10.4, leading=18, color=BODY)
    y -= 28
    rows = [
        ("01", "法律主体", "明确法人身份、章程和责任承担方式。"),
        ("02", "财务制度", "建立账户、支出、审批、记录和监督。"),
        ("03", "人员结构", "明确参与者身份、权限和职责边界。"),
        ("04", "组织程序", "建立治理、档案、决策和对外联系机制。"),
    ]
    for row in rows:
        y = draw_numbered_row(c, *row, MARGIN_X, y, CONTENT_W, row_h=76)
    c.showPage()


def page_talent(c: canvas.Canvas) -> None:
    y = draw_page_heading(c, 10, "PARTICIPATION BOUNDARIES · 参与边界", "参与边界")
    y = draw_callout(c, "先明确身份，再参与事务；先明确授权，再承担职责。", MARGIN_X, y, CONTENT_W, size=13, min_height=70)
    y -= 32
    items = [("01", "身份"), ("02", "职责"), ("03", "授权"), ("04", "责任")]
    details = ["以什么身份参与", "负责什么", "可以决定什么", "向谁负责"]
    w = CONTENT_W / 4
    for i, (n, title) in enumerate(items):
        x = MARGIN_X + i * w
        c.setFillColor(GOLD)
        c.setFont(FONT_EN_BOLD, 7)
        c.drawCentredString(x + w / 2, y, n)
        c.setFillColor(INK)
        c.setFont(FONT_MEDIUM, 10)
        c.drawCentredString(x + w / 2, y - 28, title)
        c.setFillColor(MUTED)
        c.setFont(FONT_LIGHT, 7.2)
        c.drawCentredString(x + w / 2, y - 48, details[i])
        if i < 3:
            c.setStrokeColor(RULE)
            c.setLineWidth(0.5)
            c.line(x + w, y + 8, x + w, y - 48)
    y -= 88
    y = draw_numbered_row(
        c,
        "01",
        "是否必须接受全部理论？",
        "不要求。首届董事不需要对公民秩序主义现有全部理论判断保持一致，但必须认同基本政治方向与组织原则：和平政治转轨、反对暴力与社会撕裂、尊重程序与责任，并对中国及中国人民具有长期责任意识。",
        MARGIN_X,
        y,
        CONTENT_W,
        row_h=120,
        body_max_lines=3,
    )
    draw_text(
        c,
        "理论可以存在分歧，基本方向、程序原则与责任底线必须一致。",
        MARGIN_X + 38,
        y + 21,
        CONTENT_W - 38,
        font=FONT_MEDIUM,
        size=9.2,
        leading=15,
        color=INK,
    )
    faqs = [
        ("02", "是否可以先提供专业协助？", "可以先建立联系，但实际组织事务只由身份、职责和授权明确的人员承担。"),
        ("03", "是否要求公开身份？", "依适用法律、登记要求及具体职责确定。"),
    ]
    for item in faqs:
        y = draw_numbered_row(c, *item, MARGIN_X, y, CONTENT_W, row_h=78)
    c.showPage()


def page_why_board(c: canvas.Canvas) -> None:
    y = draw_section_band(c, 5, "03", "LEGAL ENTITY & FOUNDING BOARD · 法人与董事会", "为什么第一步是法人和首届董事会？")
    y = draw_text(c, "法人解决主体问题，董事会解决治理问题。", MARGIN_X, y, CONTENT_W, font=FONT_MEDIUM, size=16, leading=25, color=INK)
    y -= 18
    y = draw_text(c, "当组织开始涉及资金、人员、长期协作和对外联系，就不能继续依靠个人临时处理。法人和董事会共同使组织第一次具备责任主体、治理程序和对外代表。", MARGIN_X, y, CONTENT_W, size=10.2, leading=18, color=BODY)
    y -= 24
    items = [
        ("01", "法律", "谁承担法律责任。"),
        ("02", "财务", "资金如何记录、审批和监督。"),
        ("03", "人员", "谁以什么身份参与。"),
        ("04", "授权", "谁可以决定什么、代表什么。"),
        ("05", "对接", "谁可以代表组织与其他机构建立正式联系。"),
    ]
    gap = 12
    w = (CONTENT_W - gap * 2) / 3
    for i, item in enumerate(items):
        x = MARGIN_X + (i % 3) * (w + gap)
        yy = y - (i // 3) * 104
        draw_module(c, *item, x, yy, w, 90, highlighted=i == 4, body_size=7.6)
    y -= 232
    draw_callout(c, "法人和董事会建立后，组织事务将从个人处理进入正式治理。", MARGIN_X, y, CONTENT_W, size=11.8, min_height=66)
    c.showPage()


def page_not_personal(c: canvas.Canvas) -> None:
    y = draw_page_heading(c, 12, "FROM PROJECT TO ORGANIZATION · 从项目到组织", "从个人项目进入正式组织", large=True)
    c.setFillColor(MUTED)
    c.setFont(FONT_EN_BOLD, 7)
    c.drawString(MARGIN_X, y, "FROM EXPRESSION TO INSTITUTION")
    y -= 36
    stages = [
        ("01", "个人表达", "公共项目"),
        ("02", "公共项目", "正式组织"),
        ("03", "个人信用", "制度信用"),
    ]
    gap = 14
    w = (CONTENT_W - gap * 2) / 3
    for i, item in enumerate(stages):
        draw_module(c, *item, MARGIN_X + i * (w + gap), y, w, 112, highlighted=i == 2)
    y -= 155
    y = draw_text(c, "长期依赖个人判断、个人账户和个人承诺，就无法形成稳定治理。正式组织意味着：授权有边界、责任可追溯、承诺可延续。", MARGIN_X, y, CONTENT_W, size=10.3, leading=18.5, color=BODY)
    y -= 28
    draw_callout(c, "首届董事会，是完成这一制度转换的重要起点。", MARGIN_X, y, CONTENT_W, size=13, min_height=70)
    c.showPage()


def page_board_duties(c: canvas.Canvas) -> None:
    y = draw_page_heading(c, 7, "BOARD RESPONSIBILITIES · 董事会责任", "董事会成立后承担什么责任？")
    y -= 4
    items = [
        ("01", "治理", "持续审议重大组织事项。"),
        ("02", "授权", "维护并调整组织代表与执行权限。"),
        ("03", "监督", "持续监督决策执行与资源使用。"),
        ("04", "风险与合规", "持续识别并处理法律、财务和治理风险。"),
        ("05", "组织连续性", "持续维护人员变化时的规则、授权和记录。"),
    ]
    for item in items:
        y = draw_numbered_row(c, *item, MARGIN_X, y, CONTENT_W, row_h=74)
    y -= 16
    draw_callout(c, "董事会首先是一套责任机制，而不是政治头衔。", MARGIN_X, y, CONTENT_W, size=11.6, min_height=66)
    c.showPage()


def page_founding_tasks(c: canvas.Canvas) -> None:
    y = draw_section_band(c, 6, "04", "FOUNDING BOARD TASKS · 阶段性任务", "首届董事会的阶段性任务")
    rows = [
        ("01", "完成法人设立", "完成注册、章程及必要治理文件。"),
        ("02", "建立基本治理规则", "明确董事会权限、决策程序和记录要求。"),
        ("03", "建立基础财务制度", "形成账户、审批、记录与监督机制。"),
        ("04", "明确人员与授权关系", "确定董事及未来正式职能人员的身份、职责和权限。"),
        ("05", "建立正式对外代表机制", "明确谁可以代表组织、建立联系并作出组织承诺。"),
    ]
    for row in rows:
        y = draw_numbered_row(c, *row, MARGIN_X, y, CONTENT_W, row_h=82)
    y -= 14
    draw_callout(
        c,
        "首届董事会不仅承担法人初建与治理任务，也承担早期组织人才的识别、培养与检验。",
        MARGIN_X,
        y,
        CONTENT_W,
        size=10.6,
        min_height=66,
    )
    c.showPage()


def page_governance(c: canvas.Canvas) -> None:
    y = draw_page_heading(c, 15, "PROPOSED GOVERNANCE · 拟议治理", "法人设立后的基本治理结构")
    y = draw_text(c, "以下为法人及首届董事会建立后拟形成的基本责任结构，不代表当前已经存在相应组织职位。", MARGIN_X, y, CONTENT_W, size=10.2, leading=18, color=BODY)
    y -= 34
    left = [
        ("01", "董事会", "治理、授权、监督与重大事项。"),
        ("02", "执行", "在授权范围内负责日常运营。"),
        ("03", "专业职能", "根据正式授权承担研究、传播、技术及其他专业事务。"),
    ]
    for item in left:
        y = draw_numbered_row(c, *item, MARGIN_X, y, CONTENT_W, row_h=92)
    c.showPage()


def page_people(c: canvas.Canvas) -> None:
    y = draw_section_band(c, 8, "05", "FOUNDING BOARD PARTICIPANTS · 参与者", "什么样的人适合成为首届董事")
    y = draw_text(
        c,
        "公民秩序主义对首届董事的判断，首先不是从职业、学历、资源或者社会身份开始。",
        MARGIN_X,
        y,
        CONTENT_W,
        font=FONT_MEDIUM,
        size=11.2,
        leading=20,
        color=INK,
    )
    y -= 26
    y = draw_callout(
        c,
        "第一标准，是对中国及中国人民怀有坚定而深厚的信念。",
        MARGIN_X,
        y,
        CONTENT_W,
        size=13,
        min_height=72,
    )
    y -= 28
    draw_eyebrow(c, "WHAT THIS CONVICTION MEANS · 信念意味着什么", MARGIN_X, y, color=MUTED)
    y -= 29
    y = draw_text(
        c,
        "这种信念不是抽象的民族情绪，也不是简单的政治立场。",
        MARGIN_X,
        y,
        CONTENT_W,
        font=FONT_MEDIUM,
        size=10.4,
        leading=18,
        color=INK,
    )
    y -= 12
    y = draw_text(
        c,
        "它意味着相信中国仍然值得拥有一个更好的未来，相信中国人民有能力生活在一个更有尊严、更有保障、更有预期的社会之中；也意味着愿意为这个目标投入时间、承担责任，并接受这可能是一项漫长而艰难的工作。",
        MARGIN_X,
        y,
        CONTENT_W,
        size=9.8,
        leading=17.2,
        color=BODY,
    )
    y -= 26
    draw_eyebrow(c, "CAPACITY CAN BE DEVELOPED · 能力可以培养", MARGIN_X, y, color=MUTED)
    y -= 28
    y = draw_text(
        c,
        "首届董事会当然需要能力。法律、财务、组织治理、公共沟通、研究、技术以及社会资源，都会决定一个组织能够走多远。但在创立阶段，公民秩序主义并不要求每一位董事从加入之初就具备完整的专业能力。",
        MARGIN_X,
        y,
        CONTENT_W,
        size=9.6,
        leading=16.8,
        color=BODY,
    )
    y -= 21
    draw_callout(
        c,
        "技术不足可以学习，经验不足可以积累，能力不足可以锻炼。",
        MARGIN_X,
        y,
        CONTENT_W,
        size=11.8,
        min_height=64,
    )
    c.showPage()


def page_people_continued(c: canvas.Canvas) -> None:
    y = draw_page_heading(c, 9, "FOUNDING BOARD STANDARD · 首届董事标准", "信念、品格与责任")
    y = draw_text(
        c,
        "组织本身就应该具有培养人的能力。今天尚不成熟的人，可以在长期共同工作中成长为可靠的组织者、管理者和政治人才。",
        MARGIN_X,
        y,
        CONTENT_W,
        size=9.8,
        leading=17.2,
        color=BODY,
    )
    y -= 14
    y = draw_text(
        c,
        "首届董事的基本判断包括：信念、品格、责任感、规则意识、学习能力与长期投入意愿。",
        MARGIN_X,
        y,
        CONTENT_W,
        font=FONT_MEDIUM,
        size=10.2,
        leading=18,
        color=INK,
    )
    y -= 22
    draw_eyebrow(c, "WHAT TRAINING CANNOT REPLACE · 信念无法替代", MARGIN_X, y, color=MUTED)
    y -= 28
    y = draw_text(
        c,
        "但有一样东西很难通过培训获得：",
        MARGIN_X,
        y,
        CONTENT_W,
        font=FONT_MEDIUM,
        size=10.2,
        leading=18,
        color=INK,
    )
    y -= 16
    y = draw_callout(
        c,
        "一个人是否真正相信中国值得为之付出，是否真正对中国人民怀有责任。",
        MARGIN_X,
        y,
        CONTENT_W,
        size=11.6,
        min_height=68,
    )
    y -= 20
    y = draw_text(
        c,
        "如果缺少这一点，再优秀的履历、再丰富的资源、再强的专业能力，都无法替代。",
        MARGIN_X,
        y,
        CONTENT_W,
        size=9.8,
        leading=17.2,
        color=BODY,
    )
    y -= 26
    draw_eyebrow(c, "WHAT WE ARE LOOKING FOR · 我们寻找什么", MARGIN_X, y, color=MUTED)
    y -= 28
    y = draw_text(
        c,
        "因此，公民秩序主义寻找的不是一份漂亮的董事履历，也不是几个能够装点组织门面的名字。公民秩序主义寻找的是这样一群人：相信中国仍有未来，相信中国人民值得一个更好的政治秩序；能够保持理性与克制，尊重规则与责任；愿意从一个尚在建立中的组织开始，与其他人共同学习、共同承担、共同成长。",
        MARGIN_X,
        y,
        CONTENT_W,
        size=9.6,
        leading=16.8,
        color=BODY,
    )
    y -= 25
    y = draw_callout(
        c,
        "首届董事会不是荣誉席位，也不是政治身份。它首先是一份责任。",
        MARGIN_X,
        y,
        CONTENT_W,
        size=12,
        min_height=66,
    )
    y -= 20
    draw_text(
        c,
        "能力决定一个人能够承担多少工作，品格决定一个人如何使用自己的能力，而最根本的信念，决定一个人在困难、漫长和无人喝彩的时候，是否仍然愿意承担这份责任。",
        MARGIN_X,
        y,
        CONTENT_W,
        size=9.8,
        leading=17.2,
        color=BODY,
    )
    c.showPage()


def page_professions(c: canvas.Canvas) -> None:
    y = draw_page_heading(c, 17, "FOUNDING BOARD BACKGROUNDS · 董事会背景", "首届董事会筹备所关注的专业背景")
    y = draw_text(c, "以下专业背景有助于首届董事会形成法律、财务、治理和组织建设能力。", MARGIN_X, y, CONTENT_W, size=10.1, leading=18, color=BODY)
    y -= 32
    items = [
        ("01", "法律与非营利治理"),
        ("02", "财务、会计与审计"),
        ("03", "组织管理"),
        ("04", "公共政策与研究"),
        ("05", "公共事务与传播"),
        ("06", "技术、网站与信息治理"),
        ("07", "公共机构或社会组织经验"),
    ]
    gap = 14
    w = (CONTENT_W - gap) / 2
    for i, (n, title) in enumerate(items):
        col, row = i % 2, i // 2
        x = MARGIN_X + col * (w + gap)
        yy = y - row * 68
        draw_rule(c, yy, x, x + w, RULE, 0.45)
        c.setFillColor(GOLD)
        c.setFont(FONT_EN_BOLD, 7)
        c.drawString(x, yy - 24, n)
        c.setFillColor(INK)
        c.setFont(FONT_MEDIUM, 10.2)
        c.drawString(x + 34, yy - 24, title)
    y -= 4 * 68 + 24
    draw_callout(c, "专业背景是董事会筹备的能力参考，不构成独立的外部协作入口。", MARGIN_X, y, CONTENT_W, size=11.2, min_height=70)
    c.showPage()


def page_participation_faq(c: canvas.Canvas) -> None:
    y = draw_page_heading(c, 18, "PARTICIPATION PRINCIPLES · 参与原则", "董事角色与常见问题")
    faqs = [
        ("成为董事必须接受全部理论吗？", "不要求。基本和平转轨方向与共同程序原则更重要。"),
        ("是否要求公开身份？", "依适用法律、登记要求及具体职责确定。"),
        ("是否可以先提供专业协助？", "普通联系不构成组织参与。实际事务只由身份、职责和授权关系明确的人员承担。"),
        ("这是政党吗？", "不是。当前仍处于非营利法人、首届董事会及组织基础建设阶段。"),
    ]
    for i, (q, a) in enumerate(faqs, 1):
        y = draw_numbered_row(c, f"0{i}", q, a, MARGIN_X, y, CONTENT_W, row_h=86)
    c.showPage()


def page_current_stage(c: canvas.Canvas) -> None:
    y = draw_section_band(c, 11, "06", "FOUNDING STAGE · 当前阶段", "当前处于什么阶段？")
    y = draw_callout(c, "本文件是正式公开的筹备文件；组织仍处于筹备阶段。", MARGIN_X, y, CONTENT_W, size=13, min_height=70)
    y -= 35
    col_w = (CONTENT_W - 20) / 2
    columns = [
        ("CURRENT WORK", "正在推进", ["北美非营利法人筹备", "首届董事会筹备", "基础治理文件准备", "注册法域与合规路径研究"]),
        ("NOT YET COMPLETED", "尚未完成", ["法人依法完成注册", "注册法域最终确定", "首届董事会依法产生", "相关税务或慈善资格程序完成"]),
    ]
    for i, (en, title, rows) in enumerate(columns):
        x = MARGIN_X + i * (col_w + 20)
        c.setFillColor(MUTED)
        c.setFont(FONT_EN_BOLD, 7)
        c.drawString(x, y, en)
        c.setFillColor(INK)
        c.setFont(FONT_MEDIUM, 13)
        c.drawString(x, y - 27, title)
        yy = y - 48
        for j, row in enumerate(rows, 1):
            draw_rule(c, yy, x, x + col_w, RULE, 0.45)
            c.setFillColor(GOLD)
            c.setFont(FONT_EN_BOLD, 6.8)
            c.drawString(x, yy - 23, f"0{j}")
            c.setFillColor(BODY)
            c.setFont(FONT_LIGHT, 9.2)
            c.drawString(x + 32, yy - 23, row)
            yy -= 52
    draw_callout(
        c,
        "公民秩序主义目前处于组织筹备阶段，尚未完成法人注册及首届董事会设立，也不以政党身份运行。",
        MARGIN_X,
        y - 285,
        CONTENT_W,
        size=9.8,
        min_height=68,
    )
    c.showPage()


def page_development_path(c: canvas.Canvas) -> None:
    y = draw_page_heading(c, 12, "DEVELOPMENT PATH · 发展路径", "发展路径")
    y -= 34
    stages = [
        ("01", "公共表达"),
        ("02", "组织筹备"),
        ("03", "法人与董事会建立"),
        ("04", "合规运行"),
        ("05", "稳定机构关系"),
    ]
    centers: list[float] = []
    step = CONTENT_W / 4
    line_y = y - 23
    c.setStrokeColor(RULE)
    c.setLineWidth(1)
    c.line(MARGIN_X, line_y, PAGE_W - MARGIN_X, line_y)
    for i, (n, title) in enumerate(stages):
        cx = MARGIN_X + i * step
        centers.append(cx)
        current = n == "02"
        c.setFillColor(WHITE)
        c.setStrokeColor(GOLD if current else RULE)
        c.setLineWidth(1.4 if current else 0.8)
        c.circle(cx, line_y, 12 if current else 8, fill=1, stroke=1)
        c.setFillColor(GOLD if current else MUTED)
        c.setFont(FONT_EN_BOLD, 6.5)
        c.drawCentredString(cx, line_y - 2.4, n)
        c.setFillColor(INK)
        c.setFont(FONT_MEDIUM, 8.4)
        lines = wrap_text(title, FONT_MEDIUM, 8.4, 76)
        for j, line in enumerate(lines[:2]):
            c.drawCentredString(cx, line_y - 34 - j * 13, line)
    c.setFillColor(GOLD)
    c.setFont(FONT_EN_BOLD, 6.5)
    c.drawCentredString(centers[1], line_y + 29, "CURRENT STAGE")
    y = line_y - 120
    draw_callout(c, "当前任务，是完成从公共项目到正式组织的制度转换。", MARGIN_X, y, CONTENT_W, size=11.8, min_height=70)
    c.showPage()


def draw_link(c: canvas.Canvas, label: str, url: str, x: float, y: float, max_width: float, *, size: float = 8.4) -> None:
    c.setFillColor(NAVY)
    c.setFont(FONT_EN, size)
    shown = label
    c.drawString(x, y, shown)
    link_w = min(width(shown, FONT_EN, size), max_width)
    c.linkURL(url, (x, y - 3, x + link_w, y + size + 2), relative=0)


def page_action(c: canvas.Canvas) -> None:
    y = draw_section_band(c, 13, "C", "FOUNDING BOARD PARTICIPATION · 行动入口", "参与首届董事会筹备")
    y = draw_text(c, "当前阶段的正式参与方向，仅限首届董事会筹备。", MARGIN_X, y, CONTENT_W, font=FONT_MEDIUM, size=14, leading=24, color=INK)
    y -= 20

    card_h = 100
    c.setFillColor(PALE)
    c.rect(MARGIN_X, y - card_h, CONTENT_W, card_h, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.rect(MARGIN_X, y - card_h, 3, card_h, fill=1, stroke=0)
    c.setFont(FONT_EN_BOLD, 7)
    c.drawString(MARGIN_X + 18, y - 23, "FOUNDING BOARD PREPARATION")
    c.setFillColor(INK)
    c.setFont(FONT_MEDIUM, 16)
    c.drawString(MARGIN_X + 18, y - 51, "首届董事会筹备")
    draw_text(c, "面向愿意参与法人设立与组织治理，并承担首届董事责任的人。", MARGIN_X + 18, y - 78, CONTENT_W - 36, size=9.2, leading=15.5, color=BODY)

    y -= card_h + 18
    c.setFillColor(MUTED)
    c.setFont(FONT_MEDIUM, 7)
    c.drawString(MARGIN_X, y, "INITIAL CONTACT · 初次联系可说明")
    y -= 22
    y = draw_text(
        c,
        "先回答为什么来，再回答会什么。",
        MARGIN_X,
        y,
        CONTENT_W,
        font=FONT_MEDIUM,
        size=10.2,
        leading=18,
        color=INK,
    )
    y -= 12
    initial = [
        (
            "为什么愿意参与首届董事会筹备",
            "简要说明为什么希望参与，以及如何理解这项工作的意义。",
        ),
        ("所在地区", "当前所在国家、城市或大致地区。"),
        ("专业背景", "职业、专业方向或能够长期贡献的领域。"),
        (
            "相关经验",
            "可说明组织治理、法律、财务、研究、传播、技术、公共事务等相关经历。没有相关经历不构成排除条件。",
        ),
        (
            "可以承担的长期责任",
            "可以投入的大致时间、希望承担的工作，以及是否愿意长期参与董事会治理。",
        ),
    ]
    col_w = (CONTENT_W - 18) / 2
    row_h = 62
    for i, (title, body) in enumerate(initial):
        x = MARGIN_X + (i % 2) * (col_w + 18)
        yy = y - (i // 2) * row_h
        draw_rule(c, yy, x, x + col_w, RULE, 0.4)
        c.setFillColor(GOLD)
        c.setFont(FONT_EN_BOLD, 6.5)
        c.drawString(x, yy - 17, f"0{i+1}")
        c.setFillColor(INK)
        c.setFont(FONT_MEDIUM, 9)
        c.drawString(x + 28, yy - 17, title)
        draw_text(
            c,
            body,
            x + 28,
            yy - 34,
            col_w - 28,
            size=7.2,
            leading=10.4,
            color=BODY,
            max_lines=3,
        )
    y -= row_h * 3 + 10
    draw_rule(c, y)
    y -= 18
    c.setFillColor(MUTED)
    c.setFont(FONT_EN_BOLD, 7)
    c.drawString(MARGIN_X, y, "CONTACT & OFFICIAL CHANNELS")
    y -= 20
    contacts = [
        ("官方网站", "civicorderism.com", "https://civicorderism.com/"),
        ("X 官方账号", "@CivicOrderism", "https://x.com/CivicOrderism"),
        ("YouTube 官方频道", "Civic Orderism", "https://www.youtube.com/@CivicOrderism"),
        ("主联系邮箱", "civicorderism@gmail.com", "mailto:civicorderism@gmail.com"),
        ("备用联系邮箱", "citizenorder@proton.me", "mailto:citizenorder@proton.me"),
    ]
    label_x = MARGIN_X
    value_x = MARGIN_X + 108
    for label, value, url in contacts:
        c.setFillColor(MUTED)
        c.setFont(FONT_LIGHT, 8.1)
        c.drawString(label_x, y, label)
        draw_link(c, value, url, value_x, y, 250, size=8.1)
        y -= 18
    qr = QrCodeWidget("https://civicorderism.com/preparation")
    bounds = qr.getBounds()
    qr_size = 64
    drawing = Drawing(qr_size, qr_size, transform=[qr_size / (bounds[2] - bounds[0]), 0, 0, qr_size / (bounds[3] - bounds[1]), 0, 0])
    drawing.add(qr)
    renderPDF.draw(drawing, c, PAGE_W - MARGIN_X - qr_size, 114)
    c.setFillColor(MUTED)
    c.setFont(FONT_EN, 6.3)
    c.drawRightString(PAGE_W - MARGIN_X, 103, "civicorderism.com/preparation")
    c.setFillColor(GOLD)
    c.setFont(FONT_EN_BOLD, 6.7)
    c.drawString(MARGIN_X, 80, "OFFICIAL DOCUMENT SERIES")
    c.setFillColor(MUTED)
    c.setFont(FONT_EN, 6.6)
    c.drawString(MARGIN_X, 64, "Version 1.4 · 2026")
    c.drawString(MARGIN_X, 50, "Document ID · CO-2026-002 · FOUNDING STAGE")
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
        page_document_note,
        page_why_now,
        page_why_organization,
        page_why_board,
        page_founding_tasks,
        page_board_duties,
        page_people,
        page_people_continued,
        page_talent,
        page_current_stage,
        page_development_path,
        page_action,
    ]
    for page in pages:
        page(c)
    c.save()
    return OUTPUT


if __name__ == "__main__":
    output = build()
    print(output)
