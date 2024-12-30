"""
Main package initialization file for the OOAD Tech Blog Project.
"""

import sys
import os

# Add correct project root to sys.path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_root)

# Import after path setup
from src.backend.api import router
from src.backend.api.chat_service import process_user_query

__version__ = "1.0.0"
__author__ = "Your Name"

# Export commonly used components
__all__ = [
    'router',
    'process_user_query',
]