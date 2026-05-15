#!/bin/bash
source ../venv/bin/activate

uvicorn main:app --host 0.0.0.0 --port 8000 \
  --ssl-certfile /var/www/WRTDIP/python-api/certs/cert.pem \
  --ssl-keyfile /var/www/WRTDIP/python-api/certs/key.pem
