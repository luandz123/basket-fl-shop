import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define the route handler with proper typing for Next.js App Router
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> } // params is a Promise
) {
  try {
    // Await the params Promise to get the actual path array
    const resolvedParams = await context.params;
    const imagePath = resolvedParams.path.join('/');

    // Determine the path to the backend upload directory
    const uploadDir = path.join(process.cwd(), '..', 'backend', 'upload');
    const filePath = path.join(uploadDir, imagePath);

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      console.error(`Image not found: ${filePath}`);
      return new Response('Image not found', { status: 404 });
    }

    // Read the image file
    const imageBuffer = fs.readFileSync(filePath);

    // Determine MIME type from file extension
    const ext = path.extname(imagePath).toLowerCase();
    let contentType = 'application/octet-stream';

    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.webp') contentType = 'image/webp';

    // Return the image with appropriate headers
    return new Response(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for 1 day
      },
    });
  } catch (error) {
    console.error(`Error serving image:`, error);
    return new Response('Error serving image', { status: 500 });
  }
}

// For Next.js route handlers in App Router
export const dynamic = 'force-dynamic';