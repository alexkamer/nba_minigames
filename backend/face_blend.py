"""
Face blending utility for creating composite player images.
Uses PIL/Pillow for image manipulation and blending.
"""
import io
from typing import List
from PIL import Image, ImageFilter, ImageDraw
import requests
import numpy as np


def download_player_image(player_id: str, size: int = 300) -> Image.Image:
    """
    Download a player headshot from ESPN.

    Args:
        player_id: ESPN player ID
        size: Image size (width and height)

    Returns:
        PIL Image object
    """
    url = f"https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/{player_id}.png&w={size}&h={size}"
    response = requests.get(url, timeout=10)
    response.raise_for_status()

    img = Image.open(io.BytesIO(response.content))

    # Convert to RGBA if not already
    if img.mode != 'RGBA':
        img = img.convert('RGBA')

    return img


def create_gradient_mask(width: int, height: int, position: str) -> Image.Image:
    """
    Create a gradient mask for smooth blending.

    Args:
        width: Mask width
        height: Mask height
        position: 'top', 'middle', or 'bottom'

    Returns:
        PIL Image mask
    """
    mask = Image.new('L', (width, height), 0)
    draw = ImageDraw.Draw(mask)

    if position == 'top':
        # Fade out at bottom
        for y in range(height):
            if y < height * 0.7:
                alpha = 255
            else:
                # Gradient from 255 to 0 in bottom 30%
                alpha = int(255 * (1 - (y - height * 0.7) / (height * 0.3)))
            draw.rectangle([(0, y), (width, y + 1)], fill=alpha)

    elif position == 'middle':
        # Fade in at top, fade out at bottom
        for y in range(height):
            if y < height * 0.2:
                # Fade in from 0 to 255 in top 20%
                alpha = int(255 * (y / (height * 0.2)))
            elif y > height * 0.8:
                # Fade out from 255 to 0 in bottom 20%
                alpha = int(255 * (1 - (y - height * 0.8) / (height * 0.2)))
            else:
                alpha = 255
            draw.rectangle([(0, y), (width, y + 1)], fill=alpha)

    else:  # bottom
        # Fade in at top
        for y in range(height):
            if y < height * 0.3:
                # Gradient from 0 to 255 in top 30%
                alpha = int(255 * (y / (height * 0.3)))
            else:
                alpha = 255
            draw.rectangle([(0, y), (width, y + 1)], fill=alpha)

    return mask


def blend_three_players(player_id1: str, player_id2: str, player_id3: str) -> Image.Image:
    """
    Blend three player images into one composite with smooth transitions.

    Args:
        player_id1: First player (top portion)
        player_id2: Second player (middle portion)
        player_id3: Third player (bottom portion)

    Returns:
        Composite PIL Image
    """
    # Download images
    img1 = download_player_image(player_id1)
    img2 = download_player_image(player_id2)
    img3 = download_player_image(player_id3)

    width, height = img1.size

    # Create base composite
    composite = Image.new('RGBA', (width, height), (255, 255, 255, 0))

    # Create masks for each section
    mask_top = create_gradient_mask(width, height, 'top')
    mask_middle = create_gradient_mask(width, height, 'middle')
    mask_bottom = create_gradient_mask(width, height, 'bottom')

    # Composite the images with masks
    composite.paste(img1, (0, 0), mask_top)
    composite.paste(img2, (0, 0), mask_middle)
    composite.paste(img3, (0, 0), mask_bottom)

    return composite


def blend_three_players_advanced(player_id1: str, player_id2: str, player_id3: str) -> Image.Image:
    """
    Advanced blending with more seamless transitions using alpha blending.

    Args:
        player_id1: First player (contributes to top)
        player_id2: Second player (contributes to middle)
        player_id3: Third player (contributes to bottom)

    Returns:
        Composite PIL Image
    """
    # Download images
    img1 = download_player_image(player_id1)
    img2 = download_player_image(player_id2)
    img3 = download_player_image(player_id3)

    width, height = img1.size

    # Convert to numpy arrays for easier blending
    arr1 = np.array(img1, dtype=np.float32)
    arr2 = np.array(img2, dtype=np.float32)
    arr3 = np.array(img3, dtype=np.float32)

    # Create weight arrays for each image
    weights1 = np.zeros((height, width, 1), dtype=np.float32)
    weights2 = np.zeros((height, width, 1), dtype=np.float32)
    weights3 = np.zeros((height, width, 1), dtype=np.float32)

    # Define blending regions with smooth transitions
    third = height // 3
    overlap = int(third * 0.3)  # 30% overlap between sections

    for y in range(height):
        if y < third:
            # Top section - gradually decrease player 1
            if y < third - overlap:
                weights1[y, :] = 1.0
            else:
                # Transition zone
                progress = (y - (third - overlap)) / overlap
                weights1[y, :] = 1.0 - progress
                weights2[y, :] = progress
        elif y < 2 * third:
            # Middle section - blend player 2 with player 3 at bottom
            if y < 2 * third - overlap:
                weights2[y, :] = 1.0
            else:
                # Transition zone
                progress = (y - (2 * third - overlap)) / overlap
                weights2[y, :] = 1.0 - progress
                weights3[y, :] = progress
        else:
            # Bottom section - player 3
            weights3[y, :] = 1.0

    # Blend the images
    blended = (arr1 * weights1 + arr2 * weights2 + arr3 * weights3)

    # Clip values and convert back to uint8
    blended = np.clip(blended, 0, 255).astype(np.uint8)

    # Convert back to PIL Image
    result = Image.fromarray(blended, mode='RGBA')

    return result


def create_composite_image_bytes(player_id1: str, player_id2: str, player_id3: str,
                                 use_advanced: bool = True) -> bytes:
    """
    Create a composite image and return as PNG bytes.

    Args:
        player_id1: First player ID
        player_id2: Second player ID
        player_id3: Third player ID
        use_advanced: Use advanced blending algorithm (default True)

    Returns:
        PNG image as bytes
    """
    if use_advanced:
        composite = blend_three_players_advanced(player_id1, player_id2, player_id3)
    else:
        composite = blend_three_players(player_id1, player_id2, player_id3)

    # Convert to RGB (remove alpha channel)
    rgb_composite = Image.new('RGB', composite.size, (255, 255, 255))
    rgb_composite.paste(composite, mask=composite.split()[3] if composite.mode == 'RGBA' else None)

    # Save to bytes
    img_bytes = io.BytesIO()
    rgb_composite.save(img_bytes, format='PNG')
    img_bytes.seek(0)

    return img_bytes.getvalue()
