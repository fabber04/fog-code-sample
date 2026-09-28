#!/usr/bin/env python3
"""
Script to upload podcasts from local folder to the backend.
Requires authentication token from admin user.

The backend will automatically upload files to Firebase Storage if configured,
or use local storage as fallback. See FIREBASE_STORAGE_SETUP.md for setup.
"""

import os
import sys
import requests
from pathlib import Path

# Configuration
# Use Render URL for production, or set via environment variable
API_BASE_URL = os.environ.get("API_BASE_URL", "https://fog-backend-iyhz.onrender.com")
PODCASTS_FOLDER = Path(__file__).parent / "BEYOND THE DATING GAME-20251209T191233Z-1-001" / "BEYOND THE DATING GAME"
IMAGES_FOLDER = Path(__file__).parent / "public" / "images" / "podcasts"

# Get auth token from environment or command line (optional now - auth disabled temporarily)
AUTH_TOKEN = os.environ.get("AUTH_TOKEN") or (sys.argv[1] if len(sys.argv) > 1 else None) or ""

# Map audio files to podcast metadata
PODCAST_METADATA = [
    {
        "filename": "Eps 01 Beyond The Dating Game.m4a",
        "title": "Episode 01: Beyond The Dating Game",
        "host": "FOG Relationship Team",
        "type": "episode",
        "category": "beyond-dating-game",
        "description": "Introduction to moving beyond superficial dating and discovering how to build meaningful, lasting relationships.",
        "coverImage": "Beyond the dating Game.jpeg",
        "tags": "relationships, dating, love, christian"
    },
    {
        "filename": "Esp 02 Study God to understand true love.m4a",
        "title": "Episode 02: Study God to Understand True Love",
        "host": "FOG Relationship Team",
        "type": "episode",
        "category": "beyond-dating-game",
        "description": "Understanding true love through studying God's word and His design for relationships.",
        "coverImage": "Beyond the dating Game.jpeg",
        "tags": "relationships, love, god, biblical"
    },
    {
        "filename": "Eps 03 The mother of all relationships.m4a",
        "title": "Episode 03: The Mother of All Relationships",
        "host": "FOG Relationship Team",
        "type": "episode",
        "category": "beyond-dating-game",
        "description": "Exploring the foundational relationship that shapes all others in our lives.",
        "coverImage": "Beyond the dating Game.jpeg",
        "tags": "relationships, foundation, family"
    },
    {
        "filename": "Eps 04 Love is not a game but a garden.m4a",
        "title": "Episode 04: Love is Not a Game But a Garden",
        "host": "FOG Relationship Team",
        "type": "episode",
        "category": "beyond-dating-game",
        "description": "Understanding that love requires cultivation, care, and patience like a garden.",
        "coverImage": "Beyond the dating Game.jpeg",
        "tags": "love, relationships, growth, patience"
    },
    {
        "filename": "Eps 05 Who is teaching you about relationships.m4a",
        "title": "Episode 05: Who is Teaching You About Relationships?",
        "host": "FOG Relationship Team",
        "type": "episode",
        "category": "beyond-dating-game",
        "description": "Examining the sources of our relationship knowledge and ensuring we learn from the right teachers.",
        "coverImage": "Beyond the dating Game.jpeg",
        "tags": "relationships, wisdom, learning, teaching"
    },
    {
        "filename": "Eps 06 Loneliness is not cured by a relationship.m4a",
        "title": "Episode 06: Loneliness is Not Cured by a Relationship",
        "host": "FOG Relationship Team",
        "type": "episode",
        "category": "beyond-dating-game",
        "description": "Understanding that relationships cannot fill the void of loneliness - finding wholeness in Christ first.",
        "coverImage": "Beyond the dating Game.jpeg",
        "tags": "loneliness, relationships, healing, wholeness"
    },
    {
        "filename": "Eps 07 Falling in love is easy but staying....m4a",
        "title": "Episode 07: Falling in Love is Easy But Staying in Love",
        "host": "FOG Relationship Team",
        "type": "episode",
        "category": "beyond-dating-game",
        "description": "The difference between falling in love and staying in love - commitment and intentionality.",
        "coverImage": "Beyond the dating Game.jpeg",
        "tags": "love, commitment, relationships, staying power"
    },
    {
        "filename": "Eps 08 Defining A Godly relationship.m4a",
        "title": "Episode 08: Defining A Godly Relationship",
        "host": "FOG Relationship Team",
        "type": "episode",
        "category": "beyond-dating-game",
        "description": "What does a God-centered relationship look like? Biblical principles for godly relationships.",
        "coverImage": "Beyond the dating Game.jpeg",
        "tags": "godly, relationships, biblical, principles"
    },
    {
        "filename": "Eps 09 Who are you glorifying in your relationship.m4a",
        "title": "Episode 09: Who Are You Glorifying in Your Relationship?",
        "host": "FOG Relationship Team",
        "type": "episode",
        "category": "beyond-dating-game",
        "description": "Ensuring our relationships bring glory to God and reflect His love to the world.",
        "coverImage": "Beyond the dating Game.jpeg",
        "tags": "glorifying god, relationships, purpose, mission"
    },
    {
        "filename": "Eps 11 Your partner should not stop you but help...m4a",
        "title": "Episode 11: Your Partner Should Not Stop You But Help You",
        "host": "FOG Relationship Team",
        "type": "episode",
        "category": "beyond-dating-game",
        "description": "A godly partner supports and encourages your growth, not hinders your purpose.",
        "coverImage": "Beyond the dating Game.jpeg",
        "tags": "partnership, support, growth, purpose"
    },
    {
        "filename": "Eps 12 Teenage Emotions and Mentality.m4a",
        "title": "Episode 12: Teenage Emotions and Mentality",
        "host": "FOG Relationship Team",
        "type": "episode",
        "category": "teens",
        "description": "Understanding teenage emotions and developing healthy relationship mindsets during adolescence.",
        "coverImage": "wisdom for teenagers.jpeg",
        "tags": "teens, emotions, relationships, youth"
    },
    {
        "filename": "Eps 13 Love is not a feeling.m4a",
        "title": "Episode 13: Love is Not a Feeling",
        "host": "FOG Relationship Team",
        "type": "episode",
        "category": "beyond-dating-game",
        "description": "Understanding that love is a choice and commitment, not just an emotion.",
        "coverImage": "Beyond the dating Game.jpeg",
        "tags": "love, choice, commitment, feelings"
    },
    {
        "filename": "Eps 14 Trap vs treasure.m4a",
        "title": "Episode 14: Trap vs Treasure",
        "host": "FOG Relationship Team",
        "type": "episode",
        "category": "beyond-dating-game",
        "description": "Learning to discern between relationships that trap you and those that are true treasures.",
        "coverImage": "Beyond the dating Game.jpeg",
        "tags": "discernment, relationships, wisdom, treasure"
    },
    {
        "filename": "Eps 15 Don_t just play learn in that relationship.m4a",
        "title": "Episode 15: Don't Just Play, Learn in That Relationship",
        "host": "FOG Relationship Team",
        "type": "episode",
        "category": "beyond-dating-game",
        "description": "Every relationship is an opportunity to learn and grow, not just to have fun.",
        "coverImage": "Beyond the dating Game.jpeg",
        "tags": "learning, growth, relationships, wisdom"
    },
    {
        "filename": "Eps 16 Ignorance makes love loud but short lived.m4a",
        "title": "Episode 16: Ignorance Makes Love Loud But Short Lived",
        "host": "FOG Relationship Team",
        "type": "episode",
        "category": "beyond-dating-game",
        "description": "Without wisdom and knowledge, relationships may start strong but quickly fade.",
        "coverImage": "Beyond the dating Game.jpeg",
        "tags": "ignorance, wisdom, relationships, knowledge"
    },
    {
        "filename": "Eps 17 Age does not qualify you for love.m4a",
        "title": "Episode 17: Age Does Not Qualify You for Love",
        "host": "FOG Relationship Team",
        "type": "episode",
        "category": "beyond-dating-game",
        "description": "Maturity and readiness for love come from character, not just age.",
        "coverImage": "Beyond the dating Game.jpeg",
        "tags": "age, maturity, love, character"
    },
    {
        "filename": "Eps 18 Focus On Becoming The right partner.m4a",
        "title": "Episode 18: Focus On Becoming The Right Partner",
        "host": "FOG Relationship Team",
        "type": "episode",
        "category": "beyond-dating-game",
        "description": "Instead of looking for the right person, focus on becoming the right person.",
        "coverImage": "Beyond the dating Game.jpeg",
        "tags": "self-improvement, becoming, relationships, growth"
    },
    {
        "filename": "Eps 19 Ignorance turns a blessing to be a burden.m4a",
        "title": "Episode 19: Ignorance Turns a Blessing to Be a Burden",
        "host": "FOG Relationship Team",
        "type": "episode",
        "category": "beyond-dating-game",
        "description": "How lack of knowledge can turn God's blessings into burdens in relationships.",
        "coverImage": "Beyond the dating Game.jpeg",
        "tags": "ignorance, blessings, relationships, wisdom"
    },
    {
        "filename": "Eps 20 Quality preparation.m4a",
        "title": "Episode 20: Quality Preparation",
        "host": "FOG Relationship Team",
        "type": "episode",
        "category": "beyond-dating-game",
        "description": "The importance of preparing yourself for a quality relationship.",
        "coverImage": "Beyond the dating Game.jpeg",
        "tags": "preparation, quality, relationships, readiness"
    },
    {
        "filename": "Eps 21 Never confuse lust for love.m4a",
        "title": "Episode 21: Never Confuse Lust for Love",
        "host": "FOG Relationship Team",
        "type": "episode",
        "category": "beyond-dating-game",
        "description": "Understanding the critical difference between lust and genuine love.",
        "coverImage": "Beyond the dating Game.jpeg",
        "tags": "lust, love, relationships, discernment"
    },
    {
        "filename": "Eps 22 Heal before the relationship.m4a",
        "title": "Episode 22: Heal Before The Relationship",
        "host": "FOG Relationship Team",
        "type": "episode",
        "category": "beyond-dating-game",
        "description": "The importance of healing from past hurts before entering new relationships.",
        "coverImage": "Beyond the dating Game.jpeg",
        "tags": "healing, relationships, wholeness, preparation"
    }
]


