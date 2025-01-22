#!/bin/bash

# Install dependencies if needed
if ! command -v magick &> /dev/null; then
    echo "ImageMagick not found. Please install it first:"
    echo "brew install imagemagick"
    exit 1
fi

# Base directory for icons
ICON_DIR="com.kolaborate.google-meets.sdPlugin/imgs/actions"

# Function to convert SVG to PNG
convert_icon() {
    local src=$1
    local basename=$(basename "$src" .svg)
    local dir=$(dirname "$src")
    
    echo "Converting $src..."
    
    # Create directory if it doesn't exist
    mkdir -p "$dir"
    
    # Create @1x version (72x72)
    magick "$src" -background none -resize 72x72 "$dir/${basename}@1x.png"
    
    # Create @2x version (144x144)
    magick "$src" -background none -resize 144x144 "$dir/${basename}@2x.png"
    
    echo "Created ${basename}@1x.png and ${basename}@2x.png"
}

# Process all icons
for action in microphone camera hand leave; do
    action_dir="$ICON_DIR/$action"
    echo "Processing $action icons in $action_dir..."
    
    # Create action directory if it doesn't exist
    mkdir -p "$action_dir"
    
    # Convert main icon
    if [ -f "$action_dir/icon.svg" ]; then
        convert_icon "$action_dir/icon.svg"
    else
        echo "Warning: Missing $action_dir/icon.svg"
    fi
    
    # Convert key states
    if [ -f "$action_dir/key_0.svg" ]; then
        convert_icon "$action_dir/key_0.svg"
    else
        echo "Warning: Missing $action_dir/key_0.svg"
    fi
    
    if [ -f "$action_dir/key_1.svg" ]; then
        convert_icon "$action_dir/key_1.svg"
    else
        echo "Warning: Missing $action_dir/key_1.svg"
    fi
    
    if [ -f "$action_dir/key.svg" ]; then
        convert_icon "$action_dir/key.svg"
    else
        echo "Warning: Missing $action_dir/key.svg"
    fi
done

echo "Conversion complete!" 