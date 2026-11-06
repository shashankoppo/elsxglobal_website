// Must be loaded via --require before Next.js starts.
// Patches fs and fs/promises to retry on EAGAIN (sandbox filesystem limitation).
const fs = require('fs');
const fsp = fs.promises;

const MAX_RETRIES = 500;
const RETRY_MS = 50;

function sleep(ms) { const t = Date.now(); while (Date.now() - t < ms) {} }

function wrapSync(fn, ctx) {
  if (!fn) return fn;
  const patched = function(...args) {
    for (let i = 0; i < MAX_RETRIES; i++) {
      try { return fn.apply(ctx, args); }
      catch (e) { if (e && e.code === 'EAGAIN' && i < MAX_RETRIES - 1) { sleep(RETRY_MS); continue; } throw e; }
    }
  };
  Object.assign(patched, fn);
  return patched;
}

function wrapCb(fn, ctx) {
  if (!fn) return fn;
  const patched = function(...args) {
    const cb = args[args.length - 1];
    if (typeof cb !== 'function') return fn.apply(ctx, args);
    let n = 0;
    const retry = (err, res) => {
      if (err && err.code === 'EAGAIN' && n < MAX_RETRIES - 1) {
        n++;
        setTimeout(() => fn.apply(ctx, args), RETRY_MS);
      } else { cb(err, res); }
    };
    args[args.length - 1] = retry;
    return fn.apply(ctx, args);
  };
  Object.assign(patched, fn);
  return patched;
}

function wrapAsync(fn, ctx) {
  if (!fn) return fn;
  const patched = async function(...args) {
    for (let i = 0; i < MAX_RETRIES; i++) {
      try { return await fn.apply(ctx, args); }
      catch (e) { if (e && e.code === 'EAGAIN' && i < MAX_RETRIES - 1) { await new Promise(r => setTimeout(r, RETRY_MS)); continue; } throw e; }
    }
  };
  Object.assign(patched, fn);
  return patched;
}

// Sync
fs.readdirSync = wrapSync(fs.readdirSync, fs);
fs.statSync = wrapSync(fs.statSync, fs);
fs.lstatSync = wrapSync(fs.lstatSync, fs);
fs.opendirSync = wrapSync(fs.opendirSync, fs);
fs.existsSync = wrapSync(fs.existsSync, fs);
fs.accessSync = wrapSync(fs.accessSync, fs);
fs.realpathSync = wrapSync(fs.realpathSync, fs);
fs.readlinkSync = wrapSync(fs.readlinkSync, fs);

// Callback
fs.readdir = wrapCb(fs.readdir, fs);
fs.stat = wrapCb(fs.stat, fs);
fs.lstat = wrapCb(fs.lstat, fs);
fs.opendir = wrapCb(fs.opendir, fs);
fs.realpath = wrapCb(fs.realpath, fs);
fs.readlink = wrapCb(fs.readlink, fs);

// Promises
fsp.readdir = wrapAsync(fsp.readdir, fsp);
fsp.stat = wrapAsync(fsp.stat, fsp);
fsp.lstat = wrapAsync(fsp.lstat, fsp);
fsp.opendir = wrapAsync(fsp.opendir, fsp);
fsp.realpath = wrapAsync(fsp.realpath, fsp);

// Also patch graceful-fs if it's already loaded (it captures fs references)
try {
  const gfs = require('graceful-fs');
  if (gfs && gfs.gracefulify) {
    // Re-gracefulify to pick up our patched fs
    gfs.gracefulify(fs);
  }
} catch (e) {}
