import { IBoardRepository } from '~/application/repositories';
import { boardStoreType } from '~/domain/board/dtos';
import { PrismaSingleton } from '~/infrastructure/repositories/prisma/settings';
type MetaType = {
  id: string;
  name: string;
  createdAt: Date;
  updateAt: Date;
};
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
    let meta: MetaType | null = null;
    try {
      meta = await PrismaSingleton.instance.board.create({
        data: {
          id: data.id,
          name: data.name,
          admin: data.admin,
          createdAt: data.createdAt,
          updateAt: data.updateAt,
        },
      });

      await PrismaSingleton.instance.userBoard.create({
        data: {
          userId: data.userId,
          boardId: meta.id,
        },
        select: {
          id: false,
          userId: false,
          boardId: false,
          users: false,
          boards: false,
        },
      });

      return meta;
    } catch (error) {
      if (meta) {
        await PrismaSingleton.instance.board.delete({
          where: { id: meta.id },
        });
      }

      throw error;
    }
  }

  async getId({ id }: { id: string }): Promise<boardStoreType> {
    const meta = await PrismaSingleton.instance.board.findUnique({
      where: { id },
      select: this.repositoryProps({ users: false }),
    });

    return meta as any;
  }
  async createAdmin({ admin, boardId }: { admin: string; boardId: string }): Promise<void> {
    const meta = await PrismaSingleton.instance.board.update({
      where: { id: boardId },
      data: {
        admin: {
          push: admin,
        },
      },
    });
  }

  async getAdmin({ id }: { id: string }): Promise<boardStoreType | null> {
    const meta = await PrismaSingleton.instance.board.findFirst({
      where: {
        admin: {
          equals: id,
        },
      },
    });
    return meta;
  }

  async getUserId({ userId }: { userId: string }): Promise<boardStoreType[]> {
    const meta = await PrismaSingleton.instance.userBoard.findMany({
      where: { userId },
      select: {
        boards: true,
      },
    });

    return meta.map((data) => data.boards);
  }
  async getName({ name }: { name: string }): Promise<boardStoreType[] | null> {
    const meta = await PrismaSingleton.instance.board.findMany({
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
      take: 6,

      select: this.repositoryProps({}),
    });

    return meta;
  }
  async delete({ id }: { id: string }): Promise<void> {
    await PrismaSingleton.instance.board.delete({
      where: { id },
    });
  }
  async getAll(): Promise<boardStoreType[]> {
    const meta = await PrismaSingleton.instance.board.findMany();
    return meta as any;
  }
}
