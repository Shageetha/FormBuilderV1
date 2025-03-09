import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL + '/api/forms/get-data';

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error from backend: ${response.statusText}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching data from backend:', error);
    return NextResponse.json(
      { error: 'Failed to connect to the backend API' },
      { status: 500 }
    );
  }
}
