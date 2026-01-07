
import React, { useEffect, useState } from 'react';
import { Smartphone, QrCode, Plane } from 'lucide-react';

const MobileGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // MobileGuard agora é apenas um pass-through, pois o app suporta Desktop
  return <>{children}</>;
};

export default MobileGuard;
