import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const envPath = path.join(process.cwd(), '.env.local');
  const hasEnvFile = fs.existsSync(envPath);

  // We only return whether they exist or not, NOT the actual values for security
  let envContent = '';
  if (hasEnvFile) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  const hasFirebaseKey = /NEXT_PUBLIC_FIREBASE_API_KEY=([^ \n]+)/.test(envContent);
  const hasOpenAIKey = /OPENAI_API_KEY=([^ \n]+)/.test(envContent);

  return NextResponse.json({
    hasEnvFile,
    hasFirebaseKey,
    hasOpenAIKey,
  });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const envPath = path.join(process.cwd(), '.env.local');
    
    // Read existing content if exists
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // A helper to update or append keys
    const updateOrAppend = (key: string, value: string) => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${key}=${value}`);
      } else {
        envContent += `\n${key}=${value}`;
      }
    };

    // Process Firebase Config
    if (data.firebaseConfig) {
      updateOrAppend('NEXT_PUBLIC_FIREBASE_API_KEY', data.firebaseConfig.apiKey);
      updateOrAppend('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', data.firebaseConfig.authDomain);
      updateOrAppend('NEXT_PUBLIC_FIREBASE_PROJECT_ID', data.firebaseConfig.projectId);
      updateOrAppend('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', data.firebaseConfig.storageBucket);
      updateOrAppend('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', data.firebaseConfig.messagingSenderId);
      updateOrAppend('NEXT_PUBLIC_FIREBASE_APP_ID', data.firebaseConfig.appId);
    }

    // Process OpenAI
    if (data.openaiKey) {
      updateOrAppend('OPENAI_API_KEY', data.openaiKey);
    }

    // Clean up empty lines
    envContent = envContent.replace(/\n\n+/g, '\n').trim();

    // Write back to file
    fs.writeFileSync(envPath, envContent);

    return NextResponse.json({ success: true, message: 'Configuration saved. Restarting server might be required.' });
  } catch (error) {
    console.error('Error writing .env.local:', error);
    return NextResponse.json({ success: false, error: 'Failed to write configuration.' }, { status: 500 });
  }
}
