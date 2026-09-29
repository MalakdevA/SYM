import sys, json, re
sys.stdout.reconfigure(encoding='utf-8')
with open('lib/data/spareParts.ts', 'r', encoding='utf-8') as f:
    content = f.read()
match = re.search(r'export const SPARE_PARTS: SparePartItem\[\] = (\[.*\]);', content, re.DOTALL)
parts = json.loads(match.group(1))
results = [p for p in parts if 'رشاش' in p.get('name','')]
for p in results:
    print(f"ID: {p['id']} | Code: {p['internalCode']} | Name: {p['name']} | Model: {p['model']} | Price: {p['price']} EGP | inStock: {p['inStock']} | Stock: {p.get('stock','-')}")
