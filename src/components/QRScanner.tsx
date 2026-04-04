import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose?: () => void;
}

const QRScanner = ({ onScanSuccess }: QRScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasScanned = useRef(false);

  useEffect(() => {
    const elementId = 'qr-reader';

    const startScanner = async () => {
      try {
        const scanner = new Html5Qrcode(elementId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 200, height: 200 } },
          (decodedText) => {
            if (!hasScanned.current) {
              hasScanned.current = true;
              onScanSuccess(decodedText);
            }
          },
          () => {} // ignore errors during scanning
        );
      } catch (err) {
        console.error('QR Scanner error:', err);
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="rounded-lg overflow-hidden bg-muted">
      <div id="qr-reader" ref={containerRef} className="w-full" />
    </div>
  );
};

export default QRScanner;
