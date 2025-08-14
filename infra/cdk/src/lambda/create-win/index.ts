import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ulid } from 'ulid';

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);
const s3Client = new S3Client({});

const TABLE_NAME = process.env.TABLE_NAME!;
const PHOTOS_BUCKET = process.env.PHOTOS_BUCKET!;

interface CreateWinInput {
  title: string;
  note?: string;
  category: string;
  points: number;
  photoKey?: string;
}

interface Win {
  winId: string;
  userId: string;
  title: string;
  note?: string;
  category: string;
  points: number;
  photoUrl?: string;
  createdAt: string;
  reactions: Record<string, number>;
}

export const handler = async (event: any): Promise<Win> => {
  try {
    const { input, identity } = event.arguments;
    const userId = identity.claims.sub;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Validate input
    if (!input.title || input.title.trim().length === 0) {
      throw new Error('Title is required');
    }

    if (!input.category || !['petty', 'cozy', 'social', 'outdoors', 'work', 'random'].includes(input.category)) {
      throw new Error('Invalid category');
    }

    if (!input.points || ![1, 2, 3].includes(input.points)) {
      throw new Error('Points must be 1, 2, or 3');
    }

    if (input.note && input.note.length > 120) {
      throw new Error('Note must be 120 characters or less');
    }

    // Check daily win limit (3 wins per day)
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const dailyWinsKey = `USER#${userId}#DAY#${today}`;
    
    const existingWins = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: {
        ':pk': dailyWinsKey,
      },
    }));

    if (existingWins.Items && existingWins.Items.length >= 3) {
      throw new Error('Daily win limit reached (3 wins per day). New wins available at midnight.');
    }

    // Generate win ID and timestamps
    const winId = ulid();
    const now = new Date().toISOString();
    const createdAt = now;

    // Build photo URL if photo was uploaded
    let photoUrl: string | undefined;
    if (input.photoKey) {
      photoUrl = `https://${PHOTOS_BUCKET}.s3.amazonaws.com/${input.photoKey}`;
    }

    // Create win item
    const win: Win = {
      winId,
      userId,
      title: input.title.trim(),
      note: input.note?.trim(),
      category: input.category,
      points: input.points,
      photoUrl,
      createdAt,
      reactions: {},
    };

    // Store win in DynamoDB with multiple access patterns
    const winItem = {
      // Primary key pattern for user's daily wins
      PK: dailyWinsKey,
      SK: `WIN#${createdAt}`,
      
      // GSI1: Feed by date
      GSI1PK: `DAY#${today}`,
      GSI1SK: `CREATED#${createdAt}`,
      
      // GSI2: User chronological
      GSI2PK: `USER#${userId}`,
      GSI2SK: `CREATED#${createdAt}`,
      
      // GSI3: Leaderboard (for weekly scoring)
      GSI3PK: `WEEK#${getWeekStart(today)}`,
      GSI3SK: input.points,
      
      // Win data
      ...win,
      
      // Metadata
      TTL: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 year TTL
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: winItem,
    }));

    // Update user profile if it doesn't exist
    await ensureUserProfile(userId, identity.claims);

    // Return the created win
    return win;

  } catch (error) {
    console.error('Error creating win:', error);
    throw error;
  }
};

async function ensureUserProfile(userId: string, claims: any) {
  try {
    const profileKey = `USER#${userId}`;
    const profileSK = 'PROFILE';
    
    // Check if profile exists
    const existingProfile = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND SK = :sk',
      ExpressionAttributeValues: {
        ':pk': profileKey,
        ':sk': profileSK,
      },
    }));

    if (!existingProfile.Items || existingProfile.Items.length === 0) {
      // Create default profile
      const profile = {
        PK: profileKey,
        SK: profileSK,
        userId,
        handle: claims['cognito:username'] || `user_${userId.slice(-8)}`,
        displayName: claims.name || claims['cognito:username'] || 'Small Winner',
        avatarUrl: undefined,
        createdAt: new Date().toISOString(),
        color: getRandomColor(),
      };

      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: profile,
      }));
    }
  } catch (error) {
    console.error('Error ensuring user profile:', error);
    // Don't fail the win creation if profile creation fails
  }
}

function getWeekStart(dateString: string): string {
  const date = new Date(dateString);
  const dayOfWeek = date.getDay();
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0
  const monday = new Date(date);
  monday.setDate(date.getDate() - daysToSubtract);
  return monday.toISOString().split('T')[0];
}

function getRandomColor(): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
