"""Wrapper for legacy Windows R encoding. Run from anywhere; requires original project."""
import argparse
import json
import subprocess
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('--rscript', default='Rscript')
args = parser.parse_args()
project = Path(__file__).resolve().parent.parent
result = subprocess.run([args.rscript, 'scripts/build-data.R', '--stdout'],
                        cwd=project, capture_output=True)
if result.returncode:
    raise RuntimeError(result.stderr.decode('utf-8', errors='replace'))
raw = result.stdout.split(b'DATA_START\n', 1)[1].split(b'\nDATA_END', 1)[0]
try:
    text = raw.decode('utf-8')
except UnicodeDecodeError:
    text = raw.decode('cp950')
data = json.loads(text.removeprefix('window.CHANGHUA_DATA = ').removesuffix(';'))
assert len(data['nodes']) == 26 and len(data['edges']) == 44
assert len(data['boundaries']['features']) == 26
assert sum(e['Freq'] for e in data['edges']) == 213
(project / 'assets/data.js').write_text(text, encoding='utf-8')
print('Exported 26 nodes, 44 edges, 10 proposed edges and 234 metric values.')
