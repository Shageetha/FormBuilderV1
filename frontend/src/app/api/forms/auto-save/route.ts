import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL + '/api/forms/auto-save';

  try {
    const { form_name, form_data } = await request.json();

    console.log('Forwarding form data to backend:', { form_name, form_data });

    const backendResponse = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ form_name, form_data }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      console.error('Backend error details:', errorData);
      return NextResponse.json(
        { detail: errorData.detail || 'Failed to save form in the backend' },
        { status: backendResponse.status }
      );
    }

    const responseData = await backendResponse.json();
    console.log('Response from backend:', responseData);

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Error in frontend API route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { detail: errorMessage },
      { status: 500 }
    );
  }
}
