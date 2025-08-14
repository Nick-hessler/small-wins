import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

const TABLE_NAME = process.env.TABLE_NAME!;

interface LeaderboardRow {
  userId: string;
  displayName: string;
  handle: string;
  score: number;
  winsCount: number;
}

export const handler = async (event: any): Promise<LeaderboardRow[]> => {
  try {
    const { weekStart, identity } = event.arguments;
    const currentUserId = identity.claims.sub;
    
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    if (!weekStart) {
      throw new Error('Week start date is required');
    }

    // Check if we have a cached leaderboard
    const cachedLeaderboard = await getCachedLeaderboard(weekStart);
    if (cachedLeaderboard) {
      return cachedLeaderboard;
    }

    // Calculate leaderboard from scratch
    const leaderboard = await calculateLeaderboard(weekStart);

    // Cache the result
    await cacheLeaderboard(weekStart, leaderboard);

    return leaderboard;

  } catch (error) {
    console.error('Error getting weekly leaderboard:', error);
    throw error;
  }
};

async function getCachedLeaderboard(weekStart: string): Promise<LeaderboardRow[] | null> {
  try {
    const cacheKey = `LEADERBOARD#${weekStart}`;
    const cacheSK = 'SUMMARY';
    
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: cacheKey,
        SK: cacheSK,
      },
    }));

    if (result.Item && result.Item.data && result.Item.expiresAt) {
      const expiresAt = new Date(result.Item.expiresAt);
      if (expiresAt > new Date()) {
        return result.Item.data;
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting cached leaderboard:', error);
    return null;
  }
}

async function calculateLeaderboard(weekStart: string): Promise<LeaderboardRow[]> {
  try {
    // Get all wins for the week
    const weekWins = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI3',
      KeyConditionExpression: 'GSI3PK = :week',
      ExpressionAttributeValues: {
        ':week': `WEEK#${weekStart}`,
      },
    }));

    if (!weekWins.Items) {
      return [];
    }

    // Aggregate wins by user
    const userScores: Record<string, { score: number; winsCount: number }> = {};
    
    for (const win of weekWins.Items) {
      const userId = win.userId;
      if (!userScores[userId]) {
        userScores[userId] = { score: 0, winsCount: 0 };
      }
      
      userScores[userId].score += win.points || 0;
      userScores[userId].winsCount += 1;
    }

    // Get user profiles
    const userIds = Object.keys(userScores);
    const userProfiles = await getUserProfiles(userIds);

    // Build leaderboard rows
    const leaderboard: LeaderboardRow[] = Object.entries(userScores)
      .map(([userId, stats]) => {
        const profile = userProfiles[userId] || {
          displayName: 'Unknown User',
          handle: 'unknown',
        };

        return {
          userId,
          displayName: profile.displayName,
          handle: profile.handle,
          score: stats.score,
          winsCount: stats.winsCount,
        };
      })
      .sort((a, b) => {
        // Sort by score descending, then by wins count descending
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return b.winsCount - a.winsCount;
      })
      .slice(0, 100); // Limit to top 100

    return leaderboard;

  } catch (error) {
    console.error('Error calculating leaderboard:', error);
    throw error;
  }
}

async function cacheLeaderboard(weekStart: string, leaderboard: LeaderboardRow[]): Promise<void> {
  try {
    const cacheKey = `LEADERBOARD#${weekStart}`;
    const cacheSK = 'SUMMARY';
    
    // Cache for 2 minutes
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);
    
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: cacheKey,
        SK: cacheSK,
        data: leaderboard,
        expiresAt: expiresAt.toISOString(),
        TTL: Math.floor(expiresAt.getTime() / 1000),
      },
    }));
  } catch (error) {
    console.error('Error caching leaderboard:', error);
    // Don't fail if caching fails
  }
}

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
            displayName: profile.displayName,
            handle: profile.handle,
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
