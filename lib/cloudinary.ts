import { v2 as cloudinary } from 'cloudinary';

export interface UploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
}

export interface UploadOptions {
  folder?: string;
  public_id?: string;
  transformation?: any;
  resource_type?: 'image' | 'video' | 'raw';
  format?: string;
  quality?: number;
}

class CloudinaryService {
  private cloudName: string;
  private apiKey: string;
  private apiSecret: string;

  constructor() {
    this.cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
    this.apiKey = process.env.CLOUDINARY_API_KEY!;
    this.apiSecret = process.env.CLOUDINARY_API_SECRET!;

    if (this.cloudName && this.apiKey && this.apiSecret) {
      cloudinary.config({
        cloud_name: this.cloudName,
        api_key: this.apiKey,
        api_secret: this.apiSecret,
      });
    }
  }

  /**
   * Upload an image from buffer
   */
  async uploadImage(
    fileBuffer: Buffer,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    if (!this.isConfigured()) {
      throw new Error('Cloudinary not configured');
    }

    try {
      const uploadOptions = {
        folder: options.folder || 'theplantstore',
        public_id: options.public_id,
        transformation: options.transformation,
        resource_type: options.resource_type || 'image',
        format: options.format,
        quality: options.quality || 'auto',
      };

      const result = await new Promise<UploadResult>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result as UploadResult);
            }
          }
        ).end(fileBuffer);
      });

      return result;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload image');
    }
  }

  /**
   * Upload an image from URL
   */
  async uploadImageFromUrl(
    imageUrl: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    if (!this.isConfigured()) {
      throw new Error('Cloudinary not configured');
    }

    try {
      const uploadOptions = {
        folder: options.folder || 'theplantstore',
        public_id: options.public_id,
        transformation: options.transformation,
        resource_type: options.resource_type || 'image',
        format: options.format,
        quality: options.quality || 'auto',
      };

      const result = await cloudinary.uploader.upload(imageUrl, uploadOptions);
      return result as UploadResult;
    } catch (error) {
      console.error('Cloudinary upload from URL error:', error);
      throw new Error('Failed to upload image from URL');
    }
  }

  /**
   * Delete an image
   */
  async deleteImage(publicId: string): Promise<boolean> {
    if (!this.isConfigured()) {
      throw new Error('Cloudinary not configured');
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      return false;
    }
  }

  /**
   * Generate optimized image URL
   */
  generateOptimizedUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: string;
      crop?: string;
    } = {}
  ): string {
    if (!this.isConfigured()) {
      return '';
    }

    const transformation = [];
    
    if (options.width || options.height) {
      transformation.push({
        width: options.width,
        height: options.height,
        crop: options.crop || 'fill',
      });
    }

    if (options.quality) {
      transformation.push({ quality: options.quality });
    }

    if (options.format) {
      transformation.push({ fetch_format: options.format });
    }

    return cloudinary.url(publicId, {
      transformation,
      secure: true,
    });
  }

  /**
   * Generate product image URLs
   */
  generateProductImageUrls(publicId: string) {
    return {
      thumbnail: this.generateOptimizedUrl(publicId, { width: 150, height: 150, crop: 'fill' }),
      small: this.generateOptimizedUrl(publicId, { width: 300, height: 300, crop: 'fill' }),
      medium: this.generateOptimizedUrl(publicId, { width: 600, height: 600, crop: 'fill' }),
      large: this.generateOptimizedUrl(publicId, { width: 1200, height: 1200, crop: 'fill' }),
      original: this.generateOptimizedUrl(publicId),
    };
  }

  /**
   * Generate receipt image URLs
   */
  generateReceiptImageUrls(publicId: string) {
    return {
      thumbnail: this.generateOptimizedUrl(publicId, { width: 200, height: 200, crop: 'fill' }),
      medium: this.generateOptimizedUrl(publicId, { width: 800, height: 800, crop: 'limit' }),
      original: this.generateOptimizedUrl(publicId),
    };
  }

  /**
   * Upload receipt image for OCR processing
   */
  async uploadReceiptImage(fileBuffer: Buffer, orderId?: string): Promise<UploadResult> {
    const options: UploadOptions = {
      folder: 'receipts',
      public_id: orderId ? `receipt_${orderId}_${Date.now()}` : undefined,
      transformation: {
        quality: 'auto',
        fetch_format: 'auto',
      },
    };

    return this.uploadImage(fileBuffer, options);
  }

  /**
   * Upload product image
   */
  async uploadProductImage(
    fileBuffer: Buffer,
    productId: string,
    imageIndex: number = 0
  ): Promise<UploadResult> {
    const options: UploadOptions = {
      folder: 'products',
      public_id: `product_${productId}_${imageIndex}`,
      transformation: {
        quality: 'auto',
        fetch_format: 'auto',
      },
    };

    return this.uploadImage(fileBuffer, options);
  }

  /**
   * Upload category image
   */
  async uploadCategoryImage(
    fileBuffer: Buffer,
    categoryId: string
  ): Promise<UploadResult> {
    const options: UploadOptions = {
      folder: 'categories',
      public_id: `category_${categoryId}`,
      transformation: {
        quality: 'auto',
        fetch_format: 'auto',
      },
    };

    return this.uploadImage(fileBuffer, options);
  }

  /**
   * Check if service is configured
   */
  isConfigured(): boolean {
    return !!(this.cloudName && this.apiKey && this.apiSecret);
  }

  /**
   * Get cloud name
   */
  getCloudName(): string {
    return this.cloudName;
  }
}

export const cloudinaryService = new CloudinaryService(); 