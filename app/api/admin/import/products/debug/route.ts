import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Debug endpoint called');
    
    // Try to get the request body as text first
    const bodyText = await request.text();
    console.log('Request body length:', bodyText.length);
    
    // Try to parse as JSON
    try {
      const jsonBody = JSON.parse(bodyText);
      console.log('JSON body received:', Object.keys(jsonBody));
      
      return NextResponse.json({
        success: true,
        message: 'JSON test successful',
        received: jsonBody,
        note: 'JSON parsing works. FormData test needed.',
      });
    } catch (jsonError) {
      console.log('Not JSON, trying FormData...');
      
      // Reset the request body for FormData parsing
      const formData = await request.formData();
      const csvFile = formData.get('file') as File;
      console.log('CSV file received:', csvFile?.name, csvFile?.size);

      if (!csvFile) {
        return NextResponse.json({ 
          error: 'No file found in FormData',
          bodyType: 'formdata',
          formDataKeys: Array.from(formData.keys())
        }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: 'FormData test successful',
        fileName: csvFile.name,
        fileSize: csvFile.size,
        note: 'FormData parsing works. Ready for CSV parsing.',
      });
    }

  } catch (error) {
    console.error('Error in debug endpoint:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Debug test failed',
      details: errorMessage 
    }, { status: 500 });
  }
} 