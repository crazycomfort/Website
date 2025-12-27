# Image Setup Guide

## Required Images

Save your HVAC images to the `assets/images/` folder with these exact filenames:

### About Section (1 image)
- **Filename**: `about-hvac.jpg`
- **Description**: Technician standing next to open HVAC air handler (smiling man with orange Crazy Comfort cap)

### Gallery Section (6 images)
1. **Filename**: `gallery-hvac-installation.jpg`
   - **Description**: Technician with open HVAC air handler (same as about image)

2. **Filename**: `gallery-ductwork.jpg`
   - **Description**: Two technicians working on HVAC unit with water (black & white photo)

3. **Filename**: `gallery-air-quality.jpg`
   - **Description**: Technician holding air filter with Crazy Comfort logo visible

4. **Filename**: `gallery-maintenance.jpg`
   - **Description**: Technician with diagnostic tools on AC unit (black & white, logo on back of shirt)

5. **Filename**: `gallery-energy-efficient.jpg`
   - **Description**: Technician on rooftop working on HVAC unit

6. **Filename**: `gallery-commercial-hvac.jpg`
   - **Description**: Two technicians working on outdoor AC unit (Carrier brand visible)

## How to Save Images

### Option 1: Using Finder (macOS)
1. Open Finder and navigate to your project folder
2. Go to `assets/images/` folder
3. Drag and drop your images into this folder
4. Rename each image to match the filenames listed above

### Option 2: Using Terminal
1. Open Terminal
2. Navigate to your project: 
   ```bash
   cd "/Users/kingoftheattic/Library/Mobile Documents/com~apple~CloudDocs/Crazy-Comfort-Website"
   ```
3. Copy your images to the images folder:
   ```bash
   cp /path/to/your/image1.jpg assets/images/about-hvac.jpg
   cp /path/to/your/image2.jpg assets/images/gallery-hvac-installation.jpg
   # ... and so on for each image
   ```

### Option 3: Using Cursor/VS Code
1. In Cursor, open the `assets/images/` folder in the file explorer
2. Right-click in the folder and select "New File" or drag images from your computer
3. Name each file according to the list above

## Image Recommendations
- **Format**: JPG or PNG
- **Size**: Optimize for web (800x600px to 1200x900px is ideal)
- **File Size**: Keep under 500KB per image for fast loading
- **Quality**: High quality but compressed for web use

## Verification
Once you've added all images, run:
```bash
npm run build
python3 -m http.server 8000
```
Then visit `http://localhost:8000` to see your images displayed on the website.




