import { NextResponse } from 'next/server';

// export async function POST() {
//   const response = NextResponse.json({ message: 'Logout berhasil' });
//   response.cookies.set('token', '', {
//     httpOnly: true,
//     expires: new Date(0),
//     path: '/',
//   });
//   return response;
// }

export async function POST() {
    const response = NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
  
    // Hapus cookie token
    response.cookies.set('token', '', {
      httpOnly: true,
      expires: new Date(0), // langsung expired
      path: '/',
    });
  
    return response;
  }