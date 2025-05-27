# Pega‑Wordle MVP – Product Requirements Document (PRD)

**Version 0.2 – 26 May 2025**

---

## 1. Purpose

Saltech Consulting needs an engaging, quick‑play Wordle‑style game for the PegaWorld *iNspire 2025* booth that reinforces Pega terminology and draws visitors to the stand, while remaining fully functional offline on booth laptops.

---

## 2. Target Users

* PegaWorld attendees (consultants, prospects, clients) passing the booth
* Saltech staff demoing the game during conversations

---

## 3. MVP Scope

### 3.1 Must‑Have Features

1. **Core gameplay** – classic 5×6 Wordle grid; five guesses; colour feedback
2. **Word bank** – 200–300 curated Pega terms (4‑6 letters) stored locally
3. **Offline‑first** 
4. **UI/UX** – large grid, on‑screen keyboard, Pega brand palette, colour‑blind safe

### 3.2 Nice‑to‑Have

* Idle “attract” animation when no one is playing

---

## 4. Out of Scope

* Multiplayer / real‑time competitions
* Server‑side answer validation
* Native mobile packages outside the PWA
* Non‑Pega vocabulary modes

---

## 5. Non‑Functional Requirements

| Category        | Requirement                                                       |
| --------------- | ----------------------------------------------------------------- |
| **Performance** | First Contentful Paint ≤ 1 s on dev laptop; ≤ 3 s on booth device |
| **Reliability** | Game loads and plays fully offline                                |

---

## 6. Acceptance Criteria

* Game is playable without internet
* All 200 + words are solvable without duplication during event
* Word list can be updated by editing a JSON/CSV file—no code changes required

---

