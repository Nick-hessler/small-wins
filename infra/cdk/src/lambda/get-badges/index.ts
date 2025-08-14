import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

const TABLE_NAME = process.env.TABLE_NAME!;

interface Badge {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
  icon: string;
}

export const handler = async (event: any): Promise<Badge[]> => {
  try {
    const { userId, identity } = event.arguments;
    const currentUserId = identity.claims.sub;
    
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    // Users can only see their own badges
    if (userId !== currentUserId) {
      throw new Error('Unauthorized to view other user badges');
    }

    // Get user's wins to calculate badges
    const userWins = await getUserWins(userId);
    
    // Calculate badges based on achievements
    const badges = calculateBadges(userWins);

    return badges;

  } catch (error) {
    console.error('Error getting badges:', error);
    throw error;
  }
};

async function getUserWins(userId: string): Promise<any[]> {
  try {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI2',
      KeyConditionExpression: 'GSI2PK = :userId',
      ExpressionAttributeValues: {
        ':userId': `USER#${userId}`,
      },
      ScanIndexForward: false, // Most recent first
      Limit: 1000, // Get last 1000 wins for badge calculation
    }));

    return result.Items || [];
  } catch (error) {
    console.error('Error getting user wins:', error);
    return [];
  }
}

function calculateBadges(wins: any[]): Badge[] {
  const badges: Badge[] = [];
  const now = new Date().toISOString();

  // Early Riser - logged a win before 7 AM
  const earlyWins = wins.filter(win => {
    const winTime = new Date(win.createdAt);
    return winTime.getHours() < 7;
  });
  
  badges.push({
    id: 'early-riser',
    name: 'Early Riser',
    description: 'Logged a win before 7 AM',
    unlocked: earlyWins.length > 0,
    unlockedAt: earlyWins.length > 0 ? earlyWins[0].createdAt : undefined,
    icon: '🌅',
  });

  // Triple Threat - logged 3 wins in a day
  const dailyWinCounts = new Map<string, number>();
  wins.forEach(win => {
    const date = win.createdAt.split('T')[0];
    dailyWinCounts.set(date, (dailyWinCounts.get(date) || 0) + 1);
  });
  
  const tripleThreatDays = Array.from(dailyWinCounts.values()).filter(count => count >= 3).length;
  
  badges.push({
    id: 'triple-threat',
    name: 'Triple Threat',
    description: 'Logged 3 wins in a single day',
    unlocked: tripleThreatDays > 0,
    unlockedAt: tripleThreatDays > 0 ? now : undefined,
    icon: '🎯',
  });

  // Outdoor Explorer - logged outdoor wins
  const outdoorWins = wins.filter(win => win.category === 'outdoors');
  
  badges.push({
    id: 'outdoor-explorer',
    name: 'Outdoor Explorer',
    description: 'Logged outdoor wins',
    unlocked: outdoorWins.length > 0,
    unlockedAt: outdoorWins.length > 0 ? outdoorWins[0].createdAt : undefined,
    icon: '🌲',
  });

  // Socialite - logged social wins
  const socialWins = wins.filter(win => win.category === 'social');
  
  badges.push({
    id: 'socialite',
    name: 'Socialite',
    description: 'Logged social wins',
    unlocked: socialWins.length > 0,
    unlockedAt: socialWins.length > 0 ? socialWins[0].createdAt : undefined,
    icon: '👥',
  });

  // Streak Master - maintained a streak
  const streak = calculateStreak(wins);
  
  badges.push({
    id: 'streak-master',
    name: 'Streak Master',
    description: `Maintained a ${streak}-day streak`,
    unlocked: streak >= 3,
    unlockedAt: streak >= 3 ? now : undefined,
    icon: '🔥',
  });

  // Point Collector - accumulated points
  const totalPoints = wins.reduce((sum, win) => sum + (win.points || 0), 0);
  
  badges.push({
    id: 'point-collector',
    name: 'Point Collector',
    description: `Accumulated ${totalPoints} total points`,
    unlocked: totalPoints >= 100,
    unlockedAt: totalPoints >= 100 ? now : undefined,
    icon: '⭐',
  });

  // First Win - logged their first win
  if (wins.length > 0) {
    badges.push({
      id: 'first-win',
      name: 'First Win',
      description: 'Logged your first small win',
      unlocked: true,
      unlockedAt: wins[wins.length - 1].createdAt,
      icon: '🎉',
    });
  }

  // Petty Master - logged petty wins
  const pettyWins = wins.filter(win => win.category === 'petty');
  
  badges.push({
    id: 'petty-master',
    name: 'Petty Master',
    description: 'Logged petty wins',
    unlocked: pettyWins.length >= 5,
    unlockedAt: pettyWins.length >= 5 ? now : undefined,
    icon: '😏',
  });

  // Cozy Champion - logged cozy wins
  const cozyWins = wins.filter(win => win.category === 'cozy');
  
  badges.push({
    id: 'cozy-champion',
    name: 'Cozy Champion',
    description: 'Logged cozy wins',
    unlocked: cozyWins.length >= 5,
    unlockedAt: cozyWins.length >= 5 ? now : undefined,
    icon: '☕',
  });

  return badges;
}

function calculateStreak(wins: any[]): number {
  if (wins.length === 0) return 0;

  const today = new Date();
  const dates = new Set<string>();
  
  // Get unique dates from wins
  wins.forEach(win => {
    const date = win.createdAt.split('T')[0];
    dates.add(date);
  });

  // Sort dates
  const sortedDates = Array.from(dates).sort().reverse();
  
  let streak = 0;
  let currentDate = new Date();
  
  // Check consecutive days
  for (let i = 0; i < 365; i++) { // Check up to a year
    const dateString = currentDate.toISOString().split('T')[0];
    
    if (dates.has(dateString)) {
      streak++;
    } else {
      break;
    }
    
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  return streak;
}
