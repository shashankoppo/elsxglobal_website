with open('app/globals.css') as f:
    content = f.read()

# Check the entire file
full_depth = 0
for i, char in enumerate(content):
    if char == '{':
        full_depth += 1
    elif char == '}':
        full_depth -= 1
    if full_depth < 0:
        line = content[:i].count('\n') + 1
        print("Unexpected closing brace in full file at line " + str(line))
        break

print("Final depth in full file: " + str(full_depth))

# Find the @layer components block
start = content.find('@layer components {')
end = content.find('}\n\n@layer utilities {')
print("@layer components starts at line " + str(content[:start].count('\n') + 1))
print("@layer components ends at line " + str(content[:end].count('\n') + 1))

# Check brace balance in the block
block = content[start:end]
depth = 0
for i, char in enumerate(block):
    if char == '{':
        depth += 1
    elif char == '}':
        depth -= 1
    if depth < 0:
        line = content[:start+i].count('\n') + 1
        print("ERROR: Unexpected closing brace at line " + str(line))
        break

print("Final depth in @layer components block: " + str(depth))
