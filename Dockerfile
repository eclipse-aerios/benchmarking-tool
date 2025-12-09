FROM node:bullseye-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production
COPY . .

RUN apt-get update && apt-get install -y \
    wget \
    file \
    iperf3 \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /opt/aerios && chmod 755 /opt/aerios && \
    wget https://cdn.geekbench.com/Geekbench-6.3.0-Linux.tar.gz && \
    tar -xzvf Geekbench-6.3.0-Linux.tar.gz && \  
    mv Geekbench-6.3.0-Linux /opt/aerios/geekbench && \
    chmod +x /opt/aerios/geekbench/geekbench6 && \
    rm Geekbench-6.3.0-Linux.tar.gz

ENV NODE_ENV=production
ENV PORT=8010
ENV PORT_IPERF=5201
ENV ORION_URL=http://orion-ld-broker:1026
ENV LOGGER_LEVEL=info
ENV ENTRYPOINT_HOST_IP=localhost
ENV HLO_COMPONENTS_SHIM_URL=http://aerios-k8s-shim-service:8085

EXPOSE $PORT
EXPOSE $PORT_IPERF

CMD ["/bin/sh", "-c", "\
  echo 'NODE_ENV=' $NODE_ENV && \
  echo 'PORT=' $PORT && \
  echo 'PORT_IPERF=' $PORT_IPERF && \
  echo 'ORION_URL=' $ORION_URL && \
  echo 'LOGGER_LEVEL=' $LOGGER_LEVEL && \
  echo 'ENTRYPOINT_HOST_IP=' $ENTRYPOINT_HOST_IP && \
  echo 'HLO_COMPONENTS_SHIM_URL=' $HLO_COMPONENTS_SHIM_URL && \
  /usr/bin/iperf3 -s -p $PORT_IPERF -D && \
  npm run start"]
