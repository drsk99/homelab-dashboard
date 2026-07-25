---
name: Homelab Control Panel
description: A ham-radio transceiver control panel for operating self-hosted services
colors:
  chassis: "#1a1b1e"
  chassis-edge: "#0e0f11"
  panel: "#232529"
  panel-hover: "#2a2c31"
  bezel: "#383b41"
  bezel-hi: "#4a4d54"
  rivet: "#55585f"
  plate-text: "#d8dade"
  plate-dim: "#83878f"
  led-ok: "#35d07f"
  led-down: "#ff5056"
  led-unknown: "#6b7078"
  amber: "#ffb020"
  amber-dim: "#7a5416"
typography:
  plate:
    fontFamily: "Big Shoulders Text, Arial Narrow, sans-serif"
    fontWeight: 700
    letterSpacing: "0.02em"
  mono:
    fontFamily: "Martian Mono, ui-monospace, Courier New, monospace"
    fontWeight: 400
rounded:
  sm: "3px"
  md: "4px"
  pill: "999px"
spacing:
  sm: "8px"
  md: "14px"
  lg: "28px"
components:
  panel-btn:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.plate-text}"
    rounded: "{rounded.md}"
    padding: "9px 16px"
  panel-btn-primary:
    backgroundColor: "{colors.amber-dim}"
    textColor: "{colors.amber}"
    rounded: "{rounded.md}"
    padding: "9px 16px"
---

# Design System: Homelab Control Panel

## Overview

**Creative North Star: "The Transceiver Bay"**

The dashboard is built as a ham-radio transceiver's control panel, not a page that lists
services. A homelab operator doesn't browse a catalog of their self-hosted apps — they scan a
bank of channels, flip one on, patch a new one in. That's the mechanism this surface commits to:
brushed gunmetal chassis, engraved aluminum label plates, an amber LCD-style readout bank, and a
toggle-switch-plus-LED-lamp per service standing in for a channel's on-air state.

This replaces a generic dark-SaaS dashboard (near-black background, blue accent, soft rounded
cards) that was visually indistinguishable from a hundred other AI-built admin panels. Every
surface in this system is deliberately closer to a machined instrument than a web app: sharp
4px-radius corners with beveled top edges, inset shadows standing in for pressed metal, and a
single amber accent reserved for backlighting rather than decoration.

**Key Characteristics:**
- Toggle + LED lamp per service, not a bare status dot — the switch position *is* the state.
- One true accent color (amber) reserved for backlit readouts and primary actions; green/red are
  functional status lamps, never decorative.
- Sharp, machined-metal corners (3–4px) instead of soft SaaS rounding.
- Condensed industrial caps for names/labels; a distinct mono face for readouts and metadata.

## Colors

Restrained strategy: neutral gunmetal chassis and panel grays carry the surface; amber is the
only saturated accent, reserved for backlighting. Green/red/gray are functional state lamps, not
part of the accent budget.

### Primary
- **Amber Backlight** (`#ffb020`): the LCD readout glow, primary button text/border, tuner
  accents. Used sparingly — this is the panel's "power is on" color, not a UI accent to spread
  around.

### Neutral
- **Chassis Black** (`#1a1b1e` → `#0e0f11`): page background, a subtle top-to-bottom gradient
  standing in for the top rail's shadow.
- **Panel Steel** (`#232529` / hover `#2a2c31`): the background of every card/module — brushed
  steel plate.
- **Bezel** (`#383b41`, highlight `#4a4d54`): borders on every panel/button, always with a
  lighter top edge to fake a beveled/machined edge catching light from above.
- **Plate Text** (`#d8dade`) / **Plate Dim** (`#83878f`): primary and secondary engraved-label
  text.

### Status Lamps (functional, not part of the accent system)
- **On-Air Green** (`#35d07f`): service responded, toggle sits right, LED glows with a soft
  green bloom.
- **Fault Red** (`#ff5056`): service unreachable, toggle sits left.
- **Standby Gray** (`#6b7078`): status not yet checked.

### Named Rules
**The One Backlight Rule.** Amber never appears as a background fill or a large surface — only
as text/border/glow on things that are literally "lit": readouts, the primary button, the tuner
knob glyph. If amber starts filling a whole component, it has drifted into decoration.

## Typography

**Display/Label Font:** Big Shoulders Text (condensed industrial caps), with Arial Narrow /
sans-serif fallback
**Body/Mono Font:** Martian Mono, with ui-monospace / Courier New fallback

**Character:** Big Shoulders Text supplies the engraved-panel-label voice — bold, condensed,
uppercase, like stamped lettering on a chassis faceplate. Martian Mono supplies every numeric
readout, URL-adjacent metadata, and body microcopy — it reads like an LCD/7-segment-adjacent
technical face without going full retro-terminal.

### Hierarchy
- **Nameplate** (800 weight, 20px, Big Shoulders Text, uppercase): the app title in the top rail.
- **Category title** (700 weight, 12px, Big Shoulders Text, 0.12em tracking, uppercase): module
  plate headers.
