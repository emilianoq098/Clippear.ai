console.info('Clipper media worker placeholder ready; job processing arrives in a later phase.');

const keepAlive = setInterval(() => undefined, 60_000);
process.on('SIGINT', () => {
  clearInterval(keepAlive);
  process.exit(0);
});
