FROM nodered/node-red

RUN npm install @flowfuse/node-red-dashboard
RUN npm install @flowfuse/node-red-dashboard-2-ui-iframe
RUN npm install @flowfuse/node-red-dashboard-2-ui-led

WORKDIR /data
COPY src/package.json /data
RUN npm install --unsafe-perm --no-update-notifier --no-fund --only=production
WORKDIR /usr/src/node-red

COPY src/settings.js /data/settings.js
COPY src/flows.json /data/flows.json