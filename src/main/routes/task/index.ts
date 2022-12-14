import { Router } from 'express';
import { createTaskFactory, deleteTaskFactory, searchTaskFactory } from '~/main/factories/task';

const taskRoutes = Router();

taskRoutes.post('/create', createTaskFactory);
taskRoutes.delete('/delete', deleteTaskFactory);
taskRoutes.get('/search', searchTaskFactory);

export default taskRoutes;