def upload_audio_file(file_path, token):
    """Upload audio file to backend."""
    url = f"{API_BASE_URL}/api/podcasts/upload-audio"
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    with open(file_path, "rb") as f:
        files = {"file": (os.path.basename(file_path), f, "audio/m4a")}
        response = requests.post(url, headers=headers, files=files)
    
    if not response.ok:
        error = response.json().get("detail", response.text)
        raise Exception(f"Failed to upload audio: {error}")
    
    return response.json()


def upload_cover_image(image_path, token):
    """Upload cover image to backend."""
    url = f"{API_BASE_URL}/api/podcasts/upload-cover"
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    with open(image_path, "rb") as f:
        files = {"file": (os.path.basename(image_path), f, "image/jpeg")}
        response = requests.post(url, headers=headers, files=files)
    
    if not response.ok:
        error = response.json().get("detail", response.text)
        raise Exception(f"Failed to upload cover: {error}")
    
    return response.json()


def create_podcast(podcast_data, token):
    """Create podcast entry in backend."""
    url = f"{API_BASE_URL}/api/podcasts/"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    response = requests.post(url, headers=headers, json=podcast_data)
    
    if not response.ok:
        # Try to get error message
        try:
            error = response.json().get("detail", response.text)
        except:
            error = response.text or f"HTTP {response.status_code}"
        raise Exception(f"Failed to create podcast: {error}")
    
    try:
        return response.json()
    except:
        raise Exception(f"Invalid JSON response: {response.text}")


