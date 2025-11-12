import React, { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Loader2, Check, AlertCircle } from 'lucide-react';
import { Modal, ModalFooter } from '../../../../shared/ui';
import { StorageService } from '../../../../shared/lib/services/Storage.service';

interface UploadImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageUploaded: (imageUrl: string) => void;
  currentImageUrl?: string;
  eventId?: string;
  eventTitle?: string;
  isLoading?: boolean;
}

export const UploadImageModal: React.FC<UploadImageModalProps> = ({
  isOpen,
  onClose,
  onImageUploaded,
  currentImageUrl,
  eventId,
  eventTitle,
  isLoading: externalLoading
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLoading = isUploading || externalLoading;

  const resetState = () => {
    setSelectedFile(null);
    setPreviewUrl(currentImageUrl || '');
    setError('');
    setUploadSuccess(false);
    setDragActive(false);
  };

  const handleClose = () => {
    if (!isLoading) {
      resetState();
      onClose();
    }
  };

  const validateFile = (file: File): boolean => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      setError('Tipo de archivo no permitido. Solo se permiten imágenes JPG, PNG, GIF y WEBP.');
      return false;
    }

    if (file.size > maxSize) {
      setError('El archivo es demasiado grande. Tamaño máximo: 5MB.');
      return false;
    }

    setError('');
    return true;
  };

  const handleFileSelect = async (file: File) => {
    if (!validateFile(file)) {
      return;
    }

    setSelectedFile(file);
    setError('');
    setUploadSuccess(false);

    // Crear preview
    try {
      const base64 = await StorageService.fileToBase64(file);
      setPreviewUrl(base64);
    } catch (err) {
      console.error('Error al crear preview:', err);
      setError('Error al cargar la vista previa de la imagen.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPreviewUrl(currentImageUrl || '');
    setError('');
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Por favor selecciona una imagen primero.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      let imageUrl: string;

      if (currentImageUrl) {
        // Actualizar imagen existente
        imageUrl = await StorageService.updateImage(selectedFile, currentImageUrl, eventId);
      } else {
        // Subir nueva imagen
        imageUrl = await StorageService.uploadImage(selectedFile, eventId);
      }

      setUploadSuccess(true);
      
      // Esperar un momento para mostrar el mensaje de éxito
      setTimeout(() => {
        onImageUploaded(imageUrl);
        handleClose();
      }, 1000);
    } catch (err) {
      console.error('Error al subir imagen:', err);
      setError(err instanceof Error ? err.message : 'Error al subir la imagen. Inténtalo de nuevo.');
      setUploadSuccess(false);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={currentImageUrl ? 'Editar Imagen del Evento' : 'Subir Imagen del Evento'}
      description={eventTitle ? `${eventTitle}` : 'Sube o actualiza la imagen de tu evento'}
      size="lg"
      closeOnOverlayClick={!isLoading}
      closeOnEscape={!isLoading}
      showCloseButton={!isLoading}
    >
      <div className="space-y-6">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isLoading}
        />

        {/* Current Image Preview (if exists and no new image selected) */}
        {currentImageUrl && !selectedFile && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Imagen Actual
            </label>
            <div className="relative group">
              <div className="aspect-video w-full rounded-lg overflow-hidden border-2 border-gray-200">
                <img
                  src={currentImageUrl}
                  alt="Imagen actual"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                <button
                  type="button"
                  onClick={openFileDialog}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-4 py-2 bg-white text-gray-900 rounded-lg font-medium shadow-lg"
                  disabled={isLoading}
                >
                  Cambiar Imagen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload/Preview Area */}
        {previewUrl && selectedFile ? (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {currentImageUrl ? 'Nueva Imagen' : 'Vista Previa'}
            </label>
            <div className="relative group">
              <div className="aspect-video w-full rounded-lg overflow-hidden border-2 border-blue-500">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={removeImage}
                disabled={isLoading}
                className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 disabled:opacity-50"
                title="Eliminar imagen seleccionada"
              >
                <X className="w-4 h-4" />
              </button>
              {uploadSuccess && (
                <div className="absolute bottom-3 left-3 px-3 py-2 bg-green-500 text-white rounded-lg flex items-center space-x-2 shadow-lg">
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-medium">¡Imagen subida con éxito!</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{selectedFile.name}</span>
              <span>{(selectedFile.size / 1024).toFixed(2)} KB</span>
            </div>
          </div>
        ) : !currentImageUrl && (
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 md:p-12 text-center transition-all duration-200 ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400 bg-gray-50'
            } ${error ? 'border-red-300 bg-red-50' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {isUploading ? (
              <div className="flex flex-col items-center space-y-3">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                <p className="text-sm text-gray-600 font-medium">Subiendo imagen...</p>
                <p className="text-xs text-gray-500">Por favor espera un momento</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                  dragActive ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <ImageIcon className={`w-8 h-8 ${dragActive ? 'text-blue-600' : 'text-gray-400'}`} />
                </div>
                <div className="space-y-2">
                  <p className={`text-base font-medium ${dragActive ? 'text-blue-600' : 'text-gray-700'}`}>
                    {dragActive ? '¡Suelta la imagen aquí!' : 'Arrastra una imagen aquí'}
                  </p>
                  <p className="text-sm text-gray-500">o</p>
                  <button
                    type="button"
                    onClick={openFileDialog}
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Seleccionar archivo
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF, WEBP hasta 5MB
                </p>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Info Message */}
        {!error && !selectedFile && currentImageUrl && (
          <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              Haz clic en "Cambiar Imagen" o selecciona un nuevo archivo para actualizar la imagen del evento.
            </p>
          </div>
        )}
      </div>

      <ModalFooter>
        <button
          type="button"
          onClick={handleClose}
          disabled={isLoading}
          className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={handleUpload}
          disabled={!selectedFile || isLoading || uploadSuccess}
          className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Subiendo...
            </>
          ) : uploadSuccess ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              ¡Listo!
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              {currentImageUrl ? 'Actualizar Imagen' : 'Subir Imagen'}
            </>
          )}
        </button>
      </ModalFooter>
    </Modal>
  );
};
