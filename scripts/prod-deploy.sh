#!/bin/bash

cd /app
npm install
npm run build
mkdir /var/www/app
cp -r build /var/www/app/
service apache2 reload
