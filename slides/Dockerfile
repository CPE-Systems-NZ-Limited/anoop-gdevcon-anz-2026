# Offline presentation server: docker build -t gdevcon-slides . && docker run --rm -p 8080:80 gdevcon-slides
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html .nojekyll /usr/share/nginx/html/
COPY css /usr/share/nginx/html/css
COPY js /usr/share/nginx/html/js
COPY vendor /usr/share/nginx/html/vendor
EXPOSE 80
