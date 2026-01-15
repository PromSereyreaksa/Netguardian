import fetch from "node-fetch"; 
import { performance } from "perf_hooks";

// custom file for test, 

const TARGET = "http://127.0.0.1:3000/test"; // your receiver 
const THREADS = 50; // concurrent requests
const DURATION = 10 * 1000; // 10 seconds

let totalRequests = 0;
let totalBytes = 0;
const startTime = performance.now();

async function sendRequest() {
  try {
    const res = await fetch(TARGET);
    const text = await res.text();
    totalRequests++;
    totalBytes += text.length;
  } catch (err) {
    // ignore errors
  }
}

async function worker() {
  const end = performance.now() + DURATION;
  while (performance.now() < end) {
    await sendRequest();
  }
}

async function main() {
  console.log(`Starting stress test: ${THREADS} threads for ${DURATION / 1000}s`);
  const workers = [];
  for (let i = 0; i < THREADS; i++) {
    workers.push(worker());
  }

  await Promise.all(workers);

  const elapsed = (performance.now() - startTime) / 1000;
  console.log(`Done!`);
  console.log(`Total Requests: ${totalRequests}`);
  console.log(`Total Bytes: ${totalBytes}`);
  console.log(`Requests/sec: ${(totalRequests / elapsed).toFixed(2)}`);
  console.log(`Bytes/sec: ${(totalBytes / elapsed).toFixed(2)}`);
}

main();
