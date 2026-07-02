import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTasks, createTask, updateTask, deleteTask } from '../api/taskApi';

const mockTask = {
	id: 1,
	title: 'Test',
	description: null,
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

beforeEach(() => {
	vi.restoreAllMocks();
});

describe('taskApi', () => {
	it('getTasks returns array', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve([mockTask]),
			})
		);

		const tasks = await getTasks();
		expect(tasks).toEqual([mockTask]);
		expect(fetch).toHaveBeenCalledWith('/api/tasks');
	});

	it('getTasks throws on HTTP error', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
				text: () => Promise.resolve('Server error'),
			})
		);

		await expect(getTasks()).rejects.toThrow('HTTP 500');
	});

	it('createTask posts payload and returns created task', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(mockTask),
			})
		);

		const result = await createTask({ title: 'Test' });

		expect(result).toEqual(mockTask);
		expect(fetch).toHaveBeenCalledWith(
			'/api/tasks',
			expect.objectContaining({
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ title: 'Test' }),
			})
		);
	});

	it('updateTask sends PUT with updated fields', async () => {
		const updated = { ...mockTask, completed: true };
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(updated),
			})
		);

		const result = await updateTask(1, { completed: true });

		expect(result.completed).toBe(true);
		expect(fetch).toHaveBeenCalledWith(
			'/api/tasks/1',
			expect.objectContaining({ method: 'PUT' })
		);
	});

	it('deleteTask throws on HTTP error', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: false,
				status: 404,
				text: () => Promise.resolve('Not found'),
			})
		);

		await expect(deleteTask(1)).rejects.toThrow('HTTP 404');
	});
});
