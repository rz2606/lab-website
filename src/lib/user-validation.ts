import { db } from '@/lib/db'

/**
 * 验证用户ID是否存在于数据库中
 * @param userId 要验证的用户ID
 * @returns 如果用户存在返回true，否则返回false
 */
export async function validateUserId(userId: number | null): Promise<boolean> {
  if (!userId) {
    return false
  }
  
  try {
    const userExists = await db.user.findUnique({
      where: { id: userId },
      select: { id: true }
    })
    
    return !!userExists
  } catch (error) {
    console.error('验证用户ID失败:', error)
    return false
  }
}

/**
 * 安全地设置updatedBy字段，只有在用户ID有效时才设置
 * @param updateData 要更新的数据对象
 * @param userId 用户ID
 */
export async function safeSetUpdatedBy(
  updateData: Record<string, unknown>,
  userId: number | null
): Promise<void> {
  if (await validateUserId(userId)) {
    updateData.updatedBy = userId
  }
}

/**
 * 安全地设置createdBy和updatedBy字段，只有在用户ID有效时才设置
 * @param createData 要创建的数据对象
 * @param userId 用户ID
 */
export async function safeSetCreatedAndUpdatedBy(
  createData: Record<string, unknown>,
  userId: number | null
): Promise<void> {
  if (await validateUserId(userId)) {
    createData.createdBy = userId
    createData.updatedBy = userId
  }
}