# Benchmarking tool

The aeriOS Benchmarking tool provides the measurement of IEs performance (CPU/RAM processing and bandwidth of network interfaces); and the calculation of some technical KPIs

A small service that runs CPU (Geekbench v6) and network (iperf3) benchmarks and persists the results in the Orion Context Broker as a **Benchmark** entity.

---

## Prerequisites

- **Orion Context Broker (LD)** 
- **KrakenD API Gateway** 
- **Management Portal** 

---

### 1. Configure KrakenD API Gateway

Add your Infrastructure Elements (IE) details under `krakend.infrastructureElements`:

```yaml
krakend:
  infrastructureElements:
    - id: <ID_IE>
      internalIp: <INTERNAL_IP_OF_IE>
```

- **ID_IE**: find it in the Continuum section of the Management Portal (e.g. `0201d0816ce5`).
- **INTERNAL_IP_OF_IE**: run
  ```bash
  kubectl get nodes -o wide
  ```
  and copy the Internal IP of the node where the Benchmark pod will run.

---

## 2. Docker Compose Deployment

You can deploy directly from:

```bash
curl -L https://raw.githubusercontent.com/eclipse-aerios/benchmarking-tool/HEAD/<COMPOSE_FILE_AMD64_OR_ARM64> \
  | HLO_COMPONENTS_SHIM_URL=http://<YOUR_SHIM_HOST>:<PORT> \
    ORION_URL=http://<ORION_HOST>:<PORT> \
    ENTRYPOINT_HOST_IP=<YOUR_MAIN_NODE_BENCHMARKING_TOOL_IP> \
    docker compose -f - up -d
```

Alternatively:
1. Download the compose file
2. Create a `.env` file in the same directory with:
```dotenv
  HLO_COMPONENTS_SHIM_URL=http://<YOUR_SHIM_HOST>:<PORT>
  ORION_URL=http://<ORION_HOST>:<PORT>
  ENTRYPOINT_HOST_IP=<YOUR_NODE_IP>
```
3. Start the stack:
   ```bash
   docker compose up -d
   ```
---

**Important:** The ports used for the SHIM and Orion Context Broker (LD) must be the ones exposed via `NODEPORT`.

## 3. Kubernetes Deployment with Helm

### 3.1. Default `values.yaml`

```yaml
api:
  service:
    ports:
      server:
        port: 8010
        targetPort: 8010
        containerPort: 8010
        protocol: TCP

  envVars:
    NODE_ENV: production
    PORT: 8010
    ORION_URL: http://orion-ld-broker:1026
    LOGGER_LEVEL: info
    ENTRYPOINT_HOST_IP: localhost
    HLO_COMPONENTS_SHIM_URL: http://aerios-k8s-shim-service:8085
```

### 3.2. Install the chart

- **With a custom values file**:
  ```bash
  helm install benchmark aerios-common/benchmark -f custom-values.yaml
  ```

- **Or inline override**:
  ```bash
  helm install benchmark aerios-common/benchmark --version 0.3.0 --set api.envVars.ENTRYPOINT_HOST_IP=<YOUR_NODE_IP>
  ```

---

## 4. Environment Variables Reference

| Variable                   | Description                                                                                  | Default                               |
|----------------------------|----------------------------------------------------------------------------------------------|---------------------------------------|
| `NODE_ENV`                 | Application environment                                                                      | `production`                          |
| `PORT`                     | HTTP port                                                                                    | `8010` (but overridden above)         |
| `ORION_URL`                | Orion Context Broker URL                                                                     | `http://orion-ld-broker:1026`         |
| `LOGGER_LEVEL`             | Log verbosity (`info`, `debug`, etc.)                                                        | `info`                                |
| `ENTRYPOINT_HOST_IP`       | IP address of the main node hosting the benchmark pod                                        | _required_                            |
| `HLO_COMPONENTS_SHIM_URL`  | URL of the HLO Shim service                                                                  | `http://aerios-k8s-shim-service:8085` |
