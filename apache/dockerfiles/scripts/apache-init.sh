#!/bin/bash

printf "apache-init.sh\n"

API_SERVICE_IP="$(getent hosts api | awk '{ print $1 }')"
UI_SERVICE_IP="$(getent hosts ui | awk '{ print $1 }')"
PYTHON_API_SERVICE_IP="$(getent hosts python-api | awk '{ print $1 }')"

printf "API_SERVICE_IP: %s\n" "$API_SERVICE_IP"
printf "UI_SERVICE_IP: %s\n" "$UI_SERVICE_IP"
printf "PYTHON_API_SERVICE_IP: %s\n" "$PYTHON_API_SERVICE_IP"

files=("000-default.conf" "default-ssl.conf" "default-wramp-ssl.conf" "localhost-ssl.conf")

for file in "${files[@]}"; do
printf "Processing file: %s\n" "$file"
    sed -i "s/%API_SERVICE_IP%/$API_SERVICE_IP/g" "/etc/apache2/sites-available/$file"
    sed -i "s/%UI_SERVICE_IP%/$UI_SERVICE_IP/g" "/etc/apache2/sites-available/$file"
    sed -i "s/%PYTHON_API_SERVICE_IP%/$PYTHON_API_SERVICE_IP/g" "/etc/apache2/sites-available/$file"
done

printf "Configuration files updated successfully.\n"
systemctl restart apache2