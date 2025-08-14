import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ulid } from 'ulid';

const s3Client = new S3Client({});
const PHOTOS_BUCKET = process.env.PHOTOS_BUCKET!;

interface SignPhotoUploadInput {
  contentType: string;
}

interface PresignedPost {
  url: string;
  fields: Record<string, string>;
}

export const handler = async (event: any): Promise<PresignedPost> => {
  try {
    const { contentType, identity } = event.arguments;
    const userId = identity.claims.sub;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }

    if (!contentType || !contentType.startsWith('image/')) {
      throw new Error('Invalid content type. Must be an image.');
    }

    // Generate unique photo key
    const photoId = ulid();
    const extension = contentType.split('/')[1];
    const photoKey = `photos/${userId}/${photoId}.${extension}`;

    // Create presigned POST URL
    const command = new PutObjectCommand({
      Bucket: PHOTOS_BUCKET,
      Key: photoKey,
      ContentType: contentType,
      Metadata: {
        userId,
        uploadedAt: new Date().toISOString(),
      },
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 300, // 5 minutes
    });

    // Return presigned POST data
    return {
      url: presignedUrl,
      fields: {
        key: photoKey,
        'Content-Type': contentType,
        'x-amz-meta-userid': userId,
        'x-amz-meta-uploadedat': new Date().toISOString(),
      },
    };

  } catch (error) {
    console.error('Error signing photo upload:', error);
    throw error;
  }
}
