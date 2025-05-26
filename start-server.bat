@echo off
echo Iniciando JSON Server...
cd /d %~dp0
start json-server --watch data/products.json --port 3000
start json-server --watch data/users.json --port 3001
start json-server --watch data/orders.json --port 3002
pause