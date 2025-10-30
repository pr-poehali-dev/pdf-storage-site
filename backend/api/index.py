"""
Business: API для управления папками и документами
Args: event с httpMethod, body, queryStringParameters
Returns: JSON с данными папок/документов или статус операции
"""

import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    path = event.get('queryStringParameters', {}).get('path', '')
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if path == 'folders':
            if method == 'GET':
                cur.execute('SELECT id, name, color, icon FROM folders ORDER BY created_at')
                folders = cur.fetchall()
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps([dict(row) for row in folders])
                }
            
            elif method == 'POST':
                body = json.loads(event.get('body', '{}'))
                name = body.get('name')
                color = body.get('color')
                icon = body.get('icon')
                
                cur.execute(
                    "INSERT INTO folders (name, color, icon) VALUES (%s, %s, %s) RETURNING id, name, color, icon",
                    (name, color, icon)
                )
                folder = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': headers,
                    'body': json.dumps(dict(folder))
                }
            
            elif method == 'DELETE':
                folder_id = event.get('queryStringParameters', {}).get('id')
                cur.execute('SELECT COUNT(*) as count FROM documents WHERE folder_id = %s', (folder_id,))
                result = cur.fetchone()
                
                if result['count'] > 0:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Папка содержит документы'})
                    }
                
                cur.execute('DELETE FROM folders WHERE id = %s', (folder_id,))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'success': True})
                }
        
        elif path == 'documents':
            if method == 'GET':
                cur.execute('''
                    SELECT d.id, d.name, d.description, d.folder_id as "folderId", 
                           d.upload_date as "uploadDate", d.size
                    FROM documents d
                    ORDER BY d.created_at DESC
                ''')
                documents = cur.fetchall()
                result = []
                for row in documents:
                    doc = dict(row)
                    doc['uploadDate'] = doc['uploadDate'].isoformat() if doc['uploadDate'] else None
                    result.append(doc)
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps(result)
                }
            
            elif method == 'POST':
                body = json.loads(event.get('body', '{}'))
                name = body.get('name')
                description = body.get('description', '')
                folder_id = body.get('folderId')
                
                cur.execute(
                    '''INSERT INTO documents (name, description, folder_id) 
                       VALUES (%s, %s, %s) 
                       RETURNING id, name, description, folder_id as "folderId", upload_date as "uploadDate", size''',
                    (name, description, folder_id)
                )
                doc = cur.fetchone()
                conn.commit()
                
                result = dict(doc)
                result['uploadDate'] = result['uploadDate'].isoformat() if result['uploadDate'] else None
                
                return {
                    'statusCode': 201,
                    'headers': headers,
                    'body': json.dumps(result)
                }
            
            elif method == 'DELETE':
                doc_id = event.get('queryStringParameters', {}).get('id')
                cur.execute('DELETE FROM documents WHERE id = %s', (doc_id,))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'success': True})
                }
        
        return {
            'statusCode': 404,
            'headers': headers,
            'body': json.dumps({'error': 'Not found'})
        }
    
    finally:
        cur.close()
        conn.close()
