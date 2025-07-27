import { PrismaClient } from '@prisma/client';
import type { UserRepository } from '../../shared/port/repository/userRepository';
import type { User, CreateUserInput, UpdateUserInput } from '../../features/user/core/user';

const prisma = new PrismaClient();

export class UserRepositoryPrisma implements UserRepository {
  async create(input: CreateUserInput): Promise<User> {
    const user = await prisma.user.create({
      data: {
        email: input.email,
        hashedPassword: input.hashedPassword,
        name: input.name,
      },
    });
    return user;
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user;
  }

  async update(id: string, input: UpdateUserInput): Promise<User> {
    const user = await prisma.user.update({
      where: { id },
      data: input,
    });
    return user;
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }

  async exists(email: string): Promise<boolean> {
    const count = await prisma.user.count({
      where: { email },
    });
    return count > 0;
  }
}