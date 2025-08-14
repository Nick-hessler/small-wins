import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

const TABLE_NAME = process.env.TABLE_NAME!;

export const handler = async (event: any): Promise<any[]> => {
  try {
    const { userId, identity } = event.arguments;
    const currentUserId = identity.claims.sub;
    
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    // Users can only see their own wins today
    if (userId !== currentUserId) {
      throw new Error('Unauthorized to view other user wins today');
    }

    // Get today's date
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const dailyWinsKey = `USER#${userId}#DAY#${today}`;
    
    // Query today's wins
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: {
        ':pk': dailyWinsKey,
      },
      ScanIndexForward: false, // Most recent first
    }));

    // Transform items to remove DynamoDB metadata
    const wins = result.Items?.map(item => ({
      winId: item.winId,
      userId: item.userId,
      title: item.title,
      note: item.note,
      category: item.category,
      points: item.points,
      photoUrl: item.photoUrl,
      createdAt: item.createdAt,
      reactions: item.reactions || {},
    })) || [];

    return wins;

  } catch (error) {
    console.error('Error getting wins today:', error);
    throw error;
  }
};
