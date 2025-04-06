import prisma from '@/lib/prismadb';
import getCurrentUser from './getCurrentUser';

const getConversations = async () => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser?.id) return [];

    // First fetch just the conversations with users
    const conversations = await prisma.conversation.findMany({
      orderBy: {
        lastMessageAt: 'desc',
      },
      where: {
        userIds: {
          has: currentUser.id,
        },
      },
      include: {
        users: true,
      }
    });

    // Then enhance each conversation with its messages
    const enhancedConversations = await Promise.all(
      conversations.map(async (conversation) => {
        try {
          const messages = await prisma.message.findMany({
            where: {
              conversationId: conversation.id,
            },
            orderBy: {
              createdAt: 'desc',
            },
            // take: 30,
            include: {
              sender: true,
              seen: true,
            },
          });
          
          return {
            ...conversation,
            messages,
          };
        } catch (error) {
          console.error(`Error fetching messages for conversation ${conversation.id}:`, error);
          // Return conversation with empty messages array if there's an error
          return {
            ...conversation,
            messages: [],
          };
        }
      })
    );

    return enhancedConversations;
  } catch (error: any) {
    console.error("Error fetching conversations:", error);
    return [];
  }
};

export default getConversations;