import { IBoardRepository } from '~/application/repositories/board';
import { boardStoreType } from '~/domain/board/dtos';
import { prismaClient } from '~/infrastructure/repositories/prisma';

export class BoardRepository implements IBoardRepository {
  private readonly repositoryProps = (props: any) => {
    return {
      id: props.id ? (props.id as boolean) : true,
      name: props.name ? (props.name as boolean) : true,
      createdAt: props.createdAt ? (props.createdAt as boolean) : true,
      updateAt: props.updateAt ? (props.updateAt as boolean) : true,
    };
  };
  async save(data: boardStoreType): Promise<{ id: string }> {
    const meta = await prismaClient.board.create({
      data: {
        id: data.id,
        name: data.name,
        admin: data.admin,
        createdAt: data.createdAt,
        updateAt: data.updateAt,
      },
    });

    await prismaClient.userBoard.create({
      data: {
        userId: data.userId,
        boardId: meta.id,
      },
      select: {
        id: false,
        userId: false,
        boardId: false,
      },
    });

    return meta;
  }

  async getId({ id }: { id: string }): Promise<boardStoreType> {
    const meta = await prismaClient.board.findUnique({
      where: { id },
      select: this.repositoryProps({ users: false }),
    });

    return meta as any;
  }

  async getUserId({ userId }: { userId: string }): Promise<boardStoreType[]> {
    const meta = await prismaClient.board.findMany({
      where: {},
      select: this.repositoryProps({ users: false }),
    });

    return meta as any;
  }
  async getName({ name }: { name: string }): Promise<boardStoreType[] | null> {
    const meta = await prismaClient.board.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
      orderBy: {
        name: 'asc',
      },
      skip: 0,
      take: 15,

      select: this.repositoryProps({ users: false }),
    });

    return meta as any;
  }
  async delete({ id }: { id: string }): Promise<void> {
    await prismaClient.board.delete({
      where: { id },
    });
  }
  async getAll(): Promise<boardStoreType[]> {
    const meta = await prismaClient.board.findMany();
    return meta as any;
  }
}
