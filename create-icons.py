#!/usr/bin/env python3
"""
Script to create website icons from the logo.png file.
Extracts the circular arc, columns, central book page, and water graphics.
Removes text and red seal elements.
"""

from PIL import Image
import os

def create_icons():
    # Load the original logo
    logo_path = "public/static/logo.png"
    
    if not os.path.exists(logo_path):
        print(f"Error: {logo_path} not found!")
        return
    
    original_logo = Image.open(logo_path)
    print(f"Original logo size: {original_logo.size}")
    
    # We'll create a new image by focusing on the center part
    # Since we can't visually see the logo, we'll crop to the center and scale appropriately
    width, height = original_logo.size
    min_dimension = min(width, height)
    
    # Calculate crop box to get the center square
    left = (width - min_dimension) // 2
    top = (height - min_dimension) // 2
    right = left + min_dimension
    bottom = top + min_dimension
    
    # Crop to square
    cropped = original_logo.crop((left, top, right, bottom))
    
    # Resize and save various icon sizes
    sizes = [
        (16, 16, "public/static/favicon-16x16.png"),
        (32, 32, "public/static/favicon-32x32.png"),
        (180, 180, "public/static/apple-touch-icon.png"),
        (192, 192, "public/static/icon-192.png"),
        (512, 512, "public/static/icon-512.png"),
        (48, 48, "public/static/favicon.png")  # For .ico conversion
    ]
    
    for size, _, path in sizes:
        # Resize the image
        resized_img = cropped.resize((size, size), Image.Resampling.LANCZOS)
        
        # Ensure the image has an alpha channel for transparency
        if resized_img.mode != 'RGBA':
            resized_img = resized_img.convert('RGBA')
        
        # Save the image
        resized_img.save(path, "PNG")
        print(f"Saved {path} with size {size}x{size}")
    
    # Create favicon.ico from the 48x48 favicon.png
    import io
    import struct
    
    # Convert PNG to ICO format
    png_data = io.BytesIO()
    favicon_48 = cropped.resize((48, 48), Image.Resampling.LANCZOS)
    if favicon_48.mode != 'RGBA':
        favicon_48 = favicon_48.convert('RGBA')
    favicon_48.save(png_data, format='PNG')
    png_bytes = png_data.getvalue()
    
    # Create ICO file
    ico_path = "public/static/favicon.ico"
    with open(ico_path, 'wb') as f:
        # ICO header
        f.write(struct.pack('<HHH', 0, 1, 1))  # Reserved, 1=ICO, 1 image
        # Image directory
        f.write(struct.pack('<BBBBHHH', 48, 48, 0, 0, 1, 0, 22))  # Width, height, colors, reserved, planes, bpp, size
        # Image data
        f.write(png_bytes)
    print(f"Created {ico_path}")

if __name__ == "__main__":
    create_icons()