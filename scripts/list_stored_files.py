#!/usr/bin/env python3
"""
Script to list all files stored in the FOG server storage directory.
Shows file count, sizes, and organization by category.
"""

import os
from pathlib import Path
from collections import defaultdict

# Storage directory (same as in file_server.py)
STORAGE_DIR = Path(__file__).resolve().parent.parent / "storage" / "files"

# Directory structure
DIRECTORIES = {
    "podcasts": {
        "audio": STORAGE_DIR / "podcasts" / "audio",
        "covers": STORAGE_DIR / "podcasts" / "covers",
    },
    "images": {
        "events": STORAGE_DIR / "images" / "events",
        "courses": STORAGE_DIR / "images" / "courses",
        "library": STORAGE_DIR / "images" / "library",
        "general": STORAGE_DIR / "images" / "general",
    },
    "documents": {
        "library": STORAGE_DIR / "documents" / "library",
        "courses": STORAGE_DIR / "documents" / "courses",
    }
}


def format_size(size_bytes):
    """Format file size in human-readable format."""
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.2f} PB"


def get_directory_info(directory_path):
    """Get information about files in a directory."""
    if not directory_path.exists():
        return {"files": [], "count": 0, "total_size": 0}
    
    files = []
    total_size = 0
    
    for file_path in directory_path.iterdir():
        if file_path.is_file():
            size = file_path.stat().st_size
            files.append({
                "name": file_path.name,
                "size": size,
                "path": file_path
            })
            total_size += size
    
    # Sort by name
    files.sort(key=lambda x: x["name"])
    
    return {
        "files": files,
        "count": len(files),
        "total_size": total_size
    }


def list_all_files():
    """List all files in storage with detailed information."""
    print("📁 FOG Server Storage - File Listing")
    print("=" * 70)
    print(f"Storage Location: {STORAGE_DIR}")
    print()
    
    if not STORAGE_DIR.exists():
        print("❌ Storage directory does not exist!")
        print(f"   Expected: {STORAGE_DIR}")
        print("\n💡 Initialize storage by starting the server or running:")
        print("   python backend/file_server.py")
        return
    
    total_files = 0
    total_size = 0
    category_stats = defaultdict(lambda: {"count": 0, "size": 0})
    
    # List files by category
    for category, subdirs in DIRECTORIES.items():
        print(f"\n📂 {category.upper()}")
        print("-" * 70)
        
        category_count = 0
        category_size = 0
        
        for subcategory, subdir_path in subdirs.items():
            info = get_directory_info(subdir_path)
            
            if info["count"] > 0:
                print(f"\n  📁 {subcategory}/")
                print(f"     Files: {info['count']}")
                print(f"     Size: {format_size(info['total_size'])}")
                
                # List files (limit to 10, show more if verbose)
                verbose = "--verbose" in sys.argv or "-v" in sys.argv
                max_files = 50 if verbose else 10
                
                for i, file_info in enumerate(info["files"][:max_files]):
                    size_str = format_size(file_info["size"])
                    print(f"     • {file_info['name']} ({size_str})")
                
                if info["count"] > max_files:
                    remaining = info["count"] - max_files
                    print(f"     ... and {remaining} more file(s)")
                    print(f"     (Use --verbose to see all files)")
                
                # Show URL format
                if info["count"] > 0:
                    example_file = info["files"][0]
                    relative_path = example_file["path"].relative_to(STORAGE_DIR)
                    url = f"http://localhost:8000/storage/{relative_path.as_posix()}"
                    print(f"     Example URL: {url}")
            
            category_count += info["count"]
            category_size += info["total_size"]
        
        if category_count == 0:
            print("  (empty)")
        else:
            print(f"\n  Category Total: {category_count} files, {format_size(category_size)}")
        
        category_stats[category] = {
            "count": category_count,
            "size": category_size
        }
        
        total_files += category_count
        total_size += category_size
    
    # Summary
    print("\n" + "=" * 70)
    print("📊 SUMMARY")
    print("=" * 70)
    print(f"Total Files: {total_files}")
    print(f"Total Size: {format_size(total_size)}")
    print()
    print("By Category:")
    for category, stats in category_stats.items():
        if stats["count"] > 0:
            print(f"  {category:12} {stats['count']:4} files  {format_size(stats['size']):>10}")
    
    # Check legacy uploads directory
    legacy_uploads = Path(__file__).parent / "backend" / "uploads"
    if legacy_uploads.exists():
        legacy_files = list(legacy_uploads.rglob("*"))
        legacy_files = [f for f in legacy_files if f.is_file()]
        if legacy_files:
            print(f"\n⚠️  Legacy uploads directory found:")
            print(f"   {legacy_uploads}")
            print(f"   {len(legacy_files)} file(s) in legacy location")
            print(f"   (These are still accessible at /uploads/ endpoint)")


if __name__ == "__main__":
    import sys
    list_all_files()

