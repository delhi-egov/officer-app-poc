This is a static frontend application that needs to be served by a web server

Nginx config

    server {
        listen 8888 default_server;
        charset UTF-8;

        server_name localhost;

        location / {
                # Replace the path below to the directory where you have cloned this repository
                root /home/user-1/Documents/Work/delhi-govt/poc/officer-app-poc/;
        }
        location /api/ {
                proxy_pass http://localhost:8080/app/;
        }

    }

