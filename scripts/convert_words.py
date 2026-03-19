"""
convert_words.py
Converts SwordPen CSV / XLSX word files -> app JSON format.
Usage: python scripts/convert_words.py
"""

import csv
import io
import json
import os

# ── Paths ──────────────────────────────────────────────────────────────────────
ONEDRIVE    = r'C:\Users\mrbig\OneDrive - AG\words'
INFORMATIVE = os.path.join(ONEDRIVE, 'informative_words.csv')
NARRATIVE   = os.path.join(ONEDRIVE, 'narrative_words.csv')
PERSUASIVE  = os.path.join(ONEDRIVE, 'persuasive_words.xlsx')

ROOT    = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, 'public', 'data')

# ── CSV row parser (handles the double-encoded Excel CSV format) ───────────────
def parse_csv_line(line):
    """Two-pass parse: strip outer quote wrapper, then parse inner CSV."""
    line = line.strip()
    if not line:
        return None
    try:
        outer = next(csv.reader([line]))
    except Exception:
        return None
    # If entire row was wrapped in one outer quote, parse the inner string
    row = next(csv.reader([outer[0]])) if len(outer) == 1 else outer
    return [c.strip().strip('"').strip() for c in row]

# ── CSV file parser ────────────────────────────────────────────────────────────
def parse_csv_file(path):
    with open(path, 'r', encoding='cp1252', errors='replace') as f:
        raw = f.read()
    rows = []
    for line in raw.splitlines():
        row = parse_csv_line(line)
        if row:
            rows.append(row)
    return rows

# ── XLSX file parser (each cell in col A contains a CSV-formatted line) ────────
def parse_xlsx_file(path):
    import openpyxl
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    ws = wb.active
    rows = []
    for excel_row in ws.iter_rows(values_only=True):
        cell_val = excel_row[0] if excel_row else None
        if not cell_val:
            continue
        row = parse_csv_line(str(cell_val))
        if row:
            rows.append(row)
    wb.close()
    return rows

# ── Difficulty heuristic ───────────────────────────────────────────────────────
ADVANCED_WORDS = {
    'aerosols', 'bioluminescence', 'photosynthesis', 'supercapacitor',
    'graphene', 'latency', 'de-orbited', 'cartilage', 'ligaments', 'marrow',
    'pesticide', 'ecosystem', 'pollination', 'fossil fuels', 'emissions',
    'durability', 'cacophony', 'acrid', 'lichen', 'threshold', 'interstellar',
    'sonar', 'constellation', 'malnourished', 'verification', 'enforcement',
    'sustainable', 'distractions', 'flexibility', 'navigation', 'observatory',
    'intersection', 'pedestrians', 'foundations', 'bioluminescent',
    'counterargument', 'counterpoint', 'substantiate', 'corroborate',
    'unequivocally', 'consequently', 'furthermore', 'nevertheless',
    'paradoxically', 'undeniably',
}

BEGINNER_WORDS = {
    'quiet', 'nearby', 'crowd', 'faint', 'ordinary', 'recent', 'available',
    'major', 'gradually', 'rose', 'carried', 'strong', 'flexible', 'delicate',
    'pollution', 'environment', 'species', 'wildlife', 'talent', 'banned',
    'careless', 'recycled', 'decade', 'traditional', 'resources', 'anxious',
    'relief', 'familiar', 'casually', 'traffic', 'exhaust', 'gentle', 'nervous',
    'confident', 'buzzing', 'clutch', 'fumble', 'volunteer', 'survive',
    'unsure', 'rattled', 'evidence', 'awkward', 'rehearse', 'faded',
    'reflection', 'identity', 'headline', 'realised', 'backpack', 'gates',
    'begged', 'vibrate', 'gripped', 'leapt', 'vanished', 'drifted', 'barely',
    'shrink', 'moss', 'discover', 'shiver', 'hidden', 'mist', 'murmur',
    'sway', 'crooked', 'cheerful', 'reliable', 'energy', 'however',
    'wondering', 'promised', 'surface', 'pathway', 'empty', 'noisy',
    'crowded', 'restless', 'hesitant', 'suspended', 'velvety', 'unhurried',
    'scarce', 'remote', 'portable', 'vital', 'variety', 'diverse', 'climate',
    'designed', 'region', 'noticeable', 'extreme', 'wealthy', 'privileged',
    'ordinary', 'charitable', 'benefit', 'suitable', 'important', 'argue',
    'believe', 'support', 'reason', 'example', 'agree', 'disagree',
}

