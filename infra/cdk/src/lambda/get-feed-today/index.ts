import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

const TABLE_NAME = process.env.TABLE_NAME!;

interface FeedPage {
  items: any[];
  nextToken?: string;
}

export const handler = async (event: any): Promise<FeedPage> => {
  try {
    const { limit = 20, nextToken, userIds, identity } = event.arguments;
    const currentUserId = identity.claims.sub;
    
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    // Get today's date
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Build query parameters
    const queryParams: any = {
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :date',
      ExpressionAttributeValues: {
        ':date': `DAY#${today}`,
      },
      ScanIndexForward: false, // Most recent first
      Limit: Math.min(limit, 50), // Max 50 items
    };

    // Add pagination token if provided
    if (nextToken) {
      queryParams.ExclusiveStartKey = JSON.parse(Buffer.from(nextToken, 'base64').toString());
    }

    // Filter by specific users if provided
    if (userIds && userIds.length > 0) {
      queryParams.FilterExpression = 'userId IN (:userIds)';
      queryParams.ExpressionAttributeValues[':userIds'] = userIds;
    }

    // Query the feed
    const result = await docClient.send(new QueryCommand(queryParams));

    // Transform items to remove DynamoDB metadata
    const items = result.Items?.map(item => ({
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

    // Get user profiles for the wins
    const userIdsInFeed = [...new Set(items.map(item => item.userId))];
    const userProfiles = await getUserProfiles(userIdsInFeed);

    // Attach user info to wins
    const winsWithUsers = items.map(win => ({
      ...win,
      user: userProfiles[win.userId] || {
        userId: win.userId,
        handle: 'unknown',
        displayName: 'Unknown User',
        avatarUrl: undefined,
        color: '#999999',
      },
    }));

    // Generate next token for pagination
    let nextPageToken: string | undefined;
    if (result.LastEvaluatedKey) {
      nextPageToken = Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64');
    }

    return {
      items: winsWithUsers,
      nextToken: nextPageToken,
    };

  } catch (error) {
    console.error('Error getting feed:', error);
    throw error;
  }
};

async function getUserProfiles(userIds: string[]): Promise<Record<string, any>> {
  try {
    const profiles: Record<string, any> = {};
    
    // Batch get user profiles
    for (const userId of userIds) {
      try {
        const profileResult = await docClient.send(new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: 'PK = :pk AND SK = :sk',
          ExpressionAttributeValues: {
            ':pk': `USER#${userId}`,
            ':sk': 'PROFILE',
          },
        }));

        if (profileResult.Items && profileResult.Items.length > 0) {
          const profile = profileResult.Items[0];
          profiles[userId] = {
            userId: profile.userId,
            handle: profile.handle,
            displayName: profile.displayName,
            avatarUrl: profile.avatarUrl,
            color: profile.color,
            createdAt: profile.createdAt,
          };
        }
      } catch (error) {
        console.error(`Error fetching profile for user ${userId}:`, error);
        // Continue with other profiles
      }
    }

    return profiles;
  } catch (error) {
    console.error('Error getting user profiles:', error);
    return {};
  }
}
