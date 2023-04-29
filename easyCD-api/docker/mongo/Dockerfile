FROM mongo:latest

COPY init.js /docker-entrypoint-initdb.d/

CMD ["mongod", "--bind_ip_all"]