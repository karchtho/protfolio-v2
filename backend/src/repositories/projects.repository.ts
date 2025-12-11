import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

import { pool } from '../config/database';
import { CreateProjectInput, Project, UpdateProjectInput } from '../models/project.model';

export class ProjectsRepository {
  async findAll(): Promise<Project[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM projects ORDER BY display_order ASC, created_at DESC',
    );
    return rows.map(row => this.mapRowToProject(row)) as Project[];
  }

  async findById(id: number): Promise<Project | null> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM projects WHERE id = ?', [id]);
    return rows.length > 0 ? this.mapRowToProject(rows[0]) : null;
  }

  async findFeatured(): Promise<Project[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM projects WHERE is_featured = TRUE AND status IN (?, ?) ORDER BY display_order ASC, created_at DESC',
      ['completed', 'actively_maintained'],
    );
    return rows.map(row => this.mapRowToProject(row)) as Project[];
  }

  async create(input: CreateProjectInput): Promise<Project> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO projects (
        name, short_description, long_description,
        url, github_url, case_study_url,
        thumbnail, images, tags,
        status, is_featured, display_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.name,
        input.short_description,
        input.long_description,
        input.url || null,
        input.github_url || null,
        input.case_study_url || null,
        input.thumbnail || null,
        input.images ? JSON.stringify(input.images) : null,
        JSON.stringify(input.tags), // Tags are required
        input.status || 'in_development',
        input.is_featured ?? false,
        input.display_order ?? 0,
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
    if (input.short_description !== undefined) {
      fields.push('short_description = ?');
      values.push(input.short_description);
    }
    if (input.long_description !== undefined) {
      fields.push('long_description = ?');
      values.push(input.long_description);
    }
    if (input.url !== undefined) {
      fields.push('url = ?');
      values.push(input.url || null);
    }
    if (input.github_url !== undefined) {
      fields.push('github_url = ?');
      values.push(input.github_url || null);
    }
    if (input.case_study_url !== undefined) {
      fields.push('case_study_url = ?');
      values.push(input.case_study_url || null);
    }
    if (input.thumbnail !== undefined) {
      fields.push('thumbnail = ?');
      values.push(input.thumbnail || null);
    }
    if (input.images !== undefined) {
      fields.push('images = ?');
      values.push(input.images ? JSON.stringify(input.images) : null);
    }
    if (input.tags !== undefined) {
      fields.push('tags = ?');
      values.push(JSON.stringify(input.tags));
    }
    if (input.status !== undefined) {
      fields.push('status = ?');
      values.push(input.status);
    }
    if (input.is_featured !== undefined) {
      fields.push('is_featured = ?');
      values.push(input.is_featured);
    }
    if (input.display_order !== undefined) {
      fields.push('display_order = ?');
      values.push(input.display_order);
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

  /**
   * Transform MySQL row data to Project object
   * Handles JSON parsing and type conversions
   */
  private mapRowToProject(row: RowDataPacket): Project {
    return {
      id: row.id,
      name: row.name,
      short_description: row.short_description,
      long_description: row.long_description,
      url: row.url,
      github_url: row.github_url,
      case_study_url: row.case_study_url,
      thumbnail: row.thumbnail,
      images: row.images ? JSON.parse(row.images as string) : null,
      tags: JSON.parse(row.tags as string),
      status: row.status,
      is_featured: Boolean(row.is_featured), // MySQL TINYINT(1) to boolean
      display_order: row.display_order,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}