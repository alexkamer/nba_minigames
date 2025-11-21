"""
Face feature swapping using MediaPipe for landmark detection.
Swaps specific facial features (hair, eyes, nose, mouth) between players.
"""
import io
from typing import List, Tuple
from PIL import Image, ImageDraw
import requests
import numpy as np
import cv2
import mediapipe as mp


def download_player_image(player_id: str, size: int = 400) -> Tuple[Image.Image, np.ndarray]:
    """
    Download a player headshot from ESPN.

    Args:
        player_id: ESPN player ID
        size: Image size (width and height)

    Returns:
        Tuple of (PIL Image, numpy array in RGB)
    """
    url = f"https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/{player_id}.png&w={size}&h={size}"
    response = requests.get(url, timeout=10)
    response.raise_for_status()

    img = Image.open(io.BytesIO(response.content))

    # Convert to RGB
    if img.mode == 'RGBA':
        # Create white background
        background = Image.new('RGB', img.size, (255, 255, 255))
        background.paste(img, mask=img.split()[3])
        img = background
    elif img.mode != 'RGB':
        img = img.convert('RGB')

    # Convert to numpy array for OpenCV
    img_array = np.array(img)

    return img, img_array


def detect_face_landmarks(image: np.ndarray) -> dict:
    """
    Detect facial landmarks using MediaPipe.

    Args:
        image: Image as numpy array (RGB)

    Returns:
        Dictionary containing landmark points for different facial features
    """
    mp_face_mesh = mp.solutions.face_mesh

    with mp_face_mesh.FaceMesh(
        static_image_mode=True,
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.5
    ) as face_mesh:
        results = face_mesh.process(image)

        if not results.multi_face_landmarks:
            return None

        landmarks = results.multi_face_landmarks[0]
        h, w = image.shape[:2]

        # Convert normalized landmarks to pixel coordinates
        points = []
        for landmark in landmarks.landmark:
            x = int(landmark.x * w)
            y = int(landmark.y * h)
            points.append((x, y))

        # Define regions based on MediaPipe face mesh indices
        return {
            'all_points': points,
            'left_eye': [points[i] for i in [33, 133, 160, 159, 158, 157, 173, 155, 154, 153, 145, 144, 163, 7]],
            'right_eye': [points[i] for i in [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385]],
            'nose': [points[i] for i in [1, 2, 98, 327, 326, 325, 324, 305, 97, 99, 94, 19, 94]],
            'mouth': [points[i] for i in [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146]],
            'face_oval': [points[i] for i in [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]],
        }


def expand_polygon(points: List[Tuple[int, int]], scale: float = 1.2) -> List[Tuple[int, int]]:
    """
    Expand a polygon by scaling from its center.

    Args:
        points: List of (x, y) coordinates
        scale: Scale factor (>1 expands, <1 shrinks)

    Returns:
        Expanded points
    """
    if not points:
        return points

    points_array = np.array(points, dtype=np.float32)
    center = points_array.mean(axis=0)
    expanded = center + (points_array - center) * scale
    return [(int(x), int(y)) for x, y in expanded]


def create_feature_mask(image_shape: Tuple[int, int], points: List[Tuple[int, int]],
                        feather: int = 15, expand: float = 1.3) -> np.ndarray:
    """
    Create a mask for a facial feature with feathered edges.

    Args:
        image_shape: (height, width) of the image
        points: List of (x, y) coordinates defining the feature region
        feather: Pixels to feather the edge
        expand: Expand the region by this factor

    Returns:
        Mask as numpy array (0-255)
    """
    h, w = image_shape[:2]
    mask = np.zeros((h, w), dtype=np.uint8)

    # Expand the polygon to make features more prominent
    expanded_points = expand_polygon(points, expand)

    # Draw filled polygon
    points_array = np.array(expanded_points, dtype=np.int32)
    cv2.fillPoly(mask, [points_array], 255)

    # Feather the edges with Gaussian blur
    if feather > 0:
        mask = cv2.GaussianBlur(mask, (feather * 2 + 1, feather * 2 + 1), 0)

    return mask


