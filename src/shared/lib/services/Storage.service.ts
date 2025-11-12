import { supabase } from '../api/supabase';

/**
 * Servicio para gestionar el almacenamiento de archivos en Supabase Storage
 */
export class StorageService {
  private static getBucketName(): string {
    const raw = (import.meta as any).env?.VITE_SUPABASE_EVENT_IMAGES_BUCKET || 'event-images';
    return String(raw).trim().toLowerCase();
  }
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];

  /**
   * Valida que el archivo cumpla con los requisitos
   */
  private static validateFile(file: File): void {
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Tipo de archivo no permitido. Solo se permiten imágenes JPG, PNG, GIF y WEBP.');
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error('El archivo es demasiado grande. Tamaño máximo: 5MB.');
    }
  }

  /**
   * Genera un nombre único para el archivo
   */
  private static generateFileName(file: File): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    return `event-${timestamp}-${randomString}.${extension}`;
  }

  /**
   * Sube una imagen al storage de Supabase
   * @param file - Archivo de imagen a subir
   * @param eventId - ID del evento (opcional, para organizar archivos)
   * @returns URL pública de la imagen subida
   */
  static async uploadImage(file: File, eventId?: string): Promise<string> {
    try {
      // Validar archivo
      this.validateFile(file);

      // Generar nombre de archivo único
      const fileName = this.generateFileName(file);
      const filePath = eventId ? `${eventId}/${fileName}` : fileName;

      // Subir archivo a Supabase Storage
      const bucket = this.getBucketName();
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        const msg = error.message?.toLowerCase() || '';
        if (msg.includes('bucket not found')) {
          throw new Error(`Error al subir la imagen: Bucket '${bucket}' not found. Verifica que exista en Supabase Storage y que VITE_SUPABASE_EVENT_IMAGES_BUCKET esté configurada.`);
        }
        throw new Error(`Error al subir la imagen: ${error.message}`);
      }

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Error en uploadImage:', error);
      throw error;
    }
  }

  /**
   * Actualiza una imagen existente
   * @param file - Nueva imagen
   * @param oldImageUrl - URL de la imagen anterior (para eliminarla)
   * @param eventId - ID del evento
   * @returns URL pública de la nueva imagen
   */
  static async updateImage(file: File, oldImageUrl: string, eventId?: string): Promise<string> {
    try {
      // Eliminar imagen anterior si existe
      if (oldImageUrl && !oldImageUrl.includes('pexels.com') && !oldImageUrl.includes('unsplash.com')) {
        await this.deleteImageFromUrl(oldImageUrl);
      }

      // Subir nueva imagen
      return await this.uploadImage(file, eventId);
    } catch (error) {
      console.error('Error en updateImage:', error);
      throw error;
    }
  }

  /**
   * Elimina una imagen del storage usando su URL
   * @param imageUrl - URL pública de la imagen
   */
  static async deleteImageFromUrl(imageUrl: string): Promise<void> {
    try {
      // Extraer el path del archivo de la URL
  const bucket = this.getBucketName();
  const urlParts = imageUrl.split(`${bucket}/`);
      if (urlParts.length < 2) {
        console.warn('No se pudo extraer el path de la URL');
        return;
      }

      const filePath = urlParts[1];

      // Eliminar archivo
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        console.warn(`Error al eliminar imagen: ${error.message}`);
      }
    } catch (error) {
      console.error('Error en deleteImageFromUrl:', error);
    }
  }

  /**
   * Elimina un archivo por su path
   * @param filePath - Path del archivo en el bucket
   */
  static async deleteImage(filePath: string): Promise<void> {
    try {
      const bucket = this.getBucketName();
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        throw new Error(`Error al eliminar la imagen: ${error.message}`);
      }
    } catch (error) {
      console.error('Error en deleteImage:', error);
      throw error;
    }
  }

  /**
   * Convierte un archivo a Base64 (útil para previsualización)
   * @param file - Archivo a convertir
   * @returns Promise con el string en Base64
   */
  static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Crea un bucket si no existe (solo para inicialización)
   */
  static async createBucketIfNotExists(): Promise<void> {
    try {
      const bucket = this.getBucketName();
      const { data: buckets } = await supabase.storage.listBuckets();
      
      const bucketExists = buckets?.some(b => b.name === bucket);

      if (!bucketExists) {
        await supabase.storage.createBucket(bucket, {
          public: true,
          fileSizeLimit: this.MAX_FILE_SIZE
        });
        console.log(`Bucket '${bucket}' creado exitosamente`);
      }
    } catch (error) {
      console.error('Error al crear bucket (posible falta de service key). Crea el bucket manualmente en Supabase:', error);
    }
  }
}
