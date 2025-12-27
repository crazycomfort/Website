#!/bin/bash

# Script to check if all required images are present

echo "Checking for required images..."
echo ""

IMAGES_DIR="assets/images"
REQUIRED_IMAGES=(
    "about-hvac.jpg"
    "gallery-hvac-installation.jpg"
    "gallery-ductwork.jpg"
    "gallery-air-quality.jpg"
    "gallery-maintenance.jpg"
    "gallery-energy-efficient.jpg"
    "gallery-commercial-hvac.jpg"
)

MISSING=0
FOUND=0

for image in "${REQUIRED_IMAGES[@]}"; do
    if [ -f "$IMAGES_DIR/$image" ]; then
        SIZE=$(ls -lh "$IMAGES_DIR/$image" | awk '{print $5}')
        echo "✓ Found: $image ($SIZE)"
        FOUND=$((FOUND + 1))
    else
        echo "✗ Missing: $image"
        MISSING=$((MISSING + 1))
    fi
done

echo ""
echo "Summary:"
echo "  Found: $FOUND / ${#REQUIRED_IMAGES[@]} images"
echo "  Missing: $MISSING / ${#REQUIRED_IMAGES[@]} images"

if [ $MISSING -eq 0 ]; then
    echo ""
    echo "✓ All images are present! Your website is ready."
    exit 0
else
    echo ""
    echo "⚠ Please add the missing images to $IMAGES_DIR/"
    exit 1
fi




