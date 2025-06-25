import React, { useState } from 'react';
import CreateWizard from './wizard/CreateWizard';
import CreateSplashScreens from './splash/CreateSplashScreens';

export default function CreateScreen() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <CreateSplashScreens onDone={() => setShowSplash(false)} />;
  }
  return <CreateWizard />;
} 