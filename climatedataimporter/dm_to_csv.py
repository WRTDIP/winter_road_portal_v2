#!/usr/bin/env python3
"""
Convert AHCCD dm (daily-monthly) files to CSV format.

AHCCD dm files contain daily climate data in a fixed-width format with one line
per month (Year, Month, then 31 daily values). This script parses them into
clean CSVs with columns: Year, Mo, Day01, Day02, ..., Day31.

Missing values are represented as -9999.9. Values beyond the actual number of
days in a month are also set to -9999.9.

Usage:
    # Convert a single file
    python dm_to_csv.py path/to/file.txt

    # Convert all dm files in a directory
    python dm_to_csv.py ./ahccd/mean_temp/*.txt -o ./ahccd/upload

    # Convert with explicit variable type (used in output filename)
    python dm_to_csv.py ./ahccd/mean_temp/*.txt -o ./ahccd/upload --variable mean_temp

    # Process an entire AHCCD extracted directory
    python dm_to_csv.py --ahccd-dir ./ahccd/mean_temp -o ./ahccd/upload --variable mean_temp
"""
import argparse
import csv
import glob
import os
import re
import calendar

NUM_DAYS = 31
TOKEN_RE = re.compile(r'-?\d+(?:\.\d+)?M?')
DATA_LINE_RE = re.compile(r'^\s*(\d{4})\s+(\d{1,2})\b')

# AHCCD station ID pattern (7-digit climate ID typically in filename)
AHCCD_STATION_RE = re.compile(r'(\d{7})')


def _extract_station_prov(lines):
    """Extract station name and province from AHCCD dm file header."""
    for line in lines[:10]:
        if ',' in line:
            parts = [p.strip() for p in line.split(',')]
            if len(parts) >= 3 and parts[1]:
                station = parts[1]
                prov = parts[2] if parts[2] else ''
                prov = re.sub(r'[^A-Z]', '', prov.upper())
                return station, prov
    return None, None


def _extract_station_id(lines, filename):
    """Try to extract AHCCD station/climate ID from header or filename."""
    # Check header lines
    for line in lines[:10]:
        if ',' in line:
            parts = [p.strip() for p in line.split(',')]
            if len(parts) >= 1 and parts[0]:
                m = AHCCD_STATION_RE.match(parts[0])
                if m:
                    return m.group(1)
    # Try filename
    m = AHCCD_STATION_RE.search(os.path.basename(filename))
    if m:
        return m.group(1)
    return None


def _normalize_name(s):
    if not s:
        return ''
    s = s.upper()
    s = re.sub(r'[^A-Z0-9]+', '_', s)
    s = re.sub(r'_+', '_', s)
    return s.strip('_')


