// Ambient module declarations for Docusaurus theme components
declare module '@theme/*' {
  import React from 'react';
  const Component: React.ComponentType<any>;
  export default Component;
} 