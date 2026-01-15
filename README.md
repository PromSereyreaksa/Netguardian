# <img src="public/logo.png" alt="Netguardian Logo" width="64" style="vertical-align:middle;"> 

# Netguardian — Work In Progress

> **Status:**  
> The dashboard visuals and core metrics are now implemented.  
> Current work focuses on reliably **receiving and observing traffic from different request methods**, then gradually integrating the **correct layered tech stack** to handle traffic beyond standard HTTP.  
> At this stage, Netguardian acts as a **traffic sink and observer**, not a full mitigation system.

<img src="public/pic-1.png" alt="Dashboard Screenshot" width="600">

Netguardian is a network security monitoring dashboard designed to **observe, count, and visualize incoming traffic in real time**.  
It provides insight into request rates, active sources, and traffic behavior, with the goal of understanding how different tools and methods interact with a target service.

> This project is for **learning, and testing your stresser (attack tools) only**.

---

## Features

- Real-time traffic monitoring
- Requests-per-second (PPS) tracking
- Active source (IP) overview
- Metrics API for dashboard consumption
- Defense mode toggle (WIP)
- Visual dashboard with charts and tables

---

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```
3. Open the dashboard:
   [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

---

## How It Works (Current)

Netguardian is currently built on Node.js + Express and operates at the application layer (Layer 7).

- The server listens on port 3000 and accepts any HTTP request method (GET, POST, HEAD, custom methods, etc.).
- All incoming requests are routed through a catch‑all traffic sink that:
  - Counts total requests
  - Tracks request rate over time (PPS)
  - Records basic per‑IP activity
- A metrics API (`/api/metrics`) exposes this data to the dashboard.
- The dashboard polls the API and updates visuals in near real time.

At this stage, Netguardian observes requests, not raw packets.  
Lower‑level traffic (TCP, UDP, ICMP) is handled by the OS kernel and will be integrated later using the appropriate tooling.

---

## Roadmap (High Level)

### 1. Solidify Layer 7 (HTTP) Traffic Handling

- Ensure all HTTP methods are accepted and logged (GET, POST, HEAD, OPTIONS, and uncommon/custom methods).
- Record additional request metadata:
  - Method
  - Path
  - Headers size
  - Body size
  - Request duration
- Improve rate calculation using sliding windows instead of simple averages.
- Distinguish between:
  - Fast bursts
  - Sustained high‑rate traffic
  - Slow or long‑lived requests

### 2. Separate “Dashboard Traffic” from “Observed Traffic”

- Exclude `/dashboard` and `/api/*` routes from global traffic counters.
- Prevent self‑polling from inflating PPS values.
- Maintain a clean boundary between:
  - Control plane (dashboard + API)
  - Data plane (incoming traffic sink)

### 3. Prepare for Layer 4 Visibility (Non‑HTTP)

- Accept that Express cannot see TCP/UDP/ICMP packets directly.
- Start collecting system‑level network stats from the OS:
  - Active TCP connections
  - New connection rate
  - UDP packet counts
- Expose these values to the dashboard as external metrics, not requests.

### 4. Introduce Layer Awareness

- Classify traffic by observed layer, for example:
  - Layer 7 → HTTP requests handled by Express
  - Layer 4 → Connection and packet statistics from the system
- Display this distinction clearly in the dashboard to avoid confusion.
- Avoid labeling traffic as “attacks” — treat everything as observed events.

### 5. Improve Accuracy & Performance

- Move in‑memory counters to ring buffers or rolling windows.
- Optimize request handling to reduce overhead during high traffic.
- Add safeguards so metrics collection does not become a bottleneck itself.

### 6. Defense Mode (Later Stage)

- Start with passive detection only (flags, warnings, indicators).
- Add optional, clearly labeled mitigation logic:
  - Rate limiting
  - Temporary request rejection
- Keep defense logic modular and easy to disable.

### 7. Documentation & Safety

- Clearly document:
  - What Netguardian can observe
  - What it cannot observe
  - Which OSI layers are covered at each stage
- Emphasize learning, monitoring, and visualization over enforcement.

---

## Developed by

Prom Sereyreaksa

---

## Contributing

Contributions are welcome.

- Fork the repository
- Create a new feature branch
- Make your changes
- Submit a pull request
- Please ensure your changes are tested and align with the project’s learning‑focused goals.