def swap_feature(base_img: np.ndarray, feature_img: np.ndarray,
                 base_landmarks: dict, feature_landmarks: dict,
                 feature_name: str, expand: float = 1.5, feather: int = 25) -> np.ndarray:
    """
    Swap a specific facial feature from one image to another.

    Args:
        base_img: Base image to composite onto
        feature_img: Image containing the feature to extract
        base_landmarks: Landmarks from base image
        feature_landmarks: Landmarks from feature image
        feature_name: Name of feature ('left_eye', 'right_eye', 'nose', 'mouth')
        expand: How much to expand the feature region
        feather: Feathering amount for edges

    Returns:
        Composited image
    """
    # Get the feature points
    feature_points = feature_landmarks.get(feature_name, [])
    if not feature_points:
        return base_img

    # Create mask for the feature with larger expansion
    mask = create_feature_mask(feature_img.shape, feature_points, feather=feather, expand=expand)

    # Expand mask to 3 channels
    mask_3ch = cv2.merge([mask, mask, mask]) / 255.0

    # Blend the feature onto the base image
    result = base_img.copy()
    result = (result * (1 - mask_3ch) + feature_img * mask_3ch).astype(np.uint8)

    return result


def create_frankenstein_face(player_id1: str, player_id2: str, player_id3: str) -> Image.Image:
    """
    Create a composite face with features from three different players.

    Feature assignment:
    - Player 1 (Curry): Hair, eyes, ears
    - Player 2 (Edwards): Face structure (BASE)
    - Player 3 (Durant): Nose, mouth, chin

    Args:
        player_id1: Curry - provides hair, eyes, ears
        player_id2: Edwards - BASE face structure
        player_id3: Durant - provides nose, mouth, chin

    Returns:
        Composite PIL Image
    """
    # Download all three images
    img1_pil, img1 = download_player_image(player_id1)  # Curry
    img2_pil, img2 = download_player_image(player_id2)  # Edwards (BASE)
    img3_pil, img3 = download_player_image(player_id3)  # Durant

    # Detect landmarks
    landmarks1 = detect_face_landmarks(img1)
    landmarks2 = detect_face_landmarks(img2)
    landmarks3 = detect_face_landmarks(img3)

    print(f"Landmarks detected - Curry: {landmarks1 is not None}, Edwards: {landmarks2 is not None}, Durant: {landmarks3 is not None}")

    if not landmarks1 or not landmarks2 or not landmarks3:
        # Fallback to simple blending if face detection fails
        print("Face detection failed, using fallback blending")
        from . import face_blend
        return face_blend.blend_three_players_advanced(player_id1, player_id2, player_id3)

    # Start with Edwards (player 2) as base face structure
    result = img2.copy()

    print("Swapping eyes from Curry (player 1)...")
    # Swap eyes from Curry with large expansion
    result = swap_feature(result, img1, landmarks2, landmarks1, 'left_eye', expand=2.2, feather=15)
    result = swap_feature(result, img1, landmarks2, landmarks1, 'right_eye', expand=2.2, feather=15)

    print("Swapping nose, mouth from Durant (player 3)...")
    # Swap nose and mouth from Durant with large expansion
    result = swap_feature(result, img3, landmarks2, landmarks3, 'nose', expand=2.0, feather=15)
    result = swap_feature(result, img3, landmarks2, landmarks3, 'mouth', expand=2.2, feather=15)

    print("Face swap complete!")

    # Convert back to PIL Image
    result_pil = Image.fromarray(result)

    return result_pil


def create_frankenstein_face_bytes(player_id1: str, player_id2: str, player_id3: str) -> bytes:
    """
    Create a Frankenstein composite face and return as PNG bytes.

    Args:
        player_id1: First player ID (base face, hair)
        player_id2: Second player ID (eyes)
        player_id3: Third player ID (nose, mouth)

    Returns:
        PNG image as bytes
    """
    try:
        composite = create_frankenstein_face(player_id1, player_id2, player_id3)

        # Save to bytes
        img_bytes = io.BytesIO()
        composite.save(img_bytes, format='PNG')
        img_bytes.seek(0)

        return img_bytes.getvalue()
    except Exception as e:
        print(f"Error creating Frankenstein face: {e}")
        # Fallback to simple blend
        from . import face_blend
        composite = face_blend.blend_three_players_advanced(player_id1, player_id2, player_id3)
        img_bytes = io.BytesIO()
        composite.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        return img_bytes.getvalue()