- **Card name** (700 weight, 15px, Big Shoulders Text): each channel's engraved name.
- **Readout value** (600 weight, 17px, Martian Mono): the ON-AIR / FAULT / TOTAL counts.
- **Body/meta** (400–500 weight, 10–12px, Martian Mono): descriptions, node names, form labels.

### Named Rules
**The Two-Voice Rule.** Every name/label is set in Big Shoulders Text; every number, URL, and
piece of metadata is set in Martian Mono. Never mix — the pairing itself signals "this is a
label" vs. "this is a live value."

## Layout

Single scrolling column, max-width 1400px, centered. The top rail is a sticky chassis header
(nameplate, live readout bank, tuner-style search, primary action) — always visible while
scrolling the rack below. Services are grouped into "modules" (bordered panel sections per
category) containing an auto-filling grid (`minmax(240px, 1fr)`) of channel cards, 12px gap.
Responsive: under 640px the readout bank and controls wrap to full width and the search input
expands to fill it; the rack padding tightens from 28px to 14–16px.

## Elevation & Depth

No soft drop shadows. Depth reads as pressed/machined metal: `inset` shadows on recessed
elements (search field, toggle switches, LCD readouts) and a 1–2px hard offset shadow plus a
lighter top border on raised elements (buttons, cards, the top rail) to fake a bevel catching
light from above.

### Named Rules
**The Beveled-Not-Floating Rule.** Elevation never uses a diffuse blurred shadow (that reads as
"card floating over background," the SaaS-dashboard rut this system rejects). Raised elements get
a hard 1–2px offset shadow and a lighter top border; recessed elements get an inset shadow.

## Shapes

Sharp, machined corners: 3–4px radius everywhere except the fully round toggle switches and the
pill-shaped tuner/search field (999px), which are the only two circular forms in the system —
reserved for literal knob/switch metaphors. Borders are always present (never borderless cards)
and always slightly lighter on the top edge than the other three sides, to fake a beveled edge.

## Components

### Buttons (`panel-btn`)
- **Shape:** 4px radius, 1px border with a lighter top edge.
- **Primary:** dark amber gradient background, amber text with a subtle glow, amber-dim border.
- **Default:** dark gunmetal gradient, plate-text color.
- **Danger:** transparent fill, red border/text (used only for the unpatch/delete action).
- **Hover:** background lightens one step. **Active:** the button drops 1px and its shadow
  shortens, simulating a physical press.

### Cards / Channel Units (`.card`)
- **Corner Style:** 4px radius, beveled top border.
- **Background:** panel-steel gradient, lightens on hover with a 1px lift.
- **State device:** a toggle switch (`.toggle`, pill-shaped, thumb slides right/green when up,
  left/red when down) paired with a glowing `.status-dot` LED — the two together are the "is
  this on-air" signal, always in the card's top-right.
- **Internal Padding:** 14px.
- **Edit affordance:** a small gear-adjacent icon button, hidden until hover, top-right corner.

### Inputs / Fields
- **Style:** dark recessed background (`#101113`), inset shadow, 1px bezel border, 3px radius.
- **Focus:** 1px amber outline — the only place amber outlines rather than glows.
- **The search field** is pill-shaped and embedded in a `.tuner` component with a knob glyph, to
  read as a tuning dial rather than a generic search box.

### Navigation / Top Rail
- Sticky chassis header: nameplate (icon + two-line title) on the left, live readout bank
  (ON-AIR/FAULT/TOTAL counts, updates with status polling) pushed to the right via `margin-left:
  auto`, then the tuner search and primary "add channel" button.

### Readout Bank (signature component)
A recessed dark strip (`#0c0d0f`, inset shadow) divided into three cells by 1px dividers, each
showing a small dim label above a large glowing mono value — ON-AIR in green, FAULT in red, TOTAL
in amber. This is the panel's "vitals" instrument, always visible, computed live from the same
status data driving each card's toggle/LED.

## Do's and Don'ts

### Do:
- **Do** pair every status signal with both a toggle switch and an LED lamp — never a bare dot.
- **Do** keep amber reserved for backlit/live elements (readouts, primary actions, focus rings).
- **Do** use Big Shoulders Text for anything that is a *label* and Martian Mono for anything that
  is a *value*.
- **Do** bevel every raised surface with a lighter top border rather than a blurred shadow.

### Don't:
- **Don't** reintroduce soft, diffuse box-shadows or fully rounded (8px+) corners — that's the
  generic-SaaS register this system explicitly left behind.
- **Don't** use amber as a fill/background color for large surfaces; it's a glow, not a paint
  color.
- **Don't** add a second saturated accent color alongside amber; the status lamps (green/red)
  cover functional color needs.
- **Don't** style the toggle/LED pairing as purely decorative — its position and color are always
  a live, truthful read of the service's actual status.
