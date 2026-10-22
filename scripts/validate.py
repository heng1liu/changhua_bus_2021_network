"""Independent numerical and static-package checks. Requires Python + numpy."""
from pathlib import Path
from collections import deque
from html.parser import HTMLParser
import base64
import hashlib
import heapq
import json
import re
import numpy as np

root = Path(__file__).resolve().parent.parent
data = json.loads((root / 'assets/data.js').read_text('utf-8').removeprefix('window.CHANGHUA_DATA = ').strip().removesuffix(';'))
assert len(data['nodes']) == 26 and len(data['edges']) == 44 and len(data['extraEdges']) == 10
assert sum(e['Freq'] for e in data['edges']) == 213
names = {n['nodename']: i for i, n in enumerate(data['nodes'])}
assert {f['properties']['TOWNENG'] for f in data['boundaries']['features']} == {n['en'] for n in data['nodes']}

def betweenness(a):
    """Brandes with positive-cost Dijkstra, independently of R igraph."""
    n = len(a)
    score = np.zeros(n)
    for s in range(n):
        dist = [float('inf')] * n
        count = [0.] * n
        parents = [[] for _ in range(n)]
        dist[s] = 0
        count[s] = 1
        q, order = [(0, s)], []
        while q:
            distance, v = heapq.heappop(q)
            if distance != dist[v]:
                continue
            order.append(v)
            for w in np.flatnonzero(a[v]):
                alt = distance + a[v, w]
                if alt < dist[w]:
                    dist[w], count[w], parents[w] = alt, count[v], [v]
                    heapq.heappush(q, (alt, int(w)))
                elif alt == dist[w]:
                    count[w] += count[v]
                    parents[w].append(v)
        delta = np.zeros(n)
        for w in reversed(order):
            for v in parents[w]:
                delta[v] += count[v] / count[w] * (1 + delta[w])
            if w != s:
                score[w] += delta[w]
    return score / 2

for mode in ['original', 'weighted', 'full']:
    edges = data['edges'] + (data['extraEdges'] if mode == 'full' else [])
    a = np.zeros((26, 26))
    for e in edges:
        i, j = names[e['O']], names[e['D']]
        assert i != j and not a[i, j]
        a[i, j] = a[j, i] = e['Freq'] if mode == 'weighted' else 1
    eigenvalues, vectors = np.linalg.eigh(a)
    eigen = np.abs(vectors[:, -1])
    eigen /= eigen.max()
    p = a / a.sum(axis=1)[:, None]
    constraint = np.sum(((p + p @ p) ** 2) * (a > 0), axis=1)
    for metric, expected in [('betweenness', betweenness(a)), ('eigen', eigen), ('constraint', constraint)]:
        actual = np.array([r[metric] for r in data['metrics'][mode]])
        assert np.all(np.isfinite(actual))
        error = np.max(np.abs(actual - expected))
        assert error < 1e-8, (mode, metric, error)
        print(f'{mode}/{metric}: 26 values match; max error {error:.2g}')

class PackageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.translations = set()
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        if 'data-i18n' in attrs:
            self.translations.add(attrs['data-i18n'])
        ref = attrs.get('src') or (attrs.get('href') if tag == 'link' else None)
        if ref and not ref.startswith(('data:', 'http:', 'https:')):
            assert (root / ref).is_file(), ref

parser = PackageParser()
parser.feed((root / 'index.html').read_text('utf-8'))
assert len(set(parser.ids)) == len(parser.ids)
js = (root / 'assets/app.js').read_text('utf-8')
assert set(re.findall(r"\$\('([^']+)'\)", js)) <= set(parser.ids)
keys = set(re.findall(r"\b(\w+):\[", js))
assert parser.translations <= keys, parser.translations - keys
for filename, expected in [('leaflet.js', '20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='),
                           ('leaflet.css', 'p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=')]:
    actual = base64.b64encode(hashlib.sha256((root / 'assets' / filename).read_bytes()).digest()).decode()
    assert actual == expected, filename
assert not re.search(r'\bfetch\s*\(|XMLHttpRequest|L\.tileLayer', js)
print('234 metrics verified. HTML resources, translation keys, boundaries and Leaflet integrity verified. No external data or tile requests.')
