"""
Business: API для управления папками и документами с загрузкой PDF файлов
Args: event с httpMethod, body, queryStringParameters
Returns: JSON с данными папок/документов или статус операции
"""

import json
import os
import base64
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
            'isBase64Encoded': False,
            'body': ''
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if path == 'folders':
            if method == 'GET':
                cur.execute('SELECT id, name, color, icon, folder_order FROM t_p21179491_pdf_storage_site.folders ORDER BY folder_order, created_at')
                folders = cur.fetchall()
                result = []
                for row in folders:
                    folder = dict(row)
                    folder['order'] = folder.pop('folder_order', None)
                    result.append(folder)
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'isBase64Encoded': False,
                    'body': json.dumps(result)
                }
            
            elif method == 'POST':
                body = json.loads(event.get('body', '{}'))
                name = body.get('name')
                color = body.get('color')
                icon = body.get('icon')
                
                cur.execute(
                    "INSERT INTO t_p21179491_pdf_storage_site.folders (name, color, icon) VALUES (%s, %s, %s) RETURNING id, name, color, icon",
                    (name, color, icon)
                )
                folder = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': headers,
                    'isBase64Encoded': False,
                    'body': json.dumps(dict(folder))
                }
            
            elif method == 'DELETE':
                folder_id = event.get('queryStringParameters', {}).get('id')
                cur.execute('SELECT COUNT(*) as count FROM t_p21179491_pdf_storage_site.documents WHERE folder_id = %s', (folder_id,))
                result = cur.fetchone()
                
                if result['count'] > 0:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'isBase64Encoded': False,
                        'body': json.dumps({'error': 'Папка содержит документы'})
                    }
                
                cur.execute('DELETE FROM t_p21179491_pdf_storage_site.folders WHERE id = %s', (folder_id,))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True})
                }
        
        elif path == 'documents':
            if method == 'GET':
                cur.execute('''
                    SELECT d.id, d.name, d.description, d.folder_id as "folderId", 
                           d.upload_date as "uploadDate", d.size,
                           CASE WHEN d.file_data IS NOT NULL THEN true ELSE false END as "hasFile"
                    FROM t_p21179491_pdf_storage_site.documents d
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
                    'isBase64Encoded': False,
                    'body': json.dumps(result)
                }
            
            elif method == 'POST':
                body = json.loads(event.get('body', '{}'))
                name = body.get('name')
                description = body.get('description', '')
                folder_id = body.get('folderId')
                file_data = body.get('file')
                
                file_size = '0 KB'
                
                if file_data:
                    try:
                        file_content = base64.b64decode(file_data)
                        file_size = f"{len(file_content) / 1024:.1f} KB" if len(file_content) < 1024*1024 else f"{len(file_content) / (1024*1024):.1f} MB"
                    except Exception:
                        file_data = None
                        file_size = '0 KB'
                
                cur.execute(
                    '''INSERT INTO t_p21179491_pdf_storage_site.documents (name, description, folder_id, file_data, size) 
                       VALUES (%s, %s, %s, %s, %s) 
                       RETURNING id, name, description, folder_id as "folderId", upload_date as "uploadDate", size''',
                    (name, description, folder_id, file_data, file_size)
                )
                doc = cur.fetchone()
                conn.commit()
                
                result = dict(doc)
                result['uploadDate'] = result['uploadDate'].isoformat() if result['uploadDate'] else None
                
                return {
                    'statusCode': 201,
                    'headers': headers,
                    'isBase64Encoded': False,
                    'body': json.dumps(result)
                }
            
            elif method == 'PUT':
                body = json.loads(event.get('body', '{}'))
                doc_id = body.get('id')
                name = body.get('name')
                description = body.get('description', '')
                folder_id = body.get('folderId')
                
                cur.execute(
                    '''UPDATE t_p21179491_pdf_storage_site.documents 
                       SET name = %s, description = %s, folder_id = %s
                       WHERE id = %s
                       RETURNING id, name, description, folder_id as "folderId", upload_date as "uploadDate", size''',
                    (name, description, folder_id, doc_id)
                )
                doc = cur.fetchone()
                conn.commit()
                
                result = dict(doc)
                result['uploadDate'] = result['uploadDate'].isoformat() if result['uploadDate'] else None
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'isBase64Encoded': False,
                    'body': json.dumps(result)
                }
            
            elif method == 'DELETE':
                doc_id = event.get('queryStringParameters', {}).get('id')
                cur.execute('DELETE FROM t_p21179491_pdf_storage_site.documents WHERE id = %s', (doc_id,))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True})
                }
        
        elif path == 'view':
            if method == 'GET':
                doc_id = event.get('queryStringParameters', {}).get('id')
                cur.execute('SELECT file_data, name FROM t_p21179491_pdf_storage_site.documents WHERE id = %s', (doc_id,))
                doc = cur.fetchone()
                
                if not doc or not doc['file_data']:
                    return {
                        'statusCode': 404,
                        'headers': headers,
                        'isBase64Encoded': False,
                        'body': json.dumps({'error': 'File not found'})
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': f'inline; filename="{doc["name"]}.pdf"'
                    },
                    'isBase64Encoded': True,
                    'body': doc['file_data']
                }
        
        elif path == 'download':
            if method == 'GET':
                doc_id = event.get('queryStringParameters', {}).get('id')
                cur.execute('SELECT file_data, name FROM t_p21179491_pdf_storage_site.documents WHERE id = %s', (doc_id,))
                doc = cur.fetchone()
                
                if not doc or not doc['file_data']:
                    return {
                        'statusCode': 404,
                        'headers': headers,
                        'isBase64Encoded': False,
                        'body': json.dumps({'error': 'File not found'})
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': f'attachment; filename="{doc["name"]}.pdf"'
                    },
                    'isBase64Encoded': True,
                    'body': doc['file_data']
                }
        
        elif path == 'reorder':
            if method == 'PUT':
                body = json.loads(event.get('body', '{}'))
                folder_ids = body.get('folderIds', [])
                
                for idx, folder_id in enumerate(folder_ids):
                    cur.execute(
                        'UPDATE t_p21179491_pdf_storage_site.folders SET folder_order = %s WHERE id = %s',
                        (idx, folder_id)
                    )
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True})
                }
        
        return {
            'statusCode': 404,
            'headers': headers,
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Path not found'})
        }
    
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': headers,
            'isBase64Encoded': False,
            'body': json.dumps({'error': str(e)})
        }
    
    finally:
        cur.close()
        conn.close()