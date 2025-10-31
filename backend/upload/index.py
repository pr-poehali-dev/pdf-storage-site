"""
Business: Загрузка, хранение и скачивание PDF файлов
Args: event с httpMethod, body для загрузки, queryStringParameters для скачивания
Returns: URL файла при загрузке или PDF файл при скачивании
"""

import json
import os
import base64
import uuid
from typing import Dict, Any

UPLOAD_DIR = "/tmp/files"

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
        'Access-Control-Max-Age': '86400'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }
    
    if method == 'POST':
        try:
            os.makedirs(UPLOAD_DIR, exist_ok=True)
            
            body = json.loads(event.get('body', '{}'))
            file_data = body.get('file')
            filename = body.get('filename', 'document.pdf')
            
            if not file_data:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'No file provided'})
                }
            
            file_content = base64.b64decode(file_data)
            file_id = str(uuid.uuid4())
            file_path = f"{UPLOAD_DIR}/{file_id}.pdf"
            
            with open(file_path, 'wb') as f:
                f.write(file_content)
            
            file_size = len(file_content)
            size_str = f"{file_size / 1024:.1f} KB" if file_size < 1024*1024 else f"{file_size / (1024*1024):.1f} MB"
            
            return {
                'statusCode': 200,
                'headers': {**headers, 'Content-Type': 'application/json'},
                'body': json.dumps({
                    'fileId': file_id,
                    'size': size_str,
                    'filename': filename
                })
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'error': str(e)})
            }
    
    if method == 'GET':
        file_id = event.get('queryStringParameters', {}).get('id')
        
        if not file_id:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'File ID required'})
            }
        
        file_path = f"{UPLOAD_DIR}/{file_id}.pdf"
        
        if not os.path.exists(file_path):
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'error': 'File not found'})
            }
        
        try:
            with open(file_path, 'rb') as f:
                file_content = f.read()
            
            return {
                'statusCode': 200,
                'headers': {
                    **headers,
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': f'inline; filename="{file_id}.pdf"'
                },
                'isBase64Encoded': True,
                'body': base64.b64encode(file_content).decode('utf-8')
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'error': str(e)})
            }
    
    return {
        'statusCode': 405,
        'headers': headers,
        'body': json.dumps({'error': 'Method not allowed'})
    }
