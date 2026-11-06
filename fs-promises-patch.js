// Patch fs/promises at module load time to retry on EAGAIN
const promises = require('fs/promises');

const MAX_RETRIES = 500;
const RETRY_DELAY = 50;

function patchAsync(fn) {
  if (!fn) return fn;
  return async function(...args) {
    for (let i = 0; i < MAX_RETRIES; i++) {
      try { return await fn.apply(this, args); }
      catch (e) { if (e.code === 'EAGAIN' && i < MAX_RETRIES - 1) { await new Promise(r => setTimeout(r, RETRY_DELAY)); continue; } throw e; }
    }
  };
}

promises.readdir = patchAsync(promises.readdir);
promises.opendir = patchAsync(promises.opendir);
promises.stat = patchAsync(promises.stat);
promises.lstat = patchAsync(promises.lstat);
promises.realpath = patchAsync(promises.realpath);
promises.access = patchAsync(promises.access);
promises.readFile = patchAsync(promises.readFile);

// Also patch the sync fs module
const fs = require('fs');
function sleep(ms) { const s = Date.now(); while (Date.now() - s < ms) {} }
function patchSync(fn) {
  if (!fn || typeof fn !== 'function') return fn;
  const patched = function(...args) {
    for (let i = 0; i < MAX_RETRIES; i++) {
      try { return fn.apply(this, args); }
      catch (e) { if (e.code === 'EAGAIN' && i < MAX_RETRIES - 1) { sleep(RETRY_DELAY); continue; } throw e; }
    }
  };
  // Copy over any properties (like .native)
  Object.assign(patched, fn);
  return patched;
}
function patchCallback(fn) {
  if (!fn || typeof fn !== 'function') return fn;
  const patched = function(...args) {
    const cb = args[args.length - 1];
    if (typeof cb !== 'function') return fn.apply(this, args);
    let attempts = 0;
    const retryCb = (err, result) => {
      if (err && err.code === 'EAGAIN' && attempts < MAX_RETRIES - 1) {
        attempts++;
        setTimeout(() => fn.apply(this, args), RETRY_DELAY);
      } else {
        cb(err, result);
      }
    };
    args[args.length - 1] = retryCb;
    return fn.apply(this, args);
  };
  Object.assign(patched, fn);
  return patched;
}

fs.readdirSync = patchSync(fs.readdirSync);
fs.statSync = patchSync(fs.statSync);
fs.lstatSync = patchSync(fs.lstatSync);
fs.opendirSync = patchSync(fs.opendirSync);
fs.existsSync = patchSync(fs.existsSync);
fs.accessSync = patchSync(fs.accessSync);
fs.realpathSync = patchSync(fs.realpathSync);
fs.readlinkSync = patchSync(fs.readlinkSync);
fs.readdir = patchCallback(fs.readdir);
fs.stat = patchCallback(fs.stat);
fs.lstat = patchCallback(fs.lstat);
fs.opendir = patchCallback(fs.opendir);
fs.realpath = patchCallback(fs.realpath);
fs.readlink = patchCallback(fs.readlink);
