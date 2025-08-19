#!/usr/bin/env python3
import json
import sys
import os
import base64
import datetime
import hashlib
import hmac
import requests

# 从环境变量读取API密钥
access_key = 'AKLTYjJiOThkZDZkMTUxNDJjM2E4YmViZGMyNzMzOTM4OWM'
secret_key = 'TnpnMlpUYzNOVGRpTURFMU5ERTVPV0poWW1VMlpUaGxZVGs0WldaaFpUSQ=='

method = 'POST'
host = 'visual.volcengineapi.com'
region = 'cn-north-1'
endpoint = 'https://visual.volcengineapi.com'
service = 'cv'

def sign(key, msg):
    return hmac.new(key, msg.encode('utf-8'), hashlib.sha256).digest()

def getSignatureKey(key, dateStamp, regionName, serviceName):
    kDate = sign(key.encode('utf-8'), dateStamp)
    kRegion = sign(kDate, regionName)
    kService = sign(kRegion, serviceName)
    kSigning = sign(kService, 'request')
    return kSigning

def formatQuery(parameters):
    request_parameters_init = ''
    for key in sorted(parameters):
        request_parameters_init += key + '=' + parameters[key] + '&'
    request_parameters = request_parameters_init[:-1]
    return request_parameters

def signV4Request(access_key, secret_key, service, req_query, req_body):
    if access_key is None or secret_key is None:
        print('No access key is available.')
        sys.exit()

    t = datetime.datetime.utcnow()
    current_date = t.strftime('%Y%m%dT%H%M%SZ')
    datestamp = t.strftime('%Y%m%d')
    canonical_uri = '/'
    canonical_querystring = req_query
    signed_headers = 'content-type;host;x-content-sha256;x-date'
    payload_hash = hashlib.sha256(req_body.encode('utf-8')).hexdigest()
    content_type = 'application/json'
    canonical_headers = 'content-type:' + content_type + '\n' + 'host:' + host + \
        '\n' + 'x-content-sha256:' + payload_hash + \
        '\n' + 'x-date:' + current_date + '\n'
    canonical_request = method + '\n' + canonical_uri + '\n' + canonical_querystring + \
        '\n' + canonical_headers + '\n' + signed_headers + '\n' + payload_hash
    
    print('=== Python调试信息 ===')
    print('Canonical Request:')
    print(repr(canonical_request))
    
    algorithm = 'HMAC-SHA256'
    credential_scope = datestamp + '/' + region + '/' + service + '/' + 'request'
    string_to_sign = algorithm + '\n' + current_date + '\n' + credential_scope + '\n' + hashlib.sha256(
        canonical_request.encode('utf-8')).hexdigest()
    
    print('String to Sign:')
    print(repr(string_to_sign))
    
    signing_key = getSignatureKey(secret_key, datestamp, region, service)
    signature = hmac.new(signing_key, (string_to_sign).encode(
        'utf-8'), hashlib.sha256).hexdigest()
    
    print('Signature:', signature)
    print('========================')

    authorization_header = algorithm + ' ' + 'Credential=' + access_key + '/' + \
        credential_scope + ', ' + 'SignedHeaders=' + \
        signed_headers + ', ' + 'Signature=' + signature
    
    headers = {'X-Date': current_date,
               'Authorization': authorization_header,
               'X-Content-Sha256': payload_hash,
               'Content-Type': content_type
               }

    request_url = endpoint + '?' + canonical_querystring

    print('\nBEGIN REQUEST++++++++++++++++++++++++++++++++++++')
    print('Request URL = ' + request_url)
    try:
        r = requests.post(request_url, headers=headers, data=req_body)
    except Exception as err:
        print(f'error occurred: {err}')
        raise
    else:
        print('\nRESPONSE++++++++++++++++++++++++++++++++++++')
        print(f'Response code: {r.status_code}\n')
        resp_str = r.text.replace("\\u0026", "&")
        print(f'Response body: {resp_str}\n')

if __name__ == "__main__":
    # 请求Query
    query_params = {
        'Action': 'CVProcess',
        'Version': '2022-08-31',
    }
    formatted_query = formatQuery(query_params)

    # 请求Body
    body_params = {
        "req_key": "jimeng_high_aes_g",
        "prompt": "测试Python API调用",
        "model_version": "general_v1.3",
        "return_url": False,
        "logo_info": {"add_logo": False}
    }
    formatted_body = json.dumps(body_params)

    signV4Request(access_key, secret_key, service, formatted_query, formatted_body)