import express, { NextFunction, Request, Response} from 'express';
import path from 'path';

import { authGuard } from "../middleware/auth.middleware";
import { deleteFile, uploadsProjectImages, verifyFileType } from '../middleware/uploads.middleware';

const router = express.Router();

// TODO: Add integration tests for upload routes
// - Test POST /api/upload/projects with valid images
// - Test POST with invalid file types
// - Test POST with oversized files
// - Test DELETE /api/upload/projects/:filename
// - Test DELETE with path traversal attempts
// See: backend/src/__tests__/routes/upload.routes.test.ts (to be created)

  /**
   * POST /api/upload/projects
   * Upload 1-10 project images
   * Returns array of file paths
   */
  router.post(
  '/projects',
  authGuard,
  uploadsProjectImages.array('images', 10),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
          return res.status(400).json({ error: 'No files uploaded'});
      }

      // Verify files types (magic bytes check)
      const paths: string[] = [];
      const filesToDelete: string [] = [];

      for (const file of files) {
        const isValid = await verifyFileType(file.path);

        if (!isValid) {
          // Mark file for deletion
          filesToDelete.push(file.path);
        } else {
          // Store relative path (matches DB format: uplaods/projects/filename.ext)
          paths.push(`uploads/projects/${file.filename}`);
        }
      }

      // Delete invalid files
      for (const filePath of filesToDelete) {
        await deleteFile(filePath);
      }

      // If all files are invalid, return error
      if (paths.length === 0) {
        return res.status(400).json({
          error: 'All upload files have invalid file types',
        });
      }

      // If some files are invalid, return succes with warning
      if (filesToDelete.length > 0) {
        return res.status(200).json({
          paths,
          warning: `${filesToDelete.length} file(s) rejected due to invalid file type`,
        });
      }

      // All files valid
      return res.status(200).json({paths});
    } catch (error) {
      return next(error);
    }
  }
);

  /**
   * DELETE /api/upload/projects/:filename
   * Delete a project image (with path traversal protection)
   */
  router.delete(
    '/projects/:filename',
    authGuard,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { filename } = req.params;

        // Path traversal protection: extract basename only
        const safeName = path.basename(filename);
        const filePath = path.join(__dirname, '../../uploads/projects', safeName);

        // Additional security: ensure file is within uploads/projects directory
        const uploadsDir = path.resolve(__dirname, '../../uploads/projects');
        const resolvedPath = path.resolve(filePath);

        if (!resolvedPath.startsWith(uploadsDir)) {
          return res.status(403).json({error: 'Invalid file path'});
        }

        // Delete file (deleteFile handles non-existant files gracefully)
        await deleteFile(resolvedPath);

        return res.status(200).json({ message: 'File deleted successfully' });
      } catch (error) {
        return next(error);
      }
    }
  );

  export default router;

