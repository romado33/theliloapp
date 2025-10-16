// This file exists to force a complete Vite rebuild
// by changing the dependency graph
import React from 'react';

export const FORCE_REBUILD_TOKEN = Date.now();
export const reactVersion = React.version;

console.log('Force rebuild token:', FORCE_REBUILD_TOKEN);
console.log('React version from forceRebuild:', reactVersion);
