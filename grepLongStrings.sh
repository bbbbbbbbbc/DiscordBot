#!/bin/bash

echo "🔍 Szukanie długich stringów w komendach (grep method)..."
echo ""

# Folders in order
folders=("moderation" "games" "utility" "ai" "youtube" "economy" "leveling" "music" "reminders" "polls" "fun" "stats" "social" "misc")

# Temp file for results
temp_file=$(mktemp)

for folder in "${folders[@]}"; do
  if [ -d "commands/$folder" ]; then
    for file in commands/$folder/*.js; do
      if [ -f "$file" ]; then
        # Extract strings between quotes and measure their length
        # Look for patterns like .setDescription('...'), .setName('...'), { name: '...' }, { value: '...' }
        
        # Find all string literals (single and double quotes)
        grep -oP "(?<=['\"])([^'\"]{80,})(?=['\"])" "$file" | while read -r str; do
          len=${#str}
          if [ $len -gt 100 ]; then
            echo "❌ $file | Length: $len | $str" >> "$temp_file"
          elif [ $len -gt 95 ]; then
            echo "⚠️  $file | Length: $len | $str" >> "$temp_file"
          fi
        done
      fi
    done
  fi
done

if [ -s "$temp_file" ]; then
  echo "📋 ZNALEZIONE DŁUGIE STRINGY:"
  cat "$temp_file"
else
  echo "✅ Nie znaleziono stringów >95 znaków przy użyciu grep"
fi

rm -f "$temp_file"

echo ""
echo "🔍 Sprawdzam teraz detale wszystkich .addChoices() i .setDescription()..."
echo ""

# More specific search for .setDescription(), .setName(), and choice definitions
for folder in "${folders[@]}"; do
  if [ -d "commands/$folder" ]; then
    for file in commands/$folder/*.js; do
      if [ -f "$file" ]; then
        # Extract setDescription calls
        grep -n "setDescription\|addChoices\|{ name:\|{ value:" "$file" | while IFS= read -r line; do
          # Try to extract the string content
          if echo "$line" | grep -qP "['\"](.{100,})['\"]"; then
            echo "⚠️  Potential long string in $file:"
            echo "    $line"
          fi
        done
      fi
    done
  fi
done

echo ""
echo "✅ Grep analysis complete"
