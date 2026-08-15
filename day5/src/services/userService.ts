import * as taskRepo from '../repo/taskRepo';
import { User } from '../repo/taskRepo';

export function getById(id: string): User | undefined {
  return taskRepo.findUserById(id);
}

export function list(): User[] {
  return taskRepo.listUsers();
}

export function create(input: { name: string; email: string }): User {
  const id = `u${Date.now()}${Math.floor(Math.random() * 1000)}`;
  return taskRepo.insertUser({ id, name: input.name, email: input.email });
}

export function update(id: string, patch: Partial<Pick<User, 'name' | 'email'>>): User | undefined {
  return taskRepo.updateUser(id, patch);
}

export function remove(id: string): boolean {
  return taskRepo.deleteUser(id);
}