def parse_dm_file(inpath, outpath=None, outdir=None, variable=None):
    """Parse an AHCCD dm file and write it as CSV.
    
    Args:
        inpath: Path to input dm file.
        outpath: Explicit output path. If None, auto-generated.
        outdir: Output directory (used when outpath is None).
        variable: Variable type string (e.g. 'mean_temp') for filename.
    
    Returns:
        Path to the written CSV file.
    """
    with open(inpath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    start = None
    for i, line in enumerate(lines):
        if DATA_LINE_RE.match(line):
            start = i
            break
    if start is None:
        raise ValueError(f'No data lines found in {inpath}')

    station, prov = _extract_station_prov(lines)
    station_id = _extract_station_id(lines, inpath)

    rows = []
    min_year = None
    max_year = None
    for line in lines[start:]:
        m = DATA_LINE_RE.match(line)
        if not m:
            continue
        year = int(m.group(1))
        mo = int(m.group(2))
        rest = line[m.end():]
        tokens = TOKEN_RE.findall(rest)
        tokens = [t.rstrip('M') for t in tokens]
        if len(tokens) < NUM_DAYS:
            rest_s = rest.rstrip('\n')
            parts = rest_s.strip().split()
            if len(parts) >= NUM_DAYS:
                chunks = parts
            else:
                width = max(6, len(rest_s) // NUM_DAYS) if rest_s else 6
                chunks = [rest_s[i:i+width].strip() for i in range(0, len(rest_s), width)]
            tokens = [c.rstrip('M') for c in chunks if c != '']
        tokens = [t if t != '' else '-9999.9' for t in tokens]
        if len(tokens) < NUM_DAYS:
            tokens += ['-9999.9'] * (NUM_DAYS - len(tokens))
        try:
            mdays = calendar.monthrange(year, mo)[1]
        except Exception:
            mdays = NUM_DAYS
        for i in range(mdays, NUM_DAYS):
            tokens[i] = '-9999.9'
        rows.append([year, mo] + tokens[:NUM_DAYS])
        if min_year is None or year < min_year:
            min_year = year
        if max_year is None or year > max_year:
            max_year = year

    if not rows:
        raise ValueError(f'No parsed data rows in {inpath}')

    header = ['Year', 'Mo'] + [f'Day{d:02d}' for d in range(1, NUM_DAYS+1)]

    if outpath is None:
        base_name = _normalize_name(station) if station else os.path.splitext(os.path.basename(inpath))[0]
        prov_code = prov if prov else ''
        if prov_code:
            filename = f"{base_name}_{prov_code}_{min_year}_{max_year}.csv"
        else:
            filename = f"{base_name}_{min_year}_{max_year}.csv"
        if outdir:
            outpath = os.path.join(outdir, filename)
        else:
            outpath = os.path.join(os.path.dirname(inpath), filename)

    os.makedirs(os.path.dirname(outpath) or '.', exist_ok=True)
    with open(outpath, 'w', newline='', encoding='utf-8') as outf:
        writer = csv.writer(outf)
        writer.writerow(header)
        for r in rows:
            writer.writerow(r)
    return outpath


def process_ahccd_directory(ahccd_dir, outdir, variable=None):
    """Process all dm/txt files in an AHCCD extracted directory.
    
    AHCCD zip files extract to directories containing .txt files,
    one per station. This processes all of them.
    """
    # Find all text/dm files
    patterns = ['*.txt', '*.dm', '*.dat']
    files = []
    for pattern in patterns:
        files.extend(glob.glob(os.path.join(ahccd_dir, pattern)))
        files.extend(glob.glob(os.path.join(ahccd_dir, '**', pattern), recursive=True))
    
    # Deduplicate
    files = sorted(set(files))
    
    if not files:
        print(f"No dm/txt/dat files found in {ahccd_dir}")
        return

    print(f"Found {len(files)} file(s) in {ahccd_dir}")
    success = 0
    errors = 0
    for infile in files:
        try:
            outpath = parse_dm_file(infile, outpath=None, outdir=outdir, variable=variable)
            print(f'  Wrote {outpath}')
            success += 1
        except Exception as e:
            print(f'  Error processing {infile}: {e}')
            errors += 1

    print(f"\nDone. Converted {success} file(s), {errors} error(s).")


def main():
    p = argparse.ArgumentParser(
        description='Convert AHCCD dm file(s) to CSV format for database loading.',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Convert individual files
  python dm_to_csv.py ./ahccd/mean_temp/dm*.txt -o ./ahccd/upload

  # Process entire AHCCD extracted directory
  python dm_to_csv.py --ahccd-dir ./ahccd/mean_temp -o ./ahccd/upload

  # Specify variable type
  python dm_to_csv.py --ahccd-dir ./ahccd/rainfall -o ./ahccd/rainfall_csv --variable rainfall
""",
    )
    p.add_argument('inputs', nargs='*',
                   help='Input dm file path(s) or glob pattern(s)')
    p.add_argument('-o', '--outdir', default=None,
                   help='Output directory for CSV files')
    p.add_argument('--ahccd-dir', default=None,
                   help='Process all dm files in an AHCCD extracted directory')
    p.add_argument('--variable', '-v', default=None,
                   choices=['mean_temp', 'max_temp', 'min_temp',
                            'rainfall', 'snowfall', 'total_precip'],
                   help='Variable type (for documentation/filename purposes)')
    args = p.parse_args()

    if args.ahccd_dir:
        process_ahccd_directory(args.ahccd_dir, args.outdir or args.ahccd_dir, args.variable)
    elif args.inputs:
        for pattern in args.inputs:
            for infile in glob.glob(pattern):
                try:
                    outpath = parse_dm_file(infile, outpath=None, outdir=args.outdir,
                                            variable=args.variable)
                    print(f'Wrote {outpath}')
                except Exception as e:
                    print(f'Error processing {infile}: {e}')
    else:
        p.print_help()


if __name__ == '__main__':
    main()
