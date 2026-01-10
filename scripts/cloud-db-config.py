#!/usr/bin/env python3
"""
Cloud database configuration helper
Supports both Cloud SQL (production) and local PostgreSQL (development)
"""

import os
import psycopg2
from typing import Dict, Optional

def get_db_config() -> Dict[str, str]:
    """
    Get database configuration based on environment

    Returns:
        Dictionary with database connection parameters
    """
    # Check if running in Cloud Run (uses Cloud SQL)
    if os.getenv('CLOUD_SQL_CONNECTION_NAME'):
        # Cloud SQL configuration
        return {
            'dbname': os.getenv('DB_NAME', 'hotstar_source'),
            'user': os.getenv('DB_USER', 'postgres'),
            'password': os.getenv('DB_PASSWORD'),
            'host': f'/cloudsql/{os.getenv("CLOUD_SQL_CONNECTION_NAME")}',
        }
    else:
        # Local PostgreSQL configuration
        return {
            'dbname': os.getenv('DB_NAME', 'hotstar_source'),
            'user': os.getenv('DB_USER', 'postgres'),
            'password': os.getenv('DB_PASSWORD'),
            'host': os.getenv('DB_HOST', 'localhost'),
            'port': os.getenv('DB_PORT', '5432')
        }

def get_db_connection():
    """
    Create database connection with automatic Cloud SQL support

    Returns:
        psycopg2 connection object
    """
    config = get_db_config()

    try:
        conn = psycopg2.connect(**config)
        return conn
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print(f"   Config: {config}")
        raise

def test_connection():
    """Test database connection"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print(f"✅ Database connected: {version[0]}")
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"❌ Connection test failed: {e}")
        return False

if __name__ == '__main__':
    test_connection()
