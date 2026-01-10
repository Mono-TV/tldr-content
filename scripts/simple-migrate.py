#!/usr/bin/env python3
import os, sys, psycopg2
sys.path.insert(0, os.path.dirname(__file__))
try:
    from cloud_db_config import get_db_connection
    conn = get_db_connection()
except: conn = psycopg2.connect(dbname='hotstar_source', user=os.getenv('DB_USER'), password=os.getenv('DB_PASSWORD'), host=os.getenv('DB_HOST', 'localhost'), port=os.getenv('DB_PORT', '5432'))
cur = conn.cursor()
for f in ['001_create_hotstar_movies.sql', '002_create_sync_log.sql', '003_create_api_tokens.sql']:
    print(f'Running {f}...')
    with open(f'/app/migrations/{f}') as sql_file:
        cur.execute(sql_file.read())
    conn.commit()
    print(f'✓ {f} done')
cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name")
print('\nTables:', [r[0] for r in cur.fetchall()])
cur.close(); conn.close()
print('✅ All migrations complete!')
