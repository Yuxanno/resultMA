import { useEffect, useRef, useState, useCallback } from 'react';
import { X, Camera, RotateCw, Zap, ZapOff } from 'lucide-react';
import { Button } from './ui/Button';
import jsQR from 'jsqr';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const detectionIntervalRef = useRef<number | null>(null);
  const autoCaptureTriggerRef = useRef<number>(0);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [qrDetected, setQrDetected] = useState(false);
  const [circlesDetected, setCirclesDetected] = useState(false);
  const [autoCapturing, setAutoCapturing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      startCamera();
      startDetection();
    } else {
      stopCamera();
      stopDetection();
    }

    return () => {
      stopCamera();
      stopDetection();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Применяем вспышку если включена
      if (flashEnabled) {
        const track = mediaStream.getVideoTracks()[0];
        const capabilities = track.getCapabilities() as any;
        if (capabilities.torch) {
          await track.applyConstraints({
            advanced: [{ torch: true } as any]
          });
        }
      }
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Kameraga kirish imkoni yo\'q. Iltimos, brauzer sozlamalarini tekshiring.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const toggleFlash = async () => {
    if (stream) {
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as any;
      
      if (capabilities.torch) {
        try {
          await track.applyConstraints({
            advanced: [{ torch: !flashEnabled } as any]
          });
          setFlashEnabled(!flashEnabled);
        } catch (error) {
          console.error('Error toggling flash:', error);
          alert('Vspyshka bu qurilmada qo\'llab-quvvatlanmaydi');
        }
      } else {
        alert('Vspyshka bu qurilmada qo\'llab-quvvatlanmaydi');
      }
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    autoCaptureTriggerRef.current = 0;
    setQrDetected(false);
    setCirclesDetected(false);
  };

  const detectQRCode = useCallback((imageData: ImageData): boolean => {
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });
    return !!code;
  }, []);

  const detectCircles = useCallback((imageData: ImageData): boolean => {
    // Простая эвристика: проверяем наличие тёмных областей (заполненных кружков)
    // В реальном OMR листе должно быть много маленьких кружков
    const data = imageData.data;
    let darkPixels = 0;
    const threshold = 100;
    const sampleRate = 10; // Проверяем каждый 10-й пиксель для производительности
    
    for (let i = 0; i < data.length; i += 4 * sampleRate) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / 3;
      
      if (brightness < threshold) {
        darkPixels++;
      }
    }
    
    // Если есть достаточно тёмных пикселей, считаем что кружки обнаружены
    const totalSamples = data.length / (4 * sampleRate);
    const darkRatio = darkPixels / totalSamples;
    
    return darkRatio > 0.1 && darkRatio < 0.7; // От 10% до 70% тёмных пикселей
  }, []);

  const startDetection = () => {
    detectionIntervalRef.current = window.setInterval(() => {
      if (videoRef.current && overlayCanvasRef.current && !autoCapturing) {
        const video = videoRef.current;
        const canvas = overlayCanvasRef.current;
        
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          const context = canvas.getContext('2d');
          if (context) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            
            const qrFound = detectQRCode(imageData);
            const circlesFound = detectCircles(imageData);
            
            setQrDetected(qrFound);
            setCirclesDetected(circlesFound);
            
            // Автоматическая съёмка если оба обнаружены
            if (qrFound && circlesFound) {
              autoCaptureTriggerRef.current++;
              
              // Автоматически фотографируем после 5 последовательных обнаружений (примерно 1 секунда)
              if (autoCaptureTriggerRef.current >= 5) {
                setAutoCapturing(true);
                setTimeout(() => {
                  capturePhoto(true);
                }, 500); // Небольшая задержка для стабилизации
              }
            } else {
              autoCaptureTriggerRef.current = 0;
            }
          }
        }
      }
    }, 200); // Проверяем каждые 200мс
  };

  const stopDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    autoCaptureTriggerRef.current = 0;
  };

  const capturePhoto = (isAuto = false) => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `omr-${Date.now()}.jpg`, { type: 'image/jpeg' });
            onCapture(file);
            onClose();
          }
        }, 'image/jpeg', 0.95);
      }
    }
  };

  if (!isOpen) return null;

  const isFullyDetected = qrDetected && circlesDetected;
  const borderColor = isFullyDetected ? 'border-green-500' : qrDetected || circlesDetected ? 'border-yellow-500' : 'border-red-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative w-full h-full max-w-4xl max-h-screen bg-gray-900">
        {/* Верхняя панель управления */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={switchCamera}
            className="bg-gray-800 hover:bg-gray-700"
            title="Переключить камеру"
          >
            <RotateCw className="h-5 w-5" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleFlash}
            className={`bg-gray-800 hover:bg-gray-700 ${flashEnabled ? 'text-yellow-400' : ''}`}
            title={flashEnabled ? 'Выключить вспышку' : 'Включить вспышку'}
          >
            {flashEnabled ? <Zap className="h-5 w-5" /> : <ZapOff className="h-5 w-5" />}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="bg-gray-800 hover:bg-gray-700"
            title="Закрыть"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Индикатор статуса обнаружения */}
        <div className="absolute top-4 left-4 z-10 bg-gray-800 bg-opacity-90 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${qrDetected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-white text-sm">QR-код</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${circlesDetected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-white text-sm">Кружки</span>
          </div>
          {autoCapturing && (
            <div className="text-green-400 text-sm font-semibold animate-pulse">
              Автосъёмка...
            </div>
          )}
        </div>

        {/* Видео с подсветкой */}
        <div className={`relative w-full h-full flex items-center justify-center border-8 ${borderColor} transition-colors duration-300`}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          />
          
          {/* Зелёная подсветка при полном обнаружении */}
          {isFullyDetected && (
            <div className="absolute inset-0 border-8 border-green-500 animate-pulse pointer-events-none"></div>
          )}
        </div>

        {/* Кнопка ручной съёмки */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2">
          {isFullyDetected && !autoCapturing && (
            <div className="text-green-400 text-sm font-semibold bg-gray-800 bg-opacity-90 px-4 py-2 rounded-full">
              Готово к съёмке!
            </div>
          )}
          <Button
            onClick={() => capturePhoto(false)}
            size="lg"
            disabled={autoCapturing}
            className={`rounded-full w-16 h-16 ${isFullyDetected ? 'bg-green-500 hover:bg-green-600' : 'bg-white hover:bg-gray-200'} text-gray-900 disabled:opacity-50`}
            title="Сфотографировать"
          >
            <Camera className="h-8 w-8" />
          </Button>
        </div>

        {/* Скрытые canvas для обработки */}
        <canvas ref={canvasRef} className="hidden" />
        <canvas ref={overlayCanvasRef} className="hidden" />
      </div>
    </div>
  );
}
