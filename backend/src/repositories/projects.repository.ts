import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

import { pool } from '../config/database';
import { CreateProjectInput, Project, UpdateProjectInput } from '../models/project.model';

export class ProjectsRepository {
  async findAll(): Promise<Project[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM projects ORDER BY created_at DESC',
    );
    return rows as Project[];
  }

  async findById(id: number): Promise<Project | null> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM projects WHERE id = ?', [id]);
    return rows.length > 0 ? (rows[0] as Project) : null;
  }

  async create(input: CreateProjectInput): Promise<Project> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO projects (name, description, url, github_url, image_url, tags, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        input.name,
        input.description,
        input.url || null,
        input.github_url || null,
        input.image_url || null,
        input.tags ? JSON.stringify(input.tags) : null,
        input.status || 'active',
      ],
    );

    const created = await this.findById(result.insertId);
    if (!created) throw new Error('Failed to retrieve created project');
    return created;
  }

  async update(id: number, input: UpdateProjectInput): Promise<Project | null> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (input.name !== undefined) {
      fields.push('name = ?');
      values.push(input.name);
    }
    if (input.description !== undefined) {
      fields.push('description = ?');
      values.push(input.description);
    }
    if (input.url !== undefined) {
      fields.push('url = ?');
      values.push(input.url);
    }
    if (input.github_url !== undefined) {
      fields.push('github_url = ?');
      values.push(input.github_url);
    }
    if (input.image_url !== undefined) {
      fields.push('image_url = ?');
      values.push(input.image_url);
    }
    if (input.tags !== undefined) {
      fields.push('tags = ?');
      values.push(input.tags ? JSON.stringify(input.tags) : null);
    }
    if (input.status !== undefined) {
      fields.push('status = ?');
      values.push(input.status);
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    await pool.query(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`, values);

    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>('DELETE FROM projects WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}