import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { CameraOff, Loader2 } from 'lucide-react';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose?: () => void;
}

const QRScanner = ({ onScanSuccess }: QRScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasScanned = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const elementId = 'qr-reader';
    let isMounted = true;

    const startScanner = async () => {
      if (!isMounted) return;
      setIsLoading(true);
      setError(null);
      
      try {
        const scanner = new Html5Qrcode(elementId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 200, height: 200 } },
          (decodedText) => {
            if (!hasScanned.current && isMounted) {
              hasScanned.current = true;
              onScanSuccess(decodedText);
            }
          },
          () => {} // ignore errors during scanning
        );
        
        if (isMounted) {
          setIsLoading(false);
        } else {
          // If unmounted while starting, stop it immediately
          scanner.stop().then(() => scanner.clear()).catch(() => {});
        }
      } catch (err) {
        console.error('QR Scanner error:', err);
        if (isMounted) {
          setError('Kamera tidak dapat diakses atau tidak didukung oleh browser.');
          setIsLoading(false);
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      const scanner = scannerRef.current;
      if (scanner) {
        // Use a safer way to stop and clear
        const cleanup = async () => {
          try {
            if (scanner.isScanning) {
              await scanner.stop();
            }
            scanner.clear();
          } catch (e) {
            console.warn('QR Scanner cleanup warning:', e);
          }
        };
        cleanup();
        scannerRef.current = null;
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="rounded-lg overflow-hidden bg-muted relative min-h-[200px] flex items-center justify-center">
      <div id="qr-reader" ref={containerRef} className="w-full" />
      
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted gap-2">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-xs text-muted-foreground">Mengaktifkan kamera...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted p-4 text-center gap-2">
          <CameraOff className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