def main():
    # Auth token is now optional (temporarily disabled on backend)
    if not AUTH_TOKEN:
        print("⚠️  Note: Uploading without authentication (temporarily enabled)")
        print("   This is for content upload only. Auth will be re-enabled later.\n")
    
    print("🚀 Starting podcast upload process...\n")
    
    total = len(PODCAST_METADATA)
    success_count = 0
    error_count = 0
    
    for i, metadata in enumerate(PODCAST_METADATA, 1):
        audio_path = PODCASTS_FOLDER / metadata["filename"]
        cover_path = IMAGES_FOLDER / metadata["coverImage"]
        
        print(f"\n[{i}/{total}] Processing: {metadata['title']}")
        
        try:
            # Check if files exist
            if not audio_path.exists():
                print(f"⚠️  Skipping: Audio file not found: {metadata['filename']}")
                error_count += 1
                continue
            
            if not cover_path.exists():
                print(f"⚠️  Skipping: Cover image not found: {metadata['coverImage']}")
                error_count += 1
                continue
            
            # Upload audio file
            print("  📤 Uploading audio file...")
            audio_result = upload_audio_file(audio_path, AUTH_TOKEN)
            print(f"  ✅ Audio uploaded: {audio_result['url']}")
            
            # Upload cover image
            print("  📤 Uploading cover image...")
            cover_result = upload_cover_image(cover_path, AUTH_TOKEN)
            print(f"  ✅ Cover uploaded: {cover_result['url']}")
            
            # Create podcast entry
            print("  📝 Creating podcast entry...")
            # Use metadata title if available, otherwise use filename
            podcast_title = metadata.get("title") or Path(metadata["filename"]).stem
            
            podcast_data = {
                "title": podcast_title,  # Use metadata title
                "host": metadata["host"],
                "type": metadata["type"],
                "category": metadata["category"],
                "description": metadata["description"],
                "duration": None,
                "is_live": False,
                "is_free": True,
                "tags": metadata["tags"],
                "audio_url": audio_result["url"],
                "transcript": None,
                "cover": cover_result["url"]
            }
            
            podcast = create_podcast(podcast_data, AUTH_TOKEN)
            print(f"  ✅ Podcast created with ID: {podcast['id']}")
            success_count += 1
            
        except Exception as error:
            print(f"  ❌ Error: {str(error)}")
            error_count += 1
    
    print(f"\n✨ Upload process completed!")
    print(f"   ✅ Success: {success_count}")
    print(f"   ❌ Errors: {error_count}")


if __name__ == "__main__":
    main()

