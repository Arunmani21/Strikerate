// One-off diagnostic: talk to the Capacitor webview over the DevTools protocol
// (adb forward) and run a fetch from inside the page to see the real error.
import { execSync } from "node:child_process";

const adb = `${process.env.LOCALAPPDATA}/Android/Sdk/platform-tools/adb.exe`;
const pid = execSync(`${adb} shell pidof com.strikerate.app`).toString().trim().split(/\s+/)[0];
execSync(`${adb} forward tcp:9222 localabstract:webview_devtools_remote_${pid}`);

const targets = await (await fetch("http://127.0.0.1:9222/json")).json();
const page = targets.find((t) => t.type === "page");
if (!page) throw new Error("no webview page found: " + JSON.stringify(targets.map(t => t.type)));
console.log("page:", page.url);

const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();

function send(method, params) {
  return new Promise((resolve) => {
    const msgId = ++id;
    pending.set(msgId, resolve);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });
}

ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  } else if (msg.method === "Network.loadingFailed") {
    console.log("NETWORK FAILED:", JSON.stringify(msg.params));
  } else if (msg.method === "Network.responseReceived") {
    console.log("RESPONSE:", msg.params.response.status, msg.params.response.url);
  }
};

await new Promise((r) => (ws.onopen = r));
await send("Runtime.enable", {});
await send("Network.enable", {});

const result = await send("Runtime.evaluate", {
  expression: `fetch("http://192.168.1.4:3000/health").then(r => "HTTP " + r.status).catch(e => "FETCH ERROR: " + e)`,
  awaitPromise: true,
  returnByValue: true,
});
console.log("evaluate:", JSON.stringify(result.result?.result?.value ?? result));

// Where does the page think it lives?
const origin = await send("Runtime.evaluate", { expression: "location.origin", returnByValue: true });
console.log("origin:", JSON.stringify(origin.result?.result?.value));

ws.close();
process.exit(0);
