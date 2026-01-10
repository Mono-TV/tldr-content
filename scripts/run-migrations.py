#!/usr/bin/env python3
"""
Run database migrations
"""

import os
import sys
import psycopg2

# Add scripts directory to path for imports
sys.path.insert(0, os.path.dirname(__file__))

# Import cloud database configuration
try:
    from cloud_db_config import get_db_connection
    USE_CLOUD_DB = True
except ImportError:
    USE_CLOUD_DB = False
    DB_CONFIG = {
        'dbname': 'hotstar_source',
        'user': os.getenv('DB_USER', 'postgres'),
        'password': os.getenv('DB_PASSWORD'),
        'host': os.getenv('DB_HOST', 'localhost'),
        'port': os.getenv('DB_PORT', '5432')
    }

# Migration SQL files
MIGRATIONS = [
    '../migrations/001_create_hotstar_movies.sql',
    '../migrations/002_create_sync_log.sql',
    '../migrations/003_create_api_tokens.sql'
]

def run_migrations():
    """Run all migrations"""
    print("🔧 Running database migrations...")

    try:
        # Connect to database
        if USE_CLOUD_DB:
            conn = get_db_connection()
        else:
            conn = psycopg2.connect(**DB_CONFIG)

        cursor = conn.cursor()
        print("✅ Database connected")

        # Read and execute each migration
        for i, migration_file in enumerate(MIGRATIONS, 1):
            migration_path = os.path.join(os.path.dirname(__file__), migration_file)

            print(f"\n📄 Running migration {i}/{len(MIGRATIONS)}: {os.path.basename(migration_file)}")

            with open(migration_path, 'r') as f:
                sql = f.read()

            cursor.execute(sql)
            conn.commit()
            print(f"✅ Migration {i} completed")

        # Verify tables
        cursor.execute("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)

        tables = cursor.fetchall()
        print(f"\n📊 Tables in database:")
        for table in tables:
            print(f"  • {table[0]}")

        cursor.close()
        conn.close()

        print("\n✅ All migrations completed successfully!")

    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        sys.exit(1)

if __name__ == '__main__':
    run_migrations()
