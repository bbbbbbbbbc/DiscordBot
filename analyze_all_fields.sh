#!/bin/bash

echo "🔍 COMPREHENSIVE COMMAND FIELD ANALYSIS (bash/grep only)"
echo "=========================================================="
echo ""

folders=("moderation" "games" "utility" "ai" "youtube" "economy" "leveling" "music" "reminders" "polls" "fun" "stats" "social" "misc")

temp_results=$(mktemp)
all_fields=$(mktemp)

# Function to extract string content and measure length
measure_string() {
    local string="$1"
    # Remove quotes
    string="${string#\'}"
    string="${string#\"}"
    string="${string%\'}"
    string="${string%\"}"
    echo ${#string}
}

echo "📋 Analyzing all command files..."
echo ""

for folder in "${folders[@]}"; do
    if [ ! -d "commands/$folder" ]; then
        continue
    fi
    
    for file in commands/$folder/*.js; do
        if [ ! -f "$file" ]; then
            continue
        fi
        
        filepath="$folder/$(basename $file)"
        
        # Extract command name
        cmd_name=$(grep -oP "\.setName\(['\"]([^'\"]+)['\"]\)" "$file" | head -1 | grep -oP "['\"]([^'\"]+)['\"]" | tr -d "'\"")
        if [ ! -z "$cmd_name" ]; then
            len=${#cmd_name}
            echo "$len|$filepath|Command.name|$cmd_name" >> "$all_fields"
            if [ $len -gt 110 ]; then
                echo "❌ PROBLEM: $filepath - Command name ($len chars): $cmd_name" >> "$temp_results"
            elif [ $len -gt 100 ]; then
                echo "⚠️  WARNING: $filepath - Command name ($len chars): $cmd_name" >> "$temp_results"
            fi
        fi
        
        # Extract command description
        cmd_desc=$(grep -oP "\.setDescription\(['\"]([^'\"]+)['\"]\)" "$file" | head -1 | grep -oP "['\"]([^'\"]+)['\"]" | tr -d "'\"")
        if [ ! -z "$cmd_desc" ]; then
            len=${#cmd_desc}
            echo "$len|$filepath|Command.description|$cmd_desc" >> "$all_fields"
            if [ $len -gt 110 ]; then
                echo "❌ PROBLEM: $filepath - Command description ($len chars): $cmd_desc" >> "$temp_results"
            elif [ $len -gt 100 ]; then
                echo "⚠️  WARNING: $filepath - Command description ($len chars): $cmd_desc" >> "$temp_results"
            fi
        fi
        
        # Extract all option names and descriptions
        grep -n "\.setName\|\.setDescription" "$file" | while IFS=: read -r line_num content; do
            # Extract the string
            extracted=$(echo "$content" | grep -oP "['\"]([^'\"]{50,})['\"]" | head -1 | tr -d "'\"")
            if [ ! -z "$extracted" ]; then
                len=${#extracted}
                if [ $len -gt 50 ]; then
                    field_type=$(echo "$content" | grep -oP "(setName|setDescription)")
                    echo "$len|$filepath|line$line_num.$field_type|$extracted" >> "$all_fields"
                    
                    if [ $len -gt 110 ]; then
                        echo "❌ PROBLEM: $filepath:$line_num - $field_type ($len chars): $extracted" >> "$temp_results"
                    elif [ $len -gt 100 ]; then
                        echo "⚠️  WARNING: $filepath:$line_num - $field_type ($len chars): $extracted" >> "$temp_results"
                    fi
                fi
            fi
        done
        
        # Extract choice definitions (look for { name: '...', value: '...' } patterns)
        grep -n "{ name:" "$file" | while IFS=: read -r line_num content; do
            # Try to extract name
            name_val=$(echo "$content" | grep -oP "name:\s*['\"]([^'\"]+)['\"]" | grep -oP "['\"]([^'\"]+)['\"]" | head -1 | tr -d "'\"")
            if [ ! -z "$name_val" ]; then
                len=${#name_val}
                echo "$len|$filepath|line$line_num.choice.name|$name_val" >> "$all_fields"
                if [ $len -gt 110 ]; then
                    echo "❌ PROBLEM: $filepath:$line_num - Choice name ($len chars): $name_val" >> "$temp_results"
                elif [ $len -gt 100 ]; then
                    echo "⚠️  WARNING: $filepath:$line_num - Choice name ($len chars): $name_val" >> "$temp_results"
                fi
            fi
            
            # Try to extract value
            value_val=$(echo "$content" | grep -oP "value:\s*['\"]([^'\"]+)['\"]" | grep -oP "['\"]([^'\"]+)['\"]" | head -1 | tr -d "'\"")
            if [ ! -z "$value_val" ]; then
                len=${#value_val}
                echo "$len|$filepath|line$line_num.choice.value|$value_val" >> "$all_fields"
                if [ $len -gt 110 ]; then
                    echo "❌ PROBLEM: $filepath:$line_num - Choice value ($len chars): $value_val" >> "$temp_results"
                elif [ $len -gt 100 ]; then
                    echo "⚠️  WARNING: $filepath:$line_num - Choice value ($len chars): $value_val" >> "$temp_results"
                fi
            fi
        done
        
    done
done

echo "📊 RESULTS:"
echo ""

if [ -s "$temp_results" ]; then
    echo "⚠️  FOUND POTENTIAL ISSUES:"
    echo ""
    cat "$temp_results"
    echo ""
else
    echo "✅ No fields >100 or >110 characters found in command definitions"
    echo ""
fi

echo "📋 TOP 30 LONGEST FIELDS:"
echo ""
sort -t'|' -k1 -rn "$all_fields" | head -30 | while IFS='|' read -r len filepath field value; do
    echo "  $len chars | $filepath | $field"
    echo "    → \"$value\""
    echo ""
done

# Count total fields analyzed
total=$(wc -l < "$all_fields")
echo "📊 Total fields analyzed: $total"

# Cleanup
rm -f "$temp_results" "$all_fields"
