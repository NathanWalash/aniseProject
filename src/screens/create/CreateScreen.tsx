import React, { useState } from 'react';
import { Modal } from 'react-native';
import CreateWizard from './wizard/CreateWizard';
import CreateSplashScreens from './splash/CreateSplashScreens';

export default function CreateScreen({ user }: { user: any }) {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      <Modal visible={showSplash} animationType="slide" onRequestClose={() => setShowSplash(false)} presentationStyle="fullScreen">
        <CreateSplashScreens onDone={() => setShowSplash(false)} />
      </Modal>
      {!showSplash && <CreateWizard user={user} />}
    </>
  );
} 