def infer_difficulty(word):
    w = word.lower().strip()
    if w in ADVANCED_WORDS:
        return 'advanced'
    if w in BEGINNER_WORDS:
        return 'beginner'
    return 'intermediate'

# ── Convert parsed rows -> Word JSON objects ───────────────────────────────────
def rows_to_words(rows, categories, id_prefix):
    words   = []
    counter = 1
    seen    = set()

    def is_header(r):
        return ('vocabulary' in (r[0] or '').lower()
                or 'meaning'  in (r[1] or '').lower()
                or 'word/idiom' in (r[0] or '').lower())

    for row in rows:
        if is_header(row):
            continue
        if len(row) < 3:
            continue

        word       = row[0].strip()
        definition = row[1].strip()
        pos        = row[2].strip() if len(row) > 2 else ''
        synonyms   = row[3].strip() if len(row) > 3 else ''
        example    = row[5].strip() if len(row) > 5 else ''

        if not word or not definition:
            continue

        # Deduplicate within file
        key = word.lower()
        if key in seen:
            continue
        seen.add(key)

        # Parse comma-separated synonyms
        syn_list = [s.strip() for s in synonyms.split(',') if s.strip()] if synonyms else []

        # Fix any remaining Windows-1252 characters
        def fix(s):
            return s.replace('\x96', '-').replace('\x92', "'").replace('\x93', '"').replace('\x94', '"')

        word       = fix(word)
        definition = fix(definition)
        pos        = fix(pos)
        example    = fix(example)
        syn_list   = [fix(s) for s in syn_list]

        entry = {
            'id':               f'{id_prefix}-{counter:03d}',
            'word':             word,
            'definition':       definition,
            'synonyms':         syn_list,
            'exampleSentences': [example] if example else [],
            'difficulty':       infer_difficulty(word),
            'categories':       categories,
            'partOfSpeech':     pos,
        }
        words.append(entry)
        counter += 1

    return words

# ── Main ───────────────────────────────────────────────────────────────────────
def main():
    print('\n  SwordPen word converter')
    print('  -----------------------------------\n')

    files = [
        (INFORMATIVE, parse_csv_file,  ['essay', 'report'],   'inf', 'words-informative.json'),
        (NARRATIVE,   parse_csv_file,  ['journal', 'essay'],  'nar', 'words-narrative.json'),
        (PERSUASIVE,  parse_xlsx_file, ['essay', 'speech'],   'per', 'words-persuasive.json'),
    ]

    def by_diff(words, d):
        return len([w for w in words if w['difficulty'] == d])

    os.makedirs(OUT_DIR, exist_ok=True)
    total = 0

    for path, parser, categories, prefix, out_name in files:
        if not os.path.exists(path):
            print(f'  [SKIP] Not found: {path}')
            continue

        rows  = parser(path)
        words = rows_to_words(rows, categories, prefix)
        total += len(words)

        out_path = os.path.join(OUT_DIR, out_name)
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(words, f, indent=2, ensure_ascii=False)

        print(f'  {out_name}  ->  {len(words)} words')
        print(f'    beginner:     {by_diff(words, "beginner")}')
        print(f'    intermediate: {by_diff(words, "intermediate")}')
        print(f'    advanced:     {by_diff(words, "advanced")}')
        print(f'    categories:   {", ".join(categories)}')
        print(f'    written:      {out_path}\n')

    print(f'  Total words across all files: {total}')
    print('  Done.\n')

if __name__ == '__main__':
    main()
