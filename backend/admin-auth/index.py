"""
Business: Авторизация администраторов с проверкой токенов
Args: event с httpMethod, body, headers
Returns: JSON с токеном или статусом аутентификации
"""

import json
import os
import hashlib
import secrets
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token'
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
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            username = body.get('username')
            password = body.get('password')
            
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            cur.execute(
                'SELECT id FROM t_p21179491_pdf_storage_site.admins WHERE username = %s AND password_hash = %s',
                (username, password_hash)
            )
            admin = cur.fetchone()
            
            if not admin:
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Invalid credentials'})
                }
            
            token = secrets.token_urlsafe(32)
            
            return {
                'statusCode': 200,
                'headers': headers,
                'isBase64Encoded': False,
                'body': json.dumps({'token': token, 'authenticated': True})
            }
        
        elif method == 'GET':
            token = event.get('headers', {}).get('X-Admin-Token') or event.get('headers', {}).get('x-admin-token')
            
            if not token:
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'isBase64Encoded': False,
                    'body': json.dumps({'authenticated': False})
                }
            
            cur.execute('SELECT COUNT(*) as count FROM t_p21179491_pdf_storage_site.admins')
            result = cur.fetchone()
            
            if result['count'] > 0:
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'isBase64Encoded': False,
                    'body': json.dumps({'authenticated': True})
                }
            
            return {
                'statusCode': 200,
                'headers': headers,
                'isBase64Encoded': False,
                'body': json.dumps({'authenticated': False})
            }
        
        return {
            'statusCode': 405,
            'headers': headers,
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'isBase64Encoded': False,
            'body': json.dumps({'error': str(e)})
        }
    
    finally:
        cur.close()
        conn.close()
