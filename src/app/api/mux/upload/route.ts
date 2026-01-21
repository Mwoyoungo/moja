import Mux from '@mux/mux-node';
import { NextResponse } from 'next/server';

const mux = new Mux({
    tokenId: process.env.MUX_TOKEN_ID,
    tokenSecret: process.env.MUX_TOKEN_SECRET,
});

export async function POST(request: Request) {
    try {
        const upload = await mux.video.uploads.create({
            new_asset_settings: {
                playback_policy: ['public'],
                input: [
                    {
                        generated_subtitles: [
                            {
                                language_code: 'en',
                                name: 'English (Auto)'
                            }
                        ]
                    }
                ]
            },
            cors_origin: '*', // In production, replace with your actual domain
        });

        return NextResponse.json({
            uploadUrl: upload.url,
            uploadId: upload.id,
        });
    } catch (error) {
        console.error('Error creating Mux upload:', error);
        return NextResponse.json(
            { error: 'Error creating upload URL' },
            { status: 500 }
        );
    }
}
